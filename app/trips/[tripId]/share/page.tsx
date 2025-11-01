"use client"

import { useEffect, useMemo, useState } from "react"
import { createClientBrowser } from "@/lib/supabase/client"

type Member = { user_id: string; role: string | null }
type ShareLink = { id: string; is_enabled: boolean; expires_at: string | null }

export default function TripSharePage({ params }: { params: { tripId: string } }) {
  const tripId = params.tripId
  const supabase = useMemo(() => createClientBrowser(), [])

  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [link, setLink] = useState<ShareLink | null>(null)
  const [copyOk, setCopyOk] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const [{ data: mData, error: mErr }, { data: lData, error: lErr }] = await Promise.all([
          supabase.from("trip_members").select("user_id, role").eq("trip_id", tripId),
          supabase
            .from("share_links")
            .select("id, is_enabled, expires_at")
            .eq("trip_id", tripId)
            .eq("is_enabled", true)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ])
        if (!alive) return
        if (mErr) throw new Error(mErr.message)
        if (lErr && lErr.code !== "PGRST116") throw new Error(lErr.message)
        setMembers(mData ?? [])
        setLink(lData ?? null)
      } catch (e: any) {
        setError(e?.message ?? "読み込みに失敗しました")
      } finally {
        setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [supabase, tripId])

  const publicUrl = link ? `${typeof window !== 'undefined' ? location.origin : ''}/share/${link.id}` : null

  async function copyShareUrl() {
    if (!publicUrl) return
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopyOk("リンクをコピーしました")
      setTimeout(() => setCopyOk(null), 1500)
    } catch {
      setCopyOk("コピーに失敗しました")
      setTimeout(() => setCopyOk(null), 1500)
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-5 p-4">
      <header className="space-y-1">
        <h1 className="text-xl font-bold">共有メンバー</h1>
        <p className="text-sm text-gray-600">tripId: {tripId}</p>
      </header>

      {/* 共有リンク */}
      <div className="rounded-2xl border bg-white p-4">
        <div className="mb-2 text-sm font-medium">共有リンク</div>
        {publicUrl ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="flex-1 truncate rounded border bg-gray-50 px-2 py-1 text-xs">{publicUrl}</code>
            <button onClick={copyShareUrl} className="rounded border px-3 py-1 text-sm hover:bg-gray-50">
              コピー
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-600">有効な共有リンクはありません。</p>
        )}
        {copyOk && <p className="mt-2 text-xs text-green-600">{copyOk}</p>}
        <p className="mt-2 text-xs text-gray-500">公開ページ: /share/[shareId]</p>
      </div>

      {/* メンバー一覧 */}
      <div className="rounded-2xl border bg-white">
        <div className="border-b p-3 text-sm font-medium">メンバー</div>
        {loading ? (
          <div className="p-4 text-sm text-gray-500">読み込み中…</div>
        ) : error ? (
          <div className="p-4 text-sm text-red-600">{error}</div>
        ) : members.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">メンバーが登録されていません。</div>
        ) : (
          <ul className="divide-y">
            {members.map((m) => (
              <li key={m.user_id} className="flex items-center justify-between p-3 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-medium">{m.user_id}</div>
                  {m.role && <div className="text-xs text-gray-600">{m.role}</div>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

