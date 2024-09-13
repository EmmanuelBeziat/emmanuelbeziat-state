class Home {
	/**
	 * Renders the Home page with provided data.
	 * @param {Object} reply - The reply object.
	 * @param {Object} data - The data to render.
	 */
	async render (reply, data) {
		await reply.code(200).view('logs.njk', { logs: data.logs, services: data.servicesUrl })
	}
}

export default Home
