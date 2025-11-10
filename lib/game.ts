export function xpForLogs(count: number) {
  return count * 10 + Math.floor(count / 10) * 25
}
export function badgeForCount(count: number) {
  if (count >= 100) return 'Gold Hunter'
  if (count >= 50) return 'Silver Hunter'
  if (count >= 20) return 'Bronze Hunter'
  return null
}
export function streakFromDates(dates: string[]): number {
  const days = new Set(dates.map(d => new Date(d).toDateString()))
  let streak = 0; let cursor = new Date()
  for (;;) {
    const key = cursor.toDateString()
    if (days.has(key)) { streak++; cursor.setDate(cursor.getDate() - 1) } else break
  }
  return streak
}
export function isHappyHourNow(hours: any): boolean {
  try {
    const now = new Date(); const day = now.getDay()
    const list = (hours?.[day] || []) as { start: string, end: string }[]
    return list.some(r => {
      const [sh, sm] = r.start.split(':').map(Number)
      const [eh, em] = r.end.split(':').map(Number)
      const s = new Date(now); s.setHours(sh, sm||0, 0, 0)
      const e = new Date(now); e.setHours(eh, em||0, 0, 0)
      return now >= s && now <= e && eh <= 19
    })
  } catch { return false }
}
