const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Formats a Date as "DD MMM YYYY", e.g. "08 Apr 2026". */
export function formatDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0')
  const m = MONTHS[date.getMonth()]
  const y = date.getFullYear()
  return `${d} ${m} ${y}`
}

/** Returns a new Date offset by `days` from `date`. */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/** For future dates: snaps Sat/Sun forward to next Monday. */
export function nearestWeekday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  if (day === 0) d.setDate(d.getDate() + 1) // Sun → Mon
  if (day === 6) d.setDate(d.getDate() + 2) // Sat → Mon
  return d
}

/** For past dates: snaps Sat/Sun backward to previous Friday. */
export function lastWeekday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  if (day === 0) d.setDate(d.getDate() - 2) // Sun → Fri
  if (day === 6) d.setDate(d.getDate() - 1) // Sat → Fri
  return d
}
