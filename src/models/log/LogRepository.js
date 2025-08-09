import fs from 'fs/promises'
import path from 'path'

export default class LogRepository {
  constructor (rootPath, logFile, statusFile) {
    this.rootPath = rootPath
    this.logFile = logFile
    this.statusFile = statusFile
  }

  async getValidFolders () {
    const folders = await fs.readdir(path.resolve(this.rootPath), 'utf-8')
    if (!folders.length) throw new Error('No log folders found')

    const validFolders = await Promise.all(folders.map(async folder => {
      const stats = await fs.stat(path.resolve(this.rootPath, folder))
      return stats.isDirectory() ? folder : null
    }))

    return validFolders.filter(Boolean)
  }

  getRelativeFilePath (folder, filename) {
    return path.join(folder, filename)
  }

  getAbsoluteFilePath (folder, filename) {
    return path.resolve(this.rootPath, folder, filename)
  }
}


