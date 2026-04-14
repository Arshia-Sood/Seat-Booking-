import { format } from 'date-fns'
import { useId, useState } from 'react'
import { useAppState } from '../context/AppStateContext'

export function DemoClock() {
  const { demoNow, setDemoNow, effectiveNow } = useAppState()
  const [local, setLocal] = useState('')
  const id = useId()

  return (
    <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.04] p-3 text-[12px]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-muted)]">
            Effective “now”
          </div>
          <div className="font-mono text-sm text-emerald-300/90">
            {format(effectiveNow, 'EEE MMM d, yyyy · HH:mm')}
          </div>
        </div>
        {demoNow && (
          <button
            type="button"
            onClick={() => setDemoNow(null)}
            className="rounded-lg bg-white/10 px-2 py-1 text-[11px] text-white/80 hover:bg-white/15"
          >
            Use real time
          </button>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1">
          <label htmlFor={id} className="text-[10px] text-[var(--color-muted)]">
            Simulate datetime (ISO)
          </label>
          <input
            id={id}
            className="w-56 max-w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 font-mono text-[11px] text-white/90"
            placeholder="2026-04-14T16:00"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            const p = Date.parse(local)
            if (!Number.isNaN(p)) setDemoNow(new Date(p))
          }}
          className="rounded-lg bg-[var(--color-accent)]/90 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[var(--color-accent)]"
        >
          Apply
        </button>
      </div>
      <p className="mt-2 text-[11px] text-[var(--color-muted)]">
        Use this to test the 3:00 PM cutoff for the next working day without waiting.
      </p>
    </div>
  )
}
