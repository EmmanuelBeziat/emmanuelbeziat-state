class Home {
	render (reply, logs) {
		reply.code(200).view('../views/logs.njk', { logs })
	}
}

export default Home
