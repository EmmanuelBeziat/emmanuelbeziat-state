import { ServiceController, EventController } from '../controllers/index.js'

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
			const serviceStatus = await service.checkServices()
			reply.send(serviceStatus)
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
