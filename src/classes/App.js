import fastify from 'fastify'
import { Auth } from './Auth.js'
import cookie from '@fastify/cookie'
import session from '@fastify/session'
import formbody from '@fastify/formbody'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import compress from '@fastify/compress'
import etag from '@fastify/etag'
import view from '@fastify/view'
import fstatic from '@fastify/static'
import favicons from 'fastify-favicon'
import { config, nunjucksFilters } from '../config/index.js'
import webRoutes from '../routes/web.js'
import apiRoutes from '../routes/api.js'

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
		this.app.register(formbody)
		this.app.register(cors, config.cors)
		this.app.register(etag)
		this.app.register(compress, {
			encodings: ['br', 'gzip'],
			global: true
		})
		if (process.env.NODE_ENV !== 'test') {
			this.app.register(rateLimit, {
				max: 100,
				timeWindow: '1 minute'
			})
		}
		this.app.register(view, {
			engine: { nunjucks: config.viewEngine },
			root: config.paths.views,
			options: {
				onConfigure: nunjucksFilters,
				noCache: process.env.NODE_ENV !== 'production'
			}
		})
		this.app.register(fstatic, {
			root: config.paths.public
		})
		this.app.register(favicons, {
			path: config.paths.favicons,
			name: 'favicon.ico'
		})
		this.auth = new Auth()

		this.app.addHook('onRequest', (request, reply, done) => {
			if (this.auth.isPublicPath(request.url) || request.session.get('authenticated')) {
				done()
			}
			else {
				reply.redirect('/login')
			}
		})

		this.app.register(webRoutes, { auth: this.auth })
		this.app.register(apiRoutes, { prefix: '/api', auth: this.auth })
	}
}

export default new App().app
