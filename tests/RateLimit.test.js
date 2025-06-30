import fastify from 'fastify'
import rateLimit from '@fastify/rate-limit'
import { test, expect } from 'vitest'

test('should return 429 status when rate limit is exceeded', async () => {
	const app = fastify()
	await app.register(rateLimit, {
		max: 10,
		timeWindow: '1 minute'
	})

	app.get('/', (req, reply) => {
		reply.send('hello')
	})

	await app.ready()

	const promises = []
	for (let i = 0; i < 11; i++) {
		promises.push(app.inject({
			method: 'GET',
			url: '/'
		}))
	}

	const responses = await Promise.all(promises)
	const lastResponse = responses[responses.length - 1]
	expect(lastResponse.statusCode).toBe(429)

	await app.close()
})
