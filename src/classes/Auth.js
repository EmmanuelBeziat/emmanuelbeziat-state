
import argon2 from 'argon2'

export class Auth {
	constructor () {
		this.publicPaths = ['/assets/', '/login', '/favicons/']
		this.dummyHashPromise = argon2.hash('dummy-password-for-timing-safety')
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
		const hashToVerify = isUsernameValid ? process.env.AUTH_PASSWORD : await this.dummyHashPromise
		const isPasswordValid = await argon2.verify(hashToVerify, password)

		if (!isUsernameValid || !isPasswordValid) {
			throw new Error('Invalid credentials')
		}
	}

	/**
	 * Checks if the given path should be publicly accessible.
	 * A trailing-slash entry (e.g. '/assets/') scopes a whole directory via prefix match;
	 * an entry without one (e.g. '/login') must match the pathname exactly, so that a path
	 * like '/loginXYZ' isn't mistakenly treated as public.
	 * @param {string} path - The path to check (may include a query string).
	 * @returns {boolean} True if the path should be public, false otherwise.
	 */
	isPublicPath (path) {
		const pathname = path.split('?')[0]
		return this.publicPaths.some(publicPath => publicPath.endsWith('/')
			? pathname.startsWith(publicPath)
			: pathname === publicPath)
	}
}
