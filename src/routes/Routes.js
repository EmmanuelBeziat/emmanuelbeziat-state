import { HomeController, LogController, ServiceController } from '../controllers/index.js'

/**
 * Defines application routes and their corresponding controllers.
 */
export class Router {
	constructor (auth) {
		this.apiURL = '/'
		this.home = new HomeController()
		this.log = new LogController()
		this.service = new ServiceController()
		this.auth = auth
	}

	/**
	 * Initializes routes and associates them with their respective controller actions
	 * @param {Object} app The fastify application instance
	 */
	routes (app) {
		// Apply authentication to all routes
    app.addHook('onRequest', (request, reply, done) => {
			if (this.auth.isPublicPath(request.url) || request.cookies.auth === 'true') {
				done()
			}
			else {
				reply.redirect('/login')
			}
		})

		app.setNotFoundHandler(this.NotFoundHandler.bind(this))

		app.get(this.apiURL, this.handleHomeRequest.bind(this))
		app.get('/api/service-statuses', this.getServiceStatuses.bind(this))
	}

	/**
	 * Handles home routes request
	 * @param {Object} request The request object
	 * @param {Object} reply The reply object
	 */
	handleHomeRequest (request, reply) {
		this.log.list(request, reply)
			.then(logs => {
				const servicesUrl = this.service.getServiceUrls()
				this.home.index(request, reply, {
					logs,
					servicesUrl,
					servicesStatus: [],
					request
				 })
			})
			.catch (error => { reply.status(500).send(error) })
	}

	/**
	 * Fetches service statuses
	 * @param {Object} request The request object
	 * @param {Object} reply The reply object
	 */
	getServiceStatuses (request, reply) {
		this.service.checkServices()
			.then(serviceStatus => {
				reply.send(serviceStatus)
			})
			.catch (error => {
				console.error('Error fetching service statuses:', error)
				reply.status(500).send({ error: error.message || 'Unable to get services' })
			})
	}

	NotFoundHandler (request, reply) {
    reply.code(404).view('../views/404.njk')
	}
}
