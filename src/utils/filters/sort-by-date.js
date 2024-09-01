export const sortByDate = items => items.sort((a, b) => new Date(b.date) - new Date(a.date))
