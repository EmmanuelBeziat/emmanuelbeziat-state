import Home from '../models/Home.js'

export class HomeController {
	constructor () {
		this.model = new Home()
	}

	async index (request, reply, data) {
		await this.model.render(reply, data)
	}
}
