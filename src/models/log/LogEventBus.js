export default class LogEventBus {
  constructor () {
    this.subscribers = new Set()
  }

  subscribe (client) {
    this.subscribers.add(client)
  }

  unsubscribe (client) {
    this.subscribers.delete(client)
  }

  size () {
    return this.subscribers.size
  }

  publish (data) {
    for (const client of this.subscribers) {
      try {
        client.write(data)
      }
      catch {
        // ignore client errors
      }
    }
  }
}


