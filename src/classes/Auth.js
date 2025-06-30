export class Auth {
	constructor () {
		this.publicPaths = ['/assets/', '/login']
	}

	async validateCredentials (username, password) {
		const isValid = username === process.env.AUTH_USERNAME && password === process.env.AUTH_PASSWORD

		if (!isValid) {
			throw new Error('Invalid credentials')
		}
	}

	isPublicPath (path) {
		return this.publicPaths.some(publicPath => path.startsWith(publicPath))
	}
}
