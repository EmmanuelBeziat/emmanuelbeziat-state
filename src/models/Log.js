import path from 'path'
import { formatDateRelative } from '../utils/filters.js'
import LogReader from './log/LogReader.js'
import LogRepository from './log/LogRepository.js'
import LogEventBus from './log/LogEventBus.js'
import LogWatcher from './log/LogWatcher.js'

/**
 * High-level facade orchestrating log repository access, reading and SSE publishing
 */
class Log {
	constructor () {
		this.path = process.env.LOGS_PATH
		this.logFile = process.env.FILE_LOG
		this.statusFile = process.env.FILE_STATUS

		// Tunables
		this.maxBytesTail = 64 * 1024

		// Components
		this.repository = new LogRepository(this.path, this.logFile, this.statusFile)
		this.logReader = new LogReader(this.path)
		if (!Log.eventBus) Log.eventBus = new LogEventBus()
		if (!Log.watcher) Log.watcher = new LogWatcher()
	}

	/**
	 * Retrieves all valid log folders and their content.
	 * @returns {Promise<Array>} A promise that resolves with the content of all log files.
	 */
	async getAllLogs () {
		try {
			const folders = await this.repository.getValidFolders()
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
		return this.repository.getValidFolders()
	}

	/**
	 * Retrieves logs from specified folders.
	 * @param {string[]} folders An array of folder names.
	 * @returns {Promise<Array>} The logs from the folders.
	 */
	async getLogsFromFolders (folders) {
		const logs = await Promise.all(folders.map(async folder => {
			const logFilePath = this.repository.getRelativeFilePath(folder, this.logFile)

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
	 * @param {string} filename Name of the file to read (relative to logs root)
	 * @returns {Promise<string>} File content
	 */
	async getLogContent (filename) {
		try {
			return await this.logReader.getLogContent(filename)
		}
		catch (error) {
			throw new Error(error.message || 'An error occurend while reading the log content')
		}
	}

	/**
	 * Retrieves the last modification date of a log file.
	 * @param {string} filename Name of the file to check (relative to logs root)
	 * @returns {Promise<Date>} Modification date
	 */
	async getLogLastEdit (filename) {
		try {
			return await this.logReader.getLogLastEdit(filename)
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
	 * Subscribes an SSE client and ensures watcher is running.
	 * @param {{write: (data: object) => void}} client Client wrapper with write()
	 */
	async subscribe (client) {
		Log.eventBus.subscribe(client)
		if (!Log.watcher.watcher) {
			await this.startSharedWatcher()
		}
	}

	/**
	 * Unsubscribes an SSE client and stops the watcher if no clients remain.
	 * @param {{write: (data: object) => void}} client Client wrapper
	 */
	async unsubscribe (client) {
		Log.eventBus.unsubscribe(client)
		if (Log.eventBus.size() === 0) {
			await Log.watcher.stop()
		}
	}

	/**
	 * Starts the shared chokidar watcher on all log and status files.
	 */
	async startSharedWatcher () {
		const folders = await this.repository.getValidFolders()
		const filesToWatch = folders.map(folder => [
			this.repository.getAbsoluteFilePath(folder, this.logFile),
			this.repository.getAbsoluteFilePath(folder, this.statusFile)
		]).flat()

		Log.watcher.start(filesToWatch, async (filePath) => {
			const changedFileName = path.basename(filePath)
			await this.publishChange(filePath, changedFileName)
		})
	}

	/**
	 * Publishes changes for either output or status file to subscribers.
	 * @param {string} absoluteFilePath Absolute path of the changed file
	 * @param {string} newFileName File name that changed (e.g., output.log)
	 */
	async publishChange (absoluteFilePath, newFileName) {
		const folder = path.basename(path.dirname(absoluteFilePath))
		const relativeFilePath = this.repository.getRelativeFilePath(folder, newFileName)

		// Ensure file write completes
		await new Promise(resolve => setTimeout(resolve, 100))

		const absolutePath = this.repository.getAbsoluteFilePath(folder, newFileName)
		const logTypeBase = newFileName.split('.')[0]

		let lastChange
		try {
			lastChange = await this.getLogLastEdit(relativeFilePath)
		}
		catch {
			lastChange = new Date()
		}
		const date = {
			timestamp: lastChange,
			formattedDate: formatDateRelative(lastChange)
		}

		if (newFileName === this.logFile) {
			const logs = await this.logReader.readTail(absolutePath, this.maxBytesTail)
			this.publish({ folder, type: logTypeBase, logs, date })
		}
		else if (newFileName === this.statusFile) {
			const statusContent = await this.getLogContent(relativeFilePath)
			const status = (statusContent || '').trim() || 'idle'
			this.publish({ folder, type: logTypeBase, status, date })
		}
	}

	/**
	 * Broadcasts data to all subscribed clients via the event bus
	 * @param {object} data Event payload
	 */
	publish (data) {
		Log.eventBus.publish(data)
	}
}

export default Log
