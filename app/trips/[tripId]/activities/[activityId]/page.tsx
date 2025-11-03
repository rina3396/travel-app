"use client"

import { useEffect, useState, use as usePromise } from "react"
import { useRouter } from "next/navigation"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Skeleton from "@/components/ui/Skeleton"

type DbActivity = {
  id: string
  title: string
  start_time?: string | null
  end_time?: string | null
  location?: string | null
  note?: string | null
}

export default function ActivityDetailPage({ params }: { params: Promise<{ tripId: string; activityId: string }> }) {
  const { tripId, activityId } = usePromise(params)
  const router = useRouter()

  const [item, setItem] = useState<DbActivity | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/activities/${encodeURIComponent(activityId)}`, { cache: "no-store" })
      if (!res.ok) { setError(await res.text()); setLoading(false); return }
      const data: DbActivity = await res.json()
      if (alive) { setItem(data); setLoading(false) }
    })()
    return () => { alive = false }
  }, [tripId, activityId])

  async function save() {
    if (!item) return
    setSaving(true)
    setError(null)
    const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/activities/${encodeURIComponent(activityId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: item.title,
        startTime: item.start_time ?? null,
        endTime: item.end_time ?? null,
        location: item.location ?? null,
        note: item.note ?? null,
      }),
    })
    setSaving(false)
    if (!res.ok) {
      setError(await res.text())
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function remove() {
    const ok = confirm("このアクティビティを削除しますか？")
    if (!ok) return
    const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/activities/${encodeURIComponent(activityId)}`, { method: "DELETE" })
    if (!res.ok) { setError(await res.text()); return }
    router.replace(`/trips/${encodeURIComponent(tripId)}/activities`)
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 p-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">アクティビティ詳細</h1>
        <p className="text-sm text-gray-600">tripId: {tripId}</p>
      </header>

      {loading ? (
        <Card title="アクティビティ詳細" description="読み込み中…">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </Card>
      ) : item ? (
        <Card title="アクティビティ詳細" description="アクティビティ情報を編集します。">
          <div className="grid gap-4">
            <label className="grid gap-1 text-sm" htmlFor="title">
              <span className="text-gray-700">タイトル</span>
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
                  value={item.title}
                  onChange={(e) => setItem({ ...(item as any), title: e.target.value })}
                  placeholder="例: 美術館ツアー"
                  aria-describedby="title-help"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pl-9 text-sm placeholder-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200/60"
                />
              </div>
              <p id="title-help" className="text-xs text-gray-500">アクティビティ名を入力</p>
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm" htmlFor="start">
                <span className="text-gray-700">開始時刻</span>
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
                    id="start"
                    type="time"
                    value={item.start_time ?? ""}
                    onChange={(e) => setItem({ ...(item as any), start_time: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pl-9 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200/60"
                  />
                </div>
              </label>
              <label className="grid gap-1 text-sm" htmlFor="end">
                <span className="text-gray-700">終了時刻</span>
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
                    id="end"
                    type="time"
                    value={item.end_time ?? ""}
                    onChange={(e) => setItem({ ...(item as any), end_time: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pl-9 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200/60"
                  />
                </div>
              </label>
            </div>
            <p className="-mt-1 text-xs text-gray-500">開始/終了時刻を設定（任意）</p>

            <label className="grid gap-1 text-sm" htmlFor="location">
              <span className="text-gray-700">場所</span>
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
                  value={item.location ?? ""}
                  onChange={(e) => setItem({ ...(item as any), location: e.target.value })}
                  placeholder="例: 駅前広場"
                  aria-describedby="location-help"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pl-9 text-sm placeholder-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200/60"
                />
              </div>
              <p id="location-help" className="text-xs text-gray-500">場所名など（任意）</p>
            </label>

            <label className="grid gap-1 text-sm" htmlFor="note">
              <span className="text-gray-700">メモ</span>
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" />
                </svg>
                <textarea
                  id="note"
                  value={item.note ?? ""}
                  onChange={(e) => setItem({ ...(item as any), note: e.target.value })}
                  placeholder="補足メモ"
                  aria-describedby="note-help"
                  className="min-h-[140px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pl-9 text-sm placeholder-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200/60"
                />
              </div>
              <p id="note-help" className="text-xs text-gray-500">自由記入（任意）</p>
            </label>

            <div className="h-px bg-gray-100" />
            <div className="flex items-center justify-end gap-2">
              <Button onClick={remove} variant="danger" className="gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M10 11v6m4-6v6M9 7l1-2h4l1 2m-9 0l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
                </svg>
                削除
              </Button>
              <Button onClick={save} disabled={saving} className="gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {saving ? "保存中…" : "保存"}
              </Button>
            </div>

            <div className="space-y-2 pt-2" aria-live="polite">
              {saved && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  変更を保存しました
                </div>
              )}
              {error && (
                <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">エラー: {error}</div>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border-rose-200 bg-rose-50 text-rose-700">
          <p className="text-sm">データを取得できませんでした。</p>
        </Card>
      )}
    </section>
  )
}

