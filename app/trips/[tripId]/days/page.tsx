"use client"

import { useEffect, useMemo, useState, use as usePromise } from "react"
import type { DbTripDetail } from "@/types/trips"
import { useRouter } from "next/navigation"
import Card from "@/components/ui/Card"
import Skeleton from "@/components/ui/Skeleton"

type TripDetail = DbTripDetail

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
    // 旅行期間から日付配列を生成。未設定時は本日1日のみ
    const start = trip?.start_date ? new Date(trip.start_date) : new Date()
    const end = trip?.end_date ? new Date(trip.end_date) : start
    // UTC の 00:00 に正規化
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
    router.push(`/trips/${encodeURIComponent(tripId)}/activities?date=${encodeURIComponent(date)}`)
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 p-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">日別しおり</h1>
        <p className="text-sm text-gray-600">tripId: {tripId}</p>
      </header>

      {loading && (
        <Card>
          <div className="grid gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </Card>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {days.map((d, i) => (
            <button
              key={d}
              onClick={() => onSelect(d)}
              className="group rounded-xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none"
            >
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-orange-500" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
                </svg>
                <div className="font-semibold">{i + 1}日目</div>
              </div>
              <div className="mt-1 text-xs text-gray-600">{d}</div>
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-600">選択した日の詳細編集は「アクティビティ」画面で行います。</p>
    </section>
  )
}

function formatISODate(d: Date) {
  return new Date(d).toISOString().slice(0, 10)
}
