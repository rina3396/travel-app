// app/trips/page.tsx // トリップ一覧ページ
import Link from "next/link" // NextのLink
import Button from "@/components/ui/Button" // ボタン
import type { DbTripSummary } from "@/types/trips" // 型: トリップ要約
import { createServer } from "@/lib/supabase/server" // サーバー側Supabase

export default async function TripsIndexPage() { // 一覧ページのサーバーコンポーネント
  const { supabase } = await createServer() // クライアント作成

  // Fetch trips (RLS handles auth) // RLSで認可
  const { data: trips, error } = await supabase // 取得
    .from("trips") // テーブル
    .select("id, title, start_date, end_date") // 必要カラム
    .order("updated_at", { ascending: false }) // 更新降順

  if (error) { // エラー表示
    return (
      <section className="mx-auto w-full max-w-2xl space-y-4 p-4"> {/* コンテナ */}
        <h1 className="text-2xl font-bold">Trips</h1> {/* タイトル */}
        <p className="text-sm text-red-600">{error.message}</p> {/* エラーメッセージ */}
      </section>
    )
  }

  const items: DbTripSummary[] = (trips ?? []) as DbTripSummary[] // 型付け

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 p-4"> {/* コンテナ */}
      <header className="flex items-center justify-between"> {/* ヘッダー */}
        <h1 className="text-2xl font-bold">Trips</h1> {/* タイトル */}
      </header>

      <ul className="grid grid-cols-1 gap-3"> {/* リスト */}
        {items.map((t) => ( // 各トリップ
          <li
            key={t.id} // key
            className="group rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none" // スタイル
          >
            <div className="flex items-center justify-between gap-4"> {/* 行 */}
              <Link href={`/trips/${encodeURIComponent(t.id)}`} className="min-w-0 flex-1"> {/* 詳細リンク */}
                <div className="flex items-center gap-2"> {/* アイコン+タイトル */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-5 w-5 text-orange-500"
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" /> {/* カレンダー */}
                  </svg>
                  <div className="truncate text-lg font-semibold">{t.title || "Untitled trip"}</div> {/* タイトル */}
                </div>
                <div className="mt-1 inline-flex items-center gap-2 truncate text-xs text-gray-600"> {/* 期間 */}
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-gray-700"> {/* バッジ */}
                    {(t.start_date ?? "Unknown start") + " - " + (t.end_date ?? "Unknown end")} {/* 日付範囲 */}
                  </span>
                </div>
              </Link>
              <Button href={`/trips/${encodeURIComponent(t.id)}`} variant="outline" size="sm">�J��</Button> {/* 詳細へ */}
            </div>
          </li>
        ))}
        <li
          key="__new__" // 新規作成カード
          className="group rounded-xl border border-dashed border-gray-200 bg-white p-4 text-orange-700 transition hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:shadow-md motion-reduce:transform-none" // スタイル
        >
          <Link href="/trips/new" className="block"> {/* 新規作成リンク */}
            <div className="flex h-16 items-center justify-center gap-2"> {/* 中央配置 */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-5 w-5"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" /> {/* プラス */}
              </svg>
              <span className="text-sm font-medium">�V�K�쐬</span> {/* 新規作成 */}
            </div>
          </Link>
        </li>
      </ul>
    </section>
  )
}

