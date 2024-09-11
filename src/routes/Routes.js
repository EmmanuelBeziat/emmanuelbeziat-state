import { HomeController, LogController, ServiceController } from '../controllers/index.js'

/**
 * Defines application routes and their corresponding controllers.
 */
export class Router {
	constructor () {
		this.apiURL = '/'
		this.home = new HomeController()
		this.log = new LogController()
		this.service = new ServiceController()
	}

	/**
	 * Initializes routes and associates them with their respective controller actions
	 * @param {Object} app The fastify application instance
	 */
	routes (app) {
		// Apply authentication to all routes
    app.addHook('onRequest', (request, reply, done) => {
			if (request.url.startsWith('/assets/')) {
        // Skip authentication for static assets
        done()
      }
			else {
        app.basicAuth(request, reply, done)
      }
		})

		app.get(this.apiURL, this.handleHomeRequest.bind(this))
		app.get('/api/service-statuses', this.getServiceStatuses.bind(this))
	}

	/**
	 * Handles home routes request
	 * @param {Object} req The request object
	 * @param {Object} reply The reply object
	 */
	handleHomeRequest (req, reply) {
		this.log.list(req, reply)
			.then(logs => {
				const servicesUrl = this.service.getServiceUrls()
				this.home.index(req, reply, { logs, servicesUrl, servicesStatus: [] })
			})
			.catch (error => { reply.status(500).send(error) })
	}

	/**
	 * Fetches service statuses
	 * @param {Object} req The request object
	 * @param {Object} reply The reply object
	 */
	getServiceStatuses (req, reply) {
		this.service.checkServices()
			.then(serviceStatus => {
				reply.send(serviceStatus)
			})
			.catch (error => {
				console.error('Error fetching service statuses:', error)
				reply.status(500).send({ error: error.message || 'Unable to get services' })
			})
	}
}
