"use client"

import { useEffect, useMemo, useState, use as usePromise } from "react"
import { createClientBrowser } from "@/lib/supabase/client"

type Member = { user_id: string; role: string | null }
type ShareLink = { id: string; is_enabled: boolean; expires_at: string | null }

export default function TripSharePage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = usePromise(params)
  const supabase = useMemo(() => createClientBrowser(), [])

  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [link, setLink] = useState<ShareLink | null>(null)
  const [copyOk, setCopyOk] = useState<string | null>(null)

  // 霑ｽ蜉繝輔か繝ｼ繝・医Γ繝ｼ繝ｫ蜈･蜉帚・UUID隗｣豎ｺ竊堤匳骭ｲ・・  const [newEmail, setNewEmail] = useState("")
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
        if (lErr && (lErr as any).code !== "PGRST116") throw new Error(lErr.message)
        setMembers(mData ?? [])
        setLink(lData ?? null)
      } catch (e: any) {
        setError(e?.message ?? "隱ｭ縺ｿ霎ｼ縺ｿ縺ｫ螟ｱ謨励＠縺ｾ縺励◆")
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
      setCopyOk("繝ｪ繝ｳ繧ｯ繧偵さ繝斐・縺励∪縺励◆")
      setTimeout(() => setCopyOk(null), 1500)
    } catch {
      setCopyOk("繧ｳ繝斐・縺ｫ螟ｱ謨励＠縺ｾ縺励◆")
      setTimeout(() => setCopyOk(null), 1500)
    }
  }

  const isValidEmail = (s: string) => /.+@.+\..+/.test(s.trim().toLowerCase())

  async function addMember(e: React.FormEvent) {
    e.preventDefault()
    const email = newEmail.trim().toLowerCase()
    if (!isValidEmail(email)) { setError("繝｡繝ｼ繝ｫ繧｢繝峨Ξ繧ｹ縺ｮ蠖｢蠑上′豁｣縺励￥縺ゅｊ縺ｾ縺帙ｓ"); return }
    setError(null)
    try {
      setLoading(true)
      // email 縺九ｉ UUID 繧定ｧ｣豎ｺ・医し繝ｼ繝舌・蛛ｴ: service role 菴ｿ逕ｨ・・      const lu = await fetch('/api/admin/users/lookup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      if (!lu.ok) throw new Error(await lu.text())
      const { id } = await lu.json()
      if (members.some(m => m.user_id === id)) { setError("譌｢縺ｫ逋ｻ骭ｲ縺輔ｌ縺ｦ縺・∪縺・); return }
      const { error: insErr } = await supabase.from("trip_members").insert({ trip_id: tripId, user_id: id, role: newRole })
      if (insErr) throw new Error(insErr.message)
      const { data: mData, error: mErr } = await supabase.from("trip_members").select("user_id, role").eq("trip_id", tripId)
      if (mErr) throw new Error(mErr.message)
      setMembers(mData ?? [])
      setNewEmail("")
      setNewRole("viewer")
    } catch (e: any) {
      setError(e?.message ?? "霑ｽ蜉縺ｫ螟ｱ謨励＠縺ｾ縺励◆")
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
    } catch (e: any) {
      setError(e?.message ?? "譖ｴ譁ｰ縺ｫ螟ｱ謨励＠縺ｾ縺励◆")
    }
  }

  async function removeMember(userId: string) {
    try {
      setError(null)
      const { error: delErr } = await supabase.from("trip_members").delete().eq("trip_id", tripId).eq("user_id", userId)
      if (delErr) throw new Error(delErr.message)
      setMembers(prev => prev.filter(m => m.user_id !== userId))
    } catch (e: any) {
      setError(e?.message ?? "蜑企勁縺ｫ螟ｱ謨励＠縺ｾ縺励◆")
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-5 p-4">
      <header className="space-y-1">
        <h1 className="text-xl font-bold">蜈ｱ譛峨・繝｡繝ｳ繝舌・邂｡逅・/h1>
        <p className="text-sm text-gray-600">tripId: {tripId}</p>
      </header>

      {/* 蜈ｱ譛峨Μ繝ｳ繧ｯ */}
      <div className="rounded-2xl border bg-white p-4">
        <div className="mb-2 text-sm font-medium">蜈ｱ譛峨Μ繝ｳ繧ｯ</div>
        {publicUrl ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="flex-1 truncate rounded border bg-gray-50 px-2 py-1 text-xs">{publicUrl}</code>
            <button onClick={copyShareUrl} className="rounded border border-orange-500 px-3 py-1 text-sm text-orange-700 hover:bg-orange-50">繧ｳ繝斐・</button>
          </div>
        ) : (
          <p className="text-sm text-gray-600">譛牙柑縺ｪ蜈ｱ譛峨Μ繝ｳ繧ｯ縺ｯ縺ゅｊ縺ｾ縺帙ｓ縲・/p>
        )}
        {copyOk && <p className="mt-2 text-xs text-green-600">{copyOk}</p>}
        <p className="mt-2 text-xs text-gray-500">蜈ｬ髢九・繝ｼ繧ｸ: /share/[shareId]</p>
      </div>

      {/* 繝｡繝ｳ繝舌・縺ｮ霑ｽ蜉 */}
      <form onSubmit={addMember} className="rounded-2xl border bg-white p-4 grid gap-3">
        <div className="text-sm font-medium">繝｡繝ｳ繝舌・縺ｮ霑ｽ蜉</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="user@example.com" className="w-full rounded-xl border px-3 py-2 text-sm" required />
          <select value={newRole} onChange={(e) => setNewRole(e.target.value as any)} className="rounded-xl border px-3 py-2 text-sm bg-white">
            <option value="viewer">viewer・磯夢隕ｧ・・/option>
            <option value="editor">editor・育ｷｨ髮・ｼ・/option>
          </select>
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="rounded-xl bg-orange-500 px-3 py-2 text-sm text-white shadow-sm hover:bg-orange-600 disabled:opacity-60">霑ｽ蜉</button>
          </div>
        </div>
      </form>

      {/* 繝｡繝ｳ繝舌・荳隕ｧ縺ｨ螟画峩 */}
      <div className="rounded-2xl border bg-white">
        <div className="border-b p-3 text-sm font-medium">繝｡繝ｳ繝舌・</div>
        {loading ? (
          <div className="p-4 text-sm text-gray-500">隱ｭ縺ｿ霎ｼ縺ｿ荳ｭ窶ｦ</div>
        ) : error ? (
          <div className="p-4 text-sm text-red-600">{error}</div>
        ) : members.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">繝｡繝ｳ繝舌・縺檎匳骭ｲ縺輔ｌ縺ｦ縺・∪縺帙ｓ縲・/div>
        ) : (
          <ul className="divide-y">
            {members.map((m) => (
              <li key={m.user_id} className="flex items-center justify-between p-3 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-medium">{m.user_id}</div>
                </div>
                <div className="flex items-center gap-2">
                  <select value={m.role ?? "viewer"} onChange={(e) => updateRole(m.user_id, e.target.value as any)} className="rounded-lg border px-2 py-1 text-xs bg-white">
                    <option value="viewer">viewer</option>
                    <option value="editor">editor</option>
                  </select>
                  <button onClick={() => removeMember(m.user_id)} className="rounded-lg border px-2 py-1 text-xs hover:bg-red-50 hover:border-red-300">蜑企勁</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  )
}


