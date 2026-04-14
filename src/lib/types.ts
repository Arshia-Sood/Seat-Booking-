export type BatchId = 1 | 2

export type SeatKind = 'designated' | 'floater'

export interface Seat {
  id: string
  label: string
  kind: SeatKind
  squadId: number | null
  /** 1-based index within squad for designated seats */
  indexInSquad: number | null
}

export interface Member {
  id: string
  name: string
  squadId: number
  batchId: BatchId
  /** Designated employees have a fixed seat; others use floaters only */
  designated: boolean
  seatId: string | null
}

export interface Booking {
  memberId: string
  /** floater bookings reference this; designated auto-use their seat */
  seatId: string
  createdAt: string
}

export interface AppState {
  bookings: Record<string, Record<string, Booking>>
  /** Dates member is away — releases designated seat */
  vacations: Record<string, string[]>
}
