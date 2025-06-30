import Home from '../models/Home.js'

export class HomeController {
	constructor () {
		this.model = new Home()
	}

	/**
	 * Renders the home page.
	 * @param {import('fastify').FastifyRequest} _request - The Fastify request object.
	 * @param {import('fastify').FastifyReply} reply - The Fastify reply object.
	 * @param {Object} data - The data to be passed to the view.
	 * @returns {Promise<void>}
	 */
	async index (_request, reply, data) {
		await this.model.render(reply, data)
	}
}
