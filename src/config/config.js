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
	cors: {
		origin: process.env.CORS_ORIGIN || true,
		credentials: Boolean(process.env.CORS_ORIGIN)
	},
	rateLimit: {
		max: 100,
		timeWindow: '1 minute'
	},
	viewEngine: nunjucks
}

/**
 * Environment variables that must be set for the server to start.
 * @see src/index.js's Server.checkEnvVariables
 */
export const requiredEnv = ['AUTH_USERNAME', 'AUTH_PASSWORD', 'SESSION_SECRET', 'SERVICES_LIST']
