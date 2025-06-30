import Service from '../models/Service.js'

export class ServiceController {
	constructor () {
		this.model = new Service()
	}

	checkServices (_request, _reply) {
		return this.model.checkAllServices()
			.then(data => data)
			.catch(err => {
 throw err 
})
	}

	getServiceUrls () {
		return this.model.servicesList
	}
}
