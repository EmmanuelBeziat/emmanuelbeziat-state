import fs from 'fs/promises'
import path from 'path'
import emojis from 'emojilib'

/**
 * Builds a reverse mapping from keyword to emoji
 * @type {Map<string, string>}
 */
const emojiMap = new Map()
for (const [emoji, keywords] of Object.entries(emojis)) {
	for (const keyword of keywords) {
		emojiMap.set(`:${keyword}:`, emoji)
	}
}

/**
 * Regular expression to match ANSI escape sequences
 * Matches sequences like: \x1b[1m, \x1b[46m, \x1b[0m, etc.
 */
// eslint-disable-next-line no-control-regex
const ANSI_ESCAPE_REGEX = /\x1b\[[0-9;]*[A-Za-z]/g

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
	 * Removes ANSI escape sequences from text
	 * @param {string} text Text containing ANSI escape sequences
	 * @returns {string} Text with ANSI sequences removed
	 */
	stripAnsi (text) {
		return text.replace(ANSI_ESCAPE_REGEX, '')
	}

	/**
	 * Converts shortcodes like :arrow_up: to actual emojis
	 * @param {string} text Text containing emoji shortcodes
	 * @returns {string} Text with shortcodes converted to emojis
	 */
	emojify (text) {
		let result = text
		for (const [shortcode, emoji] of emojiMap) {
			result = result.replaceAll(shortcode, emoji)
		}
		return result
	}

	/**
	 * Reads the content of a log file
	 * @param {string} relativeFilePath File path relative to logs root
	 * @returns {Promise<string>} File content as UTF-8 string
	 */
	async getLogContent (relativeFilePath) {
		try {
			const fileContent = await fs.readFile(path.resolve(this.rootPath, relativeFilePath), 'utf-8')
			return this.emojify(this.stripAnsi(fileContent))
		}
		catch (error) {
			throw new Error(error.message || 'An error occurred while reading the log content', { cause: error })
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
			throw new Error(error.message || 'An error occurred while reading the log data', { cause: error })
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
			return this.emojify(this.stripAnsi(text))
		}
		catch {
			return ''
		}
	}
}


