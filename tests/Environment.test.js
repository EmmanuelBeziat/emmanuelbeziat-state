import { test, expect } from 'vitest'

describe('Environment Variables', () => {
  test('should have PORT defined', () => {
    expect(process.env.PORT).toBeDefined()
  })

	test('should have HOST defined', () => {
		expect(process.env.HOST).toBeDefined()
	})

	test('should have LOGS_PATH path defined', () => {
		expect(process.env.LOGS_PATH).toBeDefined()
	})

	test('should have FILE_LOG path defined', () => {
		expect(process.env.FILE_LOG).toBeDefined()
	})

	test('should have FILE_STATUS path defined', () => {
		expect(process.env.FILE_STATUS).toBeDefined()
	})

	test('should have SERVICES_LIST path defined', () => {
		expect(process.env.SERVICES_LIST).toBeDefined()
	})

	test('should have AUTH_USERNAME credential defined', () => {
		expect(process.env.AUTH_USERNAME).toBeDefined()
	})

	test('should have AUTH_PASSWORD credential defined', () => {
		expect(process.env.AUTH_PASSWORD).toBeDefined()
	})
})
