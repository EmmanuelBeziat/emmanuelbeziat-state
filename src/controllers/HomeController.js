import Home from '../models/Home.js'

export class HomeController {
	constructor () {
		this.model = new Home()
	}

	index (req, reply, logs) {
		this.model.render(reply, logs)
	}
}
