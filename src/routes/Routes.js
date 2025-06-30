import { HomeController, LogController, ServiceController, EventController } from '../controllers/index.js'

/**
 * Defines application routes and their corresponding controllers.
 */
export class Router {
	constructor (auth) {
		this.apiURL = '/'
		this.home = new HomeController()
		this.log = new LogController()
		this.service = new ServiceController()
		this.event = new EventController()
		this.auth = auth

		this.handleHomeRequest = this.handleHomeRequest.bind(this)
		this.getServiceStatuses = this.getServiceStatuses.bind(this)
		this.handleEvents = this.handleEvents.bind(this)
		this.NotFoundHandler = this.NotFoundHandler.bind(this)
	}

	/**
	 * Initializes routes and associates them with their respective controller actions
	 * @param {Object} app The fastify application instance
	 */
	routes (app) {
		// Apply authentication to all routes
		app.addHook('onRequest', this.authenticateRequest.bind(this))

		// Handle not found error
		app.setNotFoundHandler(this.NotFoundHandler)

		// Define routes
		app.get(this.apiURL, this.handleHomeRequest)
		app.get('/api/service-statuses', this.getServiceStatuses)
		app.get('/api/events', this.handleEvents)
	}

	/**
   * Middleware to handle request authentication
   * @param {Object} request The request object
   * @param {Object} reply The reply object
   * @param {Function} done Callback to continue the request flow
   */
  authenticateRequest(request, reply, done) {
    if (this.auth.isPublicPath(request.url) || request.session.get('authenticated')) {
      done()
    }
  else {
      reply.redirect('/login')
    }
  }

	/**
   * Handles home routes request
   * @param {Object} request The request object
   * @param {Object} reply The reply object
   */
  async handleHomeRequest(request, reply) {
    try {
      const logs = await this.log.list(request, reply)
      const servicesUrl = this.service.getServiceUrls()

      await this.home.index(request, reply, { logs, servicesUrl, servicesStatus: [], request })
    }
		catch (error) {
      this.handleError(reply, error)
    }
  }

	/**
   * Fetches service statuses
   * @param {Object} request The request object
   * @param {Object} reply The reply object
   */
  async getServiceStatuses(request, reply) {
    try {
      const serviceStatus = await this.service.checkServices()
      reply.send(serviceStatus)
    }
		catch (error) {
      this.handleError(reply, error, 'Unable to get services')
    }
  }

	/**
	 * Handles SSE events
	 * @param {Object} request The request object
	 * @param {Object} reply The reply object
	 */
	async handleEvents (request, reply) {
		try {
			await this.event.handleEvents(request, reply)
		}
		catch (error) {
			this.handleError(reply, error, 'Unable to establish SSE connection')
		}
	}

	/**
   * Handles the request for a not found route
   * @param {Object} request The request object
   * @param {Object} reply The reply object
   */
  NotFoundHandler(request, reply) {
    reply.code(404).view('404.njk')
  }

  /**
   * Centralized error handler to send consistent error responses
   * @param {Object} reply The reply object
   * @param {Error} error The error object
   * @param {string} [message] Optional message to override error message
   */
  handleError(reply, error, message = 'Internal Server Error') {
    reply.status(500).send({  error: error.message || message })
  }
}
