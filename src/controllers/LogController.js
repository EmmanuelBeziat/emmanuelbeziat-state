import Log from '../models/Log.js'

export class LogController {
	constructor () {
		this.model = new Log()
	}

	/**
	 * Retrieves all logs.
	 * @param {import('fastify').FastifyRequest} _request - The Fastify request object.
	 * @param {import('fastify').FastifyReply} _reply - The Fastify reply object.
	 * @returns {Promise<Object[]>} A promise that resolves to an array of log data.
	 */
	list (_request, _reply) {
		return this.model.getAllLogs()
			.then(data => data)
			.catch(error => {
				throw error
			})
	}
}
