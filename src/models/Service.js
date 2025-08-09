/**
 * Checks external services availability
 */
class Service {
	constructor () {
		/** @type {{name:string, url:string}[]} */
		this.servicesList = JSON.parse(process.env.SERVICES_LIST)
		this.timeoutMs = Number(process.env.SERVICES_TIMEOUT_MS || 5000)
	}

	/**
	 * Checks the status of all configured services
	 * @returns {Promise<Array<{name:string, url:string, online:boolean, time?:number, error?:string}>>}
	 */
	async checkAllServices () {
		const checkSingleService = async service => {
			const startTimeMs = performance.now()
			const abortController = new AbortController()
			const timeoutId = setTimeout(() => abortController.abort(), this.timeoutMs)

			try {
				const response = await fetch(service.url, { method: 'HEAD', signal: abortController.signal })
				const endTimeMs = performance.now()
				const durationMs = endTimeMs - startTimeMs
				return { name: service.name, url: service.url, online: response.ok, time: durationMs }
			}
			catch (error) {
				const endTimeMs = performance.now()
				const durationMs = endTimeMs - startTimeMs
				const isTimeout = error && (error.name === 'AbortError' || /aborted|timeout/i.test(error.message))
				return { name: service.name, url: service.url, online: false, time: durationMs, error: isTimeout ? 'timeout' : (error.message || 'error') }
			}
			finally {
				clearTimeout(timeoutId)
			}
		}

		const statusChecks = await Promise.allSettled(this.servicesList.map(service => checkSingleService(service)))
		return statusChecks.map((result, index) => {
			if (result.status === 'fulfilled') return result.value
			const service = this.servicesList[index]
			return { name: service.name, url: service.url, online: false }
		})
	}
}

export default Service
