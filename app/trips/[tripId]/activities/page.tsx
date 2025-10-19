"use client"

import { useState } from "react"
import Link from "next/link"
import type { Activity } from "@/types/trips"

export default function ActivitiesPage({ params }: { params: { tripId: string } }) {
    const tripId = params.tripId

    const [items, setItems] = useState<Activity[]>(seedActivities(tripId))
    const [title, setTitle] = useState("")
    const [startTime, setStartTime] = useState("")
    const [location, setLocation] = useState("")

    function addActivity(e: React.FormEvent) {
        e.preventDefault()
        if (!title.trim()) return
        const a: Activity = {
            id: crypto.randomUUID(),
            tripId,
            title: title.trim(),
            startTime: startTime || undefined,
            endTime: undefined,
            location: location.trim() || undefined,
            note: undefined,
        }
        setItems((prev) => [a, ...prev])
        setTitle("")
        setStartTime("")
        setLocation("")
        // TODO: POST /api/trips/[tripId]/activities
    }

    function removeActivity(id: string) {
        setItems((prev) => prev.filter((x) => x.id !== id))
        // TODO: DELETE /api/trips/[tripId]/activities/:id
    }

    return (
        <section className="mx-auto w-full max-w-2xl p-4 space-y-4">
            <header className="space-y-1">
                <h1 className="text-xl font-bold">アクティビティ一覧</h1>
                <p className="text-sm text-gray-600">tripId: {tripId}</p>
            </header>

            {/* 追加フォーム（最小） */}
            <form onSubmit={addActivity} className="rounded-2xl border bg-white p-3 grid gap-3">
                <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-600">開始</label>
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full rounded-xl border px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="col-span-2 space-y-1">
                        <label className="text-xs text-gray-600">タイトル（必須）</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="例）首里城見学"
                            className="w-full rounded-xl border px-3 py-2 text-sm"
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-600">場所</label>
                    <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="例）首里城公園"
                        className="w-full rounded-xl border px-3 py-2 text-sm"
                    />
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="rounded-2xl border px-3 py-2 text-sm shadow-sm hover:bg-gray-50">
                        追加
                    </button>
                </div>
            </form>

            {/* 一覧 */}
            <ul className="rounded-2xl border divide-y bg-white">
                {items.length === 0 ? (
                    <li className="p-4 text-sm text-gray-500">まだアクティビティがありません。上のフォームから追加してください。</li>
                ) : (
                    items.map((a) => (
                        <li key={a.id} className="p-3 flex items-start gap-3">
                            <div className="w-16 text-sm text-gray-600 pt-1">{a.startTime || "--:--"}</div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{a.title}</div>
                                {a.location && <div className="text-xs text-gray-600 truncate">{a.location}</div>}
                                <div className="mt-1">
                                    <Link
                                        href={`/trips/${encodeURIComponent(tripId)}/activities/${encodeURIComponent(a.id)}`}
                                        className="text-xs underline"
                                    >
                                        詳細へ
                                    </Link>
                                </div>
                            </div>
                            <button
                                onClick={() => removeActivity(a.id)}
                                className="rounded-xl border px-2 py-1 text-xs hover:bg-red-50 hover:border-red-300"
                            >
                                削除
                            </button>
                        </li>
                    ))
                )}
            </ul>

            {/* API 接続ガイド（最小） */}
            <details className="text-xs text-gray-600">
                <summary className="cursor-pointer select-none">API 接続の最小ガイド</summary>
                <div className="mt-2 space-y-1">
                    <p>・初期表示：サーバーで trip の activities を取得 → props へ</p>
                    <p>・追加：POST /api/trips/[tripId]/activities</p>
                    <p>・削除：DELETE /api/trips/[tripId]/activities/:id</p>
                </div>
            </details>
        </section>
    )
}

function seedActivities(tripId: string): Activity[] {
    return [
        { id: crypto.randomUUID(), tripId, title: "首里城見学", startTime: "09:30", location: "首里城公園", note: undefined, endTime: "11:00" },
        { id: crypto.randomUUID(), tripId, title: "国際通りで昼食", startTime: "12:00", location: "那覇市内", note: undefined, endTime: undefined },
    ]
}
