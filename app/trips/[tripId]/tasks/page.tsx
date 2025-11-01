// // app/trips/[tripId]/tasks/page.tsx
// export default async function TripTasksPage({ params }: { params: { tripId: string } }) {
//     // TODO: 旅ごとのタスク（TODO/持ち物）一覧・チェック機能
//     return (
//         <section className="space-y-2">
//             <h1 className="text-xl font-bold">TODO・持ち物</h1>
//             <p className="text-sm text-gray-600">tripId: {params.tripId}</p>
//         </section>
//     )
// }

"use client"

import { useMemo, useState, use as usePromise } from "react"
import type { Task } from "@/types/trips"

/**
 * 最小構成の「TODO・持ち物」ページ
 * - 依存パッケージなし（Tailwindのみ）
 * - できること：一覧／追加／完了チェック／削除、簡易フィルタ
 * - データはクライアント状態のみ（APIは未接続）
 *
 * 配置: app/trips/[tripId]/tasks/page.tsx
 */

export default function TripTasksPage({ params }: { params: Promise<{ tripId: string }> }) {
    const { tripId } = usePromise(params)

    const [items, setItems] = useState<Task[]>(seedTasks(tripId))
    const [title, setTitle] = useState("")
    const [kind, setKind] = useState<Task["kind"]>("todo")
    const [filter, setFilter] = useState<"all" | "todo" | "packing">("all")

    const filtered = useMemo(() => {
        if (filter === "all") return items
        return items.filter((t) => t.kind === filter)
    }, [items, filter])

    function addTask(e: React.FormEvent) {
        e.preventDefault()
        if (!title.trim()) return
        const t: Task = {
            id: crypto.randomUUID(),
            tripId,
            title: title.trim(),
            kind,
            done: false,
            createdAt: new Date().toISOString(),
        }
        setItems((prev) => [t, ...prev])
        setTitle("")
        setKind("todo")
        // TODO: POST /api/trips/[tripId]/tasks
    }

    function toggle(id: string) {
        setItems((prev) => prev.map((x) => (x.id === id ? { ...x, done: !x.done } : x)))
        // TODO: PATCH /api/trips/[tripId]/tasks/:id { done }
    }

    function remove(id: string) {
        setItems((prev) => prev.filter((x) => x.id !== id))
        // TODO: DELETE /api/trips/[tripId]/tasks/:id
    }

    return (
        <section className="mx-auto w-full max-w-2xl p-4 space-y-4">
            <header>
                <h1 className="text-xl font-bold">TODO・持ち物（最小）</h1>
                <p className="text-sm text-gray-600">tripId: {tripId}</p>
            </header>

            {/* 追加フォーム */}
            <form onSubmit={addTask} className="rounded-2xl border bg-white p-3 grid gap-3">
                <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 space-y-1">
                        <label className="text-xs text-gray-600">タイトル（必須）</label>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} required
                            placeholder="例）旅程の印刷、日焼け止め" className="w-full rounded-xl border px-3 py-2 text-sm" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-600">種類</label>
                        <select value={kind} onChange={(e) => setKind(e.target.value as Task["kind"])}
                            className="w-full rounded-xl border px-3 py-2 text-sm bg-white">
                            <option value="todo">TODO</option>
                            <option value="packing">持ち物</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="rounded-2xl border px-3 py-2 text-sm shadow-sm hover:bg-gray-50">追加</button>
                </div>
            </form>

            {/* フィルタ */}
            <div className="flex gap-2">
                {(["all", "todo", "packing"] as const).map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`rounded-2xl border px-3 py-1.5 text-xs ${filter === f ? "bg-gray-50 shadow-inner" : "hover:bg-gray-50"}`}>
                        {f === "all" ? "すべて" : f === "todo" ? "TODO" : "持ち物"}
                    </button>
                ))}
            </div>

            {/* 一覧 */}
            <ul className="rounded-2xl border divide-y bg-white">
                {filtered.length === 0 ? (
                    <li className="p-4 text-sm text-gray-500">項目がありません。上のフォームから追加してください。</li>
                ) : (
                    filtered.map((t) => (
                        <li key={t.id} className="p-3 flex items-center gap-3">
                            <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)}
                                className="size-4" aria-label="完了" />
                            <div className="flex-1 min-w-0">
                                <div className={`truncate ${t.done ? "line-through text-gray-400" : ""}`}>{t.title}</div>
                                <div className="text-xs text-gray-500">{t.kind === "todo" ? "TODO" : "持ち物"}</div>
                            </div>
                            <button onClick={() => remove(t.id)} className="rounded-xl border px-2 py-1 text-xs hover:bg-red-50 hover:border-red-300">削除</button>
                        </li>
                    ))
                )}
            </ul>

            {/* API 接続ガイド（最小） */}
            <details className="text-xs text-gray-600">
                <summary className="cursor-pointer select-none">API 接続の最小ガイド</summary>
                <div className="mt-2 space-y-1">
                    <p>・初期表示：サーバーで trip の tasks を取得 → props</p>
                    <p>・追加：POST /api/trips/[tripId]/tasks</p>
                    <p>・更新：PATCH /api/trips/[tripId]/tasks/:id</p>
                    <p>・削除：DELETE /api/trips/[tripId]/tasks/:id</p>
                </div>
            </details>
        </section>
    )
}

function seedTasks(tripId: string): Task[] {
    return [
        { id: crypto.randomUUID(), tripId, title: "旅程の確認", kind: "todo", done: false, createdAt: new Date().toISOString() },
        { id: crypto.randomUUID(), tripId, title: "日焼け止め", kind: "packing", done: false, createdAt: new Date().toISOString() },
        { id: crypto.randomUUID(), tripId, title: "充電器", kind: "packing", done: true, createdAt: new Date().toISOString() },
    ]
}
