"use client"

import { useEffect, useMemo, useState, use as usePromise } from "react"
import { useRouter } from "next/navigation"

type TripDetail = {
  id: string
  title: string
  start_date?: string | null
  end_date?: string | null
}

export default function TripDaysSelectorPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = usePromise(params)
  const router = useRouter()

  const [trip, setTrip] = useState<TripDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let abort = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/index`, { cache: "no-store" })
        if (!res.ok) throw new Error(await res.text())
        const data: TripDetail = await res.json()
        if (!abort) setTrip(data)
      } catch (e: any) {
        if (!abort) setError(e?.message ?? "旅行情報の取得に失敗しました")
      } finally {
        if (!abort) setLoading(false)
      }
    })()
    return () => { abort = true }
  }, [tripId])

  const days = useMemo(() => {
    // 旅行期間から日付配列を生成（未設定時は本日1日のみ）
    const start = trip?.start_date ? new Date(trip.start_date) : new Date()
    const end = trip?.end_date ? new Date(trip.end_date) : start
    // 正規化（時刻をUTC基準の00:00に近づける）
    const s = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()))
    const e = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()))
    if (e < s) return [formatISODate(s)]
    const arr: string[] = []
    for (let d = new Date(s); d.getTime() <= e.getTime(); d.setUTCDate(d.getUTCDate() + 1)) {
      arr.push(formatISODate(d))
    }
    return arr
  }, [trip?.start_date, trip?.end_date])

  function onSelect(date: string) {
    // アクティビティ画面へ（対象日付付き）
    router.push(`/trips/${encodeURIComponent(tripId)}/activities?date=${encodeURIComponent(date)}`)
  }

  return (
    <section className="mx-auto w-full max-w-2xl p-4 space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-bold">日別しおりの編集日を選択</h1>
        <p className="text-sm text-gray-600">tripId: {tripId}</p>
      </header>

      {loading && <p className="text-sm text-gray-600">読み込み中です…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {days.map((d, i) => (
            <button
              key={d}
              className="rounded-xl border px-3 py-2 text-sm text-left hover:bg-gray-50"
              onClick={() => onSelect(d)}
            >
              <div className="font-medium">{i + 1}日目</div>
              <div className="text-xs text-gray-600">{d}</div>
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-600">
        選択した日付の詳細編集はアクティビティ画面で行います。
      </p>
    </section>
  )
}

function formatISODate(d: Date) {
  return new Date(d).toISOString().slice(0, 10)
}

