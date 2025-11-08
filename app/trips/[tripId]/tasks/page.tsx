// app/trips/[tripId]/tasks/page.tsx // TODO/持ち物 管理（クライアント）
"use client"

import { useEffect, useMemo, useState, use as usePromise } from "react" // Reactフック
import type { Task } from "@/types/trips" // 型
import Button from "@/components/ui/Button" // ボタン
import Card from "@/components/ui/Card" // カード
import Chip from "@/components/ui/Chip" // チップ
import Skeleton from "@/components/ui/Skeleton" // スケルトン

type DbTaskRow = { id: string; trip_id: string; title: string; kind?: "todo" | "packing"; done?: boolean; created_at?: string } // DB行
function toTask(x: DbTaskRow): Task { // DB→表示用マッピング
  return {
    id: x.id, // ID
    tripId: x.trip_id, // 旅ID
    title: x.title, // タイトル
    kind: (x.kind ?? "todo") as Task["kind"], // 種別
    done: !!x.done, // 完了
    createdAt: x.created_at ?? new Date().toISOString(), // 作成日時
  }
}

export default function TripTasksPage({ params }: { params: Promise<{ tripId: string }> }) { // ページ
  const { tripId } = usePromise(params) // ルートパラメータ

  const [items, setItems] = useState<Task[]>([]) // 一覧
  const [loading, setLoading] = useState(true) // ローディング
  const [error, setError] = useState<string | null>(null) // エラー

  const [title, setTitle] = useState("") // 入力: タイトル
  const [kind, setKind] = useState<Task["kind"]>("todo") // 入力: 種別
  const [filter, setFilter] = useState<"all" | "todo" | "packing">("all") // フィルタ

  useEffect(() => { // 初期ロード
    let abort = false // 中断フラグ
    ;(async () => {
      try {
        setLoading(true) // 読込ON
        setError(null) // エラー消去
        const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/tasks`, { cache: "no-store" }) // 取得
        if (!res.ok) throw new Error(await res.text()) // エラー
        const data: unknown = await res.json() // JSON
        if (!abort) setItems(Array.isArray(data) ? (data as DbTaskRow[]).map(toTask) : []) // 反映
      } catch (e: unknown) {
        if (!abort) setError(e instanceof Error ? e.message : "�ǂݍ��݂Ɏ��s���܂���") // 失敗
      } finally {
        if (!abort) setLoading(false) // 読込OFF
      }
    })()
    return () => { abort = true } // クリーンアップ
  }, [tripId]) // 依存

  const filtered = useMemo(() => { // フィルタ済み
    if (filter === "all") return items // 全件
    return items.filter((t) => t.kind === filter) // 種別一致
  }, [items, filter]) // 依存

  async function addTask(e: React.FormEvent) { // 追加
    e.preventDefault() // 送信抑止
    if (!title.trim()) return // 入力必須
    try {
      setLoading(true) // 読込ON
      setError(null) // エラー消去
      const body = { title: title.trim(), kind } // ボディ
      const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/tasks`, {
        method: "POST", // 作成
        headers: { "Content-Type": "application/json" }, // JSON
        body: JSON.stringify(body), // ペイロード
      })
      if (!res.ok) throw new Error(await res.text()) // エラー
      const ref = await fetch(`/api/trips/${encodeURIComponent(tripId)}/tasks`, { cache: "no-store" }) // 再読込
      const data: unknown = await ref.json() // JSON
      setItems(Array.isArray(data) ? (data as DbTaskRow[]).map(toTask) : []) // 更新
      setTitle("") // クリア
      setKind("todo") // デフォルト
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "�ǉ��Ɏ��s���܂���") // 失敗
    } finally {
      setLoading(false) // 読込OFF
    }
  }

  async function toggle(id: string) { // 完了トグル
    const before = items // 退避
    const next = before.map((x) => (x.id === id ? { ...x, done: !x.done } : x)) // 反転
    setItems(next) // 楽観更新
    try {
      const t = next.find((x) => x.id === id) // 対象
      if (!t) return // なし
      await fetch(`/api/trips/${encodeURIComponent(tripId)}/tasks/${encodeURIComponent(id)}`, {
        method: "PATCH", // 更新
        headers: { "Content-Type": "application/json" }, // JSON
        body: JSON.stringify({ done: t.done }), // フィールド
      })
    } catch { // 失敗
      setItems(before) // 巻き戻し
    }
  }

  async function removeTask(id: string) { // 削除
    const before = items // 退避
    setItems(before.filter((x) => x.id !== id)) // 楽観削除
    try {
      await fetch(`/api/trips/${encodeURIComponent(tripId)}/tasks/${encodeURIComponent(id)}`, { method: "DELETE" }) // 削除
    } catch { // 失敗
      setItems(before) // 巻き戻し
    }
  }

  return ( // 描画
    <section className="mx-auto w-full max-w-2xl space-y-6 p-4"> {/* コンテナ */}
      <header> {/* ヘッダー */}
        <h1 className="text-2xl font-bold">TODO�E������</h1> {/* タイトル */}
        <p className="text-sm text-gray-600">tripId: {tripId}</p> {/* ID */}
      </header>

      {/* �ǉ��t�H�[�� */} {/* 追加フォーム */}
      <Card>
        <form onSubmit={addTask} className="grid gap-3"> {/* 送信で追加 */}
          <div className="grid grid-cols-3 gap-2"> {/* グリッド */}
            <div className="col-span-2 space-y-1"> {/* タイトル入力 */}
              <label className="text-xs text-gray-600">�^�C�g��</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="��j�����̈���A���Ă��~��"
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1"> {/* 種別選択 */}
              <label className="text-xs text-gray-600">���</label>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as Task["kind"]) }
                className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
              >
                <option value="todo">TODO</option>
                <option value="packing">������</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end"> {/* 送信 */}
            <Button type="submit">�ǉ�</Button>
          </div>
        </form>
      </Card>

      {/* �^�u�i�t�B���^�j */} {/* フィルタ */}
      <div className="flex gap-2">
        {(["all", "todo", "packing"] as const).map((f) => (
          <Chip key={f} selected={filter === f} onClick={() => setFilter(f)}> {/* 選択 */}
            {f === "all" ? "���ׂ�" : f === "todo" ? "TODO" : "������"}
          </Chip>
        ))}
      </div>

      {/* �ǂݍ���/�G���[ */} {/* ロード/エラー */}
      {loading && (
        <Card>
          <div className="grid gap-2"> {/* スケルトン */}
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </Card>
      )}
      {error && <p className="text-xs text-rose-600">�G���[: {error}</p>} {/* エラー */}

      {/* �ꗗ�i�J�[�h�ň͂ށj */} {/* 一覧 */}
      <Card className="p-0 overflow-hidden">
        <ul className="divide-y">
          {filtered.length === 0 ? (
            <li className="p-4 text-sm text-gray-500">�܂����ڂ�����܂���B��̃t�H�[������ǉ����Ă��������B</li> {/* 空表示 */}
          ) : (
            filtered.map((t) => (
              <li key={t.id} className="group flex items-center gap-3 p-3 transition hover:bg-orange-50"> {/* 行 */}
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggle(t.id)}
                  className="h-4 w-4 accent-orange-600"
                  aria-label="����"
                />
                <div className="min-w-0 flex-1"> {/* 本文 */}
                  <div className={`truncate ${t.done ? "line-through text-gray-400" : ""}`}>{t.title}</div> {/* タイトル */}
                  <div className="text-xs text-gray-500">{t.kind === "todo" ? "TODO" : "������"}</div> {/* 種別 */}
                </div>
                <Button onClick={() => removeTask(t.id)} variant="outline" size="sm">�폜</Button> {/* 削除 */}
              </li>
            ))
          )}
        </ul>
      </Card>
    </section>
  )
}

