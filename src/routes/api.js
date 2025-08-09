import { ServiceController, EventController } from '../controllers/index.js'
import { createHash } from 'node:crypto'

/**
 * Defines the API routes for the application.
 * @param {import('fastify').FastifyInstance} app - The Fastify instance.
 * @param {Object} _opts - The options passed to the plugin.
 */
export default async function (app, _opts) {
	const service = new ServiceController()
	const event = new EventController()

	/**
	 * @route GET /api/service-statuses
	 * @description Retrieves the status of all monitored services.
	 */
	app.get('/service-statuses', async (request, reply) => {
		try {
			const serviceStatuses = await service.checkServices()

			// Normalize and sort for stable ETag
			const normalizedStatuses = serviceStatuses
				.map(s => ({
					name: s.name,
					url: s.url,
					online: !!s.online,
					time: typeof s.time === 'number' ? Math.round(s.time) : s.time,
					error: s.error
				}))
				.sort((a, b) => a.url.localeCompare(b.url) || a.name.localeCompare(b.name))

			const responseBodyString = JSON.stringify(normalizedStatuses)
			const entityTag = createHash('sha1').update(responseBodyString).digest('hex')

			if (request.headers['if-none-match'] === entityTag) {
				reply.code(304).send()
				return
			}

			reply.header('ETag', entityTag)
			reply.send(normalizedStatuses)
		}
		catch (error) {
			reply.status(500).send({ error: error.message || 'Unable to get services' })
		}
	})

	/**
	 * @route GET /api/events
	 * @description Establishes a Server-Sent Events (SSE) connection to stream log updates.
	 */
	app.get('/events', async (request, reply) => {
		try {
			await event.handleEvents(request, reply)
		}
		catch (error) {
			reply.status(500).send({ error: error.message || 'Unable to establish SSE connection' })
		}
	})
}
