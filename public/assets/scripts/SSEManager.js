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
		this.maxReconnectAttempts = 5
		this.reconnectDelay = 5000

		this.connect()
	}

	/**
	 * Establishes a new SSE connection to the server
	 * Sets up event handlers for connection, messages, and errors
	 */
	connect () {
		const eventSource = new EventSource('/api/events')

		eventSource.onopen = () => {
			console.log('SSE connection established')
			this.reconnectAttempts = 0
		}

		eventSource.onmessage = event => {
			const data = JSON.parse(event.data)
			this.handleMessage(data)
		}

		eventSource.onerror = error => {
			console.error('SSE error:', error)
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
	 * Handles reconnection attempts with exponential backoff
	 * Attempts to reconnect up to maxReconnectAttempts times
	 */
	handleReconnection () {
		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			this.reconnectAttempts++
			const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
			console.log(`Attempting to reconnect in ${delay/1000} seconds… (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
			setTimeout(() => this.connect(), delay)
		}
		else {
			console.error('Max reconnection attempts reached. Please refresh the page.')
		}
	}
}
