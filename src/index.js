import App from './classes/App.js'
import cors from '@fastify/cors'
import view from '@fastify/view'
import fstatic from '@fastify/static'
import favicons from 'fastify-favicon'
import path from 'path'
import nunjucks from 'nunjucks'
import { fileURLToPath } from 'url'
import { formatDate, formatDateRelative, sortByDate } from './utils/filters.js'

/**
 * Initializes the server with necessary plugins and configurations.
 */
class Server {
	constructor () {
		this.app = App
		this.dirname = path.dirname(fileURLToPath(import.meta.url))

		this.setupPlugins()
	}

	setupPlugins () {
		this.app.register(cors, {
      origin: true,
      credentials: true
    })
		this.app.register(import('@fastify/formbody'))

		this.app.register(view, {
			engine: { nunjucks },
			root: './src/views',
			options: {
				onConfigure: env => {
					env.addFilter('formatDate', formatDate)
					env.addFilter('formatDateRelative', formatDateRelative)
					env.addFilter('sortByDate', sortByDate)
					env.addFilter('log', value => { console.log(value) })
				}
			}
		})

		this.app.register(fstatic, {
			root: path.join(this.dirname, '../public')
		})

		this.app.register(favicons, {
			path: './public/favicons',
			name: 'favicon.ico'
		})
	}

	/**
	 * Starts the server on the specified host and port
	 */
	start () {
		this.app.listen({ port: process.env.PORT || 3000, host: process.env.HOST || '127.0.0.1' })
			.then(address => {
				console.log(`Server started on ${address}`)
			})
			.catch(error => {
				console.log(`Error starting server: ${error}`)
				process.exit(1)
			})
	}
}

const server = new Server()
server.start()
