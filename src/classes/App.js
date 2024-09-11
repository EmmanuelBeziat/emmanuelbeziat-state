import fastify from 'fastify'
import { Router } from '../routes/Routes.js'
import { Auth } from './Auth.js'

class App {
	constructor () {
		this.app = fastify()
		this.auth = new Auth(this.app)
		this.router = new Router(this.auth)
		this.router.routes(this.app)
	}
}

export default new App().app
