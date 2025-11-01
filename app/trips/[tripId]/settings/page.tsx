"use client"

import { useEffect, useMemo, useState } from "react"
import { createClientBrowser } from "@/lib/supabase/client"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Skeleton from "@/components/ui/Skeleton"

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
      setMessage("繧ｿ繧､繝医Ν繧貞・蜉帙＠縺ｦ縺上□縺輔＞")
      return
    }
    setSaving(true)
    setMessage(null)
    const { error } = await supabase
      .from("trips")
      .update({ title: title.trim(), start_date: start || null, end_date: end || null })
      .eq("id", tripId)
    setSaving(false)
    setMessage(error ? `菫晏ｭ倥↓螟ｱ謨励＠縺ｾ縺励◆: ${error.message}` : "菫晏ｭ倥＠縺ｾ縺励◆")
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 p-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">譌・｡後・險ｭ螳・/h1>
        <p className="text-sm text-gray-600">tripId: {tripId}</p>
      </header>

      {loading ? (
        <Card>
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-2/3 mt-2" />
        </Card>
      ) : (
        <Card>
        <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); save() }}>
          <label className="grid gap-1 text-sm">
            <span className="text-gray-600">繧ｿ繧､繝医Ν</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded border px-3 py-2" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1 text-sm">
              <span className="text-gray-600">髢句ｧ区律</span>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded border px-3 py-2" />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-gray-600">邨ゆｺ・律</span>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded border px-3 py-2" />
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={saving}>{saving ? "菫晏ｭ倅ｸｭ窶ｦ" : "菫晏ｭ・}</Button>
            {message && <span className="text-xs text-gray-600">{message}</span>}
          </div>
        </form>
        </Card>
      )}
    </section>
  )
}

