import basicAuth from '@fastify/basic-auth'

/**
 * Manages authentication for the application
 */
export class Auth {

	/**
	 * Creates an instance of Auth.
	 * @param {import('fastify').FastifyInstance} fastifyInstance - The Fastify application instance.
	 */
	constructor (app) {
		this.app = app

		this.realm = 'Emmanuel Béziat Logs'
		this.publicPaths = ['/assets/', '/login']
		this.setup()
	}

	/**
	 * Sets up the authentication plugin for the Fastify instance
	 */
	setup () {
		this.app.register(basicAuth, {
			validate: this.validateCredentials,
			authenticate: { realm: this.realm }
		})

		this.setupLoginRoute()
		this.setupLogoutRoute()
	}

	/**
	 * Validates user credentials against environment variables.
	 * @param {string} username - The provided username.
	 * @param {string} password - The provided password.
	 * @throws {Error} If credentials are invalid.
	 */
	validateCredentials = async (username, password) => {
		const isValid = username === process.env.AUTH_USERNAME && password === process.env.AUTH_PASSWORD

		if (!isValid) {
			throw new Error('Invalid credentials')
		}
	}

	 /**
	 * Applies authentication middleware to requests.
	 * @param {import('fastify').FastifyRequest} request - The incoming request.
	 * @param {import('fastify').FastifyReply} reply - The outgoing reply.
	 * @param {Function} done - The function to call when done.
	 */
	applyAuth (request, reply, done) {
		if (this.isPublicPath(request.url)) {
			done ()
		}
		else {
			this.app.basicAuth(request, reply, done)
		}
	}

	/**
	 * Checks if the given path should be publicly accessible.
	 * @param {string} path - The path to check.
	 * @returns {boolean} True if the path should be public, false otherwise.
	 */
	isPublicPath (path) {
		return this.publicPaths.some(publicPath => path.startsWith(publicPath))
	}

	/**
	 * Sets up the login routes for both GET and POST requests.
	 * GET /login: Renders the login form.
	 * POST /login: Handles the login form submission.
	 */
	setupLoginRoute () {
		this.app.get('/login', (request, reply) => {
			reply.view('login.njk', { error: request.query.error })
		})

		this.app.post('/login', async (request, reply) => {
			const { username, password } = request.body

			try {
				await this.validateCredentials(username, password)
				reply.setCookie('auth', 'true', {
					path: '/',
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'strict'
				}).redirect('/')
			}
			catch (error) {
				reply.redirect(`/login?error=${encodeURIComponent(error.message)}`)
			}
		})
	}

	/**
	 * Sets up the logout route.
	 * GET /logout: Handles user logout by clearing the authentication cookie.
	 */
	setupLogoutRoute () {
		this.app.get('/logout', (request, reply) => {
			reply.clearCookie('auth', { path: '/' }).redirect('/login')
		})
	}
}

