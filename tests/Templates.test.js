import nunjucks from 'nunjucks'
import { formatDate, formatDateRelative, sortByDate } from '../src/utils/filters.js'

const env = nunjucks.configure('src/views', { autoescape: true })

env.addFilter('formatDate', formatDate)
env.addFilter('formatDateRelative', formatDateRelative)
env.addFilter('sortByDate', sortByDate)

describe('Nunjucks Templates', () => {

  test('modal.njk renders correctly', () => {
    const log = { status: 'Success', name: 'Log Entry', content: 'Log content here' }
    const output = env.render('partials/modal.njk', { log })
    expect(output).toContain('class="log-details-name"')
    expect(output).toContain('Log Entry')
    expect(output).toContain('Log content here')
  })

  test('logs.njk renders correctly with logs', () => {
    const logs = [{ status: 'Success', name: 'Log Entry', date: '2023-01-01' }]
    const output = env.render('logs.njk', { logs })
    expect(output).not.toContain('No logs found')
    expect(output).toContain('Log Entry')
  })

  test('logs.njk renders correctly without logs', () => {
    const output = env.render('logs.njk', { logs: [] })
    expect(output).toContain('No logs found')
  })

  test('log.njk renders correctly', () => {
    const log = { status: 'Success', name: 'Log Entry', date: '2023-01-01' }
    const output = env.render('partials/log.njk', { log })
    expect(output).toContain('class="log-title"')
    expect(output).toContain('Log Entry')
  })
})
