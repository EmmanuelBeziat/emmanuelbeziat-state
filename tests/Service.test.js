import { describe, test, expect, afterEach, vi } from 'vitest'
import Service from '../src/models/Service.js'

describe('Service Class', () => {
	const originalServicesList = process.env.SERVICES_LIST
	const originalTimeout = process.env.SERVICES_TIMEOUT_MS

	afterEach(() => {
		// Assigning `undefined` to process.env.X stringifies it to "undefined" instead of
		// deleting the key, so restore via delete when the var wasn't originally set.
		if (originalServicesList === undefined) delete process.env.SERVICES_LIST
		else process.env.SERVICES_LIST = originalServicesList

		if (originalTimeout === undefined) delete process.env.SERVICES_TIMEOUT_MS
		else process.env.SERVICES_TIMEOUT_MS = originalTimeout

		vi.unstubAllGlobals()
	})

	test('throws when SERVICES_LIST is missing or invalid JSON', () => {
		process.env.SERVICES_LIST = 'not-json'
		expect(() => new Service()).toThrow('SERVICES_LIST environment variable is missing or contains invalid JSON')
	})

	test('parses a valid SERVICES_LIST and defaults the timeout to 5000ms', () => {
		process.env.SERVICES_LIST = JSON.stringify([{ name: 'App', url: 'http://example.com' }])
		delete process.env.SERVICES_TIMEOUT_MS

		const service = new Service()

		expect(service.servicesList).toEqual([{ name: 'App', url: 'http://example.com' }])
		expect(service.timeoutMs).toBe(5000)
	})

	test('honors SERVICES_TIMEOUT_MS when set', () => {
		process.env.SERVICES_LIST = '[]'
		process.env.SERVICES_TIMEOUT_MS = '2000'

		expect(new Service().timeoutMs).toBe(2000)
	})

	test('checkAllServices reports online:true with a duration for a successful HEAD request', async () => {
		process.env.SERVICES_LIST = JSON.stringify([{ name: 'App', url: 'http://example.com' }])
		const fetchMock = vi.fn().mockResolvedValue({ ok: true })
		vi.stubGlobal('fetch', fetchMock)

		const results = await new Service().checkAllServices()

		expect(results).toEqual([
			expect.objectContaining({ name: 'App', url: 'http://example.com', online: true, time: expect.any(Number) })
		])
		expect(fetchMock).toHaveBeenCalledWith('http://example.com', expect.objectContaining({ method: 'HEAD' }))
	})

	test('checkAllServices reports online:false when the response is not ok', async () => {
		process.env.SERVICES_LIST = JSON.stringify([{ name: 'App', url: 'http://example.com' }])
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

		const [result] = await new Service().checkAllServices()

		expect(result.online).toBe(false)
	})

	test('checkAllServices reports a "timeout" error when the request aborts', async () => {
		process.env.SERVICES_LIST = JSON.stringify([{ name: 'App', url: 'http://example.com' }])
		process.env.SERVICES_TIMEOUT_MS = '10'
		vi.stubGlobal('fetch', vi.fn((url, { signal }) => new Promise((resolve, reject) => {
			signal.addEventListener('abort', () => {
				const error = new Error('The operation was aborted')
				error.name = 'AbortError'
				reject(error)
			})
		})))

		const [result] = await new Service().checkAllServices()

		expect(result.online).toBe(false)
		expect(result.error).toBe('timeout')
	})

	test('checkAllServices reports the underlying error message for a non-timeout failure', async () => {
		process.env.SERVICES_LIST = JSON.stringify([{ name: 'App', url: 'http://example.com' }])
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('getaddrinfo ENOTFOUND')))

		const [result] = await new Service().checkAllServices()

		expect(result.online).toBe(false)
		expect(result.error).toBe('getaddrinfo ENOTFOUND')
	})

	test('checkAllServices resolves each service independently', async () => {
		process.env.SERVICES_LIST = JSON.stringify([
			{ name: 'Good', url: 'http://good.example.com' },
			{ name: 'Bad', url: 'http://bad.example.com' }
		])
		vi.stubGlobal('fetch', vi.fn(url => url === 'http://good.example.com'
			? Promise.resolve({ ok: true })
			: Promise.resolve({ ok: false })))

		const results = await new Service().checkAllServices()

		expect(results[0]).toEqual(expect.objectContaining({ name: 'Good', online: true }))
		expect(results[1]).toEqual(expect.objectContaining({ name: 'Bad', online: false }))
	})

	test('checkAllServices falls back to a minimal offline entry if a per-service check throws before its own try/catch', async () => {
		// AbortController is constructed outside checkSingleService's try/catch, so a failure
		// there rejects the whole per-service promise instead of being caught internally —
		// this exercises the Promise.allSettled 'rejected' fallback branch in checkAllServices.
		process.env.SERVICES_LIST = JSON.stringify([{ name: 'App', url: 'http://example.com' }])
		vi.stubGlobal('AbortController', class {
			constructor () {
				throw new Error('boom')
			}
		})

		const results = await new Service().checkAllServices()

		expect(results).toEqual([{ name: 'App', url: 'http://example.com', online: false }])
	})
})
