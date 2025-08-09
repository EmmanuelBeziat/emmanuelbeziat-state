import chokidar from 'chokidar'

export default class LogWatcher {
  constructor () {
    this.watcher = null
    this.throttleMs = 200
    this.timers = new Map()
  }

  start (files, onChange) {
    if (this.watcher) return
    this.onChange = onChange
    this.watcher = chokidar.watch(files)
    this.watcher.on('change', (filePath) => this.enqueue(filePath))
    this.watcher.on('error', (err) => console.error('Watcher error:', err))
  }

  stop = async () => {
    if (!this.watcher) return
    try {
      await this.watcher.close()
    }
    catch {
      // ignore
    }
    this.watcher = null
    for (const [, id] of this.timers) clearTimeout(id)
    this.timers.clear()
  }

  enqueue (filePath) {
    if (this.timers.has(filePath)) clearTimeout(this.timers.get(filePath))
    const id = setTimeout(() => {
      this.timers.delete(filePath)
      try {
        this.onChange?.(filePath)
      }
      catch {
        // ignore
      }
    }, this.throttleMs)
    this.timers.set(filePath, id)
  }
}


