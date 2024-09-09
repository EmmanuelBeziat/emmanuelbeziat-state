import { HomeController, LogController } from '../controllers/index.js'

/**
 * Defines application routes and their corresponding controllers.
 */
export class Router {
	constructor () {
		this.apiURL = '/'
		this.home = new HomeController()
		this.log = new LogController()
	}

	/**
	 * Initializes routes and associates them with their respective controller actions
	 * @param {Object} app The fastify application instance
	 */
	routes(app) {
		app.get(this.apiURL, this.handleHomeRequest.bind(this))
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
}
