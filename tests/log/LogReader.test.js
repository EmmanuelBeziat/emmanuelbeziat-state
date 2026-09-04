import { describe, test, expect, beforeEach, vi } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import LogReader from '../../src/models/log/LogReader.js'

vi.mock('fs/promises')

function createFakeFileHandle (content) {
	const buffer = Buffer.from(content, 'utf8')
	return {
		read: vi.fn(async (targetBuffer, offset, length, position) => {
			buffer.copy(targetBuffer, offset, position, position + length)
			return { bytesRead: length, buffer: targetBuffer }
		}),
		close: vi.fn().mockResolvedValue()
	}
}

describe('LogReader', () => {
	const rootPath = '/logs'
	let reader

	beforeEach(() => {
		reader = new LogReader(rootPath)
		vi.resetAllMocks()
	})

	test('stripAnsi removes ANSI escape sequences', () => {
		// eslint-disable-next-line no-control-regex
		const withAnsi = '\x1b[1m\x1b[46mBuild passed\x1b[0m'
		expect(reader.stripAnsi(withAnsi)).toBe('Build passed')
	})

	test('getLogContent reads and strips a file relative to the root path', async () => {
		// eslint-disable-next-line no-control-regex
		fs.readFile.mockResolvedValue('\x1b[32mok\x1b[0m')

		const content = await reader.getLogContent('build-1/output.log')

		expect(fs.readFile).toHaveBeenCalledWith(path.resolve(rootPath, 'build-1/output.log'), 'utf-8')
		expect(content).toBe('ok')
	})

	test('getLogContent wraps a read failure in a descriptive error', async () => {
		fs.readFile.mockRejectedValue(new Error('ENOENT'))

		await expect(reader.getLogContent('missing.log')).rejects.toThrow('ENOENT')
	})

	test('getLogLastEdit returns the file mtime', async () => {
		const mtime = new Date('2023-01-01T00:00:00Z')
		fs.stat.mockResolvedValue({ mtime })

		await expect(reader.getLogLastEdit('build-1/output.log')).resolves.toBe(mtime)
	})

	test('getLogLastEdit wraps a stat failure in a descriptive error', async () => {
		fs.stat.mockRejectedValue(new Error('ENOENT'))

		await expect(reader.getLogLastEdit('missing.log')).rejects.toThrow('ENOENT')
	})

	test('readTail returns the whole file when it is smaller than the byte limit', async () => {
		const content = 'line one\nline two\n'
		fs.stat.mockResolvedValue({ size: Buffer.byteLength(content) })
		fs.open.mockResolvedValue(createFakeFileHandle(content))

		const tail = await reader.readTail('/logs/build-1/output.log', 1024)

		expect(tail).toBe(content)
	})

	test('readTail trims the partial first line when starting mid-file', async () => {
		const content = 'aaaa\nbbbb\ncccc\n'
		// Force a small window so we start partway through the file, mid "bbbb" line.
		fs.stat.mockResolvedValue({ size: Buffer.byteLength(content) })
		fs.open.mockResolvedValue(createFakeFileHandle(content))

		const tail = await reader.readTail('/logs/build-1/output.log', 6)

		// Tail window is the last 6 bytes ("bb\ncccc\n" truncated to "\ncccc\n" -> after
		// trimming the partial leading line, only whole lines after the first newline remain.
		expect(tail.endsWith('cccc\n')).toBe(true)
		expect(tail.startsWith('aaaa')).toBe(false)
	})

	test('readTail strips ANSI codes from the returned tail', async () => {
		// eslint-disable-next-line no-control-regex
		const content = '\x1b[32mall good\x1b[0m\n'
		fs.stat.mockResolvedValue({ size: Buffer.byteLength(content) })
		fs.open.mockResolvedValue(createFakeFileHandle(content))

		const tail = await reader.readTail('/logs/build-1/output.log', 1024)

		expect(tail).toBe('all good\n')
	})

	test('readTail resolves to an empty string instead of throwing when the file is unreadable', async () => {
		fs.stat.mockRejectedValue(new Error('ENOENT'))

		await expect(reader.readTail('/logs/missing/output.log', 1024)).resolves.toBe('')
	})
})
