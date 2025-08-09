import Log from '../models/Log.js'

export class EventController {
	constructor () {
		this.log = new Log()
	}

	/**
	 * Handles the SSE connection, sending log updates to the client.
	 * @param {import('fastify').FastifyRequest} request - The Fastify request object.
	 * @param {import('fastify').FastifyReply} reply - The Fastify reply object.
	 * @returns {Promise<void>}
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
    request.raw.on('close', async () => {
      clearInterval(heartbeat)
      try {
        await this.log.unsubscribe(client)
      }
      catch {
        // ignore unsubscribe errors
      }
      try {
        reply.raw.end()
      }
      catch {
        // ignore end errors
      }
    })

		try {
      await this.log.subscribe(client)
		}
    catch (error) {
      clearInterval(heartbeat)
      try {
        await this.log.unsubscribe(client)
      }
      catch {
        // ignore unsubscribe errors
      }
      try {
        reply.raw.end()
      }
      catch {
        // ignore end errors
      }
      throw error
    }
	}
}
