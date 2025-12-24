export const TIMEZONE_OPTIONS = [
  { label: 'UTC+7 (WIB)', offset: 7 },
  { label: 'UTC+8 (WITA)', offset: 8 },
  { label: 'UTC+9 (WIT)', offset: 9 },
]

export const DEFAULT_TIMEZONE = TIMEZONE_OPTIONS[1]

export const toUtcIso = (dateStr: string, offsetHours: number, endOfDay: boolean) => {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-').map(Number)
  const hour = endOfDay ? 23 : 0
  const minute = endOfDay ? 59 : 0
  const second = endOfDay ? 59 : 0
  const utcMs = Date.UTC(year, month - 1, day, hour, minute, second) - offsetHours * 60 * 60 * 1000
  return new Date(utcMs).toISOString()
}

export const formatDateInput = (date: Date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}
