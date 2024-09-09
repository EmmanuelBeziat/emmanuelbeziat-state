import Home from '../models/Home.js'

export class HomeController {
	constructor () {
		this.model = new Home()
	}

	index (req, reply, data) {
		this.model.render(reply, data)
	}
}
