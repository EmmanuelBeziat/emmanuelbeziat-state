'use strict'

const logsModales = () => {
	const modalHandler = log => {
		const opener = log.querySelector('.log-details-opener')
		const dialog = log.querySelector('.log-details-modal')
		const closer = log.querySelector('.log-details-closer')

		opener.addEventListener('click', () => { dialog.showModal() })
		closer.addEventListener('click', () => { dialog.close() })
		dialog.addEventListener('click', event => {
			if (event.target.nodeName === 'DIALOG') { dialog.close() }
		})
	}

	document.querySelectorAll('.log').forEach(log => {
		modalHandler(log)
	})
}

const highlightJS = () => {
	hljs.highlightAll()
}

const statuses = () => {
	let etag = null
	const getStatus = async url => {
		const headers = {}
		if (etag) headers['If-None-Match'] = etag

		const response = await fetch(url, { headers })
		if (response.status === 304) {
			console.log('Resource not modified, using cached version')
			return
		}

		if (response.ok) {
			etag = response.headers.get('ETag')
			const data = await response.json()
			if (!Array.isArray(data)) {
				throw new Error('Service status is not an array')
			}

			data.forEach(service => {
				const listItem = document.querySelector(`[data-url="${service.url}"]`)
				const status = listItem.querySelector('.status')

				if (!listItem || !status) return
				listItem.dataset.status = service.online ? 'online' : 'offline'

				if (!service.online) return
				listItem.dataset.time = `${service.time.toFixed(0)}ms`
			})
		}
		else {
			console.error('Failed to fetch resource')
		}
	}

	if (document.querySelector('.services-list')) {
		setTimeout(() => getStatus('/api/service-statuses'), 500)
		setInterval(() => getStatus('/api/service-statuses'), 30000)
	}
}

const updateLogsView = log => {
	const logCard = document.getElementById(log.folder)
	if (!logCard) return

	if (log.type === 'output') {
		const code = logCard.querySelector('.log-details-code code')
		if (!code) return

		code.removeAttribute('data-highlighted')
		code.innerHTML = log.logs
		hljs.highlightElement(code)
	}
	else if (log.type === 'status') {
		const statusElement = logCard.querySelector('.log-status')
		if (!statusElement) return

		logCard.dataset.status = log.status
		statusElement.textContent = log.status
	}

	// Push the logcard at the top
	logCard.parentNode.prepend(logCard)

	// Update the time element with the new log modification time
	const timeElement = logCard.querySelector('.log-time')
	if (timeElement) {
		timeElement.setAttribute('timestamp', log.date.timestamp)
		timeElement.textContent = log.date.formattedDate
	}
}

const getSSE = () => {
	let reconnectAttempts = 0
	const maxReconnectAttempts = 5
	const reconnectDelay = 5000 // 5 seconds

	const connect = () => {
		const eventSource = new EventSource('/api/events')

		eventSource.onopen = () => {
			console.log('SSE connection established')
			reconnectAttempts = 0 // Reset reconnect attempts on successful connection
		}

		eventSource.onmessage = event => {
			const data = JSON.parse(event.data)

			// Handle different message types
			switch (data.type) {
				case 'connection':
					console.log('SSE connection status:', data.status)
					break
				case 'heartbeat':
					// Heartbeat received, connection is alive
					break
				default:
					// Handle log updates
					updateLogsView(data)
			}
		}

		eventSource.onerror = error => {
			console.error('SSE error:', error)
			eventSource.close()

			// Implement exponential backoff for reconnection
			if (reconnectAttempts < maxReconnectAttempts) {
				reconnectAttempts++
				const delay = reconnectDelay * Math.pow(2, reconnectAttempts - 1)
				console.log(`Attempting to reconnect in ${delay/1000} seconds... (Attempt ${reconnectAttempts}/${maxReconnectAttempts})`)
				setTimeout(connect, delay)
			}
			else {
				console.error('Max reconnection attempts reached. Please refresh the page.')
			}
		}
	}

	connect()
}

document.addEventListener('DOMContentLoaded', () => {
	logsModales()
	highlightJS()
	statuses()
	getSSE()
})
