class Home {
	render (reply, data) {
		reply.code(200).view('../views/logs.njk', { logs: data.logs, services: data.servicesUrl })
	}
}

export default Home
