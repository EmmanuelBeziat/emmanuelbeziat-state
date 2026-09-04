import { describe, test, expect, beforeAll } from 'vitest'
import argon2 from 'argon2'
import { Auth } from '../src/classes/Auth.js'

describe('Auth Class', () => {
	const auth = new Auth()

	beforeAll(async () => {
		process.env.AUTH_USERNAME = 'user'
		process.env.AUTH_PASSWORD = await argon2.hash('pass')
	})

	test('should initialize with correct public paths', () => {
		expect(auth.publicPaths).toEqual(['/assets/', '/login', '/favicons/'])
	})

	test('validateCredentials should throw error for invalid credentials', async () => {
		await expect(auth.validateCredentials('wrongUser', 'wrongPass')).rejects.toThrow('Invalid credentials')
	})

	test('validateCredentials should not throw error for valid credentials', async () => {
		await expect(auth.validateCredentials('user', 'pass')).resolves.not.toThrow()
	})

	test('validateCredentials should throw for a valid username with a wrong password', async () => {
		await expect(auth.validateCredentials('user', 'wrongPass')).rejects.toThrow('Invalid credentials')
	})

	test('validateCredentials should throw for an invalid username with the right password', async () => {
		await expect(auth.validateCredentials('wrongUser', 'pass')).rejects.toThrow('Invalid credentials')
	})

	test('isPublicPath should return true for public paths', () => {
		expect(auth.isPublicPath('/assets/style.css')).toBe(true)
		expect(auth.isPublicPath('/login')).toBe(true)
		expect(auth.isPublicPath('/favicons/favicon.ico')).toBe(true)
	})

	test('isPublicPath should keep working when the login redirect carries a query string', () => {
		expect(auth.isPublicPath('/login?error=Invalid%20credentials')).toBe(true)
	})

	test('isPublicPath should return false for non-public paths', () => {
		expect(auth.isPublicPath('/')).toBe(false)
		expect(auth.isPublicPath('/private')).toBe(false)
	})

	test('isPublicPath should not treat a path merely starting with /login as public', () => {
		expect(auth.isPublicPath('/loginXYZ')).toBe(false)
		expect(auth.isPublicPath('/login-bypass')).toBe(false)
	})
})
