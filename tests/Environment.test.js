describe('Environment Variables', () => {
  it('should have PORT defined', () => {
    expect(process.env.PORT).toBeDefined()
  })

	it('should have HOST defined', () => {
		expect(process.env.HOST).toBeDefined()
	})

	it('should have LOGS_PATH path defined', () => {
		expect(process.env.LOGS_PATH).toBeDefined()
	})

	it('should have FILE_LOG path defined', () => {
		expect(process.env.FILE_LOG).toBeDefined()
	})

	it('should have FILE_STATUS path defined', () => {
		expect(process.env.FILE_STATUS).toBeDefined()
	})

	it('should have SERVICES_LIST path defined', () => {
		expect(process.env.SERVICES_LIST).toBeDefined()
	})

	it('should have AUTH_USERNAME credential defined', () => {
		expect(process.env.AUTH_USERNAME).toBeDefined()
	})

	it('should have AUTH_PASSWORD credential defined', () => {
		expect(process.env.AUTH_PASSWORD).toBeDefined()
	})
})
