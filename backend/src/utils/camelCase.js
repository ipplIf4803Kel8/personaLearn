const camel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase())

export const toCamel = (row) => Object.fromEntries(Object.entries(row).map(([k, v]) => [camel(k), v]))
