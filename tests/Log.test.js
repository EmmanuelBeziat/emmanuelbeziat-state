import Log from '../src/models/Log.js'
import fs from 'fs/promises'
import path from 'path'

jest.mock('fs/promises')

describe('Log Class', () => {
	let log

	beforeEach(() => {
		log = new Log()
	})

	test('getValidFolders throws error when no folders found', async () => {
		fs.readdir.mockResolvedValue([])

		await expect(log.getValidFolders()).rejects.toThrow('No log folders found')
	})

	test('getLogContent reads file content', async () => {
		fs.readFile.mockResolvedValue('file content')

		const content = await log.getLogContent(process.env.FILE_LOG)
		expect(content).toBe('file content')
	})

	test('getLogContent throws error on read failure', async () => {
		fs.readFile.mockRejectedValue(new Error('Read error'))

		await expect(log.getLogContent(process.env.FILE_LOG)).rejects.toThrow('Read error')
	})

	test('stateChange returns trimmed content', async () => {
		fs.readFile.mockResolvedValue('   status content   ')

		const status = await log.stateChange('folder1')
		expect(status).toBe('status content')
	})

	test('stateChange returns idle on error', async () => {
		fs.readFile.mockRejectedValue(new Error('Read error'))

		const status = await log.stateChange('folder1')
		expect(status).toBe('idle')
	})
})
