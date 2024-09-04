import fs from 'fs/promises'
import path from 'path'
import State from '../classes/State.js'

class Log {
	constructor () {
		this.path = process.env.LOGS_PATH
		this.logFile = process.env.FILE_LOG
		this.statusFile = process.env.FILE_STATUS
		this.state = new State().service
	}

	/**
   * Retrieves all valid log folders and their content.
   * @returns {Promise<Array>} A promise that resolves with the content of all log files.
   */
  async getAllLogs () {
    try {
			const folders = await this.getValidFolders()
			const logs = await this.getLogsFromFolders(folders)
			return logs
		}
		catch (error) {
			throw new Error(error.message || 'Unable to read logs folders')
		}
  }

	/**
	 * Retrieves valid folders from the log directory.
	 * @returns {Promise<Array>} A promise that resolves with an array of valid folder names.
	 */
	async getValidFolders () {
		const folders = await fs.readdir(path.resolve(this.path), 'utf-8')
		if (!folders.length) throw new Error('No log folders found')

		const validFolders = await Promise.all(folders.map(async folder => {
			const stats = await fs.stat(path.resolve(this.path, folder))
			return stats.isDirectory() ? folder : null
		}))

		return validFolders.filter(Boolean)
	}

	/**
	 * Retrieves logs from specified folders
	 * @param {Array} folders An array of folder names.
	 * @returns {Promise<Array>} A romise that resovles with the logs from the folders.
	 */
	async getLogsFromFolders (folders) {
		const logs = await Promise.all(folders.map(async folder =>{
			const logFilePath = path.join(folder, this.logFile)

			return this.getLogContent(logFilePath)
				.then(async content => {
					if (!content) return null

					const date = await this.getLogLastEdit(logFilePath)
					const status = await this.stateChange(folder)
					return { name: folder, status, date, content }
				})
				.catch(() => null) // Skip if folder is empty
		}))

		return logs.filter(Boolean)
	}

	/**
	 * Reads the content of a file and returns it.
	 * @param {string} filename Name of the file to read.
	 * @returns {Promise<String>} A promise that resolves with the content of the file.
	 */
	async getLogContent (filename) {
		try {
			const file = await fs.readFile(path.resolve(this.path, filename), 'utf-8')
			return file
		}
		catch (error) {
			throw new Error(error.message || 'An error occurend while reading the log content')
		}
	}

	/**
	 * Retrieves the last modification date of a log file
	 * @param {string} filename Name of the file to check
	 * @returns {Promise<Date>} A promise that resolves with the last modification date of the file
	 */
	async getLogLastEdit (filename) {
		try {
			const data = await fs.stat(path.resolve(this.path, filename))
			return data.mtime
		}
		catch (error) {
			throw new Error(error.message || 'An error occurend while reading the log data')
		}
	}

	/**
	 * Reads the content of the status.log file and removes any empty space or end lines.
	 * @param {string} name The name of the folder (not used in this context).
	 * @param {string} state The current state (not used in this context).
	 * @returns {Promise<string>} A promise that resolves with the trimmed content of the status.log file.
	 */
	async stateChange (folder) {
		const statusLogPath = path.join(folder, this.statusFile)
		try {
			const content = await this.getLogContent(statusLogPath)
			return content.trim()
		}
		catch (error) {
			throw new Error(error.message || 'Unable to read status.log')
		}
	}
}

export default Log
