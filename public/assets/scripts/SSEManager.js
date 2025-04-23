export default class SSEManager {
	constructor(logsManager) {
		this.logsManager = logsManager
		this.reconnectAttempts = 0
		this.maxReconnectAttempts = 5
		this.reconnectDelay = 5000

		this.connect()
	}

	connect() {
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

	handleMessage(data) {
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

	handleReconnection() {
		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			this.reconnectAttempts++
			const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
			console.log(`Attempting to reconnect in ${delay/1000} seconds... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
			setTimeout(() => this.connect(), delay)
		} else {
			console.error('Max reconnection attempts reached. Please refresh the page.')
		}
	}
}
