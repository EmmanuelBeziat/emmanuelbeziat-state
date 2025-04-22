import App from './classes/App.js'
import cors from '@fastify/cors'
import view from '@fastify/view'
import fstatic from '@fastify/static'
import favicons from 'fastify-favicon'
import path from 'path'
import { fileURLToPath } from 'url'
import { config, nunjucksFilters } from './config/index.js'

/**
 * Initializes the server with necessary plugins and configurations
 */
class Server {
	constructor () {
		this.app = App
		this.dirname = path.dirname(fileURLToPath(import.meta.url))

		this.setupPlugins()
	}

	setupPlugins () {
		this.setupCors()
		this.setupFormBody()
		this.setupViewEngine()
		this.setupStaticFiles()
		this.setupFavicons()
	}

	setupCors () {
		this.app.register(cors, config.cors)
	}

	setupFormBody () {
		this.app.register(import('@fastify/formbody'))
	}

	setupViewEngine () {
		this.app.register(view, {
			engine: { nunjucks: config.viewEngine },
			root: config.paths.views,
			options: {
				onConfigure: nunjucksFilters
			}
		})
	}

	setupStaticFiles () {
		this.app.register(fstatic, {
			root: config.paths.public
		})
	}

	setupFavicons () {
		this.app.register(favicons, {
			path: config.paths.favicons,
			name: 'favicon.ico'
		})
	}

	/**
	 * Starts the server on the specified host and port
	 */
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
