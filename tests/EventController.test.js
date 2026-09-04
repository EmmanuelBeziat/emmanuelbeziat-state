import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { EventEmitter } from 'events'

const { mockSubscribe, mockUnsubscribe } = vi.hoisted(() => ({
	mockSubscribe: vi.fn(),
	mockUnsubscribe: vi.fn()
}))

vi.mock('../src/models/Log.js', () => ({
	default: vi.fn().mockImplementation(function () {
		return { subscribe: mockSubscribe, unsubscribe: mockUnsubscribe }
	})
}))

const { EventController } = await import('../src/controllers/EventController.js')

function createReply () {
	return {
		hijack: vi.fn(),
		raw: {
			writeHead: vi.fn(),
			write: vi.fn(),
			end: vi.fn()
		}
	}
}

function createRequest () {
	return { raw: new EventEmitter() }
}

describe('EventController', () => {
	let controller, reply, request

	beforeEach(() => {
		vi.useFakeTimers()
		mockSubscribe.mockReset().mockResolvedValue()
		mockUnsubscribe.mockReset().mockResolvedValue()
		controller = new EventController()
		reply = createReply()
		request = createRequest()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	test('hijacks the reply before writing to the raw stream', async () => {
		const callOrder = []
		reply.hijack = vi.fn(() => callOrder.push('hijack'))
		reply.raw.writeHead = vi.fn(() => callOrder.push('writeHead'))

		await controller.handleEvents(request, reply)

		expect(callOrder).toEqual(['hijack', 'writeHead'])
	})

	test('writes SSE headers and an initial connection message', async () => {
		await controller.handleEvents(request, reply)

		expect(reply.raw.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({
			'Content-Type': 'text/event-stream'
		}))
		expect(reply.raw.write).toHaveBeenCalledWith(expect.stringContaining('"type":"connection"'))
	})

	test('subscribes to the Log event bus with a write-capable client', async () => {
		await controller.handleEvents(request, reply)

		expect(mockSubscribe).toHaveBeenCalledWith(expect.objectContaining({ write: expect.any(Function) }))
	})

	test('sends a heartbeat every 30 seconds', async () => {
		await controller.handleEvents(request, reply)
		reply.raw.write.mockClear()

		await vi.advanceTimersByTimeAsync(30000)

		expect(reply.raw.write).toHaveBeenCalledWith(expect.stringContaining('"type":"heartbeat"'))
	})

	test('cleans up on client disconnect: stops the heartbeat, unsubscribes, and ends the stream', async () => {
		await controller.handleEvents(request, reply)

		request.raw.emit('close')
		// cleanup() awaits log.unsubscribe() before calling reply.raw.end() — flush that microtask.
		await Promise.resolve()
		await Promise.resolve()

		expect(mockUnsubscribe).toHaveBeenCalled()
		expect(reply.raw.end).toHaveBeenCalled()

		reply.raw.write.mockClear()
		await vi.advanceTimersByTimeAsync(30000)
		expect(reply.raw.write).not.toHaveBeenCalled()
	})

	test('reports a subscribe failure as an SSE error event instead of a second HTTP response', async () => {
		mockSubscribe.mockRejectedValue(new Error('boom'))

		await controller.handleEvents(request, reply)

		expect(reply.raw.write).toHaveBeenCalledWith(expect.stringContaining('"type":"error"'))
		expect(reply.raw.write).toHaveBeenCalledWith(expect.stringContaining('boom'))
		expect(mockUnsubscribe).toHaveBeenCalled()
		expect(reply.raw.end).toHaveBeenCalled()
	})
})
