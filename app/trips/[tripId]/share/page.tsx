"use client"

import { useEffect, useMemo, useState, use as usePromise } from "react"
import { createClientBrowser } from "@/lib/supabase/client"
import type { DbMember, DbShareLink } from "@/types/trips"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Skeleton from "@/components/ui/Skeleton"


// use shared Db types
type Member = DbMember
type ShareLink = DbShareLink

// NOTE: placeholder to avoid unresolved identifier in disabled code paths
const id: string = ""

export default function TripSharePage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = usePromise(params)
  const supabase = useMemo(() => createClientBrowser(), [])

  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [link, setLink] = useState<ShareLink | null>(null)
  const [copyOk, setCopyOk] = useState<string | null>(null)

  const [newEmail, setNewEmail] = useState("")
  const [newRole, setNewRole] = useState<"viewer" | "editor">("viewer")

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
        if (lErr && (lErr as { code?: string }).code !== "PGRST116") throw new Error(lErr.message)
        setMembers(mData ?? [])
        setLink(lData ?? null)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "読み込みに失敗しました")
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

  const isValidEmail = (s: string) => /.+@.+\..+/.test(s.trim().toLowerCase())

  async function addMember(e: React.FormEvent) {
    e.preventDefault()
    const email = newEmail.trim().toLowerCase()
    if (!isValidEmail(email)) { setError("メールアドレスの形式が正しくありません"); return }
    setError(null)
    try {
      setLoading(true)
      throw new Error('管理APIが無効化されているため、メール検索は利用できません。ユーザーIDを直接指定する方式に切り替えるか、この機能を無効化してください。')
      if (members.some(m => m.user_id === id)) { setError("既に登録されています"); setLoading(false); return }
      const { error: insErr } = await supabase.from("trip_members").insert({ trip_id: tripId, user_id: id, role: newRole })
      if (insErr) throw new Error(String((insErr as { message?: string } | null)?.message ?? ""))
      const { data: mData, error: mErr } = await supabase.from("trip_members").select("user_id, role").eq("trip_id", tripId)
      if (mErr) throw new Error(String((mErr as { message?: string } | null)?.message ?? ""))
      setMembers(mData ?? [])
      setNewEmail("")
      setNewRole("viewer")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "追加に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  async function updateRole(userId: string, role: "viewer" | "editor") {
    try {
      setError(null)
      const { error: upErr } = await supabase.from("trip_members").update({ role }).eq("trip_id", tripId).eq("user_id", userId)
      if (upErr) throw new Error(upErr.message)
      setMembers(prev => prev.map(m => m.user_id === userId ? { ...m, role } : m))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "更新に失敗しました")
    }
  }

  async function removeMember(userId: string) {
    try {
      setError(null)
      const { error: delErr } = await supabase.from("trip_members").delete().eq("trip_id", tripId).eq("user_id", userId)
      if (delErr) throw new Error(delErr.message)
      setMembers(prev => prev.filter(m => m.user_id !== userId))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "削除に失敗しました")
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 p-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">共有・メンバー管理</h1>
        <p className="text-sm text-gray-600">tripId: {tripId}</p>
      </header>

      {/* 共有リンク */}
      <Card>
        <div className="mb-2 text-sm font-medium">共有リンク</div>
        {publicUrl ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="flex-1 truncate rounded border bg-gray-50 px-2 py-1 text-xs">{publicUrl}</code>
            <Button onClick={copyShareUrl} variant="outline" size="sm">コピー</Button>
          </div>
        ) : (
          <p className="text-sm text-gray-600">有効な共有リンクはありません。</p>
        )}
        {copyOk && <p className="mt-2 text-xs text-green-600">{copyOk}</p>}
        <p className="mt-2 text-xs text-gray-500">公開ページ: /share/[shareId]</p>
      </Card>

      {/* メンバーの追加 */}
      <Card>
        <form onSubmit={addMember} className="grid gap-3">
          <div className="text-sm font-medium">メンバーの追加</div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="user@example.com" className="w-full rounded-xl border px-3 py-2 text-sm" required />
            <select value={newRole} onChange={(e) => setNewRole(e.target.value as "viewer" | "editor")} className="rounded-xl border bg-white px-3 py-2 text-sm">
              <option value="viewer">viewer（閲覧）</option>
              <option value="editor">editor（編集）</option>
            </select>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>追加</Button>
            </div>
          </div>
        </form>
      </Card>

      {/* メンバー一覧 */}
      <Card>
        <div className="border-b p-3 text-sm font-medium">メンバー</div>
        {loading ? (
          <div className="p-4 text-sm text-gray-500">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="mt-2 h-4 w-1/2" />
          </div>
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
                </div>
                <div className="flex items-center gap-2">
                  <select value={m.role ?? "viewer"} onChange={(e) => updateRole(m.user_id, e.target.value as "viewer" | "editor")} className="rounded-lg border bg-white px-2 py-1 text-xs">
                    <option value="viewer">viewer</option>
                    <option value="editor">editor</option>
                  </select>
                  <Button onClick={() => removeMember(m.user_id)} variant="outline" size="sm">削除</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  )
}

