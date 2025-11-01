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

  // 参加メンバー（trip_members 由来）
  const [members, setMembers] = useState<Participant[]>([])
  // 予算サマリ（ウィザード設定の反映）
  const [budget, setBudget] = useState<BudgetRow | null>(null)
  // 費用一覧
  const [items, setItems] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 追加フォーム
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState<Expense["category"]>("meal")
  const [paidBy, setPaidBy] = useState("")

  // 初期読み込み: メンバー・予算・費用
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
        setError(e?.message ?? "読み込みに失敗しました")
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [supabase, tripId])

  // 合計
  const total = useMemo(() => items.reduce((s, x) => s + x.amount, 0), [items])
  // 均等割ベースの簡易残高
  const balances = useMemo(() => calcBalances(items, members), [items, members])

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
      setError(e?.message ?? "追加に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl p-4 space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-bold">予算・費用</h1>
        <p className="text-sm text-gray-600">tripId: {tripId}</p>
      </header>

      {/* メンバー管理の場所について */}
      <div className="rounded-2xl border bg-white p-3 text-sm">
        <p>メンバーの登録・変更は「共有」ページで管理します。</p>
        <p className="mt-1">
          <Link className="underline" href={`/trips/${encodeURIComponent(tripId)}/share`}>共有ページへ移動</Link>
        </p>
      </div>

      {/* 予算サマリ（ウィザード設定の反映） */}
      <div className="rounded-2xl border bg-white p-4 grid gap-2">
        <div className="text-sm">設定済みの予算</div>
        {budget ? (
          <div className="text-lg font-semibold">{budget.amount.toLocaleString()} {budget.currency}</div>
        ) : (
          <div className="text-sm text-gray-600">予算は未設定です（ウィザード未入力）</div>
        )}
      </div>

      {/* 合計と残高サマリ */}
      <div className="rounded-2xl border bg-white p-4 grid gap-3">
        <div className="text-sm">合計金額</div>
        <div className="text-2xl font-semibold">¥{formatJPY(total)}</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {members.map((m) => (
            <div key={m.id} className="rounded-xl border p-3 text-sm flex items-center justify-between">
              <span className="truncate mr-2">{m.name}</span>
              <span className={balances[m.id] >= 0 ? "text-emerald-600" : "text-rose-600"}>
                {balances[m.id] >= 0 ? "+" : ""}¥{formatJPY(Math.abs(balances[m.id]))}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600">※ 正の値は受け取り、負の値は支払いの目安（均等割り）です。</p>
      </div>

      {/* 追加フォーム */}
      <form onSubmit={addExpense} className="rounded-2xl border bg-white p-4 grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-gray-600">タイトル（必須）</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required
              placeholder="例）ランチ" className="w-full rounded-xl border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-600">金額（円）</label>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min={0} step={100}
              placeholder="例）1200" className="w-full rounded-xl border px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-gray-600">カテゴリ</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as Expense["category"]) }
              className="w-full rounded-xl border px-3 py-2 text-sm bg-white">
              <option value="meal">食事</option>
              <option value="transport">交通</option>
              <option value="lodging">宿泊</option>
              <option value="ticket">入場/体験</option>
              <option value="other">その他</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-600">支払者</label>
            <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm bg-white">
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="rounded-2xl border px-3 py-2 text-sm shadow-sm hover:bg-gray-50">追加</button>
        </div>
      </form>

      {/* 費用一覧 */}
      <div className="rounded-2xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">日付</th>
              <th className="px-3 py-2 text-left">タイトル</th>
              <th className="px-3 py-2 text-left">カテゴリ</th>
              <th className="px-3 py-2 text-right">金額</th>
              <th className="px-3 py-2 text-left">支払者</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-gray-500">まだ費用がありません。</td>
              </tr>
            ) : (
              items.map((x) => (
                <tr key={x.id} className="border-t">
                  <td className="px-3 py-2 align-top">{x.date}</td>
                  <td className="px-3 py-2 align-top">{x.title}</td>
                  <td className="px-3 py-2 align-top">{labelOfCategory(x.category)}</td>
                  <td className="px-3 py-2 align-top text-right">¥{formatJPY(x.amount)}</td>
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

// --- 計算ユーティリティ ---
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
    case "meal": return "食事"
    case "transport": return "交通"
    case "lodging": return "宿泊"
    case "ticket": return "入場/体験"
    default: return "その他"
  }
}

function formatJPY(v: number) {
  return new Intl.NumberFormat("ja-JP").format(Math.round(v))
}

