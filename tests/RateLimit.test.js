import fastify from 'fastify'
import rateLimit from '@fastify/rate-limit'
import { test, expect, afterEach } from 'vitest'
import { config } from '../src/config/config.js'

// src/classes/App.js registers @fastify/rate-limit using this same config.rateLimit object,
// but skips registering it entirely when NODE_ENV === 'test' (as it is here), so there is no
// way to exercise the real App instance's rate limiting through the normal test run. This
// builds a standalone app with the exact production config values instead, so a change to
// config.rateLimit that weakens protection (e.g. a much higher max) is still caught.
let app

afterEach(async () => {
	await app?.close()
})

test('should return 429 status when the configured rate limit is exceeded', async () => {
	app = fastify()
	await app.register(rateLimit, config.rateLimit)

	app.get('/', (req, reply) => {
		reply.send('hello')
	})

	await app.ready()

	const requestCount = config.rateLimit.max + 1
	const promises = Array.from({ length: requestCount }, () => app.inject({
		method: 'GET',
		url: '/'
	}))

	const responses = await Promise.all(promises)
	const lastResponse = responses[responses.length - 1]
	expect(lastResponse.statusCode).toBe(429)
})
