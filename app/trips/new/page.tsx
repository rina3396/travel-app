// app/trips/new/page.tsx
// "use client"

// import { useState } from "react"
// import { useRouter } from "next/navigation"

// export default function TripNewPage() {
//     const router = useRouter()
//     const [title, setTitle] = useState("")
//     const [loading, setLoading] = useState(false)
//     const [error, setError] = useState<string | null>(null)

//     const onSubmit = async (e: React.FormEvent) => {
//         e.preventDefault()
//         if (!title.trim()) {
//             setError("タイトルを入力してください")
//             return
//         }
//         setError(null)
//         setLoading(true)
//         try {
//             const res = await fetch("/api/trips", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ title }),
//             })
//             if (!res.ok) {
//                 const m = await res.text()
//                 throw new Error(m || `HTTP ${res.status}`)
//             }
//             const { id } = await res.json()
//             router.push(`/trips/${id}`)
//         } catch (err: any) {
//             console.error(err)
//             setError(err.message ?? "作成に失敗しました")
//         } finally {
//             setLoading(false)
//         }
//     }

//     return (
//         <section className="p-4 max-w-md mx-auto">
//             <h1 className="text-lg font-semibold mb-4">旅の新規作成</h1>
//             <form onSubmit={onSubmit} className="space-y-3">
//                 <input
//                     type="text"
//                     value={title}
//                     onChange={(e) => setTitle(e.target.value)}
//                     placeholder="旅のタイトルを入力してください"
//                     className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 {error && <p className="text-sm text-red-600">{error}</p>}
//                 <button
//                     type="submit"
//                     disabled={loading || !title.trim()}
//                     className="w-full rounded-md bg-black px-4 py-2 text-white text-sm hover:bg-gray-800 disabled:opacity-60"
//                 >
//                     {loading ? "作成中…" : "作成"}
//                 </button>
//             </form>
//         </section>
//     )
// }
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
            if (!res.ok) {
                const json = await res.json().catch(() => ({}))
                throw new Error(json.error || "作成に失敗しました")
            }
            const { id } = await res.json()
            // ★ ここが超重要：作成直後に /trips/[id] へ遷移する
            router.push(`/trips/${id}`)
        } catch (err: any) {
            setError(err.message)
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
