import chokidar from 'chokidar'

/**
 * Wraps chokidar to provide a single shared watcher with throttled change events
 */
export default class LogWatcher {
	constructor () {
		/** @type {import('chokidar').FSWatcher | null} */
		this.watcher = null
		this.throttleMs = 200
		/** @type {Map<string, ReturnType<typeof setTimeout>>} */
		this.timers = new Map()
		/** @type {(filePath: string) => void} */
		this.onFileChangedCallback = undefined
	}

	/**
	 * Starts watching a list of files and emits debounced change events
	 * @param {string[]} absoluteFilePaths List of absolute file paths to watch
	 * @param {(filePath: string) => void} onFileChanged Callback invoked on change
	 */
	start (absoluteFilePaths, onFileChanged) {
		if (this.watcher) return
		this.onFileChangedCallback = onFileChanged
		this.watcher = chokidar.watch(absoluteFilePaths)
		this.watcher.on('change', (filePath) => this.enqueue(filePath))
		this.watcher.on('error', (error) => console.error('Watcher error:', error))
	}

	/**
	 * Stops watching and clears internal timers
	 */
	stop = async () => {
		if (!this.watcher) return
		try {
			await this.watcher.close()
		}
		catch {
			// ignore
		}
		this.watcher = null
		for (const [, timeoutId] of this.timers) clearTimeout(timeoutId)
		this.timers.clear()
	}

	/**
	 * Debounces rapid file changes before emitting to consumer
	 * @param {string} filePath Absolute file path that changed
	 */
	enqueue (filePath) {
		if (this.timers.has(filePath)) clearTimeout(this.timers.get(filePath))
		const timeoutId = setTimeout(() => {
			this.timers.delete(filePath)
			try {
				this.onFileChangedCallback?.(filePath)
			}
			catch {
				// ignore
			}
		}, this.throttleMs)
		this.timers.set(filePath, timeoutId)
	}
}


