import Home from '../models/Home.js'

export class HomeController {
	constructor () {
		this.model = new Home()
	}

	async index (_request, reply, data) {
		await this.model.render(reply, data)
	}
}
