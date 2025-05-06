import Log from '../models/Log.js'

export class LogController {
	constructor () {
		this.model = new Log()
	}

	list (_request, _reply) {
		return this.model.getAllLogs()
			.then(data => data)
			.catch(err => { throw err })
	}
}
