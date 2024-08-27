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
	 * @param {Object} app
	 */
	routes(app) {
		const opts = {
			schema: {
				querystring: {
					code: { type: 'string' },
				}
			}
		}

		app.get(this.apiURL, (req, reply) => {
			this.log.list(req, reply)
				.then(data => { this.home.index(req, reply, data) })
				.catch (error => { reply.status(500).send(error) })
		})

		app.get(`${this.apiURL}log/:name/:state`, opts, (req, reply) => {
			this.log.state(req, reply)
			const isBrowser = req.headers['user-agent'] && req.headers['user-agent'].includes('Mozilla')
			if (isBrowser) {
				return reply.status(403).send('Access forbidden')
			}
		})
	}
}
