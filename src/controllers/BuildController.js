import Build from '../models/Build.js'

export class BuildController {
	constructor () {
		this.model = new Build()
	}

	start (req, reply) {
		this.model.updateState(req.body.project, 'started')
	}
}
