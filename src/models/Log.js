import fs from 'fs/promises'
import path from 'path'
import State from '../classes/State.js'

class Log {
	constructor () {
		this.path = process.env.PATH_LOGS
		this.state = new State().service
	}

	/**
   * Retrieves all files from the folder, reads their content, and returns it.
   * @returns {Promise<Array>} A promise that resolves with the content of all files.
   */
  async getAllLogs () {
    try {
			const folders = await fs.readdir(path.resolve(this.path), 'utf8')
			if (!folders.length) throw new Error('No folders in folder')

			const validFolders = await Promise.all(folders.map(async folder => {
				const stats = await fs.stat(path.resolve(this.path, folder))
				return stats.isDirectory() ? folder : null
			}))

			const logs = await Promise.all(validFolders.filter(Boolean).map(async folder => {
				const logFilePath = path.join(folder, 'output.log')
				try {
					const content = await this.getLogContent(logFilePath)
					return { name: folder, state: this.state.machine.current, content }
				}
				catch (error) {
					// Skip if folder is empty
					return null
				}
			})).then(results => results.filter(Boolean))

			return logs
		}
		catch (error) {
			throw new Error(error.message || 'An error occurred while retrieving logs')
		}
  }

	/**
   * Reads the content of a file, parses it, and returns the parsed content.
   * @param {string} fileName The name of the file to read.
   * @returns {Promise<Object>} A promise that resolves with the parsed content of the file.
   */
	async getLogContent (fileName) {
    try {
			const file = await fs.readFile(path.resolve(this.path, fileName), 'utf8')
			return file
		}
		catch (error) {
			throw new Error(error.message || 'An error occurred while reading the file')
		}
	}

	stateChange (name, state) {
		console.log(name, state)
		this.state.send(state)
	}

	deploy () {
		this.state.send('deploy')
	}

	success () {
		this.state.send('success')
	}

	failed () {
		this.state.send('failed')
	}
}

export default Log
