import basicAuth from '@fastify/basic-auth'

export class Auth {
	constructor (app) {
		this.app = app

		this.setup()
	}

	setup () {
		const validate = async (username, password) => {
			if (username !== process.env.AUTH_USERNAME || password !== process.env.AUTH_PASSWORD) {
				return new Error('Invalid credentials')
			}
		}

		this.app.register(basicAuth, {
			validate,
			authenticate: { realm: 'Emmanuel Béziat Logs' }
		})
	}

	applyAuth (request, reply, done) {
		if (request.url.startsWith('/assets/')) {
			done ()
		}
		else {
			this.app.basicAuth(request, reply, done)
		}
	}
}

