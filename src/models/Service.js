class Service {
	constructor () {
		this.servicesList = JSON.parse(process.env.SERVICES_LIST)
	}

	/**
	 * Checks the status of all services.
	 * @returns {Promise<Array>} A promise that resolves to an array of service statuses
	 */
	async checkAllServices () {
		const checkService = async service => {
			const startTime = performance.now()
			try {
				const response = await fetch(service.url, { method: 'HEAD' })
				const endTime = performance.now()
				const duration = endTime - startTime
				return { name: service.name, url: service.url, online: response.ok, time: duration }
			}
			catch (error) {
				return { name: service.name, url: service.url, online: false, error: error.message }
			}
		}

		const statusChecks = await Promise.allSettled(this.servicesList.map(checkService))
		return statusChecks.map(result => result.status === 'fulfilled' ? result.value : { app: result.reason.app, url: result.reason.url, online: false })
	}
}

export default Service
