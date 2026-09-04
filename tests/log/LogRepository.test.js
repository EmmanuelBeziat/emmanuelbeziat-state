import { describe, test, expect, beforeEach, vi } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import LogRepository from '../../src/models/log/LogRepository.js'

vi.mock('fs/promises')

describe('LogRepository', () => {
	const rootPath = '/logs'
	let repository

	beforeEach(() => {
		repository = new LogRepository(rootPath, 'output.log', 'status.log')
		vi.resetAllMocks()
	})

	test('getValidFolders throws when the log directory is empty', async () => {
		fs.readdir.mockResolvedValue([])

		await expect(repository.getValidFolders()).rejects.toThrow('No log folders found')
	})

	test('getValidFolders returns only directory entries, filtering out files', async () => {
		fs.readdir.mockResolvedValue(['build-1', 'build-2', 'README.md'])
		fs.stat.mockImplementation(async targetPath => ({
			isDirectory: () => !targetPath.endsWith('README.md')
		}))

		const folders = await repository.getValidFolders()

		expect(folders).toEqual(['build-1', 'build-2'])
	})

	test('getRelativeFilePath joins the folder and file name', () => {
		expect(repository.getRelativeFilePath('build-1', 'output.log')).toBe(path.join('build-1', 'output.log'))
	})

	test('getAbsoluteFilePath resolves the folder and file name against the root path', () => {
		expect(repository.getAbsoluteFilePath('build-1', 'output.log'))
			.toBe(path.resolve(rootPath, 'build-1', 'output.log'))
	})
})
