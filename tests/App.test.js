import { describe, test, expect, afterAll } from 'vitest'
import app from '../src/classes/App.js'

// Unlike Routes.test.js (which builds its own minimal Fastify app to exercise the route
// handlers with known test credentials), this exercises the actual composed App.js instance —
// its real plugin registration order, security headers, and the onRequest auth-gate hook.
describe('App', () => {
	afterAll(async () => {
		await app.close()
	})

	test('redirects an unauthenticated request to /login', async () => {
		const response = await app.inject({ method: 'GET', url: '/' })

		expect(response.statusCode).toBe(302)
		expect(response.headers.location).toBe('/login')
	})

	test('allows a public path through without authentication', async () => {
		const response = await app.inject({ method: 'GET', url: '/login' })

		expect(response.statusCode).toBe(200)
	})

	test('does not treat a path merely starting with /login as public', async () => {
		const response = await app.inject({ method: 'GET', url: '/loginXYZ' })

		expect(response.statusCode).toBe(302)
		expect(response.headers.location).toBe('/login')
	})

	test('sets helmet security headers', async () => {
		const response = await app.inject({ method: 'GET', url: '/login' })

		expect(response.headers['x-content-type-options']).toBe('nosniff')
		expect(response.headers['content-security-policy']).toContain("default-src 'self'")
	})

	test('rejects unauthenticated access to the API', async () => {
		const response = await app.inject({ method: 'GET', url: '/api/service-statuses' })

		expect(response.statusCode).toBe(302)
		expect(response.headers.location).toBe('/login')
	})
})
