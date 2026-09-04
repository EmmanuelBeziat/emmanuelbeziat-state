import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'

const { mockWatch, mockClose, mockOn, handlers } = vi.hoisted(() => {
	const handlers = {}
	const mockOn = vi.fn((event, handler) => { handlers[event] = handler })
	const mockClose = vi.fn().mockResolvedValue()
	const mockWatch = vi.fn(() => ({ on: mockOn, close: mockClose }))
	return { mockWatch, mockClose, mockOn, handlers }
})

vi.mock('chokidar', () => ({
	default: { watch: mockWatch }
}))

const { default: LogWatcher } = await import('../../src/models/log/LogWatcher.js')

describe('LogWatcher', () => {
	let watcher

	beforeEach(() => {
		vi.useFakeTimers()
		mockWatch.mockClear()
		mockOn.mockClear()
		mockClose.mockClear()
		for (const key of Object.keys(handlers)) delete handlers[key]
		watcher = new LogWatcher()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	test('start() watches the given paths via chokidar', () => {
		watcher.start(['/logs/a/output.log'], vi.fn())

		expect(mockWatch).toHaveBeenCalledWith(['/logs/a/output.log'])
	})

	test('start() is a no-op if already watching', () => {
		watcher.start(['/logs/a/output.log'], vi.fn())
		watcher.start(['/logs/b/output.log'], vi.fn())

		expect(mockWatch).toHaveBeenCalledTimes(1)
	})

	test('debounces rapid repeated changes to the same file into a single callback', () => {
		const onFileChanged = vi.fn()
		watcher.start(['/logs/a/output.log'], onFileChanged)

		handlers.change('/logs/a/output.log')
		handlers.change('/logs/a/output.log')
		handlers.change('/logs/a/output.log')
		vi.advanceTimersByTime(200)

		expect(onFileChanged).toHaveBeenCalledTimes(1)
		expect(onFileChanged).toHaveBeenCalledWith('/logs/a/output.log')
	})

	test('changes to different files are debounced independently', () => {
		const onFileChanged = vi.fn()
		watcher.start(['/logs/a/output.log', '/logs/b/output.log'], onFileChanged)

		handlers.change('/logs/a/output.log')
		handlers.change('/logs/b/output.log')
		vi.advanceTimersByTime(200)

		expect(onFileChanged).toHaveBeenCalledTimes(2)
	})

	test('stop() closes the watcher and cancels pending debounced callbacks', async () => {
		const onFileChanged = vi.fn()
		watcher.start(['/logs/a/output.log'], onFileChanged)
		handlers.change('/logs/a/output.log')

		await watcher.stop()

		expect(mockClose).toHaveBeenCalled()
		expect(watcher.watcher).toBeNull()

		vi.advanceTimersByTime(200)
		expect(onFileChanged).not.toHaveBeenCalled()
	})

	test('stop() is a no-op if not currently watching', async () => {
		await expect(watcher.stop()).resolves.toBeUndefined()
		expect(mockClose).not.toHaveBeenCalled()
	})
})
