import { format } from 'date-fns'
import { IconUmbrella } from './Icons'
import { getMember } from '../lib/organization'
import { toDateKey } from '../lib/schedule'
import { useAppState } from '../context/AppStateContext'

type Props = { selectedDate: Date }

export function VacationToggle({ selectedDate }: Props) {
  const { state, currentMemberId, toggleVacation } = useAppState()
  const member = getMember(currentMemberId)
  const key = toDateKey(selectedDate)
  if (!member?.designated) {
    return (
      <p className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] px-3 py-2 text-[12px] text-[var(--color-muted)]">
        Vacation release applies to <strong className="text-white/80">designated</strong> seats
        only. Non-designated staff use floaters and can book when their batch is in office.
      </p>
    )
  }
  const on = (state.vacations[member.id] ?? []).includes(key)

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/90 p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-white">
        <IconUmbrella className="h-4 w-4 text-sky-400" />
        Vacation · {format(selectedDate, 'EEE MMM d')}
      </div>
      <p className="text-[12px] text-[var(--color-muted)]">
        Toggle to release your designated seat for this day so others can use capacity.
      </p>
      <button
        type="button"
        onClick={() => toggleVacation(key)}
        className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
          on
            ? 'bg-sky-500/20 text-sky-200 ring-1 ring-sky-500/40'
            : 'bg-white/5 text-white/80 hover:bg-white/10'
        }`}
      >
        {on ? 'Seat released (vacation)' : 'Mark vacation / release seat'}
      </button>
    </div>
  )
}
