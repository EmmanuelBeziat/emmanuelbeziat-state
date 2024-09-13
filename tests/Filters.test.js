import { formatDate, formatDateRelative, sortByDate } from '../src/utils/filters.js'

describe('sortByDate', () => {
	test('sorts items by date in descending order', () => {
		const items = [
			{ date: '2023-01-01' },
			{ date: '2022-12-31' },
			{ date: '2023-01-02' }
		]
		const sortedItems = sortByDate(items)
		expect(sortedItems).toEqual([
			{ date: '2023-01-02' },
			{ date: '2023-01-01' },
			{ date: '2022-12-31' }
		])
	})

	test('handles empty array', () => {
		const sortedItems = sortByDate([])
		expect(sortedItems).toEqual([])
	})

	test('handles single item array', () => {
		const items = [{ date: '2023-01-01' }]
		const sortedItems = sortByDate(items)
		expect(sortedItems).toEqual(items)
	})
})

describe('formatDate', () => {
	test('formats date correctly', () => {
		const date = new Date('2023-01-01T12:00:00Z')
		const formattedDate = formatDate(date)
		expect(formattedDate).toBe('01/01/2023 13:00:00')
	})

	test('handles string date input', () => {
		const formattedDate = formatDate('2023-01-01T12:00:00Z')
		expect(formattedDate).toBe('01/01/2023 13:00:00')
	})

	test('handles invalid date input', () => {
		const formattedDate = formatDate('invalid date')
		expect(formattedDate).toBe('Invalid Date')
	})
})

describe('formatDateRelative', () => {
	test('returns relative time correctly', () => {
		const date = new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
		const relativeTime = formatDateRelative(date)
		expect(relativeTime).toMatch(/hours? ago/)
	})

	test('handles string date input for relative time', () => {
		const relativeTime = formatDateRelative('2023-01-01T12:00:00Z')
		expect(relativeTime).toMatch(/years? ago|months? ago|days? ago/)
	})

	test('handles invalid date input for relative time', () => {
		const relativeTime = formatDateRelative('invalid date')
		expect(relativeTime).toBe('Invalid Date')
	})
})
