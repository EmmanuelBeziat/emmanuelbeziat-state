import fs from 'fs/promises'
import path from 'path'
import chokidar from 'chokidar'
import { formatDateRelative } from '../utils/filters.js'

class Log {
	constructor () {
		this.path = process.env.LOGS_PATH
		this.logFile = process.env.FILE_LOG
		this.statusFile = process.env.FILE_STATUS
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
			return content.trim() || 'idle'
		}
		catch (error) {
			return 'idle'
		}
	}

	/**
	 * Watch for changes in both output.log and status.log files
	 * @param {object} client - SSE client object for sending updates
	 */
	async watchLogs (client) {
		const folders = await this.getValidFolders()
		const watcher = chokidar.watch(folders.map(folder => [
			path.join(this.path, folder, this.logFile),
			path.join(this.path, folder, this.statusFile)
		]).flat()) // Watch both logFile and statusFile

		watcher.on('change', async (logFilePath) => {
			const logFileName = path.basename(logFilePath)
			await this.handleLogChange(logFilePath, logFileName, client)
		})

		watcher.on('error', error => console.error('Watcher error:', error))
	}

	/**
	 * Helper method to handle log changes (output or status)
	 * @param {string} logFilePath - Path of the changed log file
	 * @param {string} logType - Type of log ("output" or "status")
	 * @param {object} client - SSE client object for sending updates
	 */
	async handleLogChange (logFilePath, logType, client) {
		const folder = path.basename(path.dirname(logFilePath))
		const fileName = path.join(folder, logType)
		const content = await this.getLogContent(fileName)
		const type = logType.split('.')[0]
		const lastChange = await this.getLogLastEdit(fileName)
		const date = {
			timestamp: lastChange,
			formattedDate: formatDateRelative(lastChange)
		}

		if (logType === this.logFile) {
			client.write({ folder, type, logs: content, date })
		}
		else if (logType === this.statusFile) {
			client.write({ folder, type, status: content.trim(), date })
		}
	}
}

export default Log
