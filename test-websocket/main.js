const fastify = require('fastify')();
fastify.register(require('fastify-websocket'));

fastify.get('/hello', (request, reply) => {
    reply.send({
        message: 'Hello Fastify'
    });
});

fastify.get('/hello-ws', { websocket: true }, (connection, req) => {
	console.log('route')
	connection.socket.on('error', error => {
		console.log(error.stack)
	})
	connection.socket.on('message', message => {
			console.log('connect')
        connection.socket.send('Hello Fastify WebSockets');
    });
});

fastify.listen({ host: '127.0.0.1', port: 3000 }, (err, address) => {
    if(err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at: ${address}`);
});
