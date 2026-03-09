import App from './classes/App.js'
import { config } from './config/index.js'

/**
 * Thin bootstrap wrapper around the Fastify app.
 * App.js exports the raw Fastify instance (new App().app) directly;
 * this class only adds environment variable validation before starting.
 */
class Server {
	constructor () {
		this.checkEnvVariables()
		this.app = App
	}

	checkEnvVariables () {
		const requiredEnv = ['AUTH_USERNAME', 'AUTH_PASSWORD', 'SESSION_SECRET', 'SERVICES_LIST']
		const missingEnv = requiredEnv.filter(envVar => !process.env[envVar])

		if (missingEnv.length > 0) {
			console.error(`Error: Missing required environment variables: ${missingEnv.join(', ')}`)
			process.exit(1)
		}
	}

	async start () {
		try {
			const address = await this.app.listen({ port: config.port, host: config.host })
			console.log(`Server started on ${address}`)
		}
		catch (error) {
			console.error(`Error starting server: ${error}`)
			process.exit(1)
		}
	}
}

export default new Server().start()
