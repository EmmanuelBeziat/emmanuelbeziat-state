import { describe, test, expect, vi } from 'vitest'
import LogEventBus from '../../src/models/log/LogEventBus.js'

describe('LogEventBus', () => {
	test('starts with no subscribers', () => {
		expect(new LogEventBus().size()).toBe(0)
	})

	test('subscribe adds a client and increases size', () => {
		const bus = new LogEventBus()
		const client = { write: vi.fn() }

		bus.subscribe(client)

		expect(bus.size()).toBe(1)
	})

	test('unsubscribe removes a client and decreases size', () => {
		const bus = new LogEventBus()
		const client = { write: vi.fn() }
		bus.subscribe(client)

		bus.unsubscribe(client)

		expect(bus.size()).toBe(0)
	})

	test('subscribing the same client twice does not double-count it (Set semantics)', () => {
		const bus = new LogEventBus()
		const client = { write: vi.fn() }

		bus.subscribe(client)
		bus.subscribe(client)

		expect(bus.size()).toBe(1)
	})

	test('publish writes the payload to every subscribed client', () => {
		const bus = new LogEventBus()
		const clientA = { write: vi.fn() }
		const clientB = { write: vi.fn() }
		bus.subscribe(clientA)
		bus.subscribe(clientB)

		const payload = { folder: 'build-1', type: 'output' }
		bus.publish(payload)

		expect(clientA.write).toHaveBeenCalledWith(payload)
		expect(clientB.write).toHaveBeenCalledWith(payload)
	})

	test('publish does not deliver to an unsubscribed client', () => {
		const bus = new LogEventBus()
		const client = { write: vi.fn() }
		bus.subscribe(client)
		bus.unsubscribe(client)

		bus.publish({ folder: 'build-1' })

		expect(client.write).not.toHaveBeenCalled()
	})

	test('publish continues delivering to other clients if one client write throws', () => {
		const bus = new LogEventBus()
		const failingClient = { write: vi.fn(() => { throw new Error('client gone') }) }
		const healthyClient = { write: vi.fn() }
		bus.subscribe(failingClient)
		bus.subscribe(healthyClient)

		expect(() => bus.publish({ folder: 'build-1' })).not.toThrow()
		expect(healthyClient.write).toHaveBeenCalled()
	})
})
