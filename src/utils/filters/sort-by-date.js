/**
 * Sorts an array of objects by date in descending order.
 * @param {Object[]} items - The array of objects to sort. Each object must have a 'date' property.
 * @returns {Object[]} The sorted array.
 */
export const sortByDate = items => items.sort((a, b) => new Date(b.date) - new Date(a.date))
