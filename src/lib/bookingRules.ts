import type { Booking } from './types'
import { canBookDate, isBatchInOffice } from './schedule'
import { getMember, getSeat } from './organization'
import { isFloaterAvailable } from './occupancy'

export function getBookingsForDay(
  dateKey: string,
  bookings: Record<string, Record<string, Booking>>,
): Record<string, Booking> {
  return bookings[dateKey] ?? {}
}

export interface FloaterBookingAttempt {
  memberId: string
  seatId: string
  dateKey: string
}

export function validateFloaterBooking(
  attempt: FloaterBookingAttempt,
  now: Date,
  holidays: Set<string>,
  bookings: Record<string, Record<string, Booking>>,
  vacations: Record<string, string[]>,
): { ok: true } | { ok: false; message: string } {
  const member = getMember(attempt.memberId)
  const seat = getSeat(attempt.seatId)
  if (!member || !seat) {
    return { ok: false, message: 'Invalid member or seat.' }
  }
  if (member.designated) {
    return { ok: false, message: 'Designated employees use their assigned seat automatically.' }
  }
  if (seat.kind !== 'floater') {
    return { ok: false, message: 'Non-designated employees may only book floater seats.' }
  }

  const date = new Date(attempt.dateKey + 'T12:00:00')
  const window = canBookDate(date, now, holidays)
  if (!window.ok) {
    return { ok: false, message: window.reason ?? 'Cannot book this date.' }
  }

  if (!isBatchInOffice(member.batchId, date)) {
    return {
      ok: false,
      message:
        'Your batch is not scheduled for this day. Seats are blocked on non-designated office days.',
    }
  }
  if ((vacations[member.id] ?? []).includes(attempt.dateKey)) {
    return {
      ok: false,
      message: 'You are on vacation this day — toggle vacation off to book.',
    }
  }
  if (!isFloaterAvailable(seat, attempt.dateKey, bookings)) {
    return { ok: false, message: 'This floater seat is already booked.' }
  }
  return { ok: true }
}
