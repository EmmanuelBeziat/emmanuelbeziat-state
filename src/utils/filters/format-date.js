import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime.js'

export const formatDate = date => {
	if (!(date instanceof Date)) { date = new Date(date) }
	if (isNaN(date.getTime())) return 'Invalid Date'

	const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }
	return new Intl.DateTimeFormat('en', options).format(date).replace(',', '')
}

export const formatDateRelative = date => {
	if (!(date instanceof Date)) { date = new Date(date) }
	if (isNaN(date.getTime())) return 'Invalid Date'
	dayjs.extend(relativeTime)
	return dayjs(date).fromNow()
}
