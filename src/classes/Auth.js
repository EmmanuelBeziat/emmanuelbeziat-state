
import argon2 from 'argon2'

export class Auth {
	constructor () {
		this.publicPaths = ['/assets/', '/login', '/favicons/']
	}

	/**
	 * Validates user credentials against environment variables.
	 * The AUTH_PASSWORD env variable must be an argon2 hash (generated via setup.js).
	 * @param {string} username - The provided username.
	 * @param {string} password - The provided password.
	 * @returns {Promise<void>}
	 * @throws {Error} If credentials are invalid.
	 */
	async validateCredentials (username, password) {
		const isUsernameValid = username === process.env.AUTH_USERNAME
		const isPasswordValid = isUsernameValid && await argon2.verify(process.env.AUTH_PASSWORD, password)

		if (!isUsernameValid || !isPasswordValid) {
			throw new Error('Invalid credentials')
		}
	}

	/**
	 * Checks if the given path should be publicly accessible.
	 * @param {string} path - The path to check.
	 * @returns {boolean} True if the path should be public, false otherwise.
	 */
	isPublicPath (path) {
		return this.publicPaths.some(publicPath => path.startsWith(publicPath))
	}
}
