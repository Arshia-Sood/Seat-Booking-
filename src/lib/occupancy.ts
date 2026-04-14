import type { Booking, Member, Seat } from './types'
import { getMember, MEMBERS } from './organization'
import { isBatchInOffice } from './schedule'

export function getDesignatedOccupant(
  seat: Seat,
  date: Date,
  dateKey: string,
  vacations: Record<string, string[]>,
): Member | null {
  if (seat.kind !== 'designated' || seat.squadId == null) return null
  const holder = MEMBERS.find(
    (m) => m.designated && m.seatId === seat.id && m.squadId === seat.squadId,
  )
  if (!holder) return null
  if (!isBatchInOffice(holder.batchId, date)) return null
  if ((vacations[holder.id] ?? []).includes(dateKey)) return null
  return holder
}

export function getFloaterOccupant(
  seat: Seat,
  dateKey: string,
  bookings: Record<string, Record<string, Booking>>,
): Member | null {
  if (seat.kind !== 'floater') return null
  const b = bookings[dateKey]?.[seat.id]
  if (!b) return null
  return getMember(b.memberId) ?? null
}

export function getSeatOccupant(
  seat: Seat,
  date: Date,
  dateKey: string,
  bookings: Record<string, Record<string, Booking>>,
  vacations: Record<string, string[]>,
): Member | null {
  const d = getDesignatedOccupant(seat, date, dateKey, vacations)
  if (d) return d
  return getFloaterOccupant(seat, dateKey, bookings)
}

export function countOccupiedSeats(
  date: Date,
  dateKey: string,
  seats: Seat[],
  bookings: Record<string, Record<string, Booking>>,
  vacations: Record<string, string[]>,
): number {
  let n = 0
  for (const s of seats) {
    if (getSeatOccupant(s, date, dateKey, bookings, vacations)) n++
  }
  return n
}

export function isFloaterAvailable(
  seat: Seat,
  dateKey: string,
  bookings: Record<string, Record<string, Booking>>,
): boolean {
  if (seat.kind !== 'floater') return false
  return !bookings[dateKey]?.[seat.id]
}
