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

      <Card>
        <form onSubmit={addActivity} className="grid gap-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-gray-600">Start</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs text-gray-600">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g., Visit museum"
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Downtown"
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={!canSubmit}>
              Add
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

      <ul className="rounded-2xl divide-y border bg-white">
        {viewItems.length === 0 ? (
          <li className="p-4 text-sm text-gray-500">No activities yet. Use the form above to add.</li>
        ) : (
          viewItems.map((a) => (
            <li key={a.id} className="flex items-start gap-3 p-3">
              <div className="w-16 pt-1 text-sm text-gray-600">{a.startTime || "--:--"}</div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{a.title}</div>
                {a.location && <div className="truncate text-xs text-gray-600">{a.location}</div>}
                <div className="mt-1">
                  <Link
                    href={`/trips/${encodeURIComponent(tripId)}/activities/${encodeURIComponent(a.id)}`}
                    className="text-xs underline"
                  >
                    Details
                  </Link>
                </div>
              </div>
              <button
                onClick={() => removeActivity(a.id)}
                className="rounded-xl border px-2 py-1 text-xs hover:border-red-300 hover:bg-red-50"
              >
                Delete
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  )
}

function addDays(isoDate: string, delta: number) {
  const d = new Date(isoDate + "T00:00:00Z")
  d.setUTCDate(d.getUTCDate() + delta)
  return d.toISOString().slice(0, 10)
}