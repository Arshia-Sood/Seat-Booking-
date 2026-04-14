import { MEMBERS, squadBatch } from '../lib/organization'
import { useAppState } from '../context/AppStateContext'

export function MemberPicker() {
  const { currentMemberId, setCurrentMemberId } = useAppState()

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted)]">
        Act as
      </label>
      <select
        value={currentMemberId}
        onChange={(e) => setCurrentMemberId(e.target.value)}
        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-white outline-none ring-[var(--color-accent)]/30 focus:ring-2"
      >
        {MEMBERS.map((m) => {
          const b = squadBatch(m.squadId)
          return (
            <option key={m.id} value={m.id}>
              {m.name} · Batch {b} · {m.designated ? 'Designated' : 'Non-designated'}
            </option>
          )
        })}
      </select>
    </div>
  )
}
