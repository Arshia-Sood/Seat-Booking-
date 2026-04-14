import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AppState } from '../lib/types'
import { DEFAULT_HOLIDAYS, getMember } from '../lib/organization'
import { validateFloaterBooking } from '../lib/bookingRules'

const STORAGE_KEY = 'wissen-seat-v1'

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const p = JSON.parse(raw) as AppState
      if (p.bookings && p.vacations) return p
    }
  } catch {
    /* ignore */
  }
  return { bookings: {}, vacations: {} }
}

type Ctx = {
  state: AppState
  holidays: Set<string>
  setHolidayDates: (dates: string[]) => void
  currentMemberId: string
  setCurrentMemberId: (id: string) => void
  demoNow: Date | null
  setDemoNow: (d: Date | null) => void
  effectiveNow: Date
  bookFloater: (seatId: string, dateKey: string) => { ok: true } | { ok: false; message: string }
  cancelFloater: (seatId: string, dateKey: string) => void
  toggleVacation: (dateKey: string) => void
}

const AppStateContext = createContext<Ctx | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState())
  const [holidayList, setHolidayList] = useState<string[]>(DEFAULT_HOLIDAYS)
  const [currentMemberId, setCurrentMemberId] = useState('m-1-d-1')
  const [demoNow, setDemoNow] = useState<Date | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const holidays = useMemo(() => new Set(holidayList), [holidayList])

  const effectiveNow = demoNow ?? new Date()

  const setHolidayDates = useCallback((dates: string[]) => {
    setHolidayList(dates)
  }, [])

  const bookFloater = useCallback(
    (seatId: string, dateKey: string) => {
      const member = getMember(currentMemberId)
      if (!member) return { ok: false as const, message: 'No member selected.' }
      const res = validateFloaterBooking(
        { memberId: member.id, seatId, dateKey },
        effectiveNow,
        holidays,
        state.bookings,
        state.vacations,
      )
      if (!res.ok) return res
      setState((prev) => {
        const day = { ...(prev.bookings[dateKey] ?? {}) }
        day[seatId] = {
          memberId: member.id,
          seatId,
          createdAt: new Date().toISOString(),
        }
        return {
          ...prev,
          bookings: { ...prev.bookings, [dateKey]: day },
        }
      })
      return { ok: true as const }
    },
    [currentMemberId, effectiveNow, holidays, state.bookings, state.vacations],
  )

  const cancelFloater = useCallback(
    (seatId: string, dateKey: string) => {
      const member = getMember(currentMemberId)
      if (!member) return
      setState((prev) => {
        const day = { ...(prev.bookings[dateKey] ?? {}) }
        const b = day[seatId]
        if (!b || b.memberId !== member.id) return prev
        delete day[seatId]
        const next = { ...prev.bookings }
        if (Object.keys(day).length === 0) delete next[dateKey]
        else next[dateKey] = day
        return { ...prev, bookings: next }
      })
    },
    [currentMemberId],
  )

  const toggleVacation = useCallback(
    (dateKey: string) => {
      setState((prev) => {
        const member = getMember(currentMemberId)
        if (!member || !member.designated) return prev
        const list = [...(prev.vacations[member.id] ?? [])]
        const i = list.indexOf(dateKey)
        if (i >= 0) list.splice(i, 1)
        else list.push(dateKey)
        return {
          ...prev,
          vacations: { ...prev.vacations, [member.id]: list },
        }
      })
    },
    [currentMemberId],
  )

  const value = useMemo(
    () => ({
      state,
      holidays,
      setHolidayDates,
      currentMemberId,
      setCurrentMemberId,
      demoNow,
      setDemoNow,
      effectiveNow,
      bookFloater,
      cancelFloater,
      toggleVacation,
    }),
    [
      state,
      holidays,
      setHolidayDates,
      currentMemberId,
      demoNow,
      effectiveNow,
      bookFloater,
      cancelFloater,
      toggleVacation,
    ],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const c = useContext(AppStateContext)
  if (!c) throw new Error('useAppState outside provider')
  return c
}
