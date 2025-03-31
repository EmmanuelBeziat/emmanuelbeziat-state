import path from 'path'
import { fileURLToPath } from 'url'
import nunjucks from 'nunjucks'

// Simulate __dirname in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const config = {
	host: process.env.HOST || '127.0.0.1',
	port: process.env.PORT || 3000,
	paths: {
		views: path.resolve(__dirname, '../views'),
		public: path.resolve(__dirname, '../../public'),
		favicons: path.resolve(__dirname, '../../public/favicons')
	},
	websocket: {
		port: process.env.WEBSOCKET_PORT || '4080'
	},
	cors: {
		origin: true,
		credentials: true
	},
	viewEngine: nunjucks
}
