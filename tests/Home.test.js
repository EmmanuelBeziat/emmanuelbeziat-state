import Home from '../src/models/Home.js'

describe('Home Class', () => {
	let home
	let reply

	beforeEach(() => {
		home = new Home()
		reply = {
			code: jest.fn().mockReturnThis(),
			view: jest.fn()
		}
	})

	test('render should respond with status 200 and render the logs view', () => {
		const logs = [{ message: 'Log entry 1' }, { message: 'Log entry 2' }]
		home.render(reply, logs)

		expect(reply.code).toHaveBeenCalledWith(200)
		expect(reply.view).toHaveBeenCalledWith('../views/logs.njk', { logs })
	})
})
