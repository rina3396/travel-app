"use client"

import { useEffect, useMemo, useState, use as usePromise } from "react"
import type { Task } from "@/types/trips"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Chip from "@/components/ui/Chip"
import Skeleton from "@/components/ui/Skeleton"

type DbTask = {
  id: string
  trip_id: string
  title: string
  kind?: Task["kind"] | null
  done: boolean
  created_at?: string | null
}

function toTask(x: DbTask): Task {
  return {
    id: x.id,
    tripId: x.trip_id,
    title: x.title,
    kind: (x.kind ?? "todo") as Task["kind"],
    done: !!x.done,
    createdAt: x.created_at ?? new Date().toISOString(),
  }
}

export default function TripTasksPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = usePromise(params)

  const [items, setItems] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [kind, setKind] = useState<Task["kind"]>("todo")
  const [filter, setFilter] = useState<"all" | "todo" | "packing">("all")

  useEffect(() => {
    let abort = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/tasks`, { cache: "no-store" })
        if (!res.ok) throw new Error(await res.text())
        const data: DbTask[] = await res.json()
        if (!abort) setItems(data.map(toTask))
      } catch (e: any) {
        if (!abort) setError(e?.message ?? "読み込みに失敗しました")
      } finally {
        if (!abort) setLoading(false)
      }
    })()
    return () => { abort = true }
  }, [tripId])

  const filtered = useMemo(() => {
    if (filter === "all") return items
    return items.filter((t) => t.kind === filter)
  }, [items, filter])

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    try {
      setLoading(true)
      setError(null)
      const body = { title: title.trim(), kind }
      const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(await res.text())
      const ref = await fetch(`/api/trips/${encodeURIComponent(tripId)}/tasks`, { cache: "no-store" })
      const data: DbTask[] = await ref.json()
      setItems(data.map(toTask))
      setTitle("")
      setKind("todo")
    } catch (e: any) {
      setError(e?.message ?? "追加に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  async function toggle(id: string) {
    const before = items
    const next = before.map((x) => (x.id === id ? { ...x, done: !x.done } : x))
    setItems(next)
    try {
      const t = next.find((x) => x.id === id)
      if (!t) return
      await fetch(`/api/trips/${encodeURIComponent(tripId)}/tasks/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: t.done }),
      })
    } catch {
      setItems(before)
    }
  }

  async function remove(id: string) {
    const before = items
    setItems(before.filter((x) => x.id !== id))
    try {
      await fetch(`/api/trips/${encodeURIComponent(tripId)}/tasks/${encodeURIComponent(id)}`, { method: "DELETE" })
    } catch {
      setItems(before)
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl p-4 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">TODO・持ち物</h1>
        <p className="text-sm text-gray-600">tripId: {tripId}</p>
      </header>

      {/* 追加フォーム */}
      <Card>
      <form onSubmit={addTask} className="grid gap-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2 space-y-1">
            <label className="text-xs text-gray-600">タイトル�E�忁E��！E/label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required
              placeholder="例）旅程�E印刷、日焼け止めE
              className="w-full rounded-xl border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-600">種別</label>
            <select value={kind} onChange={(e) => setKind(e.target.value as Task["kind"]) }
              className="w-full rounded-xl border px-3 py-2 text-sm bg-white">
              <option value="todo">TODO</option>
              <option value="packing">持ち物</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit">追加</Button>
        </div>
      </form>
      </Card>

      {/* フィルタ */}
      <div className="flex gap-2">
        {(["all", "todo", "packing"] as const).map((f) => (
          <Chip key={f} selected={filter === f} onClick={() => setFilter(f)}>
            {f === "all" ? "すべて" : f === "todo" ? "TODO" : "持ち物"}
          </Chip>
        ))}
      </div>

      {/* 一覧 */}
      <ul className="rounded-2xl border divide-y bg-white">
        {filtered.length === 0 ? (
          <li className="p-4 text-sm text-gray-500">まだ頁E��がありません。上�Eフォームから追加してください、E/li>
        ) : (
          filtered.map((t) => (
            <li key={t.id} className="p-3 flex items-center gap-3">
              <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)}
                className="h-4 w-4" aria-label="完亁E />
              <div className="flex-1 min-w-0">
                <div className={`truncate ${t.done ? "line-through text-gray-400" : ""}`}>{t.title}</div>
                <div className="text-xs text-gray-500">{t.kind === "todo" ? "TODO" : "持ち物"}</div>
              </div>
              <Button onClick={() => remove(t.id)} variant="outline" size="sm">削除</Button>
            </li>
          ))
        )}
      </ul>

      {loading && (
        <Card>
          <div className="grid gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </Card>
      )}
      {error && <p className="text-xs text-rose-600">エラー: {error}</p>}
    </section>
  )
}

