// // app/trips/[tripId]/days/[date]/page.tsx
// export default async function TripDayEditPage({ params }: { params: { tripId: string; date: string } }) {
//     // TODO: 指定日のアクティビティ一覧を表示し、並び替え/追加/削除を提供
//     return (
//         <section className="space-y-2">
//             <h1 className="text-xl font-bold">日別しおり編集</h1>
//             <p className="text-sm text-gray-600">tripId: {params.tripId} / date: {params.date}</p>
//             {/* TODO: DnD で並び替え・時間帯の入力フォームなど */}
//         </section>
//     )
// }

"use client"

import { useMemo, useState } from "react"
import type { Day } from "@/types/trips"

export default function TripDayEditPage({ params }: { params: { tripId: string; date: string } }) {
    const tripId = params.tripId
    const date = params.date

    // デモ用 Day データ
    const [day, setDay] = useState<Day>({
        id: crypto.randomUUID(),
        date,
        tripId,
        title: "1日目",
        activities: seedActivities(),
    })

    const ordered = useMemo(
        () => [...day.activities].sort((a, b) => a.order - b.order),
        [day.activities]
    )

    // --- 追加 ---
    const [title, setTitle] = useState("")
    const [startTime, setStartTime] = useState("")
    const [location, setLocation] = useState("")

    function addActivity(e: React.FormEvent) {
        e.preventDefault()
        if (!title.trim()) return
        const newActivity = {
            id: crypto.randomUUID(),
            title: title.trim(),
            startTime: startTime || undefined,
            location: location.trim() || undefined,
            order: day.activities.length,
        }
        setDay((prev) => ({
            ...prev,
            activities: [...prev.activities, newActivity],
        }))
        setTitle("")
        setStartTime("")
        setLocation("")
    }

    function removeActivity(id: string) {
        setDay((prev) => ({
            ...prev,
            activities: prev.activities
                .filter((a) => a.id !== id)
                .map((a, i) => ({ ...a, order: i })),
        }))
    }

    return (
        <section className="mx-auto w-full max-w-2xl p-4 space-y-4">
            <header>
                <h1 className="text-xl font-bold">日別しおり編集</h1>
                <p className="text-sm text-gray-600">
                    tripId: {tripId} / date: {date}
                </p>
            </header>

            {/* 追加フォーム */}
            <form onSubmit={addActivity} className="rounded-2xl border p-3 grid gap-3 bg-white">
                <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1 col-span-1">
                        <label className="text-xs text-gray-600">開始</label>
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full rounded-xl border px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="space-y-1 col-span-2">
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
                    <button
                        type="submit"
                        className="rounded-2xl border px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
                    >
                        追加
                    </button>
                </div>
            </form>

            {/* 一覧 */}
            <ul className="rounded-2xl border divide-y bg-white">
                {ordered.length === 0 ? (
                    <li className="p-4 text-sm text-gray-500">まだアクティビティがありません。</li>
                ) : (
                    ordered.map((a) => (
                        <li key={a.id} className="p-3 flex items-start gap-3">
                            <div className="w-14 text-sm text-gray-600 pt-1">{a.startTime || "--:--"}</div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{a.title}</div>
                                {a.location && (
                                    <div className="text-xs text-gray-600 truncate">{a.location}</div>
                                )}
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
        </section>
    )
}

function seedActivities() {
    return [
        { id: crypto.randomUUID(), title: "ホテル出発", startTime: "08:30", order: 0 },
        { id: crypto.randomUUID(), title: "首里城", startTime: "09:30", location: "首里城公園", order: 1 },
        { id: crypto.randomUUID(), title: "国際通りで昼食", startTime: "12:00", order: 2 },
    ]
}
