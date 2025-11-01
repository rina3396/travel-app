"use client"

import { useEffect, useMemo, useState, use as usePromise } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import type { Activity } from "@/types/trips"

type DbActivity = {
  id: string
  trip_id: string
  title: string
  start_time?: string | null
  end_time?: string | null
  location?: string | null
  note?: string | null
  day_id?: string | null
  order_no?: number | null
}

function toActivity(x: DbActivity): Activity {
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

function fromActivityInput(input: Partial<Activity> & { tripId: string }) {
  return {
    title: input.title,
    startTime: input.startTime ?? null,
    endTime: input.endTime ?? null,
    location: input.location ?? null,
    note: input.note ?? null,
    dayId: input.dayId ?? null,
    order_no: input.order_no ?? null,
  }
}

export default function ActivitiesPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = usePromise(params)
  const search = useSearchParams()
  const targetDate = search.get("date") || undefined
  const router = useRouter()

  const [items, setItems] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tripStart, setTripStart] = useState<string | null>(null)
  const [tripEnd, setTripEnd] = useState<string | null>(null)
  const [dayUuid, setDayUuid] = useState<string | null>(null)

  useEffect(() => {
    let abort = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/activities`, { cache: "no-store" })
        if (!res.ok) throw new Error(await res.text())
        const data: DbActivity[] = await res.json()
        if (!abort) setItems(data.map(toActivity))
      } catch (e: any) {
        if (!abort) setError(e?.message ?? "読み込みに失敗しました")
      } finally {
        if (!abort) setLoading(false)
      }
    })()
    return () => { abort = true }
  }, [tripId])

  useEffect(() => {
    let abort = false
    ;(async () => {
      try {
        const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/index`, { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        if (!abort) {
          setTripStart(data?.start_date ?? null)
          setTripEnd(data?.end_date ?? null)
        }
      } catch {}
    })()
    return () => { abort = true }
  }, [tripId])

  useEffect(() => {
    let abort = false
    ;(async () => {
      if (!targetDate) { setDayUuid(null); return }
      try {
        const g = await fetch(`/api/trips/${encodeURIComponent(tripId)}/days/${targetDate}`, { cache: 'no-store' })
        if (!g.ok) throw new Error(await g.text())
        const d = await g.json()
        if (abort) return
        if (d.dayId) { setDayUuid(d.dayId); return }
        const p = await fetch(`/api/trips/${encodeURIComponent(tripId)}/days/${targetDate}`, { method: 'POST' })
        if (!p.ok) throw new Error(await p.text())
        const created = await p.json()
        if (!abort) setDayUuid(created.dayId)
      } catch {
        if (!abort) setDayUuid(null)
      }
    })()
    return () => { abort = true }
  }, [tripId, targetDate])

  const [title, setTitle] = useState("")
  const [startTime, setStartTime] = useState("")
  const [location, setLocation] = useState("")
  const canSubmit = useMemo(() => title.trim().length > 0, [title])

  async function addActivity(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    const optimistic: Activity = {
      id: `tmp-${crypto.randomUUID()}`,
      tripId,
      title: title.trim(),
      startTime: startTime || undefined,
      endTime: undefined,
      location: location.trim() || undefined,
      note: undefined,
      dayId: dayUuid ?? undefined,
    }
    setItems((prev) => [optimistic, ...prev])

    try {
      const body = fromActivityInput({
        tripId,
        title: optimistic.title,
        startTime: optimistic.startTime,
        location: optimistic.location,
        dayId: dayUuid ?? undefined,
      })
      const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(await res.text())
      const ref = await fetch(`/api/trips/${encodeURIComponent(tripId)}/activities`, { cache: "no-store" })
      const latest: DbActivity[] = await ref.json()
      setItems(latest.map(toActivity))
      setTitle("")
      setStartTime("")
      setLocation("")
    } catch (e: any) {
      setItems((prev) => prev.filter((x) => x.id !== optimistic.id))
      setError(e?.message ?? "作成に失敗しました")
    }
  }

  async function removeActivity(id: string) {
    const before = items
    setItems(before.filter((x) => x.id !== id))
    try {
      const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/activities/${encodeURIComponent(id)}`, { method: "DELETE" })
      if (!res.ok) throw new Error(await res.text())
    } catch (e: any) {
      setItems(before)
      setError(e?.message ?? "削除に失敗しました")
    }
  }

  const viewItems = useMemo(() => {
    if (!dayUuid) return items
    return items.filter((x) => x.dayId === dayUuid)
  }, [items, dayUuid])

  async function migrateUnassignedToTarget() {
    if (!targetDate) return
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/activities/assign-day`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: targetDate })
      })
      if (!res.ok) throw new Error(await res.text())
      const ref = await fetch(`/api/trips/${encodeURIComponent(tripId)}/activities`, { cache: "no-store" })
      const latest: DbActivity[] = await ref.json()
      setItems(latest.map(toActivity))
    } catch (e: any) {
      setError(e?.message ?? "移行に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl p-4 space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-bold">アクティビティ一覧</h1>
        <p className="text-sm text-gray-600">tripId: {tripId}{targetDate ? ` / 対象日: ${targetDate}` : ""}</p>
      </header>

      {targetDate && tripStart && tripEnd && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              const d = addDays(targetDate, -1)
              if (d >= tripStart) router.push(`/trips/${encodeURIComponent(tripId)}/activities?date=${d}`)
            }}
            disabled={addDays(targetDate, -1) < tripStart}
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
          >
            前日へ
          </button>
          <button
            onClick={() => {
              const d = addDays(targetDate, 1)
              if (d <= tripEnd) router.push(`/trips/${encodeURIComponent(tripId)}/activities?date=${d}`)
            }}
            disabled={addDays(targetDate, 1) > tripEnd}
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
          >
            翌日へ
          </button>
        </div>
      )}

      {targetDate && (
        <div className="flex justify-end">
          <button onClick={migrateUnassignedToTarget} className="text-xs rounded-md border px-2 py-1 hover:bg-gray-50">
            未割当をこの日に移行
          </button>
        </div>
      )}

      <form onSubmit={addActivity} className="rounded-2xl border bg-white p-3 grid gap-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <label className="text-xs text-gray-600">開始</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <label className="text-xs text-gray-600">タイトル（必須）</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="例）首里城見学"
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-gray-600">場所</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="例）首里城公園"
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={!canSubmit} className="rounded-2xl border px-3 py-2 text-sm shadow-sm hover:bg-gray-50 disabled:opacity-60">
            追加
          </button>
        </div>
      </form>

      {loading && <p className="text-sm text-gray-500">読み込み中…</p>}
      {error && <p className="text-sm text-rose-600">エラー: {error}</p>}

      <ul className="rounded-2xl border divide-y bg-white">
        {viewItems.length === 0 ? (
          <li className="p-4 text-sm text-gray-500">まだアクティビティがありません。上のフォームから追加してください。</li>
        ) : (
          viewItems.map((a) => (
            <li key={a.id} className="p-3 flex items-start gap-3">
              <div className="w-16 text-sm text-gray-600 pt-1">{a.startTime || "--:--"}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{a.title}</div>
                {a.location && <div className="text-xs text-gray-600 truncate">{a.location}</div>}
                <div className="mt-1">
                  <Link
                    href={`/trips/${encodeURIComponent(tripId)}/activities/${encodeURIComponent(a.id)}`}
                    className="text-xs underline"
                  >
                    詳細へ
                  </Link>
                </div>
              </div>
              <button
                onClick={() => removeActivity(a.id)}
                className="rounded-xl border px-2 py-1 text-xs hover:bg-red-50 hover:border-red-300"
              >
                削除
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  )
}

function addDays(isoDate: string, delta: number) {
  const d = new Date(isoDate + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + delta)
  return d.toISOString().slice(0, 10)
}

