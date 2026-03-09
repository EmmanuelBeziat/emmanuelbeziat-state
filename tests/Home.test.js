import { describe, test, expect, beforeEach, vi } from 'vitest'
import Home from '../src/models/Home.js'

describe('Home Class', () => {
	let home, reply

	beforeEach(() => {
		home = new Home()
		reply = {
			code: vi.fn().mockReturnThis(),
			view: vi.fn()
		}
	})

	test('render should respond with status 200 and render the logs view', async () => {
		const logs = [{ message: 'Log entry 1' }, { message: 'Log entry 2' }]
		const servicesUrl = [
			{ name: 'App 1', url: 'http://app1.com' },
			{ name: 'App 2', url: 'http://app2.com' }
		]

		await home.render(reply, { logs, servicesUrl })

		expect(reply.code).toHaveBeenCalledWith(200)
		expect(reply.view).toHaveBeenCalledWith('logs.njk', { logs, services: servicesUrl })
	})
})
