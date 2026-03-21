import { formatDate, formatDateRelative, sortByDate } from '../utils/filters.js'

/**
 * Emoji shortcode mappings (common ones)
 * @type {Map<string, string>}
 */
const emojiMap = new Map([
	[':arrow_up:', '⬆️'],
	[':arrow_down:', '⬇️'],
	[':arrow_left:', '⬅️'],
	[':arrow_right:', '➡️'],
	[':check:', '✅'],
	[':x:', '❌'],
	[':warning:', '⚠️'],
	[':information_source:', 'ℹ️'],
	[':question:', '❓'],
	[':exclamation:', '❗'],
	[':bulb:', '💡'],
	[':rocket:', '🚀'],
	[':fire:', '🔥'],
	[':sparkles:', '✨'],
	[':zap:', '⚡'],
	[':cloud:', '☁️'],
	[':sun:', '☀️'],
	[':moon:', '🌙'],
	[':star:', '⭐'],
	[':heart:', '❤️'],
	[':thumbsup:', '👍'],
	[':thumbsdown:', '👎'],
	[':ok_hand:', '👌'],
	[':wave:', '👋'],
	[':eyes:', '👀'],
	[':speech_balloon:', '💬'],
	[':bell:', '🔔'],
	[':lock:', '🔒'],
	[':unlock:', '🔓'],
	[':key:', '🔑'],
	[':gear:', '⚙️'],
	[':wrench:', '🔧'],
	[':hammer:', '🔨'],
	[':computer:', '💻'],
	[':mobile_phone:', '📱'],
	[':email:', '📧'],
	[':calendar:', '📅'],
	[':clock:', '🕐'],
	[':hourglass:', '⏳'],
	[':trash:', '🗑️'],
	[':file:', '📄'],
	[':folder:', '📁'],
	[':mag:', '🔍'],
])

/**
 * Converts shortcodes like :arrow_up: to actual emojis
 * @param {string} text Text containing emoji shortcodes
 * @returns {string} Text with shortcodes converted to emojis
 */
function emojify (text) {
	if (!text) return text
	let result = text
	for (const [shortcode, emoji] of emojiMap) {
		result = result.replaceAll(shortcode, emoji)
	}
	return result
}

/**
 * Configures custom Nunjucks filters.
 * @param {Object} env - Nunjucks environment object
 */
export const nunjucksFilters = env => {
	env.addFilter('formatDate', formatDate)
	env.addFilter('formatDateRelative', formatDateRelative)
	env.addFilter('sortByDate', sortByDate)
	env.addFilter('emojify', emojify)
}
