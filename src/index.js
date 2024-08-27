import App from './App.js'
import cors from '@fastify/cors'
import view from '@fastify/view'
import fstatic from '@fastify/static'
import favicons from 'fastify-favicon'
import path from 'path'
import { fileURLToPath } from 'url'
import nunjucks from 'nunjucks'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// CORS
App.register(cors, {
	origin: (origin, cb) => {
		// Allow requests from localhost or a specific domain
		if (/localhost/.test(origin) || 'https://www.emmanuelbeziat.com') {
			cb(null, true)
			return
		}

		cb(new Error('Not allowed'))
	}
})

App.register(view, {
  engine: { nunjucks },
	root: './src/views',
})

App.register(fstatic, {
	root: path.join(__dirname, '../public'),
})

App.register(favicons, {
	path: './public/favicons',
	name: 'favicon.ico'
})

// Server start
App.listen({ port: process.env.PORT || 3000, host: '127.0.0.1' })
	.then(address => {
		console.log(`Server started on ${address}`)
	})
	.catch(error => {
		console.log(`Error starting server: ${error}`)
		process.exit(1)
	})
