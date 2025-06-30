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

		this.publicPaths = ['/assets/', '/login']
		this.setup()
	}

	/**
	 * Sets up the authentication plugin for the Fastify instance
	 */
	setup () {
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
				request.session.set('authenticated', true)
				reply.redirect('/')
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
			request.session.destroy((err) => {
				if (err) {
					reply.status(500).send('Failed to logout')
				} else {
					reply.redirect('/login')
				}
			})
		})
	}
}

