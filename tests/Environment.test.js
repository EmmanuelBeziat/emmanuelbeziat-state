import { describe, test, expect } from 'vitest'
import { requiredEnv } from '../src/config/config.js'

describe('Environment Variables', () => {
	// Sourced from src/config/config.js, the same list src/index.js's Server.checkEnvVariables
	// enforces at startup — kept in one place so this test can't silently drift from it.
	describe.each(requiredEnv)('%s', envVar => {
		test('is defined', () => {
			expect(process.env[envVar]).toBeDefined()
		})
	})

	test('SERVICES_LIST is valid JSON', () => {
		expect(() => JSON.parse(process.env.SERVICES_LIST)).not.toThrow()
	})

	// These have defaults in src/config/config.js, so they aren't required to start the
	// server, but setup.js/.env.example expect a local dev environment to define them.
	describe.each(['PORT', 'HOST', 'LOGS_PATH', 'FILE_LOG', 'FILE_STATUS'])('%s', envVar => {
		test('is defined', () => {
			expect(process.env[envVar]).toBeDefined()
		})
	})
})
