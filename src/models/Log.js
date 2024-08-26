import fs from 'fs'
import path from 'path'

class Log {
	constructor () {
		this.path = process.env.PATH_LOGS
	}

	/**
   * Retrieves all files from the folder, reads their content, and returns it.
   * @returns {Promise<Array>} A promise that resolves with the content of all files.
   */
  getAllLogs () {
    return new Promise((resolve, reject) => {
      fs.readdir(path.resolve(this.path), 'utf8', (error, folders) => {

        if (error) reject('No folder found.')
        if (!folders.length) reject('No folders in folder')

        Promise.all(folders.map(folder => {
					return new Promise((response, reject) => {
						fs.stat(path.resolve(this.path, folder), (error, stats) => {
							if (error || !stats.isDirectory()) return response(null)
							response(folder)
						})
					})
				}))
				.then(folders => folders.filter(folder => folder !== null))
				.then(folders => Promise.all(folders.map(folder => {
					return this.getFileContent(path.join(folder, 'output.log'))
						.then(content => ({ name: folder, state: 'success', content }))
				})))
        .then(fileContents => { resolve(fileContents) })
				.catch(reject)
      })
    })
  }

	/**
   * Reads the content of a file, parses it, and returns the parsed content.
   * @param {string} fileName The name of the file to read.
   * @returns {Promise<Object>} A promise that resolves with the parsed content of the file.
   */
	getFileContent (fileName) {
    return new Promise((resolve, reject) => {
      fs.readFile(path.resolve(this.path, fileName), 'utf8', (error, file) => {
        if (error) reject(error)
        resolve(file)
      })
    })
	}
}

export default Log
