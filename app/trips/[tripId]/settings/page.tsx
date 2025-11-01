"use client"

import { useEffect, useMemo, useState } from "react"
import { createClientBrowser } from "@/lib/supabase/client"

type Trip = { id: string; title: string | null; start_date: string | null; end_date: string | null }

export default function TripSettingsPage({ params }: { params: { tripId: string } }) {
  const tripId = params.tripId
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
        .single()
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
    if (!title.trim()) {
      setMessage("タイトルを�E力してください")
      return
    }
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
    <section className="mx-auto w-full max-w-2xl space-y-5 p-4">
      <header className="space-y-1">
        <h1 className="text-xl font-bold">旁E�E設宁E/h1>
        <p className="text-sm text-gray-600">tripId: {tripId}</p>
      </header>

      {loading ? (
        <p className="text-sm text-gray-500">読み込み中…</p>
      ) : (
        <form className="grid gap-3 rounded-2xl border bg-white p-4" onSubmit={(e) => { e.preventDefault(); save() }}>
          <label className="grid gap-1 text-sm">
            <span className="text-gray-600">タイトル</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded border px-3 py-2" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1 text-sm">
              <span className="text-gray-600">開始日</span>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded border px-3 py-2" />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-gray-600">終亁E��</span>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded border px-3 py-2" />
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button type="submit" disabled={saving} className="rounded bg-orange-500 px-4 py-2 text-sm text-white hover:bg-orange-600 disabled:opacity-60">
              {saving ? "保存中…" : "保孁E}
            </button>
            {message && <span className="text-xs text-gray-600">{message}</span>}
          </div>
        </form>
      )}
    </section>
  )
}


