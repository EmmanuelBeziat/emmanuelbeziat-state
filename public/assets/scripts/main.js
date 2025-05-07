'use strict'

import LogsManager from './LogsManager.js'
import ServiceStatusManager from './ServiceStatusManager.js'
import SSEManager from './SSEManager.js'

// Initialize all modules
document.addEventListener('DOMContentLoaded', () => {
	const logsManager = new LogsManager()
	new ServiceStatusManager()
	new SSEManager(logsManager)
})
