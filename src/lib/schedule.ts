import {
  addDays,
  format,
  getISODay,
  isAfter,
  isBefore,
  isSameDay,
  isWeekend,
  parseISO,
  setHours,
  setMinutes,
  setSeconds,
  startOfDay,
  startOfISOWeek,
} from 'date-fns'

/** Monday anchor for alternating “cycle week 1 / week 2” (ISO week parity) */
export const CYCLE_ANCHOR = new Date(2026, 0, 5) // Mon 5 Jan 2026

export function toDateKey(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

export function parseDateKey(key: string): Date {
  return startOfDay(parseISO(key))
}

/** 0 = cycle week A (matches spec “week 1”), 1 = cycle week B (“week 2”) */
export function getCycleWeekIndex(date: Date): number {
  const monday = startOfISOWeek(date)
  const anchorMonday = startOfISOWeek(CYCLE_ANCHOR)
  const diffMs = monday.getTime() - anchorMonday.getTime()
  const weeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000))
  return ((weeks % 2) + 2) % 2
}

/**
 * Batch 1: Mon–Wed on cycle week 0, Thu–Fri on cycle week 1.
 * Batch 2: Thu–Fri on cycle week 0, Mon–Wed on cycle week 1.
 */
export function isBatchInOffice(batchId: 1 | 2, date: Date): boolean {
  if (isWeekend(date)) return false
  const dow = getISODay(date) // 1 Mon … 7 Sun
  const c = getCycleWeekIndex(date)
  if (c === 0) {
    if (batchId === 1) return dow <= 3
    return dow >= 4 && dow <= 5
  }
  if (batchId === 1) return dow >= 4 && dow <= 5
  return dow <= 3
}

export function isHoliday(date: Date, holidays: Set<string>): boolean {
  return holidays.has(toDateKey(date))
}

export function isWorkingDay(date: Date, holidays: Set<string>): boolean {
  return !isWeekend(date) && !isHoliday(date, holidays)
}

export function getNextWorkingDay(from: Date, holidays: Set<string>): Date {
  let d = addDays(startOfDay(from), 1)
  while (!isWorkingDay(d, holidays)) {
    d = addDays(d, 1)
  }
  return d
}

/** After 15:00 on day D, the next working day is locked for new bookings */
export function isPastCutoffForNextWorkingDay(now: Date): boolean {
  const cutoff = setSeconds(setMinutes(setHours(startOfDay(now), 15), 0), 0)
  return isAfter(now, cutoff)
}

export function isDateBookingWindowClosed(
  targetDate: Date,
  now: Date,
  holidays: Set<string>,
): boolean {
  const target = startOfDay(targetDate)
  const nextWd = getNextWorkingDay(now, holidays)
  if (!isSameDay(target, nextWd)) return false
  return isPastCutoffForNextWorkingDay(now)
}

export function canBookDate(
  targetDate: Date,
  now: Date,
  holidays: Set<string>,
): { ok: boolean; reason?: string } {
  const target = startOfDay(targetDate)
  if (isWeekend(target)) {
    return { ok: false, reason: 'Weekends are not bookable.' }
  }
  if (isHoliday(target, holidays)) {
    return { ok: false, reason: 'This date is a company holiday.' }
  }
  if (isBefore(target, startOfDay(now))) {
    return { ok: false, reason: 'Cannot book past dates.' }
  }
  if (isDateBookingWindowClosed(target, now, holidays)) {
    return {
      ok: false,
      reason: 'Booking for the next working day closes at 3:00 PM today.',
    }
  }
  return { ok: true }
}
