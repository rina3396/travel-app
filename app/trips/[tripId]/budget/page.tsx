// app/trips/[tripId]/budget/page.tsx — 予算・費用ページ（クライアント）
"use client"

import { useEffect, useMemo, useState, use as usePromise } from "react"
import Link from "next/link"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Skeleton from "@/components/ui/Skeleton"
import type { Expense, DbExpense } from "@/types/trips"

type BudgetResponse = { amount?: number; currency?: string }

export default function BudgetPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = usePromise(params)

  const [items, setItems] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [budgetAmount, setBudgetAmount] = useState(0)
  const [budgetCurrency, setBudgetCurrency] = useState<"JPY">("JPY")
  const [budgetInput, setBudgetInput] = useState("")
  const [budgetCurrencyInput, setBudgetCurrencyInput] = useState<"JPY">("JPY")
  const [budgetSaving, setBudgetSaving] = useState(false)
  const [budgetMessage, setBudgetMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

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
        const [budgetRes, expensesRes] = await Promise.all([
          fetch(`/api/trips/${encodeURIComponent(tripId)}/budget`, { cache: "no-store" }),
          fetch(`/api/trips/${encodeURIComponent(tripId)}/budget/expenses`, { cache: "no-store" }),
        ])
        if (!budgetRes.ok) throw new Error(await budgetRes.text())
        if (!expensesRes.ok) throw new Error(await expensesRes.text())

        const budget = (await budgetRes.json()) as BudgetResponse
        const expRows = await expensesRes.json()
        if (!alive) return

        const amountValue = Number(budget?.amount)
        const safeAmount = Number.isFinite(amountValue) ? amountValue : 0
        const safeCurrency = "JPY"

        setBudgetAmount(safeAmount)
        setBudgetCurrency(safeCurrency)
        setBudgetInput(budget?.amount === undefined ? "" : String(safeAmount))
        setBudgetCurrencyInput(safeCurrency)
        setItems(Array.isArray(expRows) ? (expRows as DbExpense[]).map(toExpense) : [])
      } catch (e: unknown) {
        if (!alive) return
        setError(e instanceof Error ? e.message : "取得に失敗しました")
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [tripId])

  const total = useMemo(() => items.reduce((sum, x) => sum + x.amount, 0), [items])
  const remaining = useMemo(() => budgetAmount - total, [budgetAmount, total])

  async function addExpense(e: React.FormEvent) {
    e.preventDefault()
    const amt = Number(amount)
    if (!title.trim() || !Number.isFinite(amt) || amt <= 0) return
    const payer = paidBy.trim()
    const body = {
      date: new Date().toISOString().slice(0, 10),
      title: title.trim(),
      category,
      amount: Math.round(amt * 100) / 100,
      paidBy: payer,
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
      setPaidBy("")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "追加に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  async function saveBudget(e: React.FormEvent) {
    e.preventDefault()
    const amt = Number(budgetInput || "0")
    if (!Number.isFinite(amt) || amt < 0) {
      setBudgetMessage({ type: "error", text: "0以上の数値で入力してください" })
      return
    }

    try {
      setBudgetSaving(true)
      setBudgetMessage(null)
      const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/budget`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, currency: budgetCurrencyInput }),
      })
      if (!res.ok) throw new Error(await res.text())
      const latest = (await res.json()) as BudgetResponse
      const nextAmount = Number(latest?.amount)
      const safeAmount = Number.isFinite(nextAmount) ? nextAmount : 0
      const safeCurrency = "JPY"

      setBudgetAmount(safeAmount)
      setBudgetCurrency(safeCurrency)
      setBudgetInput(String(safeAmount))
      setBudgetCurrencyInput(safeCurrency)
      setBudgetMessage({ type: "success", text: "予算を保存しました" })
    } catch (e: unknown) {
      setBudgetMessage({
        type: "error",
        text: e instanceof Error ? e.message : "予算の保存に失敗しました",
      })
    } finally {
      setBudgetSaving(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 p-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">予算・費用</h1>
        <p className="text-sm text-gray-600">tripId: {tripId}</p>
      </header>

      <Card className="space-y-4 p-4 text-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <div className="text-xs text-gray-500">設定済み予算</div>
            <div className="text-xl font-semibold">{formatCurrency(budgetAmount, budgetCurrency)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">支出合計</div>
            <div className="text-xl font-semibold">¥{formatJPY(total)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">残額</div>
            <div className={`text-xl font-semibold ${remaining < 0 ? "text-rose-600" : "text-emerald-600"}`}>
              {formatCurrency(remaining, budgetCurrency)}
            </div>
          </div>
        </div>
        <form onSubmit={saveBudget} className="grid gap-3 sm:grid-cols-5">
          <label className="sm:col-span-3 space-y-1 text-xs text-gray-600">
            予算額
            <input
              type="number"
              min={0}
              step={1000}
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="例: 150000"
            />
          </label>
          <label className="space-y-1 text-xs text-gray-600">
            通貨
            <input
              value="JPY"
              disabled
              className="w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm text-gray-600"
            />
          </label>
          <div className="flex items-end justify-end">
            <Button type="submit" disabled={budgetSaving}>
              {budgetSaving ? "保存中..." : "予算を更新"}
            </Button>
          </div>
          {budgetMessage && (
            <div className="sm:col-span-5">
              <p className={`text-xs ${budgetMessage.type === "success" ? "text-emerald-600" : "text-rose-600"}`}>
                {budgetMessage.text}
              </p>
            </div>
          )}
        </form>
      </Card>

      <Card>
        <form onSubmit={addExpense} className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-600">タイトル</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-600">金額（円）</label>
              <input
                value={amount ? formatWithComma(Number(amount)) : ""}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^\d]/g, "")
                  setAmount(cleaned)
                }}
                inputMode="numeric"
                className="w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="例: 12,000"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-600">カテゴリ</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Expense["category"])}
                className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
              >
                <option value="meal">食事</option>
                <option value="transport">移動</option>
                <option value="lodging">宿泊</option>
                <option value="ticket">チケット/入場</option>
                <option value="other">その他</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-600">支払者</label>
              <input
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                placeholder="お名前を入力してください"
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
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
                <td colSpan={5} className="px-3 py-4 text-center text-gray-500">
                  まだ支出がありません。上のフォームから追加してください。
                </td>
              </tr>
            ) : (
              items.map((x) => (
                <tr key={x.id} className="border-t">
                  <td className="px-3 py-2 align-top">{x.date}</td>
                  <td className="px-3 py-2 align-top">{x.title}</td>
                  <td className="px-3 py-2 align-top">{labelOfCategory(x.category ?? "other")}</td>
                  <td className="px-3 py-2 align-top text-right">¥{formatJPY(x.amount)}</td>
                  <td className="px-3 py-2 align-top">{x.paidBy}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <Card className="text-sm">
        <p>
          メンバー管理や権限設定は{" "}
          <Link className="underline" href={`/trips/${encodeURIComponent(tripId)}/share`}>
            共有ページ
          </Link>
          から行えます。
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
    paidBy: r.paid_by_name ?? r.paid_by ?? "",
    paidByMemberId: r.paid_by ?? null,
    splitWith: r.split_with ?? [],
  }
}

function labelOfCategory(cat: Expense["category"]) {
  switch (cat) {
    case "meal":
      return "食事"
    case "transport":
      return "移動"
    case "lodging":
      return "宿泊"
    case "ticket":
      return "チケット/入場"
    default:
      return "その他"
  }
}

function formatJPY(v: number) {
  return formatWithComma(v)
}

function formatCurrency(value: number, currency: string) {
  const safeCurrency = (currency || "JPY").toUpperCase()
  const sign = value < 0 ? "-" : ""
  const body = formatWithComma(Math.abs(value))
  if (safeCurrency === "JPY") return `${sign}¥${body}`
  return `${sign}${safeCurrency} ${body}`
}

function formatWithComma(value: number) {
  return Math.round(value).toLocaleString("en-US", { useGrouping: true })
}
