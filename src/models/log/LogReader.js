import fs from 'fs/promises'
import path from 'path'

/**
 * Provides low-level file reading utilities for logs
 */
export default class LogReader {
	/**
	 * @param {string} rootPath Absolute path to the logs root directory
	 */
	constructor (rootPath) {
		this.rootPath = rootPath
	}

	/**
	 * Reads the content of a log file
	 * @param {string} relativeFilePath File path relative to logs root
	 * @returns {Promise<string>} File content as UTF-8 string
	 */
	async getLogContent (relativeFilePath) {
		try {
			const fileContent = await fs.readFile(path.resolve(this.rootPath, relativeFilePath), 'utf-8')
			return fileContent
		}
		catch (error) {
			throw new Error(error.message || 'An error occurend while reading the log content')
		}
	}

	/**
	 * Retrieves the last modification date of a log file
	 * @param {string} relativeFilePath File path relative to logs root
	 * @returns {Promise<Date>} Last modification date
	 */
	async getLogLastEdit (relativeFilePath) {
		try {
			const fileStats = await fs.stat(path.resolve(this.rootPath, relativeFilePath))
			return fileStats.mtime
		}
		catch (error) {
			throw new Error(error.message || 'An error occurend while reading the log data')
		}
	}

	/**
	 * Reads the tail of a file up to a maximum number of bytes
	 * @param {string} absoluteFilePath Absolute path to the file
	 * @param {number} maxBytesToRead Maximum number of bytes to read from the end
	 * @returns {Promise<string>} Tail content as UTF-8 string
	 */
	async readTail (absoluteFilePath, maxBytesToRead) {
		try {
			const fileStats = await fs.stat(absoluteFilePath)
			const startOffset = Math.max(0, fileStats.size - maxBytesToRead)
			const fileDescriptor = await fs.open(absoluteFilePath, 'r')
			const sliceLength = fileStats.size - startOffset
			const buffer = Buffer.allocUnsafe(sliceLength)
			await fileDescriptor.read(buffer, 0, sliceLength, startOffset)
			await fileDescriptor.close()

			let text = buffer.toString('utf8')
			if (startOffset > 0) {
				const newlineIndex = text.indexOf('\n')
				if (newlineIndex !== -1) text = text.slice(newlineIndex + 1)
			}
			return text
		}
		catch {
			return ''
		}
	}
}


