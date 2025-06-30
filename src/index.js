import App from './classes/App.js'
import { config } from './config/index.js'

class Server {
	constructor () {
		this.checkEnvVariables()
		this.app = App
	}

	checkEnvVariables () {
		const requiredEnv = ['AUTH_USERNAME', 'AUTH_PASSWORD', 'SESSION_SECRET']
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
