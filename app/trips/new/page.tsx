// app/trips/new/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function TripNewPage() {
    const router = useRouter()
    const [title, setTitle] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const res = await fetch("/api/trips", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title }),
            })

            // ✅ サーバーが成功なら、そのIDで遷移
            if (res.ok) {
                const { id } = await res.json()
                router.push(`/trips/${encodeURIComponent(id)}`)
                return
            }

            // ✅ 401 などAPI失敗時：ローカル“仮トリップ”で即遷移（未ログインでも進める）
            const tempId = makeTempTripId()
            saveLocalTrip(tempId, { id: tempId, title, createdAt: new Date().toISOString() })
            router.push(`/trips/${encodeURIComponent(tempId)}?guest=1`)
        } catch (err: any) {
            // ✅ 通信例外でも同様にフォールバック
            const tempId = makeTempTripId()
            saveLocalTrip(tempId, { id: tempId, title, createdAt: new Date().toISOString() })
            router.push(`/trips/${encodeURIComponent(tempId)}?guest=1`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="p-4 max-w-md mx-auto space-y-4">
            <h1 className="text-lg font-semibold">旅の新規作成</h1>
            <form onSubmit={onSubmit} className="space-y-3">
                <input
                    type="text"
                    placeholder="旅のタイトル"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
                >
                    {loading ? "作成中…" : "作成する"}
                </button>
                {error && <p className="text-sm text-red-600">{error}</p>}
            </form>
        </section>
    )
}

function makeTempTripId() {
    // 例: guest-maz3k-3b0b1b2e-...
    return `guest-${Date.now().toString(36)}-${crypto.randomUUID()}`
}

function saveLocalTrip(id: string, data: any) {
    try {
        const key = `trip:local:${id}`
        localStorage.setItem(key, JSON.stringify(data))
        // ついでに最近作成したリストも持っておく（任意）
        const listKey = "trip:local:index"
        const list = JSON.parse(localStorage.getItem(listKey) || "[]")
        localStorage.setItem(listKey, JSON.stringify([id, ...list.filter((x: string) => x !== id)]))
    } catch { }
}
