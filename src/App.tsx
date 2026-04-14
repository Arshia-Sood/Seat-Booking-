import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  addWeeks,
  endOfISOWeek,
  format,
  isSameDay,
  startOfISOWeek,
  subWeeks,
} from 'date-fns'
import {
  IconChevronLeft,
  IconChevronRight,
  IconLayoutGrid,
} from './components/Icons'
import gsap from 'gsap'
import { AppStateProvider, useAppState } from './context/AppStateContext'
import { WeekStrip } from './components/WeekStrip'
import { SeatMap } from './components/SeatMap'
import { MemberPicker } from './components/MemberPicker'
import { RulesPanel } from './components/RulesPanel'
import { VacationToggle } from './components/VacationToggle'
import { DemoClock } from './components/DemoClock'
import { countOccupiedSeats } from './lib/occupancy'
import { SEATS, getMember, squadBatch } from './lib/organization'
import { getCycleWeekIndex, isBatchInOffice, isWorkingDay, toDateKey } from './lib/schedule'

function Shell() {
  const { state, holidays, effectiveNow, currentMemberId } = useAppState()
  const [weekAnchor, setWeekAnchor] = useState(() => startOfISOWeek(new Date()))
  const [selected, setSelected] = useState(() => new Date())
  const shellRef = useRef<HTMLDivElement | null>(null)

  const weekStart = startOfISOWeek(weekAnchor)
  const member = getMember(currentMemberId)

  const stats = useMemo(() => {
    const key = toDateKey(selected)
    const occ = isWorkingDay(selected, holidays)
      ? countOccupiedSeats(selected, key, SEATS, state.bookings, state.vacations)
      : 0
    const pct = Math.round((occ / SEATS.length) * 100)
    return { occ, pct }
  }, [selected, holidays, state.bookings, state.vacations])

  const cycle = getCycleWeekIndex(selected)
  const batchIn = member ? isBatchInOffice(member.batchId, selected) : false

  useLayoutEffect(() => {
    if (!shellRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('[data-anim="header"]', {
        y: -22,
        autoAlpha: 0,
        duration: 0.55,
        ease: 'power2.out',
      })
      gsap.from('[data-anim="sidebar"] > *', {
        x: -14,
        autoAlpha: 0,
        duration: 0.45,
        ease: 'power2.out',
        stagger: 0.06,
        delay: 0.1,
      })
      gsap.from('[data-anim="main"] > *', {
        y: 18,
        autoAlpha: 0,
        duration: 0.45,
        ease: 'power2.out',
        stagger: 0.08,
        delay: 0.15,
      })
    }, shellRef)
    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={shellRef}
      className="min-h-dvh bg-gradient-to-b from-[#0a0e14] via-[var(--color-surface)] to-[#0a0e14]"
    >
      <header
        data-anim="header"
        className="border-b border-[var(--color-border)]/80 bg-[var(--color-surface-2)]/50 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent)]/20 text-[var(--color-accent)]">
              <IconLayoutGrid className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-white md:text-xl">
                Wissen Seat Studio
              </h1>
              <p className="text-[12px] text-[var(--color-muted)]">
                50 seats · 10 floaters · 10 squads · 2 batches · 2-week rotation
              </p>
            </div>
          </div>
          <div className="text-right text-[12px] text-[var(--color-muted)]">
            <div>
              Batch 1: Mon–Wed in cycle week 1, Thu–Fri in cycle week 2
            </div>
            <div>
              Batch 2: Thu–Fri in cycle week 1, Mon–Wed in cycle week 2
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[280px_1fr]">
        <aside data-anim="sidebar" className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <MemberPicker />
          {member && (
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/80 p-4 text-[13px]">
              <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted)]">
                Profile
              </div>
              <div className="mt-1 font-medium text-white">{member.name}</div>
              <div className="mt-2 space-y-1 text-[var(--color-muted)]">
                <div>
                  Squad <span className="text-white/90">{member.squadId}</span> · Batch{' '}
                  <span
                    className={
                      squadBatch(member.squadId) === 1
                        ? 'text-[var(--color-batch1)]'
                        : 'text-[var(--color-batch2)]'
                    }
                  >
                    {squadBatch(member.squadId)}
                  </span>
                </div>
                <div>
                  Role:{' '}
                  <span className="text-white/90">
                    {member.designated ? 'Designated (fixed seat)' : 'Non-designated (floater)'}
                  </span>
                </div>
                <div>
                  Selected day:{' '}
                  <span className={batchIn ? 'text-emerald-400/90' : 'text-rose-300/90'}>
                    {batchIn ? 'Your batch is in office' : 'Not your batch day — blocked'}
                  </span>
                </div>
              </div>
            </div>
          )}
          <VacationToggle selectedDate={selected} />
          <DemoClock />
          <RulesPanel />
        </aside>

        <section data-anim="main" className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-white md:text-lg">
                Week view · utilization
              </h2>
              <p className="text-[13px] text-[var(--color-muted)]">
                Cycle week {cycle + 1} · {format(weekStart, 'MMM d')} –{' '}
                {format(endOfISOWeek(weekStart), 'MMM d, yyyy')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWeekAnchor((w) => subWeeks(w, 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-white/90 hover:bg-[var(--color-surface-3)]"
              >
                <IconChevronLeft className="h-4 w-4" /> Prev
              </button>
              <button
                type="button"
                onClick={() => {
                  const t = startOfISOWeek(new Date())
                  setWeekAnchor(t)
                  setSelected(new Date())
                }}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
              >
                This week
              </button>
              <button
                type="button"
                onClick={() => setWeekAnchor((w) => addWeeks(w, 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-white/90 hover:bg-[var(--color-surface-3)]"
              >
                Next <IconChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <WeekStrip weekStart={weekStart} selected={selected} onSelect={setSelected} />

          <div className="grid gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/60 p-4 md:grid-cols-3">
            <div>
              <div className="text-[11px] uppercase text-[var(--color-muted)]">Selected day</div>
              <div className="mt-1 text-lg font-semibold text-white">
                {format(selected, 'EEEE, MMM d')}
              </div>
              {isSameDay(selected, effectiveNow) && (
                <div className="text-[12px] text-[var(--color-accent)]">Today</div>
              )}
            </div>
            <div>
              <div className="text-[11px] uppercase text-[var(--color-muted)]">Seat utilization</div>
              <div className="mt-1 text-lg font-semibold text-emerald-300/90">{stats.pct}%</div>
              <div className="text-[12px] text-[var(--color-muted)]">
                {stats.occ} / {SEATS.length} seats
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase text-[var(--color-muted)]">Batches on-site</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {isBatchInOffice(1, selected) && (
                  <span className="rounded-full bg-[var(--color-batch1-soft)] px-2.5 py-1 text-[12px] font-medium text-[var(--color-batch1)]">
                    Batch 1
                  </span>
                )}
                {isBatchInOffice(2, selected) && (
                  <span className="rounded-full bg-[var(--color-batch2-soft)] px-2.5 py-1 text-[12px] font-medium text-[var(--color-batch2)]">
                    Batch 2
                  </span>
                )}
                {!isWorkingDay(selected, holidays) && (
                  <span className="text-[12px] text-zinc-500">No office day (weekend / holiday)</span>
                )}
              </div>
            </div>
          </div>

          <SeatMap selectedDate={selected} />
        </section>
      </main>

      <footer className="border-t border-[var(--color-border)]/60 py-6 text-center text-[11px] text-zinc-500">
        Local persistence · adjust holidays in <code className="text-zinc-400">organization.ts</code>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <AppStateProvider>
      <Shell />
    </AppStateProvider>
  )
}
