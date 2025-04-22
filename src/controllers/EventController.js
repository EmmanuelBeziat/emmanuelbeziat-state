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
		// Set headers to prevent timeouts
		reply.raw.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache, no-transform',
			'Connection': 'keep-alive',
			'X-Accel-Buffering': 'no', // Disable buffering for Nginx
			'Access-Control-Allow-Origin': '*'
		})

		const client = {
			write: data => {
				reply.raw.write(`data: ${JSON.stringify(data)}\n\n`)
			}
		}

		// Send initial connection message
		client.write({ type: 'connection', status: 'connected' })

		// Set up heartbeat
		const heartbeat = setInterval(() => {
			client.write({ type: 'heartbeat', timestamp: Date.now() })
		}, 30000) // Send heartbeat every 30 seconds

		// Clean up on connection close
		request.raw.on('close', () => {
			clearInterval(heartbeat)
		})

		try {
			await this.log.watchLogs(client)
		}
		catch (error) {
			clearInterval(heartbeat)
			throw error
		}
	}
}
