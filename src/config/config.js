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
export const requiredEnv = ['AUTH_USERNAME', 'AUTH_PASSWORD', 'SESSION_SECRET', 'SESSION_SALT', 'SERVICES_LIST', 'LOGS_PATH', 'FILE_LOG', 'FILE_STATUS']

/**
 * Parses and validates the SERVICES_LIST JSON.
 * @param {string} raw Raw SERVICES_LIST value
 * @returns {{name: string, url: string}[]}
 * @throws {Error} If the value isn't a JSON array of {name, url} string pairs
 */
export const parseServicesList = raw => {
	let servicesList
	try {
		servicesList = JSON.parse(raw)
	}
	catch {
		throw new Error('SERVICES_LIST environment variable is missing or contains invalid JSON')
	}
	if (!Array.isArray(servicesList)) {
		throw new Error('SERVICES_LIST must be a JSON array')
	}
	servicesList.forEach((service, index) => {
		if (typeof service?.name !== 'string' || typeof service?.url !== 'string') {
			throw new Error(`SERVICES_LIST[${index}] must have string "name" and "url" properties`)
		}
	})
	return servicesList
}

/**
 * Parses and validates SERVICES_TIMEOUT_MS, defaulting to 5000ms when unset.
 * @param {string | undefined} raw Raw SERVICES_TIMEOUT_MS value
 * @returns {number}
 * @throws {Error} If the value isn't a positive number (NaN would make setTimeout fire immediately)
 */
export const parseServicesTimeout = raw => {
	if (raw === undefined || raw === '') return 5000
	const timeoutMs = Number(raw)
	if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
		throw new Error(`SERVICES_TIMEOUT_MS must be a positive number, got "${raw}"`)
	}
	return timeoutMs
}

/**
 * Validates presence and shape of the environment variables.
 * @param {NodeJS.ProcessEnv} env Environment to validate
 * @returns {string[]} Error messages, empty when the environment is valid
 */
export const validateEnv = (env = process.env) => {
	const missingEnv = requiredEnv.filter(envVar => !env[envVar])
	if (missingEnv.length > 0) {
		return [`Missing required environment variables: ${missingEnv.join(', ')}`]
	}

	const errors = []
	if (env.SESSION_SECRET.length < 32) {
		errors.push('SESSION_SECRET must be at least 32 characters long')
	}
	// Buffer.from(value, 'hex') silently drops invalid characters, so check the format up front
	if (!/^[0-9a-f]{32}$/i.test(env.SESSION_SALT)) {
		errors.push('SESSION_SALT must be a 16-byte hex string (32 hex characters), generate it via npm run setup')
	}
	if (!env.AUTH_PASSWORD.startsWith('$argon2')) {
		errors.push('AUTH_PASSWORD must be an argon2 hash, not a plaintext password, generate it via npm run setup')
	}
	for (const check of [() => parseServicesList(env.SERVICES_LIST), () => parseServicesTimeout(env.SERVICES_TIMEOUT_MS)]) {
		try {
			check()
		}
		catch (error) {
			errors.push(error.message)
		}
	}
	return errors
}
