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
	const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
	const getStatus = async url => {
		await delay(500)
		fetch(url)
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok')
				}
				return response.json()
			})
			.then(serviceStatus => {
				if (!Array.isArray(serviceStatus)) {
					throw new Error('Service status is not an array')
				}
				serviceStatus.forEach(service => {
					const listItem = document.querySelector(`[data-url="${service.url}"]`)
					const status = listItem.querySelector('.status')
					if (!listItem || !status) return
					status.innerHTML = service.online ? '✅' : '❌'
					listItem.dataset.status = service.online ? 'online' : 'offline'
					listItem.dataset.time = `${service.time.toFixed(0)}ms`
				})
			})
			.catch(error => {
				console.error('Error fetching service statuses:', error)
			})
	}

	if (document.querySelector('.services-list')) {
		getStatus('/api/service-statuses')
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

	// Update the time element with the new log modification time
	const timeElement = logCard.querySelector('.log-time')
	if (timeElement) {
		console.log(log.date)
		timeElement.setAttribute('timestamp', log.date.timestamp)
		timeElement.textContent = log.date.formattedDate
	}
}

const getWebSocket = () => {
	const socket = new WebSocket('ws://state.emmanuelbeziat.com:3078')
	socket.onmessage = event => {
		const newLogs = JSON.parse(event.data)
		updateLogsView(newLogs)
	}
}

document.addEventListener('DOMContentLoaded', () => {
	logsModales()
	highlightJS()
	statuses()
	getWebSocket()
})
