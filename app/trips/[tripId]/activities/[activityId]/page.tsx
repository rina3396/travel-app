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

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/activities/${encodeURIComponent(activityId)}`, { cache: 'no-store' })
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
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        title: item.title,
        startTime: item.start_time ?? null,
        endTime: item.end_time ?? null,
        location: item.location ?? null,
        note: item.note ?? null,
      })
    })
    setSaving(false)
    if (!res.ok) setError(await res.text())
  }

  async function remove() {
    const ok = confirm('このアクティビティを削除しますか？')
    if (!ok) return
    const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/activities/${encodeURIComponent(activityId)}`, { method: 'DELETE' })
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
        <Card>
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </Card>
      ) : item ? (
        <Card>
          <div className="grid gap-3">
            <label className="grid gap-1 text-sm">
              <span className="text-gray-600">タイトル</span>
              <input value={item.title} onChange={(e) => setItem({ ...(item as any), title: e.target.value })} className="rounded-xl border px-3 py-2" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm">
                <span className="text-gray-600">開始</span>
                <input type="time" value={item.start_time ?? ''} onChange={(e) => setItem({ ...(item as any), start_time: e.target.value })} className="rounded-xl border px-3 py-2" />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-gray-600">終了</span>
                <input type="time" value={item.end_time ?? ''} onChange={(e) => setItem({ ...(item as any), end_time: e.target.value })} className="rounded-xl border px-3 py-2" />
              </label>
            </div>
            <label className="grid gap-1 text-sm">
              <span className="text-gray-600">場所</span>
              <input value={item.location ?? ''} onChange={(e) => setItem({ ...(item as any), location: e.target.value })} className="rounded-xl border px-3 py-2" />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-gray-600">メモ</span>
              <textarea value={item.note ?? ''} onChange={(e) => setItem({ ...(item as any), note: e.target.value })} className="min-h-[120px] rounded-xl border px-3 py-2" />
            </label>
            <div className="flex items-center justify-end gap-2">
              <Button onClick={remove} variant="outline">削除</Button>
              <Button onClick={save} disabled={saving}>{saving ? '保存中…' : '保存'}</Button>
            </div>
            {error && (
              <div className="pt-2">
                <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">エラー: {error}</div>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="border-rose-200 bg-rose-50 text-rose-700"><p className="text-sm">データを取得できませんでした。</p></Card>
      )}
    </section>
  )
}