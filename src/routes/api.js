import { ServiceController, EventController } from '../controllers/index.js'

export default async function (app, _opts) {
	const service = new ServiceController()
	const event = new EventController()

	app.get('/service-statuses', async (request, reply) => {
		try {
			const serviceStatus = await service.checkServices()
			reply.send(serviceStatus)
		}
		catch (error) {
			reply.status(500).send({ error: error.message || 'Unable to get services' })
		}
	})

	app.get('/events', async (request, reply) => {
		try {
			await event.handleEvents(request, reply)
		}
		catch (error) {
			reply.status(500).send({ error: error.message || 'Unable to establish SSE connection' })
		}
	})
}
