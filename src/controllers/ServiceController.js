import Service from '../models/Service.js'

export class ServiceController {
	constructor () {
		this.model = new Service()
	}

	checkServices (req, reply) {
		return this.model.checkAllServices()
			.then(data => {
				return data
			})
			.catch(err => { throw err })
	}

	getServiceUrls () {
		return this.model.servicesList
	}
}
