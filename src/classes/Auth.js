
export class Auth {
	constructor () {
		this.publicPaths = ['/assets/', '/login']
	}

	/**
	 * Validates user credentials against environment variables.
	 * @param {string} username - The provided username.
	 * @param {string} password - The provided password.
	 * @returns {Promise<void>}
	 * @throws {Error} If credentials are invalid.
	 */
	async validateCredentials (username, password) {
		const isValid = username === process.env.AUTH_USERNAME && password === process.env.AUTH_PASSWORD

		if (!isValid) {
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
