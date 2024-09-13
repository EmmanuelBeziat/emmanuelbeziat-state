import Home from '../src/models/Home.js'
import Service from '../src/models/Service.js'

describe('Home Class', () => {
	let home, service, reply

	beforeEach(() => {
		home = new Home()
		service = new Service()
		reply = {
			code: jest.fn().mockReturnThis(),
			view: jest.fn()
		}
	})

	test('render should respond with status 200 and render the logs view', () => {
		const logs = [{ message: 'Log entry 1' }, { message: 'Log entry 2' }]
		const serviceStatus = [
			{ name: 'App 1', url: 'http://app1.com', online: true },
			{ name: 'App 2', url: 'http://app2.com', online: false }
		]
		service.checkAllServices = jest.fn().mockResolvedValue(serviceStatus)

		home.render(reply, { logs, services: serviceStatus })

		expect(reply.code).toHaveBeenCalledWith(200)
		expect(reply.view).toHaveBeenCalledWith('logs.njk', { logs })
	})
})
