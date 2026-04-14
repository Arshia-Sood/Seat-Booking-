import { eachDayOfInterval, endOfISOWeek, format, isSameDay, startOfISOWeek } from 'date-fns'
import { useEffect, useRef } from 'react'
import { getCycleWeekIndex, isBatchInOffice, isWorkingDay, toDateKey } from '../lib/schedule'
import { countOccupiedSeats } from '../lib/occupancy'
import { SEATS } from '../lib/organization'
import { useAppState } from '../context/AppStateContext'
import gsap from 'gsap'

type Props = {
  weekStart: Date
  selected: Date
  onSelect: (d: Date) => void
}

export function WeekStrip({ weekStart, selected, onSelect }: Props) {
  const { state, holidays, effectiveNow } = useAppState()
  const start = startOfISOWeek(weekStart)
  const end = endOfISOWeek(weekStart)
  const days = eachDayOfInterval({ start, end })
  const wrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!wrapRef.current) return
    const cards = wrapRef.current.querySelectorAll('[data-day-card]')
    gsap.fromTo(
      cards,
      { y: 10, autoAlpha: 0, scale: 0.98 },
      {
        y: 0,
        autoAlpha: 1,
        scale: 1,
        duration: 0.42,
        ease: 'power2.out',
        stagger: 0.035,
        overwrite: 'auto',
      },
    )
  }, [weekStart])

  return (
    <div ref={wrapRef} className="grid grid-cols-7 gap-2">
      {days.map((d) => {
        const key = toDateKey(d)
        const cycle = getCycleWeekIndex(d)
        const wd = isWorkingDay(d, holidays)
        const occ = wd
          ? countOccupiedSeats(d, key, SEATS, state.bookings, state.vacations)
          : 0
        const pct = Math.round((occ / SEATS.length) * 100)
        const b1 = isBatchInOffice(1, d)
        const b2 = isBatchInOffice(2, d)
        const isSel = isSameDay(d, selected)
        return (
          <button
            key={key}
            type="button"
            data-day-card
            onClick={() => onSelect(d)}
            className={`rounded-xl border px-2 py-3 text-left transition ${
              isSel
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] ring-1 ring-[var(--color-accent)]/40'
                : 'border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-zinc-500'
            }`}
          >
            <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted)]">
              {format(d, 'EEE')}
            </div>
            <div className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
              {format(d, 'd')}
            </div>
            <div className="mt-1 text-[10px] text-[var(--color-muted)]">
              Cycle W{cycle + 1}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {b1 && (
                <span className="rounded bg-[var(--color-batch1-soft)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-batch1)]">
                  B1
                </span>
              )}
              {b2 && (
                <span className="rounded bg-[var(--color-batch2-soft)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-batch2)]">
                  B2
                </span>
              )}
              {!wd && (
                <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-500">
                  Off
                </span>
              )}
            </div>
            {wd && (
              <div className="mt-2 text-[11px] text-[var(--color-muted)]">
                <span className="text-emerald-400/90">{pct}%</span> used
              </div>
            )}
            {isSameDay(d, effectiveNow) && (
              <div className="mt-1 text-[10px] font-medium text-[var(--color-accent)]">Today</div>
            )}
          </button>
        )
      })}
    </div>
  )
}
