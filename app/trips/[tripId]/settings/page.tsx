"use client"

import { useEffect, useMemo, useState, use as usePromise } from "react"
import { createClientBrowser } from "@/lib/supabase/client"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Skeleton from "@/components/ui/Skeleton"

export default function TripSettingsPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = usePromise(params)
  const supabase = useMemo(() => createClientBrowser(), [])

  const [title, setTitle] = useState("")
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setMessage(null)
      const { data, error } = await supabase
        .from("trips")
        .select("id, title, start_date, end_date")
        .eq("id", tripId)
        .maybeSingle()
      if (!alive) return
      if (error) {
        setMessage(error.message)
      } else if (data) {
        setTitle(data.title ?? "")
        setStart(data.start_date ?? "")
        setEnd(data.end_date ?? "")
      }
      setLoading(false)
    })()
    return () => { alive = false }
  }, [supabase, tripId])

  async function save() {
    if (!title.trim()) { setMessage("タイトルを入力してください"); return }
    setSaving(true)
    setMessage(null)
    const { error } = await supabase
      .from("trips")
      .update({ title: title.trim(), start_date: start || null, end_date: end || null })
      .eq("id", tripId)
    setSaving(false)
    setMessage(error ? `保存に失敗しました: ${error.message}` : "保存しました")
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 p-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">旅行の設定</h1>
        <p className="text-sm text-gray-600">tripId: {tripId}</p>
      </header>

      {loading ? (
        <Card>
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </Card>
      ) : (
        <Card>
          <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); save() }}>
            <label className="grid gap-1 text-sm">
              <span className="text-gray-600">タイトル</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl border px-3 py-2" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm">
                <span className="text-gray-600">開始日</span>
                <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-xl border px-3 py-2" />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-gray-600">終了日</span>
                <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-xl border px-3 py-2" />
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={saving}>{saving ? "保存中…" : "保存"}</Button>
              {message && <span className="text-xs text-gray-600">{message}</span>}
            </div>
          </form>
        </Card>
      )}
    </section>
  )
}