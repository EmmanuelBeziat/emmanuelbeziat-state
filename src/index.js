import { config, validateEnv } from './config/index.js'

/**
 * Thin bootstrap wrapper around the Fastify app.
 * App.js exports the raw Fastify instance (new App().app) directly;
 * this class only adds environment variable validation before starting.
 */
class Server {
	constructor () {
		this.checkEnvVariables()
	}

	checkEnvVariables () {
		const envErrors = validateEnv(process.env)

		if (envErrors.length > 0) {
			console.error(`Error: Invalid environment:\n- ${envErrors.join('\n- ')}`)
			process.exit(1)
		}
	}

	async start () {
		try {
			const { default: app } = await import('./classes/App.js')
			this.app = app
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
