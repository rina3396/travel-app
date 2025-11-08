// app/trips/[tripId]/page.tsx // トリップのダッシュボード
import Link from "next/link" // Link
import { createServer } from "@/lib/supabase/server" // サーバーSupabase
import Button from "@/components/ui/Button" // ボタン
import Card from "@/components/ui/Card" // カード

export default async function TripDashboardPage({ params }: { params: { tripId: string } }) { // ページ
  const { tripId } = params // パラメータ
  const { supabase } = await createServer() // クライアント

  const { data: trip, error } = await supabase // 1件取得
    .from("trips") // テーブル
    .select("id, title, start_date, end_date") // カラム
    .eq("id", tripId) // 絞り込み
    .single() // 単一

  if (error || !trip) { // 見つからない/エラー
    return (
      <section className="p-4 space-y-4"> {/* セクション */}
        <h1 className="text-2xl font-bold text-red-600">����������܂���</h1> {/* 失敗文言 */}
        <p className="text-sm text-gray-600">tripId: {tripId}</p> {/* ID確認 */}
        {error && <p className="text-sm text-gray-500">{error.message}</p>} {/* エラーメッセージ */}
        <Link className="underline" href="/trips/new">�V���������쐬</Link> {/* 新規作成へ */}
      </section>
    )
  }

  const title = trip.title ?? "�^�C�g�����ݒ�" // タイトル代替
  const start = trip.start_date ?? "�J�n�����ݒ�" // 開始代替
  const end = trip.end_date ?? "�I�������ݒ�" // 終了代替
  const period = `${start} - ${end}` // 期間

  return (
    <section className="space-y-8 p-4"> {/* セクション */}
      <header className="space-y-1"> {/* ヘッダー */}
        <h1 className="text-2xl font-bold">���̃_�b�V���{�[�h</h1> {/* タイトル */}
        <p className="text-sm text-gray-600">tripId: {tripId}</p> {/* ID表示 */}
      </header>

      <Card> {/* 概要カード */}
        <div className="flex items-center justify-between gap-4"> {/* 行 */}
          <div className="min-w-0"> {/* 左領域 */}
            <div className="flex items-center gap-2"> {/* アイコン+タイトル */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-6 w-6 text-orange-500"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" /> {/* カレンダー */}
              </svg>
              <h2 className="truncate text-2xl font-bold">{title}</h2> {/* タイトル */}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600"> {/* 補足 */}
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-gray-700"> {/* バッジ */}
                {period} {/* 期間表示 */}
              </span>
            </div>
          </div>
          <Button href={`/trips/${encodeURIComponent(tripId)}/settings`} variant="outline" size="sm">�ҏW</Button> {/* 設定へ */}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3"> {/* ナビカード */}
        <Button href={`/trips/${encodeURIComponent(tripId)}/days`} variant="outline">����</Button> {/* 日別 */}
        <Button href={`/trips/${encodeURIComponent(tripId)}/budget`} variant="outline">�\�Z�E��p</Button> {/* 予算 */}
        <Button href={`/trips/${encodeURIComponent(tripId)}/tasks`} variant="outline">�^�X�N</Button> {/* タスク */}
        <Button href={`/trips/${encodeURIComponent(tripId)}/share`} variant="outline">���L</Button> {/* 共有 */}
        <Button href={`/trips/${encodeURIComponent(tripId)}/settings`} variant="outline">�ݒ�</Button> {/* 設定 */}
        <Button href={`/trips/${encodeURIComponent(tripId)}/preview`} variant="primary">�v���r���[</Button> {/* プレビュー */}
      </div>
    </section>
  )
}

