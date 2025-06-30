import { HomeController, LogController, ServiceController } from '../controllers/index.js'

export default async function (app, _opts) {
	const home = new HomeController()
	const log = new LogController()
	const service = new ServiceController()

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

	app.get('/login', (request, reply) => {
		reply.view('login.njk', { error: request.query.error })
	})

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

	app.setNotFoundHandler((request, reply) => {
		reply.code(404).view('404.njk')
	})
}
