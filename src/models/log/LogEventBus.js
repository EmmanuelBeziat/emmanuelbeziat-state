/**
 * Minimal publish/subscribe event bus to fan out log updates to SSE clients
 */
export default class LogEventBus {
	constructor () {
		/** @type {Set<{write: (data: object) => void}>} */
		this.subscribers = new Set()
	}

	/**
	 * Adds a client to the subscription list
	 * @param {{write: (data: object) => void}} client SSE client wrapper
	 */
	subscribe (client) {
		this.subscribers.add(client)
	}

	/**
	 * Removes a client from the subscription list
	 * @param {{write: (data: object) => void}} client SSE client wrapper
	 */
	unsubscribe (client) {
		this.subscribers.delete(client)
	}

	/**
	 * Current number of subscribers
	 * @returns {number}
	 */
	size () {
		return this.subscribers.size
	}

	/**
	 * Publishes data to all subscribed clients
	 * @param {object} data Event payload
	 */
	publish (data) {
		for (const client of this.subscribers) {
			try {
				client.write(data)
			}
			catch {
				// ignore client errors
			}
		}
	}
}


