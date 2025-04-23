export default class ServiceStatusManager {
	constructor() {
		this.etag = null
		this.init()
	}

	init() {
		if (!document.querySelector('.services-list')) return

		setTimeout(() => this.fetchStatus('/api/service-statuses'), 500)
		setInterval(() => this.fetchStatus('/api/service-statuses'), 30000)
	}

	async fetchStatus(url) {
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

	updateServiceStatuses(services) {
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
