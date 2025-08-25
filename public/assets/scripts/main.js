'use strict'

import LogsManager from './LogsManager.js'
import ServiceStatusManager from './ServiceStatusManager.js'
import SSEManager from './SSEManager.js'

// Initialize all modules
document.addEventListener('DOMContentLoaded', () => {
	const logsManager = new LogsManager()
	new ServiceStatusManager()

	// Ne pas initialiser l'EventSource sur la page de login
	if (!window.location.pathname.includes('/login')) {
		new SSEManager(logsManager)
	}
})
