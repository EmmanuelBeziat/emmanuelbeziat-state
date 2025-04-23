export default class LogsManager {
	constructor() {
		this.setupModals()
		this.setupCodeHighlighting()
	}

	setupModals() {
		document.querySelectorAll('.log').forEach(log => this.setupModal(log))
	}

	setupModal(log) {
		const opener = log.querySelector('.log-details-opener')
		const dialog = document.getElementById(`modal-${log.id}`)
		const closer = dialog.querySelector('.log-details-closer')

		opener.addEventListener('click', () => dialog.showModal())
		closer.addEventListener('click', () => dialog.close())
		dialog.addEventListener('click', event => {
			if (event.target.nodeName === 'DIALOG') dialog.close()
		})
	}

	setupCodeHighlighting() {
		hljs.highlightAll()
	}

	updateLog(log) {
		const logCard = document.getElementById(log.folder)
		if (!logCard) {
			console.warn(`Log card not found for folder: ${log.folder}`)
			return
		}

		const dialog = document.getElementById(`modal-${log.folder}`)
		if (!dialog) {
			console.warn(`Dialog modal not found for folder: ${log.folder}`)
			return
		}

		if (log.type === 'output') {
			this.updateOutputLog(log, dialog)
		} else if (log.type === 'status') {
			this.updateStatusLog(log, logCard, dialog)
		}

		this.updateLogCardPosition(logCard)
		this.updateTimestamp(logCard, log.date)
	}

	updateOutputLog(log, dialog) {
		const code = dialog.querySelector('.log-details-code code')
		if (!code) {
			console.warn(`Code element not found in log card: ${log.folder}`)
			return
		}

		code.innerHTML = log.logs
		if (code.closest('.log-details-modal[open]')) {
			code.removeAttribute('data-highlighted')
			hljs.highlightElement(code)
		}
	}

	updateStatusLog(log, logCard, dialog) {
		const statusElement = logCard.querySelector('.log-status')
		if (!statusElement) {
			console.warn(`Status element not found in log card: ${log.folder}`)
			return
		}

		const newStatus = String(log.status || '').trim()
		if (!newStatus) {
			console.warn(`Empty status received for log card: ${log.folder}`)
			return
		}

		console.log('status')

		logCard.dataset.status = newStatus
		dialog.dataset.status = newStatus
		statusElement.textContent = newStatus
	}

	updateLogCardPosition(logCard) {
		logCard.parentNode.prepend(logCard)
	}

	updateTimestamp(logCard, date) {
		const timeElement = logCard.querySelector('.log-time')
		if (timeElement) {
			timeElement.dataset.timestamp = date.timestamp
			timeElement.textContent = date.formattedDate
		}
	}
}