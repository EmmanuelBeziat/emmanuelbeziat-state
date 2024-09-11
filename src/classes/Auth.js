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
    this.publicPaths = ['/assets/']
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
}

