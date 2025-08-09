import fs from 'fs/promises'
import path from 'path'

/**
 * Provides access to the logs repository on disk (folders and paths)
 */
export default class LogRepository {
	/**
	 * @param {string} rootPath Absolute path to logs root directory
	 * @param {string} logFileName Log file name inside each folder
	 * @param {string} statusFileName Status file name inside each folder
	 */
	constructor (rootPath, logFileName, statusFileName) {
		this.rootPath = rootPath
		this.logFile = logFileName
		this.statusFile = statusFileName
	}

	/**
	 * Lists valid log folders present in the repository
	 * @returns {Promise<string[]>} Array of folder names
	 */
	async getValidFolders () {
		const folders = await fs.readdir(path.resolve(this.rootPath), 'utf-8')
		if (!folders.length) throw new Error('No log folders found')

		const validFolders = await Promise.all(folders.map(async folderName => {
			const stats = await fs.stat(path.resolve(this.rootPath, folderName))
			return stats.isDirectory() ? folderName : null
		}))

		return validFolders.filter(Boolean)
	}

	/**
	 * Builds a relative file path inside a folder
	 * @param {string} folderName Log folder name
	 * @param {string} fileName File name
	 * @returns {string} Relative path from logs root
	 */
	getRelativeFilePath (folderName, fileName) {
		return path.join(folderName, fileName)
	}

	/**
	 * Builds an absolute file path inside a folder
	 * @param {string} folderName Log folder name
	 * @param {string} fileName File name
	 * @returns {string} Absolute path
	 */
	getAbsoluteFilePath (folderName, fileName) {
		return path.resolve(this.rootPath, folderName, fileName)
	}
}


