import Service from '../models/Service.js'

export class ServiceController {
	constructor () {
		this.model = new Service()
	}

	/**
	 * Checks the status of all services.
	 * @param {import('fastify').FastifyRequest} _request - The Fastify request object.
	 * @param {import('fastify').FastifyReply} _reply - The Fastify reply object.
	 * @returns {Promise<Object[]>} A promise that resolves to an array of service statuses.
	 */
	checkServices (_request, _reply) {
		return this.model.checkAllServices()
			.then(data => data)
			.catch(error => {
				throw error
			})
	}

	/**
	 * Retrieves the list of service URLs.
	 * @returns {string[]} An array of service URLs.
	 */
	getServiceUrls () {
		return this.model.servicesList
	}
}
