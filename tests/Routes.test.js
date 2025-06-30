import fastify from 'fastify'
import view from '@fastify/view'
import nunjucks from 'nunjucks'
import cookie from '@fastify/cookie'
import session from '@fastify/session'
import webRoutes from '../src/routes/web.js'
import apiRoutes from '../src/routes/api.js'
import { formatDate, formatDateRelative, sortByDate } from '../src/utils/filters.js'
import { test, expect, beforeAll, afterAll } from 'vitest'

describe('Routes', () => {
	let app, authCookie

	beforeAll(async () => {
		app = fastify()

		app.register(cookie)
		app.register(session, {
			secret: 'a-very-long-and-secure-secret-for-testing',
			cookie: { secure: false }
		})
		app.register(view, {
			engine: { nunjucks },
			root: './src/views',
			options: {
				onConfigure: env => {
					env.addFilter('formatDate', formatDate)
					env.addFilter('formatDateRelative', formatDateRelative)
					env.addFilter('sortByDate', sortByDate)
				}
			}
		})

		// Initialize authentication and router
		const auth = {
			validateCredentials: async (username, password) => {
				const isValid = username === process.env.AUTH_USERNAME && password === process.env.AUTH_PASSWORD
				if (!isValid) {
					throw new Error('Invalid credentials')
				}
			},
			isPublicPath: (path) => ['/assets/', '/login'].some(publicPath => path.startsWith(publicPath))
		}
		app.addHook('onRequest', (request, reply, done) => {
			if (auth.isPublicPath(request.url) || request.session.get('authenticated')) {
				done()
			}
			else {
				reply.redirect('/login')
			}
		})
		app.register(webRoutes, { auth })
		app.register(apiRoutes, { prefix: '/api', auth })

		// Set environment variables for authentication
		process.env.AUTH_USERNAME = 'testuser'
		process.env.AUTH_PASSWORD = 'testpass'
		process.env.SESSION_SECRET = 'a-very-long-and-secure-secret-for-testing'

		// Perform login to get auth cookie
		const response = await app.inject({
			method: 'POST',
			url: '/login',
			payload: {
				username: 'testuser',
				password: 'testpass'
			}
		})

		authCookie = response.headers['set-cookie']
	})

	afterAll(() => {
		app.close()
	})

	test('GET / should return 200 and render home page', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/',
			headers: {
				cookie: authCookie
			}
		})

		expect(response.statusCode).toBe(200)
		expect(response.body).toContain('class="logs-list"')
	})

	test('GET /api/service-statuses should return 200 and service statuses', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/api/service-statuses',
			headers: {
				cookie: authCookie
			}
		})

		expect(response.statusCode).toBe(200)
	})

	test('should return 404 status and render 404 template for unknown routes', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/unknown-route',
			headers: {
				cookie: authCookie
			}
		})

		expect(response.statusCode).toBe(404)
		expect(response.body).toContain('<h1>404</h1>')
		expect(response.body).toContain('<p>That route didn’t lead anywhere.</p>')
	})

	test('GET /login should return 200 and render login page', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/login'
		})

		expect(response.statusCode).toBe(200)
		expect(response.body).toContain('<div class="login-form">')
		expect(response.body).toContain('<button type="submit" class="button">Login</button>')
	})

	test('POST /login with valid credentials should set auth cookie and redirect to home', async () => {
		process.env.AUTH_USERNAME = 'testuser'
		process.env.AUTH_PASSWORD = 'testpass'

		const response = await app.inject({
			method: 'POST',
			url: '/login',
			payload: {
				username: 'testuser',
				password: 'testpass'
			}
		})

		expect(response.statusCode).toBe(302)
		expect(response.headers['set-cookie']).toBeDefined()
		expect(response.headers.location).toBe('/')
	})

	test('POST /login with invalid credentials should redirect to login with error', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/login',
			payload: {
				username: 'wronguser',
				password: 'wrongpass'
			}
		})

		expect(response.statusCode).toBe(302)
		expect(response.headers.location).toContain('/login?error=Invalid%20credentials')
	})

	test('GET /logout should clear auth cookie and redirect to login', async () => {
		const logoutResponse = await app.inject({
			method: 'GET',
			url: '/logout',
			headers: {
				cookie: authCookie
			}
		})

		expect(logoutResponse.statusCode).toBe(302)
		expect(logoutResponse.headers.location).toBe('/login')

		const postLogoutResponse = await app.inject({
			method: 'GET',
			url: '/',
			headers: {
				cookie: authCookie
			}
		})
		expect(postLogoutResponse.statusCode).toBe(302)
		expect(postLogoutResponse.headers.location).toBe('/login')
	})
})
