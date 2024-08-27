import Log from '../models/Log.js'

export class LogController {
	constructor () {
		this.model = new Log()
	}

	list (req, reply) {
		return this.model.getAllLogs()
			.then(data => data)
			.catch(err => { throw err })
	}

	state (req, reply) {
		return this.model.stateChange(req.params.name, req.params.state)
	}
}
