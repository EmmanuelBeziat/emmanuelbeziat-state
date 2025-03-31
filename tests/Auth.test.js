import { describe, beforeEach, expect, vi } from 'vitest'
import { Auth } from '../src/classes/Auth.js'
import basicAuth from '@fastify/basic-auth'

describe('Auth Class', () => {
	let mockFastifyInstance
	let auth

	beforeEach(() => {
		mockFastifyInstance = {
			register: vi.fn(),
			get: vi.fn(),
			post: vi.fn(),
			clearCookie: vi.fn(),
			setCookie: vi.fn(),
		}
		auth = new Auth(mockFastifyInstance)
	})

	test('should initialize with correct properties', () => {
		expect(auth.app).toBe(mockFastifyInstance)
		expect(auth.realm).toBe('Emmanuel Béziat Logs')
		expect(auth.publicPaths).toEqual(['/assets/', '/login'])
	})

	test('should register basicAuth in setup', () => {
		auth.setup()
		expect(mockFastifyInstance.register).toHaveBeenCalledWith(basicAuth, expect.any(Object))
	})

	test('validateCredentials should throw error for invalid credentials', async () => {
		process.env.AUTH_USERNAME = 'user'
		process.env.AUTH_PASSWORD = 'pass'

		await expect(auth.validateCredentials('wrongUser', 'wrongPass')).rejects.toThrow('Invalid credentials')
	})

	test('validateCredentials should not throw error for valid credentials', async () => {
		process.env.AUTH_USERNAME = 'user'
		process.env.AUTH_PASSWORD = 'pass'

		await expect(auth.validateCredentials('user', 'pass')).resolves.not.toThrow()
	})

	test('applyAuth should call done for public paths', () => {
		const mockDone = vi.fn()
		const mockRequest = { url: '/assets/' }
		auth.applyAuth(mockRequest, {}, mockDone)
		expect(mockDone).toHaveBeenCalled()
	})

	test('applyAuth should call basicAuth for non-public paths', () => {
		const mockRequest = { url: '/private/' }
		auth.app.basicAuth = vi.fn()
		auth.applyAuth(mockRequest, {}, vi.fn())
		expect(auth.app.basicAuth).toHaveBeenCalledWith(mockRequest, {}, expect.any(Function))
	})

	test('setupLoginRoute should register GET and POST routes', () => {
		auth.setupLoginRoute()
		expect(mockFastifyInstance.get).toHaveBeenCalledWith('/login', expect.any(Function))
		expect(mockFastifyInstance.post).toHaveBeenCalledWith('/login', expect.any(Function))
	})

	test('setupLogoutRoute should register GET route for logout', () => {
		auth.setupLogoutRoute()
		expect(mockFastifyInstance.get).toHaveBeenCalledWith('/logout', expect.any(Function))
	})
})
