import { describe, beforeEach, expect, vi } from 'vitest'
import { Auth } from '../src/classes/Auth.js'

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
		expect(auth.publicPaths).toEqual(['/assets/', '/login'])
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
