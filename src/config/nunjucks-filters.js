import { formatDate, formatDateRelative, sortByDate } from '../utils/filters.js'

/**
 * Configures custom Nunjucks filters.
 * @param {Object} env - Nunjucks environment object
 */
export const nunjucksFilters = env => {
	env.addFilter('formatDate', formatDate)
	env.addFilter('formatDateRelative', formatDateRelative)
	env.addFilter('sortByDate', sortByDate)
	env.addFilter('log', console.log)
}
