import path from 'path'
import { formatDateRelative } from '../utils/filters.js'
import LogReader from './log/LogReader.js'
import LogRepository from './log/LogRepository.js'
import LogEventBus from './log/LogEventBus.js'
import LogWatcher from './log/LogWatcher.js'

class Log {
	constructor () {
		this.path = process.env.LOGS_PATH
		this.logFile = process.env.FILE_LOG
		this.statusFile = process.env.FILE_STATUS

		// Tunables
		this.maxBytesTail = 64 * 1024

		// Components
		this.repo = new LogRepository(this.path, this.logFile, this.statusFile)
		this.reader = new LogReader(this.path)
		if (!Log.eventBus) Log.eventBus = new LogEventBus()
		if (!Log.watcher) Log.watcher = new LogWatcher()
	}

	/**
	 * Retrieves all valid log folders and their content.
	 * @returns {Promise<Array>} A promise that resolves with the content of all log files.
	 */
	async getAllLogs () {
		try {
			const folders = await this.repo.getValidFolders()
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
// kept for backward compatibility if used elsewhere
	async getValidFolders () {
		return this.repo.getValidFolders()
	}

	/**
	 * Retrieves logs from specified folders
	 * @param {Array} folders An array of folder names.
	 * @returns {Promise<Array>} A romise that resovles with the logs from the folders.
	 */
	async getLogsFromFolders (folders) {
		const logs = await Promise.all(folders.map(async folder => {
			const logFilePath = this.repo.getRelativeFilePath(folder, this.logFile)

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
			return await this.reader.getLogContent(filename)
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
			return await this.reader.getLogLastEdit(filename)
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
			console.log(error.message)
			return 'idle'
		}
	}

	/**
	 * Watch for changes in both output.log and status.log files
	 * @param {object} client - SSE client object for sending updates
	 */
	// Subscribe a client to SSE updates. Starts the shared watcher on first subscribe.
	async subscribe (client) {
		Log.eventBus.subscribe(client)
		if (!Log.watcher.watcher) {
			await this.startSharedWatcher()
		}
	}

	// Unsubscribe a client. If no subscribers remain, stop the watcher.
	async unsubscribe (client) {
		Log.eventBus.unsubscribe(client)
		if (Log.eventBus.size() === 0) {
			await Log.watcher.stop()
		}
	}

	async startSharedWatcher () {
		const folders = await this.repo.getValidFolders()
		const filesToWatch = folders.map(folder => [
			this.repo.getAbsoluteFilePath(folder, this.logFile),
			this.repo.getAbsoluteFilePath(folder, this.statusFile)
		]).flat()

		Log.watcher.start(filesToWatch, async (filePath) => {
			const logFileName = path.basename(filePath)
			await this.publishChange(filePath, logFileName)
		})
	}

// throttling is handled by LogWatcher

	/**
	 * Helper method to handle log changes (output or status)
	 * @param {string} logFilePath - Path of the changed log file
	 * @param {string} logType - Type of log ("output" or "status")
	 * @param {object} client - SSE client object for sending updates
	 */
	async publishChange (logFilePath, logType) {
		const folder = path.basename(path.dirname(logFilePath))
		const fileName = this.repo.getRelativeFilePath(folder, logType)

		// Ensure file write completes
		await new Promise(resolve => setTimeout(resolve, 100))

		const absolutePath = this.repo.getAbsoluteFilePath(folder, logType)
		const type = logType.split('.')[0]

		const lastChange = await this.getLogLastEdit(fileName)
		const date = {
			timestamp: lastChange,
			formattedDate: formatDateRelative(lastChange)
		}

		if (logType === this.logFile) {
			const logs = await this.reader.readTail(absolutePath, this.maxBytesTail)
			this.publish({ folder, type, logs, date })
		}
		else if (logType === this.statusFile) {
			const statusContent = await this.getLogContent(fileName)
			const status = (statusContent || '').trim() || 'idle'
			this.publish({ folder, type, status, date })
		}
	}

	publish (data) {
		Log.eventBus.publish(data)
	}
}

export default Log
