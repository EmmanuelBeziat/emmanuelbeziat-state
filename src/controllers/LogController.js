import Log from '../models/Log.js'

export class LogController {
	constructor () {
		this.model = new Log()
	}

	list (request, reply) {
		return this.model.getAllLogs()
			.then(data => data)
			.catch(err => { throw err })
	}
}
