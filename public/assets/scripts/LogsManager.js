/* global hljs */

export default class LogsManager {
	/**
	 * Creates a new LogsManager instance
	 * Initializes modals and code highlighting
	 */
	constructor () {
		this.setupModals()
		this.setupCodeHighlighting()
	}

	/**
	 * Sets up modal dialogs for all log entries
	 */
	setupModals () {
		document.querySelectorAll('.log').forEach(log => this.setupModal(log))
	}

	/**
	 * Configures a single modal dialog for a log entry
	 * @param {HTMLElement} log - The log element to setup the modal for
	 */
	setupModal (log) {
		const opener = log.querySelector('.log-details-opener')
		const dialog = document.getElementById(`modal-${log.id}`)
		const closer = dialog.querySelector('.log-details-closer')

		opener.addEventListener('click', () => dialog.showModal())
		closer.addEventListener('click', () => dialog.close())
		dialog.addEventListener('click', event => {
			if (event.target.nodeName === 'DIALOG') dialog.close()
		})
	}

	/**
	 * Initializes syntax highlighting for code blocks
	 */
	setupCodeHighlighting () {
		hljs.highlightAll()
	}

	/**
	 * Updates a log entry with new data
	 * @param {Object} log - The log data to update
	 */
	updateLog (log) {
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
		}
		else if (log.type === 'status') {
			this.updateStatusLog(log, logCard, dialog)
		}

		this.updateLogCardPosition(logCard)
		this.updateTimestamp(logCard, log.date)
	}

	/**
	 * Updates the output log content in a modal dialog
	 * @param {Object} log - The log data containing output content
	 * @param {HTMLElement} dialog - The modal dialog element
	 */
	updateOutputLog (log, dialog) {
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

	/**
	 * Updates the status information for a log entry
	 * @param {Object} log - The log data containing status information
	 * @param {HTMLElement} logCard - The log card element
	 * @param {HTMLElement} dialog - The modal dialog element
	 */
	updateStatusLog (log, logCard, dialog) {
		const statusCard = logCard.querySelector('.log-status')
		if (!statusCard) {
			console.warn(`Status element not found in log card: ${log.folder}`)
			return
		}

		const statusDialog = dialog.querySelector('.log-status')
		if (!statusDialog) {
			console.warn(`Status element not found in log card: ${log.folder}`)
			return
		}

		const newStatus = String(log.status || '').trim()
		if (!newStatus) {
			console.warn(`Empty status received for log card: ${log.folder}`)
			return
		}

		logCard.dataset.status = newStatus
		dialog.dataset.status = newStatus
		statusCard.textContent = newStatus
		statusDialog.textContent = newStatus
	}

	/**
	 * Updates the position of a log card in the UI
	 * @param {HTMLElement} logCard - The log card element to reposition
	 */
	updateLogCardPosition (logCard) {
		logCard.parentNode.prepend(logCard)
	}

	/**
	 * Updates the timestamp display for a log entry
	 * @param {HTMLElement} logCard - The log card element
	 * @param {Object} date - The date object containing timestamp and formatted date
	 */
	updateTimestamp (logCard, date) {
		const timeElement = logCard.querySelector('.log-time')
		if (timeElement) {
			timeElement.dataset.timestamp = date.timestamp
			timeElement.textContent = date.formattedDate
		}
	}
}
