import { useEffect, useMemo, useRef, useState } from 'react'
import { format } from 'date-fns'
import { SEATS, getMember } from '../lib/organization'
import { getSeatOccupant, isFloaterAvailable } from '../lib/occupancy'
import { canBookDate, isBatchInOffice, toDateKey } from '../lib/schedule'
import { useAppState } from '../context/AppStateContext'
import gsap from 'gsap'

type Props = {
  selectedDate: Date
}

export function SeatMap({ selectedDate }: Props) {
  const {
    state,
    holidays,
    effectiveNow,
    currentMemberId,
    bookFloater,
    cancelFloater,
  } = useAppState()
  const [toast, setToast] = useState<string | null>(null)
  const seatMapRef = useRef<HTMLDivElement | null>(null)

  const dateKey = toDateKey(selectedDate)
  const member = getMember(currentMemberId)

  const grid = useMemo(() => {
    const rows: (typeof SEATS)[] = []
    for (let r = 0; r < 5; r++) {
      rows.push(SEATS.slice(r * 10, r * 10 + 10))
    }
    return rows
  }, [])

  const window = canBookDate(selectedDate, effectiveNow, holidays)

  if (!member) return null

  const batchIn = isBatchInOffice(member.batchId, selectedDate)
  const onVacation = (state.vacations[member.id] ?? []).includes(dateKey)

  useEffect(() => {
    if (!seatMapRef.current) return
    const seats = seatMapRef.current.querySelectorAll('[data-seat-cell]')
    gsap.fromTo(
      seats,
      { autoAlpha: 0, y: 8, scale: 0.97 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power1.out',
        stagger: { each: 0.004, from: 'random' },
        overwrite: 'auto',
      },
    )
  }, [selectedDate, state.bookings, state.vacations, currentMemberId])

  function onSeatClick(seatId: string) {
    if (!member) return
    const seat = SEATS.find((s) => s.id === seatId)
    if (!seat) return
    if (!batchIn) {
      setToast('Your batch is not in office this day — seat blocked.')
      setTimeout(() => setToast(null), 3200)
      return
    }
    if (member.designated) {
      setToast('Designated seat is automatic — use vacation to release it.')
      setTimeout(() => setToast(null), 3200)
      return
    }
    if (onVacation) {
      setToast('You are on vacation this day.')
      setTimeout(() => setToast(null), 3200)
      return
    }
    if (seat.kind !== 'floater') return
    const occ = getSeatOccupant(seat, selectedDate, dateKey, state.bookings, state.vacations)
    if (occ?.id === member.id) {
      cancelFloater(seatId, dateKey)
      setToast('Booking cancelled.')
      setTimeout(() => setToast(null), 2200)
      return
    }
    if (!window.ok) {
      setToast(window.reason ?? 'Cannot book')
      setTimeout(() => setToast(null), 3200)
      return
    }
    if (!isFloaterAvailable(seat, dateKey, state.bookings)) {
      setToast('Seat already taken.')
      setTimeout(() => setToast(null), 3200)
      return
    }
    const r = bookFloater(seatId, dateKey)
    if (!r.ok) {
      setToast(r.message)
      setTimeout(() => setToast(null), 3800)
      return
    }
    setToast('Floater seat booked.')
    setTimeout(() => setToast(null), 2200)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-[family-name:var(--font-display)] text-base font-semibold text-white">
          Floor · {format(selectedDate, 'EEEE, MMM d')}
        </h3>
        <div className="flex flex-wrap gap-3 text-[11px] text-[var(--color-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/80" /> Designated
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-500/80" /> Floater
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-zinc-600" /> Empty
          </span>
        </div>
      </div>

      <div
        ref={seatMapRef}
        className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/80 p-3"
      >
        <div className="min-w-[640px] space-y-2">
          {grid.map((row, ri) => (
            <div key={ri} className="grid grid-cols-10 gap-2">
              {row.map((seat) => {
                const occ = getSeatOccupant(
                  seat,
                  selectedDate,
                  dateKey,
                  state.bookings,
                  state.vacations,
                )
                const mine = occ?.id === member.id
                const isFloater = seat.kind === 'floater'
                const empty = !occ
                let cls =
                  'relative flex aspect-[5/4] flex-col items-center justify-center rounded-lg border text-xs font-medium transition'
                if (isFloater) {
                  cls += empty
                    ? ' border-amber-500/25 bg-[var(--color-floater-soft)] text-amber-200/90'
                    : ' border-amber-500/40 bg-amber-500/15 text-amber-100'
                } else {
                  cls += empty
                    ? ' border-emerald-500/20 bg-emerald-500/10 text-emerald-100/70'
                    : ' border-emerald-500/35 bg-emerald-500/15 text-emerald-50'
                }
                if (!batchIn && member.designated && seat.kind === 'designated') {
                  cls += ' opacity-40 grayscale'
                }
                const clickable =
                  isFloater &&
                  batchIn &&
                  !onVacation &&
                  !member.designated &&
                  (empty ? window.ok : mine)

                return (
                  <button
                    key={seat.id}
                    type="button"
                    data-seat-cell
                    disabled={!clickable}
                    onClick={() => onSeatClick(seat.id)}
                    className={`${cls} ${
                      clickable
                        ? 'cursor-pointer hover:ring-2 hover:ring-white/20'
                        : 'cursor-default'
                    } ${mine ? 'ring-2 ring-[var(--color-accent)]' : ''}`}
                  >
                    <span className="text-[10px] text-white/60">{seat.label}</span>
                    <span className="mt-0.5 max-w-full truncate px-0.5 text-[10px] leading-tight">
                      {occ ? occ.name.split('·').pop()?.trim() : 'Free'}
                    </span>
                    {seat.kind === 'floater' && (
                      <span className="absolute right-1 top-1 text-[8px] uppercase text-amber-400/80">
                        Fl
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {toast && (
        <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/90 backdrop-blur">
          {toast}
        </div>
      )}
    </div>
  )
}
