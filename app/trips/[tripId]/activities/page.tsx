"use client"

import { useEffect, useMemo, useState, use as usePromise } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Skeleton from "@/components/ui/Skeleton"
import type { Activity } from "@/types/trips"

// Map DB row to UI Activity
function toActivity(x: any): Activity {
  return {
    id: x.id,
    tripId: x.trip_id,
    title: x.title,
    startTime: x.start_time ?? undefined,
    endTime: x.end_time ?? undefined,
    location: x.location ?? undefined,
    note: x.note ?? undefined,
    dayId: x.day_id ?? undefined,
    order_no: x.order_no ?? undefined,
  }
}

export default function ActivitiesPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = usePromise(params)
  const search = useSearchParams()
  const router = useRouter()
  const targetDate = search.get("date") || undefined

  const [items, setItems] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [tripStart, setTripStart] = useState<string | null>(null)
  const [tripEnd, setTripEnd] = useState<string | null>(null)
  const [dayId, setDayId] = useState<string | null>(null)

  // Load activities
  useEffect(() => {
    let abort = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/activities`, { cache: "no-store" })
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        if (!abort) setItems((data as any[]).map(toActivity))
      } catch (e: any) {
        if (!abort) setError(e?.message ?? "Failed to load activities")
      } finally {
        if (!abort) setLoading(false)
      }
    })()
    return () => { abort = true }
  }, [tripId])

  // Load trip period
  useEffect(() => {
    let abort = false
    ;(async () => {
      try {
        const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/index`, { cache: "no-store" })
        if (!res.ok) return
        const d = await res.json()
        if (!abort) {
          setTripStart(d?.start_date ?? null)
          setTripEnd(d?.end_date ?? null)
        }
      } catch {}
    })()
    return () => { abort = true }
  }, [tripId])

  // Ensure day for targetDate and get its id
  useEffect(() => {
    let abort = false
    ;(async () => {
      if (!targetDate) { setDayId(null); return }
      try {
        const get = await fetch(`/api/trips/${encodeURIComponent(tripId)}/days/${targetDate}`, { cache: "no-store" })
        if (!get.ok) throw new Error(await get.text())
        const info = await get.json()
        if (abort) return
        if (info.dayId) { setDayId(info.dayId); return }
        const crt = await fetch(`/api/trips/${encodeURIComponent(tripId)}/days/${targetDate}`, { method: "POST" })
        if (!crt.ok) throw new Error(await crt.text())
        const created = await crt.json()
        if (!abort) setDayId(created.dayId)
      } catch {
        if (!abort) setDayId(null)
      }
    })()
    return () => { abort = true }
  }, [tripId, targetDate])

  // Derived view
  const viewItems = useMemo(() => {
    const arr = targetDate && dayId ? items.filter(a => a.dayId === dayId) : items
    return [...arr].sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""))
  }, [items, targetDate, dayId])

  // Form state
  const [title, setTitle] = useState("")
  const [startTime, setStartTime] = useState("")
  const [location, setLocation] = useState("")
  const canSubmit = useMemo(() => title.trim().length > 0, [title])

  async function addActivity(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    try {
      setLoading(true)
      setError(null)
      const body = {
        title: title.trim(),
        startTime: startTime || null,
        endTime: null,
        location: location || null,
        note: null,
        dayId: targetDate ? dayId : null,
      }
      const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(await res.text())
      // refresh list
      const ref = await fetch(`/api/trips/${encodeURIComponent(tripId)}/activities`, { cache: "no-store" })
      const data = await ref.json()
      setItems((data as any[]).map(toActivity))
      setTitle("")
      setStartTime("")
      setLocation("")
    } catch (e: any) {
      setError(e?.message ?? "Failed to add activity")
    } finally {
      setLoading(false)
    }
  }

  async function removeActivity(id: string) {
    const before = items
    setItems(before.filter(x => x.id !== id))
    try {
      const del = await fetch(`/api/trips/${encodeURIComponent(tripId)}/activities/${encodeURIComponent(id)}`, { method: "DELETE" })
      if (!del.ok) throw new Error(await del.text())
    } catch {
      setItems(before)
    }
  }

  async function migrateUnassignedToTarget() {
    if (!targetDate) return
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/activities/assign-day`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: targetDate }),
      })
      if (!res.ok) throw new Error(await res.text())
      const ref = await fetch(`/api/trips/${encodeURIComponent(tripId)}/activities`, { cache: "no-store" })
      const data = await ref.json()
      setItems((data as any[]).map(toActivity))
    } catch (e: any) {
      setError(e?.message ?? "Failed to migrate items")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 p-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Activities</h1>
        <p className="text-sm text-gray-600">tripId: {tripId}{targetDate ? `, date: ${targetDate}` : ""}</p>
      </header>

      {targetDate && tripStart && tripEnd && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const d = addDays(targetDate, -1)
              if (tripStart && d >= tripStart) router.push(`/trips/${encodeURIComponent(tripId)}/activities?date=${d}`)
            }}
            disabled={addDays(targetDate, -1) < (tripStart ?? targetDate)}
          >
            Prev day
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const d = addDays(targetDate, 1)
              if (tripEnd && d <= tripEnd) router.push(`/trips/${encodeURIComponent(tripId)}/activities?date=${d}`)
            }}
            disabled={addDays(targetDate, 1) > (tripEnd ?? targetDate)}
          >
            Next day
          </Button>
        </div>
      )}

      {targetDate && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={migrateUnassignedToTarget}>
            Move unassigned to this day
          </Button>
        </div>
      )}

      <Card title="Add Activity" description="Create a new activity with optional time and location.">
        <form onSubmit={addActivity} className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-600" htmlFor="start-time">Start</label>
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
                </svg>
                <input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pl-9 text-sm placeholder-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200/60"
                />
              </div>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-gray-600" htmlFor="title">Title</label>
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18M3 12h18M3 19h18" />
                </svg>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g., Visit museum"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pl-9 text-sm placeholder-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200/60"
                />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-600" htmlFor="location">Location</label>
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-4.5 7-10a7 7 0 1 0-14 0c0 5.5 7 10 7 10Zm0-11.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" />
              </svg>
              <input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Downtown"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pl-9 text-sm placeholder-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200/60"
              />
            </div>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex justify-end">
            <Button type="submit" disabled={!canSubmit} className="gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
              </svg>
              Add Activity
            </Button>
          </div>
        </form>
      </Card>

      {loading && (
        <Card>
          <div className="grid gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </Card>
      )}
      {error && (
        <Card className="border-rose-200 bg-rose-50 text-rose-700">
          <p className="text-sm">Error: {error}</p>
        </Card>
      )}

      {viewItems.length === 0 ? (
        <Card className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-5 w-5"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18M3 12h18M7 19h10" />
            </svg>
          </div>
          <div className="space-y-0.5">
            <div className="text-sm font-medium text-gray-900">No activities yet</div>
            <p className="text-xs text-gray-600">Use the form above to add.</p>
          </div>
        </Card>
      ) : (
        <Card className="p-2 sm:p-3">
        <ul className="divide-y">
          {viewItems.map((a) => (
            <li key={a.id} className="flex items-center gap-1.5 p-1.5 sm:p-2 transition-colors hover:bg-gray-50">
              <div className="w-16 text-center text-xs font-medium text-gray-700">
                {a.startTime || "--:--"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-base font-medium leading-tight">{a.title}</div>
                {a.location && <div className="truncate text-xs text-gray-600 leading-snug">{a.location}</div>}
                <div className="mt-0">
                  <Link
                    href={`/trips/${encodeURIComponent(tripId)}/activities/${encodeURIComponent(a.id)}`}
                    className="text-xs text-gray-700 underline hover:text-gray-900"
                  >
                    Details
                  </Link>
                </div>
              </div>
              <Button
                onClick={() => removeActivity(a.id)}
                variant="danger"
                size="sm"
                aria-label={`Delete ${a.title}`}
                className="gap-0.5 px-1.5 py-0.5 text-[11px] leading-tight"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-3 w-3"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M10 11v6m4-6v6M9 7l1-2h4l1 2m-9 0l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
                </svg>
                Delete
              </Button>
            </li>
          ))}
        </ul>
        </Card>
      )}
    </section>
  )
}

function addDays(isoDate: string, delta: number) {
  const d = new Date(isoDate + "T00:00:00Z")
  d.setUTCDate(d.getUTCDate() + delta)
  return d.toISOString().slice(0, 10)
}
