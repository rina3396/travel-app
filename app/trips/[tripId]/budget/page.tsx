// app/trips/[tripId]/budget/page.tsx
// export default async function BudgetPage({ params }: { params: { tripId: string } }) {
//     // TODO: 旅の費用一覧・合計・参加者割り勘など
//     return (
//         <section className="space-y-2">
//             <h1 className="text-xl font-bold">予算・費用</h1>
//             <p className="text-sm text-gray-600">tripId: {params.tripId}</p>
//         </section>
//     )
// }

"use client"

import { useMemo, useState } from "react"
import type { Participant, Expense } from "@/types/trips"

/**
 * 最小構成の「予算・費用」ページ
 * - 依存パッケージなし（Tailwindのみ）
 * - できること：参加者の簡易表示、費用の追加/削除、合計、均等割りの残高計算
 * - データはクライアント状態のみ（APIは未接続）
 *
 * 配置: app/trips/[tripId]/budget/page.tsx
 */

export default function BudgetPage({ params }: { params: { tripId: string } }) {
    const tripId = params.tripId

    // 参加者（最小）
    const [members, setMembers] = useState<Participant[]>([
        { id: "u1", name: "Alice" },
        { id: "u2", name: "Bob" },
        { id: "u3", name: "Carol" },
    ])

    // 費用リスト
    const [items, setItems] = useState<Expense[]>(seedExpenses(tripId, members))

    // 追加フォーム
    const [title, setTitle] = useState("")
    const [amount, setAmount] = useState("")
    const [category, setCategory] = useState<Expense["category"]>("meal")
    const [paidBy, setPaidBy] = useState(members[0]?.id ?? "")

    // 合計
    const total = useMemo(() => items.reduce((s, x) => s + x.amount, 0), [items])

    // 均等割りの残高: + は受取（立替超過）、- は支払不足（他者へ支払う）
    const balances = useMemo(() => calcBalances(items, members), [items, members])

    function addExpense(e: React.FormEvent) {
        e.preventDefault()
        const amt = Number(amount)
        if (!title.trim() || !Number.isFinite(amt) || amt <= 0 || !paidBy) return

        const allMemberIds = members.map((m) => m.id)
        const exp: Expense = {
            id: crypto.randomUUID(),
            tripId,
            date: new Date().toISOString().slice(0, 10),
            title: title.trim(),
            category,
            amount: Math.round(amt * 100) / 100,
            paidBy,
            splitWith: allMemberIds, // 最小構成：常に全員で割る
        }
        setItems((prev) => [exp, ...prev])
        setTitle("")
        setAmount("")
        setCategory("meal")
        setPaidBy(members[0]?.id ?? "")
        // TODO: POST /api/trips/[tripId]/budget/expenses
    }

    function removeExpense(id: string) {
        setItems((prev) => prev.filter((x) => x.id !== id))
        // TODO: DELETE /api/trips/[tripId]/budget/expenses/:id
    }

    return (
        <section className="mx-auto w-full max-w-3xl p-4 space-y-4">
            <header>
                <h1 className="text-xl font-bold">予算・費用（最小）</h1>
                <p className="text-sm text-gray-600">tripId: {tripId}</p>
            </header>

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
                <p className="text-xs text-gray-600">※ 正の値は受け取り、負の値は支払いが必要な目安（均等割り）</p>
            </div>

            {/* 追加フォーム（最小） */}
            <form onSubmit={addExpense} className="rounded-2xl border bg-white p-4 grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-600">タイトル（必須）</label>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} required
                            placeholder="例）ランチ" className="w-full rounded-xl border px-3 py-2 text-sm" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-600">金額（必須）</label>
                        <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal"
                            placeholder="2000" className="w-full rounded-xl border px-3 py-2 text-sm" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-600">カテゴリ</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value as Expense["category"])}
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
                            <th className="px-3 py-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-3 py-4 text-center text-gray-500">まだ費用がありません。</td>
                            </tr>
                        ) : (
                            items.map((x) => (
                                <tr key={x.id} className="border-t">
                                    <td className="px-3 py-2 align-top">{x.date}</td>
                                    <td className="px-3 py-2 align-top">{x.title}</td>
                                    <td className="px-3 py-2 align-top">{labelOfCategory(x.category)}</td>
                                    <td className="px-3 py-2 align-top text-right">¥{formatJPY(x.amount)}</td>
                                    <td className="px-3 py-2 align-top">{members.find((m) => m.id === x.paidBy)?.name ?? "-"}</td>
                                    <td className="px-3 py-2 align-top text-right">
                                        <button onClick={() => removeExpense(x.id)} className="rounded-xl border px-2 py-1 text-xs hover:bg-red-50 hover:border-red-300">削除</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* API 接続ガイド（最小） */}
            <details className="text-xs text-gray-600">
                <summary className="cursor-pointer select-none">API 接続の最小ガイド</summary>
                <div className="mt-2 space-y-1">
                    <p>・初期表示：サーバーで参加者/費用を取得 → props へ</p>
                    <p>・追加：POST /api/trips/[tripId]/budget/expenses</p>
                    <p>・削除：DELETE /api/trips/[tripId]/budget/expenses/:id</p>
                </div>
            </details>
        </section>
    )
}

// --- 計算・ユーティリティ ---
function calcBalances(items: Expense[], members: Participant[]) {
    const ids = members.map((m) => m.id)
    const map: Record<string, number> = Object.fromEntries(ids.map((id) => [id, 0]))

    for (const x of items) {
        const participants = x.splitWith.length > 0 ? x.splitWith : ids
        const share = x.amount / participants.length

        // 支払者が立て替えた金額をプラス
        map[x.paidBy] = (map[x.paidBy] ?? 0) + x.amount

        // 各参加者は自分の取り分をマイナス
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

function seedExpenses(tripId: string, members: Participant[]): Expense[] {
    if (members.length === 0) return []
    const ids = members.map((m) => m.id)
    return [
        { id: crypto.randomUUID(), tripId, date: today(), title: "朝食", category: "meal", amount: 1800, paidBy: ids[0], splitWith: ids },
        { id: crypto.randomUUID(), tripId, date: today(), title: "ゆいレール", category: "transport", amount: 840, paidBy: ids[1], splitWith: ids },
        { id: crypto.randomUUID(), tripId, date: today(), title: "首里城入場", category: "ticket", amount: 2400, paidBy: ids[2], splitWith: ids },
    ]
}

function today() { return new Date().toISOString().slice(0, 10) }
    