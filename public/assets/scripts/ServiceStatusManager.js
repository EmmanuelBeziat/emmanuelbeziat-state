export default class ServiceStatusManager {
	/**
	 * Creates a new ServiceStatusManager instance
	 * Initializes ETag for caching and starts the status monitoring
	 */
	constructor () {
		this.etag = null
		this.init()
	}

	/**
	 * Initializes the service status monitoring
	 * Sets up initial fetch and periodic status checks
	 */
	init () {
		if (!document.querySelector('.services-list')) return

		setTimeout(() => this.fetchStatus('/api/service-statuses'), 500)
		setInterval(() => this.fetchStatus('/api/service-statuses'), 30000)
	}

	/**
	 * Fetches the current status of all services
	 * Uses ETag for caching to minimize unnecessary updates
	 * @param {string} url - The API endpoint to fetch service statuses from
	 */
	async fetchStatus (url) {
		const headers = this.etag ? { 'If-None-Match': this.etag } : {}
		const response = await fetch(url, { headers })

		if (response.status === 304) {
			console.log('Resource not modified, using cached version')
			return
		}

		if (!response.ok) {
			console.error('Failed to fetch resource')
			return
		}

		this.etag = response.headers.get('ETag')
		const data = await response.json()

		if (!Array.isArray(data)) {
			throw new Error('Service status is not an array')
		}

		this.updateServiceStatuses(data)
	}

	/**
	 * Updates the UI with the latest service statuses
	 * @param {Array} services - Array of service objects containing status information
	 */
	updateServiceStatuses (services) {
		services.forEach(service => {
			const listItem = document.querySelector(`[data-url="${service.url}"]`)
			const status = listItem?.querySelector('.status')

			if (!listItem || !status) return

			listItem.dataset.status = service.online ? 'online' : 'offline'
			if (service.online) {
				listItem.dataset.time = `${service.time.toFixed(0)}ms`
			}
		})
	}
}
