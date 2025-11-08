// app/trips/[tripId]/settings/page.tsx // 設定ページ（クライアント）
"use client" // クライアントコンポーネント指定

import { useEffect, useMemo, useState, use as usePromise } from "react" // Reactフック
import { createClientBrowser } from "@/lib/supabase/client" // ブラウザ用Supabase
import Button from "@/components/ui/Button" // ボタン
import Card from "@/components/ui/Card" // カード
import Skeleton from "@/components/ui/Skeleton" // スケルトン

export default function TripSettingsPage({ params }: { params: Promise<{ tripId: string }> }) { // 設定ページ本体
  const { tripId } = usePromise(params) // ルートパラメータからtripId取得
  const supabase = useMemo(() => createClientBrowser(), []) // Supabaseクライアントをメモ化

  const [title, setTitle] = useState("") // タイトル
  const [start, setStart] = useState("") // 開始日
  const [end, setEnd] = useState("") // 終了日
  const [loading, setLoading] = useState(true) // 読込中
  const [saving, setSaving] = useState(false) // 保存中
  const [message, setMessage] = useState<string | null>(null) // メッセージ

  useEffect(() => { // 初期ロード
    let alive = true // 生存フラグ
    ;(async () => { // 即時非同期
      setLoading(true) // 読込ON
      setMessage(null) // メッセージ消去
      const { data, error } = await supabase // データ取得
        .from("trips") // テーブル
        .select("id, title, start_date, end_date") // 必要カラム
        .eq("id", tripId) // 絞り込み
        .maybeSingle() // 0/1件
      if (!alive) return // 中断時は戻る
      if (error) { // エラーがあれば
        setMessage(error.message) // メッセージ表示
      } else if (data) { // 正常取得
        setTitle(data.title ?? "") // タイトル設定
        setStart(data.start_date ?? "") // 開始日設定
        setEnd(data.end_date ?? "") // 終了日設定
      }
      setLoading(false) // 読込OFF
    })()
    return () => { alive = false } // クリーンアップ
  }, [supabase, tripId]) // 依存

  async function save() { // 保存処理
    if (!title.trim()) { setMessage("�^�C�g������͂��Ă�������"); return } // 必須チェック
    setSaving(true) // 保存中ON
    setMessage(null) // メッセージ消去
    const { error } = await supabase // 更新クエリ
      .from("trips") // テーブル
      .update({ title: title.trim(), start_date: start || null, end_date: end || null }) // 更新値
      .eq("id", tripId) // 対象
    setSaving(false) // 保存中OFF
    setMessage(error ? `�ۑ��Ɏ��s���܂���: ${error.message}` : "�ۑ����܂���") // 結果メッセージ
  }

  return ( // 描画
    <section className="mx-auto w-full max-w-2xl space-y-6 p-4"> {/* コンテナ */}
      <header className="space-y-1"> {/* ヘッダー */}
        <h1 className="text-2xl font-bold">���̐ݒ�</h1> {/* タイトル */}
        <p className="text-sm text-gray-600">tripId: {tripId}</p> {/* ID表示 */}
      </header>

      {loading ? ( // ローディング表示
        <Card> {/* スケルトン */}
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </Card>
      ) : ( // 本文
        <>
          <Card> {/* 基本情報フォーム */}
            <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); save() }}> {/* 送信で保存 */}
              <label className="grid gap-1 text-sm"> {/* タイトル */}
                <span className="text-gray-600">�^�C�g��</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl border px-3 py-2" />
              </label>
              <div className="grid grid-cols-2 gap-3"> {/* 期間 */}
                <label className="grid gap-1 text-sm">
                  <span className="text-gray-600">�J�n��</span>
                  <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-xl border px-3 py-2" />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="text-gray-600">�I����</span>
                  <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-xl border px-3 py-2" />
                </label>
              </div>
              <div className="flex items-center gap-2"> {/* 操作 */}
                <Button type="submit" disabled={saving}>{saving ? "�ۑ����c" : "�ۑ�"}</Button>
                {message && <span className="text-xs text-gray-600">{message}</span>}
              </div>
            </form>
          </Card>

          <Card title="�댯�ȑ���" description="���̂�����S�̂��폜���܂��B���ɖ߂��܂���B"> {/* 危険操作 */}
            <div className="flex items-center justify-between gap-3"> {/* 行 */}
              <div className="text-sm text-gray-700">���̂���������S�ɍ폜</div> {/* 説明 */}
              <Button
                variant="danger" // 危険ボタン
                onClick={async () => { // 削除処理
                  const ok = confirm('���̗��̂�������폜���܂����H���̑���͌��ɖ߂��܂���B') // 確認
                  if (!ok) return // 中断
                  try {
                    const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}`, { method: 'DELETE' }) // API呼び出し
                    if (!res.ok) throw new Error(await res.text()) // エラー
                    location.href = '/trips' // 一覧へ
                  } catch { 
                    alert('�폜�Ɏ��s���܂���') // 失敗通知
                  }
                }}
              >
                ���̂�������폜
              </Button>
            </div>
          </Card>
        </>
      )}
    </section>
  )
}

