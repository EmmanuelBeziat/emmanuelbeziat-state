import { HomeController, LogController, ServiceController } from '../controllers/index.js'

/**
 * Defines the web routes for the application.
 * @param {import('fastify').FastifyInstance} app - The Fastify instance.
 * @param {Object} _opts - The options passed to the plugin.
 */
export default async function (app, _opts) {
	const home = new HomeController()
	const log = new LogController()
	const service = new ServiceController()

	/**
	 * @route GET /
	 * @description Renders the home page with logs and service URLs.
	 */
	app.get('/', async (request, reply) => {
		try {
			const logs = await log.list(request, reply)
			const servicesUrl = service.getServiceUrls()
			await home.index(request, reply, { logs, servicesUrl, servicesStatus: [], request })
		}
		catch (error) {
			reply.status(500).send({ error: error.message || 'Internal Server Error' })
		}
	})

	/**
	 * @route GET /login
	 * @description Renders the login page.
	 */
	app.get('/login', (request, reply) => {
		reply.view('login.njk', { error: request.query.error })
	})

	/**
	 * @route POST /login
	 * @description Handles user login.
	 */
	app.post('/login', async (request, reply) => {
		const { username, password } = request.body
		try {
			await _opts.auth.validateCredentials(username, password)
			request.session.set('authenticated', true)
			reply.redirect('/')
		}
		catch (error) {
			reply.redirect(`/login?error=${encodeURIComponent(error.message)}`)
		}
	})

	/**
	 * @route GET /logout
	 * @description Handles user logout.
	 */
	app.get('/logout', (request, reply) => {
		request.session.destroy((err) => {
			if (err) {
				reply.status(500).send('Failed to logout')
			}
			else {
				reply.redirect('/login')
			}
		})
	})

	/**
	 * @description Sets a handler for not found routes.
	 */
	app.setNotFoundHandler((request, reply) => {
		reply.code(404).view('404.njk')
	})
}
