'use strict'

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

document.addEventListener('DOMContentLoaded', () => {
	// Modales
	document.querySelectorAll('.log').forEach(log => { modalHandler(log) })

	// Code highligting
	hljs.highlightAll()

	fetch('/api/service-statuses')
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
				const listItem = document.querySelector(`[data-url="${service.url}"] .status`)
				if (!listItem) return
				listItem.innerHTML = service.online ? '✅' : '❌'
				listItem.parentElement.dataset.status = service.online ? 'online' : 'offline';
			})
		})
		.catch(error => {
			console.error('Error fetching service statuses:', error)
		})
})
