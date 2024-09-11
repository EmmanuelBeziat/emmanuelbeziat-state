import fastify from 'fastify'
import { Router } from '../routes/Routes.js'
import basicAuth from '@fastify/basic-auth'

class App {
	constructor () {
		this.app = fastify()
		this.setupAuth()
		this.router = new Router()
		this.router.routes(this.app)
	}

	setupAuth () {
    const validate = async (username, password, req, reply) => {
      if (username !== process.env.AUTH_USERNAME || password !== process.env.AUTH_PASSWORD) {
        return new Error('Invalid username or password')
      }
    }

    this.app.register(basicAuth, {
      validate,
      authenticate: { realm: 'Emmanuel Béziat Logs' }
    })
  }
}

export default new App().app
