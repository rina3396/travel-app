// app/trips/[tripId]/budget/page.tsx // 予算・支出ページ（クライアント）
"use client" // クライアントコンポーネント

import { useEffect, useMemo, useState, use as usePromise } from "react" // Reactフック
import Link from "next/link" // リンク
import Button from "@/components/ui/Button" // ボタン
import Card from "@/components/ui/Card" // カード
import Skeleton from "@/components/ui/Skeleton" // スケルトン
import type { Participant, Expense, DbExpense } from "@/types/trips" // 型

export default function BudgetPage({ params }: { params: Promise<{ tripId: string }> }) { // ページ本体
  const { tripId } = usePromise(params) // ルートパラメータ

  const [_members, _setMembers] = useState<Participant[]>([]) // 参加者（簡易版では未使用）
  const [items, setItems] = useState<Expense[]>([]) // 支出一覧
  const [_budget, _setBudget] = useState<{ amount: number; currency: string } | null>(null) // 予算
  const [loading, setLoading] = useState(true) // ローディング
  const [error, setError] = useState<string | null>(null) // エラー

  const [title, setTitle] = useState("") // 入力: タイトル
  const [amount, setAmount] = useState("") // 入力: 金額
  const [category, setCategory] = useState<Expense["category"]>("meal") // 入力: カテゴリ
  const [paidBy, setPaidBy] = useState("") // 入力: 支払者

  useEffect(() => { // 初期ロード
    let alive = true // 生存フラグ
    ;(async () => { // 即時非同期
      try {
        setLoading(true) // 読込ON
        setError(null) // エラー消去
        const _mRes = await fetch(`/api/trips/${encodeURIComponent(tripId)}/index`, { cache: "no-store" }) // 旅行基本情報
        // 本簡易実装ではmembersの詳細解決はスキップし、支出テーブルのみ取得
        const ms = await fetch(`/api/trips/${encodeURIComponent(tripId)}/budget/expenses`, { cache: "no-store" }) // 支出一覧
        if (!ms.ok) throw new Error(await ms.text()) // エラー
        const expRows = await ms.json() // JSON
        const mem: Participant[] = [] // 参加者（未設定）
        setItems(Array.isArray(expRows) ? (expRows as DbExpense[]).map(toExpense) : []) // 一覧反映
        setPaidBy(mem[0]?.id ?? "") // 既定の支払者
      } catch (e: unknown) { // エラー
        if (!alive) return // 中断
        setError(e instanceof Error ? e.message : "�ǂݍ��݂Ɏ��s���܂���") // メッセージ
      } finally {
        if (alive) setLoading(false) // 読込OFF
      }
    })()
    return () => { alive = false } // クリーンアップ
  }, [tripId]) // 依存

  const total = useMemo(() => items.reduce((s, x) => s + x.amount, 0), [items]) // 合計金額

  async function addExpense(e: React.FormEvent) { // 支出追加
    e.preventDefault() // 送信抑止
    const amt = Number(amount) // 数値化
    if (!title.trim() || !Number.isFinite(amt) || amt <= 0) return // 入力検証
    const body = { // レコード
      date: new Date().toISOString().slice(0, 10), // 今日の日付
      title: title.trim(), // タイトル
      category, // カテゴリ
      amount: Math.round(amt * 100) / 100, // 小数桁丸め
      paidBy: paidBy || "me", // 支払者
      splitWith: [], // 按分先（未使用）
    }
    try {
      setLoading(true) // 読込ON
      const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/budget/expenses`, { // 作成API
        method: "POST", // POST
        headers: { "Content-Type": "application/json" }, // JSON
        body: JSON.stringify(body), // ペイロード
      })
      if (!res.ok) throw new Error(await res.text()) // エラー
      const ref = await fetch(`/api/trips/${encodeURIComponent(tripId)}/budget/expenses`, { cache: "no-store" }) // 再取得
      const latest = await ref.json() // JSON
      setItems(Array.isArray(latest) ? (latest as DbExpense[]).map(toExpense) : []) // 一覧更新
      setTitle("") // クリア
      setAmount("") // クリア
      setCategory("meal") // 既定カテゴリに戻す
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "�ǉ��Ɏ��s���܂���") // 失敗
    } finally {
      setLoading(false) // 読込OFF
    }
  }

  return ( // 描画
    <section className="mx-auto w-full max-w-3xl space-y-6 p-4"> {/* コンテナ */}
      <header className="space-y-1"> {/* ヘッダー */}
        <h1 className="text-2xl font-bold">�\�Z�E��p</h1> {/* タイトル */}
        <p className="text-sm text-gray-600">tripId: {tripId}</p> {/* ID */}
      </header>

      <Card className="text-sm"> {/* 合計カード */}
        <div className="flex items-center justify-between"> {/* 行 */}
          <div className="font-medium">���v</div> {/* 合計 */}
          <div className="text-lg font-semibold">\{formatJPY(total)}</div> {/* 金額 */}
        </div>
      </Card>

      <Card> {/* 追加フォーム */}
        <form onSubmit={addExpense} className="grid gap-3"> {/* 送信で追加 */}
          <div className="grid grid-cols-2 gap-3"> {/* 上段 */}
            <div className="space-y-1"> {/* タイトル */}
              <label className="text-xs text-gray-600">�^�C�g��</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full rounded-xl border px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1"> {/* 金額 */}
              <label className="text-xs text-gray-600">���z�i�~�j</label>
              <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min={0} step={100} className="w-full rounded-xl border px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3"> {/* 下段 */}
            <div className="space-y-1"> {/* カテゴリ */}
              <label className="text-xs text-gray-600">�J�e�S��</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as Expense["category"]) } className="w-full rounded-xl border bg-white px-3 py-2 text-sm">
                <option value="meal">�H��</option>
                <option value="transport">���</option>
                <option value="lodging">�h��</option>
                <option value="ticket">����/�̌�</option>
                <option value="other">���̑�</option>
              </select>
            </div>
            <div className="space-y-1"> {/* 支払者 */}
              <label className="text-xs text-gray-600">�x����</label>
              <input value={paidBy} onChange={(e) => setPaidBy(e.target.value)} placeholder="���Ȃ��̖��O�Ȃ�" className="w-full rounded-xl border px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex justify-end"> {/* 送信 */}
            <Button type="submit">�ǉ�</Button>
          </div>
        </form>
      </Card>

      {loading && ( // ロード中表示
        <Card>
          <div className="grid gap-2"> {/* スケルトン */}
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </Card>
      )}
      {error && <p className="text-xs text-rose-600">�G���[: {error}</p>} {/* エラー表示 */}

      <Card className="overflow-hidden"> {/* 一覧テーブル */}
        <table className="w-full text-sm"> {/* テーブル */}
          <thead className="bg-gray-50 text-gray-600"> {/* ヘッダー */}
            <tr>
              <th className="px-3 py-2 text-left">���t</th>
              <th className="px-3 py-2 text-left">�^�C�g��</th>
              <th className="px-3 py-2 text-left">�J�e�S��</th>
              <th className="px-3 py-2 text-right">���z</th>
              <th className="px-3 py-2 text-left">�x����</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? ( // 空時
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-gray-500">�܂���p������܂���B</td>
              </tr>
            ) : (
              items.map((x) => ( // 明細行
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

      <Card className="text-sm"> {/* 注意書き */}
        <p>
          �����o�[�̓o�^�E�ύX�� <Link className="underline" href={`/trips/${encodeURIComponent(tripId)}/share`}>���L�y�[�W</Link> �ōs���܂��B
        </p>
      </Card>
    </section>
  )
}

function toExpense(r: DbExpense): Expense { // DB→表示用に変換
  return {
    id: r.id, // ID
    tripId: r.trip_id, // 旅ID
    date: r.date, // 日付
    title: r.title, // タイトル
    category: (r.category ?? undefined) as Expense["category"] | undefined, // カテゴリ
    amount: r.amount, // 金額
    paidBy: r.paid_by ?? "", // 支払者
    splitWith: r.split_with ?? [], // 按分先
  }
}

function labelOfCategory(cat: Expense["category"]) { // カテゴリ名
  switch (cat) {
    case "meal": return "�H��"
    case "transport": return "���"
    case "lodging": return "�h��"
    case "ticket": return "����/�̌�"
    default: return "���̑�"
  }
}

function formatJPY(v: number) { // 円フォーマット
  return new Intl.NumberFormat("ja-JP").format(Math.round(v)) // 3桁区切り
}

