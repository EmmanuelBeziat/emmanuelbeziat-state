import fs from 'fs/promises'
import path from 'path'

export default class LogReader {
  constructor (rootPath) {
    this.rootPath = rootPath
  }

  async getLogContent (relativeFilename) {
    try {
      const file = await fs.readFile(path.resolve(this.rootPath, relativeFilename), 'utf-8')
      return file
    }
    catch (error) {
      throw new Error(error.message || 'An error occurend while reading the log content')
    }
  }

  async getLogLastEdit (relativeFilename) {
    try {
      const data = await fs.stat(path.resolve(this.rootPath, relativeFilename))
      return data.mtime
    }
    catch (error) {
      throw new Error(error.message || 'An error occurend while reading the log data')
    }
  }

  async readTail (absolutePath, maxBytes) {
    try {
      const stats = await fs.stat(absolutePath)
      const start = Math.max(0, stats.size - maxBytes)
      const fileHandle = await fs.open(absolutePath, 'r')
      const length = stats.size - start
      const buffer = Buffer.allocUnsafe(length)
      await fileHandle.read(buffer, 0, length, start)
      await fileHandle.close()

      let text = buffer.toString('utf8')
      if (start > 0) {
        const nlIndex = text.indexOf('\n')
        if (nlIndex !== -1) text = text.slice(nlIndex + 1)
      }
      return text
    }
    catch {
      return ''
    }
  }
}


