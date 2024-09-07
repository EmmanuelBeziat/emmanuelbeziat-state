import App from '../src/classes/App.js'

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
})