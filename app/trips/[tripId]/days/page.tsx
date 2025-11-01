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
        if (!abort) setError(e?.message ?? "譌・｡梧ュ蝣ｱ縺ｮ蜿門ｾ励↓螟ｱ謨励＠縺ｾ縺励◆")
      } finally {
        if (!abort) setLoading(false)
      }
    })()
    return () => { abort = true }
  }, [tripId])

  const days = useMemo(() => {
    // 譌・｡梧悄髢薙°繧画律莉倬・蛻励ｒ逕滓・・域悴險ｭ螳壽凾縺ｯ譛ｬ譌･1譌･縺ｮ縺ｿ・・    const start = trip?.start_date ? new Date(trip.start_date) : new Date()
    const end = trip?.end_date ? new Date(trip.end_date) : start
    // 豁｣隕丞喧・域凾蛻ｻ繧旦TC蝓ｺ貅悶・00:00縺ｫ霑代▼縺代ｋ・・    const s = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()))
    const e = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()))
    if (e < s) return [formatISODate(s)]
    const arr: string[] = []
    for (let d = new Date(s); d.getTime() <= e.getTime(); d.setUTCDate(d.getUTCDate() + 1)) {
      arr.push(formatISODate(d))
    }
    return arr
  }, [trip?.start_date, trip?.end_date])

  function onSelect(date: string) {
    // 繧｢繧ｯ繝・ぅ繝薙ユ繧｣逕ｻ髱｢縺ｸ・亥ｯｾ雎｡譌･莉倅ｻ倥″・・    router.push(`/trips/${encodeURIComponent(tripId)}/activities?date=${encodeURIComponent(date)}`)
  }

  return (
    <section className="mx-auto w-full max-w-2xl p-4 space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-bold">譌･蛻･縺励♀繧翫・邱ｨ髮・律繧帝∈謚・/h1>
        <p className="text-sm text-gray-600">tripId: {tripId}</p>
      </header>

      {loading && <p className="text-sm text-gray-600">隱ｭ縺ｿ霎ｼ縺ｿ荳ｭ縺ｧ縺吮ｦ</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {days.map((d, i) => (
            <button
              key={d}
              className="rounded-xl border px-3 py-2 text-sm text-left hover:bg-orange-50"
              onClick={() => onSelect(d)}
            >
              <div className="font-medium">{i + 1}譌･逶ｮ</div>
              <div className="text-xs text-gray-600">{d}</div>
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-600">
        驕ｸ謚槭＠縺滓律莉倥・隧ｳ邏ｰ邱ｨ髮・・繧｢繧ｯ繝・ぅ繝薙ユ繧｣逕ｻ髱｢縺ｧ陦後＞縺ｾ縺吶・      </p>
    </section>
  )
}

function formatISODate(d: Date) {
  return new Date(d).toISOString().slice(0, 10)
}


