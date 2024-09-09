class Service {
	constructor () {
		this.servicesList = JSON.parse(process.env.SERVICES_LIST)
	}

	async checkAllServices () {
		const checkService = async service => {
			try {
				const response = await fetch(service.url, { method: 'HEAD' })
				return { name: service.name, url: service.url, online: response.ok }
			}
			catch (error) {
				return { name: service.name, url: service.url, online: false }
			}
		}

		const statusChecks = await Promise.allSettled(this.servicesList.map(checkService))
		return statusChecks.map(result => result.status === 'fulfilled' ? result.value : { app: result.reason.app, url: result.reason.url, online: false })
	}
}

export default Service
