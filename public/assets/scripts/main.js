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
					if (!listItem) return
					status.innerHTML = service.online ? '✅' : '❌'
					listItem.dataset.status = service.online ? 'online' : 'offline';
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

document.addEventListener('DOMContentLoaded', () => {
	logsModales()
	highlightJS()
	statuses()
})
