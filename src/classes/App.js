import fastify from 'fastify'
import { Router } from '../routes/Routes.js'
import { Auth } from './Auth.js'
import cookie from '@fastify/cookie'
import session from '@fastify/session'

class App {
	constructor () {
		this.app = fastify()
		this.app.register(cookie)
		this.app.register(session, {
			secret: process.env.SESSION_SECRET,
			cookie: {
				secure: process.env.NODE_ENV === 'production',
				httpOnly: true,
				sameSite: 'strict'
			}
		})
		this.auth = new Auth(this.app)
		this.router = new Router(this.auth)
		this.router.routes(this.app)
	}
}

export default new App().app
