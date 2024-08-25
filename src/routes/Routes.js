import { PushController } from '../controllers/index.js'

/**
 * Defines application routes and their corresponding controllers.
 */
export class Router {
	constructor () {
		this.apiURL = '/'
		this.push = new PushController()
	}

	/**
	 * Initializes routes and associates them with their respective controller actions
	 * @param {Object} app
	 */
	routes(app) {
		app.get(this.apiURL, (req, reply) => this.push.index(req, reply))
	}
}
