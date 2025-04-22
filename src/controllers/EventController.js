import Log from '../models/Log.js'

export class EventController {
	constructor () {
		this.log = new Log()
	}

	/**
	 * Handles SSE connection and log watching
	 * @param {Object} request The request object
	 * @param {Object} reply The reply object
	 */
	async handleEvents (request, reply) {
		reply.raw.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive'
		})

		const client = {
			write: data => {
				reply.raw.write(`data: ${JSON.stringify(data)}\n\n`)
			}
		}

		request.raw.on('close', () => {
			// Cleanup will be handled by the Log model
		})

		await this.log.watchLogs(client)
	}
}
