import { describe, test, expect, beforeEach, vi } from 'vitest'
import fs from 'fs/promises'

vi.mock('fs/promises')

const { mockWatch, mockClose, handlers } = vi.hoisted(() => {
	const handlers = {}
	const mockOn = vi.fn((event, handler) => { handlers[event] = handler })
	const mockClose = vi.fn().mockResolvedValue()
	const mockWatch = vi.fn(() => ({ on: mockOn, close: mockClose }))
	return { mockWatch, mockClose, mockOn, handlers }
})

vi.mock('chokidar', () => ({
	default: { watch: mockWatch }
}))

const { default: Log } = await import('../src/models/Log.js')

describe('Log Class', () => {
	let log

	beforeEach(() => {
		log = new Log()
	})

	test('getValidFolders throws error when no folders found', async () => {
		fs.readdir.mockResolvedValue([])

		await expect(log.repository.getValidFolders()).rejects.toThrow('No log folders found')
	})

	test('getLogContent reads file content', async () => {
		fs.readFile.mockResolvedValue('file content')

		const content = await log.getLogContent(process.env.FILE_LOG)
		expect(content).toBe('file content')
	})

	test('getLogContent throws error on read failure', async () => {
		fs.readFile.mockRejectedValue(new Error('Read error'))

		await expect(log.getLogContent(process.env.FILE_LOG)).rejects.toThrow('Read error')
	})

	test('stateChange returns trimmed content', async () => {
		fs.readFile.mockResolvedValue('   status content   ')

		const status = await log.stateChange('folder1')
		expect(status).toBe('status content')
	})

	test('stateChange returns idle on error', async () => {
		fs.readFile.mockRejectedValue(new Error('Read error'))
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

		const status = await log.stateChange('folder1')
		expect(status).toBe('idle')

		consoleSpy.mockRestore()
	})

	describe('getAllLogs', () => {
		test('returns one entry per non-empty folder and skips empty ones', async () => {
			fs.readdir.mockResolvedValue(['build-success', 'build-empty'])
			fs.stat.mockImplementation(async targetPath => {
				const str = targetPath.toString()
				if (str.endsWith(log.logFile) || str.endsWith(log.statusFile)) {
					return { mtime: new Date('2023-01-01T00:00:00Z') }
				}
				return { isDirectory: () => true }
			})
			fs.readFile.mockImplementation(async targetPath => {
				const str = targetPath.toString()
				if (str.includes('build-success') && str.endsWith(log.logFile)) return 'log content'
				if (str.includes('build-success') && str.endsWith(log.statusFile)) return 'success'
				throw new Error('ENOENT')
			})

			const logs = await log.getAllLogs()

			expect(logs).toEqual([
				{ name: 'build-success', status: 'success', date: new Date('2023-01-01T00:00:00Z'), content: 'log content' }
			])
		})
	})

	describe('subscribe/unsubscribe (SSE watcher lifecycle)', () => {
		beforeEach(() => {
			// Reset the class-level singleton, then re-create `log` so the constructor
			// re-initializes it — otherwise the outer beforeEach's `log` keeps referencing
			// a Log.eventBus/watcher pair that this reset just nulled out.
			Log.eventBus = null
			Log.watcher = null
			Log.watcherStartPromise = null
			vi.clearAllMocks()
			fs.readdir.mockResolvedValue(['build-1'])
			fs.stat.mockResolvedValue({ isDirectory: () => true })
			log = new Log()
		})

		test('two Log instances share the same static eventBus and watcher', () => {
			const logA = new Log()
			const logB = new Log()

			expect(Log.eventBus).toBeDefined()
			expect(Log.watcher).toBeDefined()
			expect(logA.repository).not.toBe(logB.repository) // per-instance
		})

		test('subscribing the first client starts the shared watcher', async () => {
			await log.subscribe({ write: vi.fn() })

			expect(mockWatch).toHaveBeenCalledTimes(1)
		})

		test('subscribing a second client does not start a second watcher', async () => {
			await log.subscribe({ write: vi.fn() })
			await log.subscribe({ write: vi.fn() })

			expect(mockWatch).toHaveBeenCalledTimes(1)
		})

		test('unsubscribing the last client stops the shared watcher', async () => {
			const client = { write: vi.fn() }
			await log.subscribe(client)

			await log.unsubscribe(client)

			expect(mockClose).toHaveBeenCalledTimes(1)
		})

		test('unsubscribing while other clients remain keeps the watcher running', async () => {
			const clientA = { write: vi.fn() }
			const clientB = { write: vi.fn() }
			await log.subscribe(clientA)
			await log.subscribe(clientB)

			await log.unsubscribe(clientA)

			expect(mockClose).not.toHaveBeenCalled()
		})

		test('concurrent subscribes share one in-flight watcher start (no duplicate folder scans)', async () => {
			await Promise.all([
				log.subscribe({ write: vi.fn() }),
				log.subscribe({ write: vi.fn() })
			])

			expect(fs.readdir).toHaveBeenCalledTimes(1)
		})
	})

	describe('publishChange', () => {
		beforeEach(() => {
			vi.useFakeTimers()
		})

		test('for the output log file: reads the tail and publishes an "output" payload', async () => {
			vi.spyOn(log.logReader, 'getLogLastEdit').mockResolvedValue(new Date('2023-01-01T00:00:00Z'))
			vi.spyOn(log.logReader, 'readTail').mockResolvedValue('tail content')
			const publishSpy = vi.spyOn(log, 'publish')

			const promise = log.publishChange(`/logs/build-1/${log.logFile}`, log.logFile)
			await vi.advanceTimersByTimeAsync(100)
			await promise

			expect(publishSpy).toHaveBeenCalledWith(expect.objectContaining({
				folder: 'build-1',
				type: log.logFile.split('.')[0],
				logs: 'tail content'
			}))
		})

		test('for the status file: reads the trimmed status and publishes a "status" payload', async () => {
			vi.spyOn(log.logReader, 'getLogLastEdit').mockResolvedValue(new Date('2023-01-01T00:00:00Z'))
			vi.spyOn(log, 'getLogContent').mockResolvedValue('  success  ')
			const publishSpy = vi.spyOn(log, 'publish')

			const promise = log.publishChange(`/logs/build-1/${log.statusFile}`, log.statusFile)
			await vi.advanceTimersByTimeAsync(100)
			await promise

			expect(publishSpy).toHaveBeenCalledWith(expect.objectContaining({
				folder: 'build-1',
				type: log.statusFile.split('.')[0],
				status: 'success'
			}))
		})
	})
})
