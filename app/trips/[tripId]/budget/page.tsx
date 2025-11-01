"use client"

import { useEffect, useMemo, useState, use as usePromise } from "react"
import Link from "next/link"
import { createClientBrowser } from "@/lib/supabase/client"
import type { Participant, Expense } from "@/types/trips"

type DbExpense = {
  id: string
  trip_id: string
  date: string
  title: string
  category: Expense["category"] | null
  amount: number
  paid_by: string
  split_with: string[]
}

type BudgetRow = { amount: number; currency: string }

export default function BudgetPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = usePromise(params)
  const supabase = createClientBrowser()

  // 蜿ょ刈繝｡繝ｳ繝舌・・・rip_members 逕ｱ譚･・・  const [members, setMembers] = useState<Participant[]>([])
  // 莠育ｮ励し繝槭Μ・医え繧｣繧ｶ繝ｼ繝芽ｨｭ螳壹・蜿肴丐・・  const [budget, setBudget] = useState<BudgetRow | null>(null)
  // 雋ｻ逕ｨ荳隕ｧ
  const [items, setItems] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 霑ｽ蜉繝輔か繝ｼ繝
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState<Expense["category"]>("meal")
  const [paidBy, setPaidBy] = useState("")

  // 蛻晄悄隱ｭ縺ｿ霎ｼ縺ｿ: 繝｡繝ｳ繝舌・繝ｻ莠育ｮ励・雋ｻ逕ｨ
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const [mRes, bRes, eRes] = await Promise.all([
          supabase.from("trip_members").select("user_id").eq("trip_id", tripId),
          supabase.from("budgets").select("amount,currency").eq("trip_id", tripId).maybeSingle(),
          fetch(`/api/trips/${encodeURIComponent(tripId)}/budget/expenses`, { cache: "no-store" }),
        ])
        if (!alive) return
        if (mRes.error) throw new Error(mRes.error.message)
        if (!eRes.ok) throw new Error(await eRes.text())
        const m: Participant[] = (mRes.data ?? []).map((x: any) => ({ id: x.user_id, name: x.user_id }))
        const expRows: DbExpense[] = await eRes.json()
        setMembers(m)
        setBudget(bRes.data ? { amount: bRes.data.amount, currency: bRes.data.currency } : null)
        setItems(expRows.map(toExpense))
        setPaidBy(m[0]?.id ?? "")
      } catch (e: any) {
        if (!alive) return
        setError(e?.message ?? "隱ｭ縺ｿ霎ｼ縺ｿ縺ｫ螟ｱ謨励＠縺ｾ縺励◆")
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [supabase, tripId])

  // 蜷郁ｨ・  const total = useMemo(() => items.reduce((s, x) => s + x.amount, 0), [items])
  // 蝮・ｭ牙牡繝吶・繧ｹ縺ｮ邁｡譏捺ｮ矩ｫ・  const balances = useMemo(() => calcBalances(items, members), [items, members])

  async function addExpense(e: React.FormEvent) {
    e.preventDefault()
    const amt = Number(amount)
    if (!title.trim() || !Number.isFinite(amt) || amt <= 0 || !paidBy) return
    const allMemberIds = members.map((m) => m.id)
    const b = {
      date: new Date().toISOString().slice(0, 10),
      title: title.trim(),
      category,
      amount: Math.round(amt * 100) / 100,
      paidBy,
      splitWith: allMemberIds,
    }
    try {
      setLoading(true)
      const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/budget/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(b),
      })
      if (!res.ok) throw new Error(await res.text())
      const ref = await fetch(`/api/trips/${encodeURIComponent(tripId)}/budget/expenses`, { cache: "no-store" })
      const latest: DbExpense[] = await ref.json()
      setItems(latest.map(toExpense))
      setTitle("")
      setAmount("")
      setCategory("meal")
      setPaidBy(members[0]?.id ?? "")
    } catch (e: any) {
      setError(e?.message ?? "霑ｽ蜉縺ｫ螟ｱ謨励＠縺ｾ縺励◆")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl p-4 space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-bold">莠育ｮ励・雋ｻ逕ｨ</h1>
        <p className="text-sm text-gray-600">tripId: {tripId}</p>
      </header>

      {/* 繝｡繝ｳ繝舌・邂｡逅・・蝣ｴ謇縺ｫ縺､縺・※ */}
      <div className="rounded-2xl border bg-white p-3 text-sm">
        <p>繝｡繝ｳ繝舌・縺ｮ逋ｻ骭ｲ繝ｻ螟画峩縺ｯ縲悟・譛峨阪・繝ｼ繧ｸ縺ｧ邂｡逅・＠縺ｾ縺吶・/p>
        <p className="mt-1">
          <Link className="underline" href={`/trips/${encodeURIComponent(tripId)}/share`}>蜈ｱ譛峨・繝ｼ繧ｸ縺ｸ遘ｻ蜍・/Link>
        </p>
      </div>

      {/* 莠育ｮ励し繝槭Μ・医え繧｣繧ｶ繝ｼ繝芽ｨｭ螳壹・蜿肴丐・・*/}
      <div className="rounded-2xl border bg-white p-4 grid gap-2">
        <div className="text-sm">險ｭ螳壽ｸ医∩縺ｮ莠育ｮ・/div>
        {budget ? (
          <div className="text-lg font-semibold">{budget.amount.toLocaleString()} {budget.currency}</div>
        ) : (
          <div className="text-sm text-gray-600">莠育ｮ励・譛ｪ險ｭ螳壹〒縺呻ｼ医え繧｣繧ｶ繝ｼ繝画悴蜈･蜉幢ｼ・/div>
        )}
      </div>

      {/* 蜷郁ｨ医→谿矩ｫ倥し繝槭Μ */}
      <div className="rounded-2xl border bg-white p-4 grid gap-3">
        <div className="text-sm">蜷郁ｨ磯≡鬘・/div>
        <div className="text-2xl font-semibold">ﾂ･{formatJPY(total)}</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {members.map((m) => (
            <div key={m.id} className="rounded-xl border p-3 text-sm flex items-center justify-between">
              <span className="truncate mr-2">{m.name}</span>
              <span className={balances[m.id] >= 0 ? "text-emerald-600" : "text-rose-600"}>
                {balances[m.id] >= 0 ? "+" : ""}ﾂ･{formatJPY(Math.abs(balances[m.id]))}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600">窶ｻ 豁｣縺ｮ蛟､縺ｯ蜿励￠蜿悶ｊ縲∬ｲ縺ｮ蛟､縺ｯ謾ｯ謇輔＞縺ｮ逶ｮ螳会ｼ亥插遲牙牡繧奇ｼ峨〒縺吶・/p>
      </div>

      {/* 霑ｽ蜉繝輔か繝ｼ繝 */}
      <form onSubmit={addExpense} className="rounded-2xl border bg-white p-4 grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-gray-600">繧ｿ繧､繝医Ν・亥ｿ・茨ｼ・/label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required
              placeholder="萓具ｼ峨Λ繝ｳ繝・ className="w-full rounded-xl border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-600">驥鷹｡搾ｼ亥・・・/label>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min={0} step={100}
              placeholder="萓具ｼ・200" className="w-full rounded-xl border px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-gray-600">繧ｫ繝・ざ繝ｪ</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as Expense["category"]) }
              className="w-full rounded-xl border px-3 py-2 text-sm bg-white">
              <option value="meal">鬟滉ｺ・/option>
              <option value="transport">莠､騾・/option>
              <option value="lodging">螳ｿ豕・/option>
              <option value="ticket">蜈･蝣ｴ/菴馴ｨ・/option>
              <option value="other">縺昴・莉・/option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-600">謾ｯ謇戊・/label>
            <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm bg-white">
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="rounded-2xl bg-orange-500 px-3 py-2 text-sm text-white shadow-sm hover:bg-orange-600">霑ｽ蜉</button>
        </div>
      </form>

      {/* 雋ｻ逕ｨ荳隕ｧ */}
      <div className="rounded-2xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">譌･莉・/th>
              <th className="px-3 py-2 text-left">繧ｿ繧､繝医Ν</th>
              <th className="px-3 py-2 text-left">繧ｫ繝・ざ繝ｪ</th>
              <th className="px-3 py-2 text-right">驥鷹｡・/th>
              <th className="px-3 py-2 text-left">謾ｯ謇戊・/th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-gray-500">縺ｾ縺雋ｻ逕ｨ縺後≠繧翫∪縺帙ｓ縲・/td>
              </tr>
            ) : (
              items.map((x) => (
                <tr key={x.id} className="border-t">
                  <td className="px-3 py-2 align-top">{x.date}</td>
                  <td className="px-3 py-2 align-top">{x.title}</td>
                  <td className="px-3 py-2 align-top">{labelOfCategory(x.category)}</td>
                  <td className="px-3 py-2 align-top text-right">ﾂ･{formatJPY(x.amount)}</td>
                  <td className="px-3 py-2 align-top">{members.find((m) => m.id === x.paidBy)?.name ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  )
}

function toExpense(r: DbExpense): Expense {
  return {
    id: r.id,
    tripId: r.trip_id,
    date: r.date,
    title: r.title,
    category: (r.category ?? undefined) as Expense["category"] | undefined,
    amount: r.amount,
    paidBy: r.paid_by,
    splitWith: r.split_with ?? [],
  }
}

// --- 險育ｮ励Θ繝ｼ繝・ぅ繝ｪ繝・ぅ ---
function calcBalances(items: Expense[], members: Participant[]) {
  const ids = members.map((m) => m.id)
  const map: Record<string, number> = Object.fromEntries(ids.map((id) => [id, 0]))
  for (const x of items) {
    const participants = x.splitWith.length > 0 ? x.splitWith : ids
    const share = x.amount / (participants.length || 1)
    map[x.paidBy] = (map[x.paidBy] ?? 0) + x.amount
    for (const pid of participants) {
      map[pid] = (map[pid] ?? 0) - share
    }
  }
  return map
}

function labelOfCategory(cat: Expense["category"]) {
  switch (cat) {
    case "meal": return "鬟滉ｺ・
    case "transport": return "莠､騾・
    case "lodging": return "螳ｿ豕・
    case "ticket": return "蜈･蝣ｴ/菴馴ｨ・
    default: return "縺昴・莉・
  }
}

function formatJPY(v: number) {
  return new Intl.NumberFormat("ja-JP").format(Math.round(v))
}


