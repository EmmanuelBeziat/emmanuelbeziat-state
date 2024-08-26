import { createMachine, interpret, state, transition } from 'robot3'

class State {
	constructor () {
		const machine = createMachine('idle', {
			idle: state(transition('deploy', 'deploy')),
			deploy: state(transition('success', 'success'), transition('failed', 'failed')),
			success: state(transition('idle', 'idle')),
			failed: state(transition('deploy', 'deploy'))
		})

		this.service = interpret(machine, () => {})
	}
}

export default State
