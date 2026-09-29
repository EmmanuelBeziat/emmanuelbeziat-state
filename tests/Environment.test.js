import { describe, test, expect } from 'vitest'
import { requiredEnv, validateEnv, parseServicesTimeout } from '../src/config/config.js'

describe('Environment Variables', () => {
	// Sourced from src/config/config.js, the same list src/index.js's Server.checkEnvVariables
	// enforces at startup — kept in one place so this test can't silently drift from it.
	describe.each(requiredEnv)('%s', envVar => {
		test('is defined', () => {
			expect(process.env[envVar]).toBeDefined()
		})
	})

	test('the local .env passes validateEnv', () => {
		expect(validateEnv(process.env)).toEqual([])
	})

	// These have defaults in src/config/config.js, so they aren't required to start the
	// server, but setup.js/.env.example expect a local dev environment to define them.
	describe.each(['PORT', 'HOST'])('%s', envVar => {
		test('is defined', () => {
			expect(process.env[envVar]).toBeDefined()
		})
	})
})

describe('validateEnv', () => {
	const validEnv = {
		AUTH_USERNAME: 'admin',
		AUTH_PASSWORD: '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$aGFzaA',
		SESSION_SECRET: 'a'.repeat(32),
		SESSION_SALT: '0123456789abcdef0123456789abcdef',
		SERVICES_LIST: '[{"name":"App","url":"http://example.com"}]',
		LOGS_PATH: '/logs',
		FILE_LOG: 'output.log',
		FILE_STATUS: 'status.log'
	}

	test('returns no errors for a valid environment', () => {
		expect(validateEnv(validEnv)).toEqual([])
	})

	test('reports missing variables', () => {
		const { LOGS_PATH: _logsPath, FILE_LOG: _fileLog, ...env } = validEnv
		expect(validateEnv(env)).toEqual(['Missing required environment variables: LOGS_PATH, FILE_LOG'])
	})

	test.each([
		['SESSION_SECRET', 'too-short', 'SESSION_SECRET must be at least 32 characters long'],
		['SESSION_SALT', 'zz'.repeat(16), 'SESSION_SALT must be a 16-byte hex string'],
		['SESSION_SALT', 'abcd', 'SESSION_SALT must be a 16-byte hex string'],
		['AUTH_PASSWORD', 'plaintext', 'AUTH_PASSWORD must be an argon2 hash'],
		['SERVICES_LIST', 'not-json', 'contains invalid JSON'],
		['SERVICES_LIST', '{"name":"App"}', 'SERVICES_LIST must be a JSON array'],
		['SERVICES_LIST', '[{"name":"App"}]', 'SERVICES_LIST[0] must have string "name" and "url" properties'],
		['SERVICES_TIMEOUT_MS', '5s', 'SERVICES_TIMEOUT_MS must be a positive number'],
		['SERVICES_TIMEOUT_MS', '0', 'SERVICES_TIMEOUT_MS must be a positive number']
	])('rejects %s=%s', (envVar, value, expectedError) => {
		const errors = validateEnv({ ...validEnv, [envVar]: value })
		expect(errors).toHaveLength(1)
		expect(errors[0]).toContain(expectedError)
	})
})

describe('parseServicesTimeout', () => {
	test('defaults to 5000ms when unset or empty', () => {
		expect(parseServicesTimeout(undefined)).toBe(5000)
		expect(parseServicesTimeout('')).toBe(5000)
	})
})
