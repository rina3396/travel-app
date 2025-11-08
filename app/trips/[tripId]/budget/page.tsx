// app/trips/[tripId]/budget/page.tsx — 予算・費用ページ（クライアント）
"use client"

import { useEffect, useMemo, useState, use as usePromise } from "react"
import Link from "next/link"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Skeleton from "@/components/ui/Skeleton"
import type { Participant, Expense, DbExpense } from "@/types/trips"

export default function BudgetPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = usePromise(params)

  const [_members, _setMembers] = useState<Participant[]>([])
  const [items, setItems] = useState<Expense[]>([])
  const [_budget, _setBudget] = useState<{ amount: number; currency: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState<Expense["category"]>("meal")
  const [paidBy, setPaidBy] = useState("")

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        await fetch(`/api/trips/${encodeURIComponent(tripId)}/index`, { cache: "no-store" })
        const ms = await fetch(`/api/trips/${encodeURIComponent(tripId)}/budget/expenses`, { cache: "no-store" })
        if (!ms.ok) throw new Error(await ms.text())
        const expRows = await ms.json()
        const mem: Participant[] = []
        setItems(Array.isArray(expRows) ? (expRows as DbExpense[]).map(toExpense) : [])
        setPaidBy(mem[0]?.id ?? "")
      } catch (e: unknown) {
        if (!alive) return
        setError(e instanceof Error ? e.message : "取得に失敗しました")
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [tripId])

  const total = useMemo(() => items.reduce((s, x) => s + x.amount, 0), [items])

  async function addExpense(e: React.FormEvent) {
    e.preventDefault()
    const amt = Number(amount)
    if (!title.trim() || !Number.isFinite(amt) || amt <= 0) return
    const body = {
      date: new Date().toISOString().slice(0, 10),
      title: title.trim(),
      category,
      amount: Math.round(amt * 100) / 100,
      paidBy: paidBy || "me",
      splitWith: [],
    }
    try {
      setLoading(true)
      const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/budget/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(await res.text())
      const ref = await fetch(`/api/trips/${encodeURIComponent(tripId)}/budget/expenses`, { cache: "no-store" })
      const latest = await ref.json()
      setItems(Array.isArray(latest) ? (latest as DbExpense[]).map(toExpense) : [])
      setTitle("")
      setAmount("")
      setCategory("meal")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "追加に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 p-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">予算・費用</h1>
        <p className="text-sm text-gray-600">tripId: {tripId}</p>
      </header>

      <Card className="text-sm">
        <div className="flex items-center justify-between">
          <div className="font-medium">合計</div>
          <div className="text-lg font-semibold">\{formatJPY(total)}</div>
        </div>
      </Card>

      <Card>
        <form onSubmit={addExpense} className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-600">タイトル</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full rounded-xl border px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-600">金額（円）</label>
              <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min={0} step={100} className="w-full rounded-xl border px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-600">カテゴリ</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as Expense["category"]) } className="w-full rounded-xl border bg-white px-3 py-2 text-sm">
                <option value="meal">食事</option>
                <option value="transport">交通</option>
                <option value="lodging">宿泊</option>
                <option value="ticket">チケット/入場</option>
                <option value="other">その他</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-600">支払者</label>
              <input value={paidBy} onChange={(e) => setPaidBy(e.target.value)} placeholder="山田太郎 など" className="w-full rounded-xl border px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">追加</Button>
          </div>
        </form>
      </Card>

      {loading && (
        <Card>
          <div className="grid gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </Card>
      )}
      {error && <p className="text-xs text-rose-600">エラー: {error}</p>}

      <Card className="overflow-hidden">
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
                  <td className="px-3 py-2 align-top">{labelOfCategory(x.category ?? "other")}</td>
                  <td className="px-3 py-2 align-top text-right">\{formatJPY(x.amount)}</td>
                  <td className="px-3 py-2 align-top">{x.paidBy}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <Card className="text-sm">
        <p>
          メンバー管理や精算は <Link className="underline" href={`/trips/${encodeURIComponent(tripId)}/share`}>共有ページ</Link> で行えます。
        </p>
      </Card>
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
    paidBy: r.paid_by ?? "",
    splitWith: r.split_with ?? [],
  }
}

function labelOfCategory(cat: Expense["category"]) {
  switch (cat) {
    case "meal": return "食事"
    case "transport": return "交通"
    case "lodging": return "宿泊"
    case "ticket": return "チケット/入場"
    default: return "その他"
  }
}

function formatJPY(v: number) {
  return new Intl.NumberFormat("ja-JP").format(Math.round(v))
}

