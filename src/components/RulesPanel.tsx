import { format } from 'date-fns'
import {
  IconAlertTriangle,
  IconClock,
  IconMoon,
  IconPalmtree,
} from './Icons'
import { getNextWorkingDay, isPastCutoffForNextWorkingDay, toDateKey } from '../lib/schedule'
import { useAppState } from '../context/AppStateContext'

export function RulesPanel() {
  const { holidays, effectiveNow } = useAppState()
  const nextWd = getNextWorkingDay(effectiveNow, holidays)
  const locked = isPastCutoffForNextWorkingDay(effectiveNow)

  return (
    <div className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/90 p-4">
      <h4 className="font-[family-name:var(--font-display)] text-sm font-semibold text-white">
        Booking rules
      </h4>
      <ul className="space-y-2.5 text-[13px] leading-snug text-[var(--color-muted)]">
        <li className="flex gap-2">
          <IconClock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" />
          <span>
            After <strong className="text-white/90">3:00 PM</strong>, the{' '}
            <strong className="text-white/90">next working day</strong> is closed for new floater
            bookings. Next WD:{' '}
            <strong className="text-white/90">{format(nextWd, 'EEE MMM d')}</strong>
            {locked ? (
              <span className="ml-1 inline-flex items-center gap-1 rounded bg-rose-500/15 px-1.5 py-0.5 text-[11px] font-medium text-rose-300">
                <IconAlertTriangle className="h-3 w-3" /> locked now
              </span>
            ) : (
              <span className="ml-1 text-emerald-400/90">open</span>
            )}
          </span>
        </li>
        <li className="flex gap-2">
          <IconPalmtree className="mt-0.5 h-4 w-4 shrink-0 text-amber-400/90" />
          <span>
            <strong className="text-white/90">Holidays</strong> cannot be booked. Today’s holiday
            flag: {holidays.has(toDateKey(effectiveNow)) ? 'yes' : 'no'}.
          </span>
        </li>
        <li className="flex gap-2">
          <IconMoon className="mt-0.5 h-4 w-4 shrink-0 text-violet-400/90" />
          <span>
            <strong className="text-white/90">Batches</strong> alternate Mon–Wed vs Thu–Fri across a
            two-week cycle so space is shared efficiently.
          </span>
        </li>
      </ul>
    </div>
  )
}
