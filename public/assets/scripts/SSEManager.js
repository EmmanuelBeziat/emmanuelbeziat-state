/**
 * Manages Server-Sent Events (SSE) connection and message handling
 * Handles automatic reconnection attempts and message processing
 */
export default class SSEManager {
	/**
	 * Creates a new SSEManager instance
	 * @param {Object} logsManager - The logs manager instance to handle log updates
	 */
	constructor (logsManager) {
		this.logsManager = logsManager
		this.reconnectAttempts = 0
		this.reconnectDelay = 5000
		this.maxReconnectDelay = 30000
		this.hasDroppedConnection = false

		this.connect()
	}

	/**
	 * Establishes a new SSE connection to the server
	 * Sets up event handlers for connection, messages, and errors
	 */
	connect () {
		const eventSource = new EventSource('/api/events')

		eventSource.onopen = () => {
			if (this.hasDroppedConnection) {
				console.log('SSE reconnected after a drop — reloading to resync state')
				window.location.reload()
				return
			}

			console.log('SSE connection established')
			this.reconnectAttempts = 0
		}

		eventSource.onmessage = event => {
			let data
			try {
				data = JSON.parse(event.data)
			}
			catch (error) {
				console.error('SSE message parse error:', error)
				return
			}
			this.handleMessage(data)
		}

		eventSource.onerror = error => {
			console.error('SSE error:', error)
			this.hasDroppedConnection = true
			eventSource.close()
			this.handleReconnection()
		}
	}

	/**
	 * Processes incoming SSE messages based on their type
	 * @param {Object} data - The parsed message data from the server
	 */
	handleMessage (data) {
		switch (data.type) {
			case 'connection':
				console.log('SSE connection status:', data.status)
				break
			case 'heartbeat':
				break
			default:
				this.logsManager.updateLog(data)
		}
	}

	/**
	 * Handles reconnection attempts with exponential backoff, plateauing at
	 * maxReconnectDelay instead of giving up — a dropped connection (e.g. a deploy
	 * restart) should always eventually reconnect on its own.
	 */
	handleReconnection () {
		this.reconnectAttempts++
		const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay)
		console.log(`Attempting to reconnect in ${delay / 1000} seconds… (attempt ${this.reconnectAttempts})`)
		setTimeout(() => this.connect(), delay)
	}
}
