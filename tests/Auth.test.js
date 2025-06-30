import { describe, test, expect } from 'vitest'
import { Auth } from '../src/classes/Auth.js'

describe('Auth Class', () => {
	const auth = new Auth()

	test('should initialize with correct public paths', () => {
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

	test('isPublicPath should return true for public paths', () => {
		expect(auth.isPublicPath('/assets/style.css')).toBe(true)
		expect(auth.isPublicPath('/login')).toBe(true)
	})

	test('isPublicPath should return false for non-public paths', () => {
		expect(auth.isPublicPath('/')).toBe(false)
		expect(auth.isPublicPath('/private')).toBe(false)
	})
})
