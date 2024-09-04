import { HomeController, LogController } from '../controllers/index.js'

/**
 * Defines application routes and their corresponding controllers.
 */
export class Router {
	constructor () {
		this.apiURL = '/'
		this.home = new HomeController()
		this.log = new LogController()

		this.routeOptions = {
			schema: {
				querystring: {
					code: { type: 'string' },
				}
			}
		}
	}

	/**
	 * Initializes routes and associates them with their respective controller actions
	 * @param {Object} app The fastify application instance
	 */
	routes(app) {
		app.get(this.apiURL, this.handleHomeRequest.bind(this))
		// app.get(`${this.apiURL}log/:name/:state`, this.routeOptions, this.handleLogRequest.bind(this))
		app.get(`${this.apiURL}hello-ws`, { websocket: true }, (connection, req) => {
			console.log('test url')
			connection.socket.on('message', message => {
				console.log('test message')
				connection.socket.send('Hello Fastify websockets: %', message)
			})
		})
	}

	/**
	 * Handles home routes request
	 * @param {Object} req The request object
	 * @param {Object} reply The reply object
	 */
	handleHomeRequest (req, reply) {
		this.log.list(req, reply)
			.then(data => { this.home.index(req, reply, data) })
			.catch (error => { reply.status(500).send(error) })
	}

	/**
	 * Handles log route request
	 * @param {Object} req The request object
	 * @param {Object} reply The reply object
	 */
	handleLogRequest (req, reply) {
		this.log.state(req, reply)

		const isBrowser = req.headers['user-agent'] && req.headers['user-agent'].includes('Mozilla')
		if (isBrowser) return reply.status(403).send('Access forbidden')
	}
}
