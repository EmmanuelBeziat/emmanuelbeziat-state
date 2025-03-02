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

let etag = null
const statuses = () => {
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
		setInterval(() => getStatus('/api/service-statuses'), 30000)
	}
}

const updateLogsView = (log) => {
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
		console.log(log.date)
		timeElement.setAttribute('timestamp', log.date.timestamp)
		timeElement.textContent = log.date.formattedDate
	}
}

const getWebSocket = () => {
	const socket = new WebSocket('ws://127.0.0.1:3078')
	socket.onopen = () => {
		console.log('WebSocket connection opened.')
	}

	socket.onmessage = event => {
		const newLogs = JSON.parse(event.data)
		updateLogsView(newLogs)
	}

	socket.onerror = error => {
		console.error('WebSocket encountered an error:', error)
	}

	socket.onclose = event => {
		console.log('WebSocket connection closed:', event)
	}
}

document.addEventListener('DOMContentLoaded', () => {
	logsModales()
	highlightJS()
	statuses()
	getWebSocket()
})
