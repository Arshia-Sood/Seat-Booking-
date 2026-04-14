import type { BatchId, Member, Seat } from './types'

/** Squads 1–5 → Batch 1; Squads 6–10 → Batch 2 */
export function squadBatch(squadId: number): BatchId {
  return squadId <= 5 ? 1 : 2
}

function makeSeats(): Seat[] {
  const seats: Seat[] = []
  let n = 1
  for (let squad = 1; squad <= 10; squad++) {
    for (let i = 1; i <= 4; i++) {
      seats.push({
        id: `d-${squad}-${i}`,
        label: `${n}`,
        kind: 'designated',
        squadId: squad,
        indexInSquad: i,
      })
      n++
    }
  }
  for (let i = 1; i <= 10; i++) {
    seats.push({
      id: `f-${i}`,
      label: `F${i}`,
      kind: 'floater',
      squadId: null,
      indexInSquad: null,
    })
  }
  return seats
}

export const SEATS = makeSeats()

const seatById = new Map(SEATS.map((s) => [s.id, s]))

export function getSeat(id: string): Seat | undefined {
  return seatById.get(id)
}

/** 4 designated + 4 non-designated per squad */
export function makeMembers(): Member[] {
  const members: Member[] = []
  for (let squad = 1; squad <= 10; squad++) {
    const batch = squadBatch(squad)
    for (let i = 1; i <= 4; i++) {
      const seatId = `d-${squad}-${i}`
      members.push({
        id: `m-${squad}-d-${i}`,
        name: `Squad ${squad} · D${i}`,
        squadId: squad,
        batchId: batch,
        designated: true,
        seatId,
      })
    }
    for (let i = 1; i <= 4; i++) {
      members.push({
        id: `m-${squad}-nd-${i}`,
        name: `Squad ${squad} · ND${i}`,
        squadId: squad,
        batchId: batch,
        designated: false,
        seatId: null,
      })
    }
  }
  return members
}

export const MEMBERS = makeMembers()

const memberById = new Map(MEMBERS.map((m) => [m.id, m]))

export function getMember(id: string): Member | undefined {
  return memberById.get(id)
}

export const DEFAULT_HOLIDAYS: string[] = [
  '2026-01-26',
  '2026-03-14',
  '2026-08-15',
  '2026-10-02',
  '2026-12-25',
]
