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
})
