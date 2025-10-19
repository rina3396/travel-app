// app/trips/[tripId]/activities/[activityId]/page.tsx
// export default async function ActivityDetailPage({ params }: { params: { tripId: string; activityId: string } }) {
//     // TODO: アクティビティ詳細表示/編集フォーム
//     return (
//         <section className="space-y-2">
//             <h1 className="text-xl font-bold">アクティビティ詳細</h1>
//             <p className="text-sm text-gray-600">tripId: {params.tripId} / activityId: {params.activityId}</p>
//         </section>
//     )
// }

"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import type { Activity } from "@/types/trips"

/**
 * 最小構成のアクティビティ詳細/編集ページ
 * - 依存パッケージなし（Tailwindのみ）
 * - できること：表示／編集／削除（いずれもローカル状態、APIは未接続）
 *
 * 配置: app/trips/[tripId]/activities/[activityId]/page.tsx
 */

export default function ActivityDetailPage({
    params,
}: {
    params: { tripId: string; activityId: string }
}) {
    const { tripId, activityId } = params
    const [isPending, startTransition] = useTransition()
    const [editing, setEditing] = useState(false)

    // 表示用データ
    const [activity, setActivity] = useState<Activity | null>(null)

    // フォーム状態
    const [title, setTitle] = useState("")
    const [startTime, setStartTime] = useState("")
    const [endTime, setEndTime] = useState("")
    const [location, setLocation] = useState("")
    const [note, setNote] = useState("")

    // ダミー読込（API接続前の最小実装）
    useEffect(() => {
        const mock: Activity = {
            id: activityId,
            tripId,
            title: "首里城見学",
            startTime: "09:30",
            endTime: "11:00",
            location: "首里城公園",
            note: "有料エリアを中心に。雨天時は順延。",
        }
        setActivity(mock)
        // 初期値をフォームへ転記
        setTitle(mock.title)
        setStartTime(mock.startTime ?? "")
        setEndTime(mock.endTime ?? "")
        setLocation(mock.location ?? "")
        setNote(mock.note ?? "")
    }, [tripId, activityId])

    function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!activity) return

        const next: Activity = {
            ...activity,
            title: title.trim(),
            startTime: startTime || undefined,
            endTime: endTime || undefined,
            location: location.trim() || undefined,
            note: note.trim() || undefined,
        }

        setActivity(next) // 楽観的更新（ローカル）
        setEditing(false)

        // TODO: PATCH /api/trips/[tripId]/activities/[activityId]
        // startTransition(async () => {
        //   await fetch(`/api/trips/${tripId}/activities/${activityId}`, {
        //     method: "PATCH",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify(next),
        //   })
        // })
    }

    function onDelete() {
        if (!activity) return
        if (!confirm("このアクティビティを削除します。よろしいですか？")) return
        // TODO: DELETE /api/trips/[tripId]/activities/[activityId]
        // startTransition(async () => { await fetch(..., { method: "DELETE" }) })
        // ここでは画面上から消すのみ
        setActivity(null)
    }

    if (!activity) {
        return (
            <section className="mx-auto w-full max-w-2xl p-4 space-y-4">
                <header>
                    <h1 className="text-xl font-bold">アクティビティ詳細</h1>
                    <p className="text-sm text-gray-600">tripId: {tripId} / activityId: {activityId}</p>
                </header>
                <div className="rounded-2xl border p-4 bg-white text-sm text-gray-600">データがありません。</div>
                <div>
                    <Link href={`/trips/${tripId}`} className="text-sm underline">旅ダッシュボードへ戻る</Link>
                </div>
            </section>
        )
    }

    return (
        <section className="mx-auto w-full max-w-2xl p-4 space-y-4">
            <header className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-bold">アクティビティ詳細</h1>
                    <p className="text-sm text-gray-600">tripId: {tripId} / activityId: {activityId}</p>
                </div>
                <div className="flex gap-2">
                    {!editing ? (
                        <>
                            <button onClick={() => setEditing(true)} className="rounded-2xl border px-3 py-2 text-sm hover:bg-gray-50">編集</button>
                            <button onClick={onDelete} className="rounded-2xl border px-3 py-2 text-sm hover:bg-red-50 hover:border-red-300">削除</button>
                        </>
                    ) : (
                        <button onClick={() => setEditing(false)} className="rounded-2xl border px-3 py-2 text-sm hover:bg-gray-50">キャンセル</button>
                    )}
                </div>
            </header>

            {!editing ? (
                <div className="rounded-2xl border bg-white divide-y">
                    <div className="p-4">
                        <div className="text-xs text-gray-600">タイトル</div>
                        <div className="mt-1 font-medium">{activity.title}</div>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-3">
                        <div>
                            <div className="text-xs text-gray-600">開始</div>
                            <div className="mt-1">{activity.startTime || "--:--"}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-600">終了</div>
                            <div className="mt-1">{activity.endTime || "--:--"}</div>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="text-xs text-gray-600">場所</div>
                        <div className="mt-1">{activity.location || "-"}</div>
                    </div>
                    <div className="p-4">
                        <div className="text-xs text-gray-600">メモ</div>
                        <div className="mt-1 whitespace-pre-wrap text-sm">{activity.note || "-"}</div>
                    </div>
                </div>
            ) : (
                <form onSubmit={onSubmit} className="rounded-2xl border p-4 bg-white space-y-3">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-600">タイトル（必須）</label>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} required
                            className="w-full rounded-xl border px-3 py-2 text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-600">開始</label>
                            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                                className="w-full rounded-xl border px-3 py-2 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-600">終了</label>
                            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                                className="w-full rounded-xl border px-3 py-2 text-sm" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-600">場所</label>
                        <input value={location} onChange={(e) => setLocation(e.target.value)}
                            className="w-full rounded-xl border px-3 py-2 text-sm" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-600">メモ</label>
                        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4}
                            className="w-full rounded-xl border px-3 py-2 text-sm" />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setEditing(false)} className="rounded-2xl border px-3 py-2 text-sm hover:bg-gray-50">キャンセル</button>
                        <button type="submit" className="rounded-2xl border px-3 py-2 text-sm shadow-sm hover:bg-gray-50">保存</button>
                    </div>
                    {isPending && <p className="text-xs text-gray-500">保存中…</p>}
                </form>
            )}

            <div>
                <Link href={`/trips/${tripId}`} className="text-sm underline">旅ダッシュボードへ戻る</Link>
            </div>
        </section>
    )
}


