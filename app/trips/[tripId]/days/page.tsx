// app/trips/[tripId]/days/page.tsx // 日付選択ページ（クライアント）
"use client"

import { useEffect, useMemo, useState, use as usePromise } from "react" // Reactフック
import type { DbTripDetail } from "@/types/trips" // 型
import { useRouter } from "next/navigation" // ルーター
import Card from "@/components/ui/Card" // カード
import Skeleton from "@/components/ui/Skeleton" // スケルトン

type TripDetail = DbTripDetail // エイリアス

export default function TripDaysSelectorPage({ params }: { params: Promise<{ tripId: string }> }) { // ページ
  const { tripId } = usePromise(params) // ルートパラメータ
  const router = useRouter() // ルーター

  const [trip, setTrip] = useState<TripDetail | null>(null) // 旅詳細
  const [loading, setLoading] = useState(true) // 読込中
  const [error, setError] = useState<string | null>(null) // エラー

  useEffect(() => { // 初回ロード
    let abort = false // 中断フラグ
    ;(async () => { // 即時非同期
      try {
        setLoading(true) // ローディングON
        setError(null) // エラー消去
        const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/index`, { cache: "no-store" }) // API
        if (!res.ok) throw new Error(await res.text()) // エラー
        const data: TripDetail = await res.json() // JSON
        if (!abort) setTrip(data) // 状態更新
      } catch (e: unknown) {
        if (!abort) setError(e instanceof Error ? e.message : "���s���̎擾�Ɏ��s���܂���") // 取得失敗
      } finally {
        if (!abort) setLoading(false) // ローディングOFF
      }
    })()
    return () => { abort = true } // クリーンアップ
  }, [tripId]) // 依存

  const days = useMemo(() => { // 日付配列を生成
    // 旅行期間から配列生成。未設定時は当日1日のみ
    const start = trip?.start_date ? new Date(trip.start_date) : new Date() // 開始
    const end = trip?.end_date ? new Date(trip.end_date) : start // 終了
    // UTC 00:00 に正規化
    const s = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) // 開始UTC
    const e = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate())) // 終了UTC
    if (e < s) return [formatISODate(s)] // 逆転時は開始のみ
    const arr: string[] = [] // 結果
    for (let d = new Date(s); d.getTime() <= e.getTime(); d.setUTCDate(d.getUTCDate() + 1)) { // 1日ずつ
      arr.push(formatISODate(d)) // 追加
    }
    return arr // 配列
  }, [trip?.start_date, trip?.end_date]) // 依存

  function onSelect(date: string) { // 選択時の遷移
    router.push(`/trips/${encodeURIComponent(tripId)}/activities?date=${encodeURIComponent(date)}`) // 活動画面へ
  }

  return ( // 描画
    <section className="mx-auto w-full max-w-2xl space-y-6 p-4"> {/* コンテナ */}
      <header className="space-y-1"> {/* ヘッダー */}
        <h1 className="text-2xl font-bold">���ʂ�����</h1> {/* タイトル */}
        <p className="text-sm text-gray-600">tripId: {tripId}</p> {/* ID表示 */}
      </header>

      {loading && ( // ローディング
        <Card>
          <div className="grid gap-2"> {/* スケルトン */}
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </Card>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>} {/* エラー表示 */}

      {!loading && !error && ( // 本文
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3"> {/* グリッド */}
          {days.map((d, i) => ( // 各日
            <button
              key={d} // key
              onClick={() => onSelect(d)} // 選択
              className="group rounded-xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none" // スタイル
            >
              <div className="flex items-center gap-2"> {/* 行 */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-orange-500" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" /> {/* カレンダー */}
                </svg>
                <div className="font-semibold">{i + 1}����</div> {/* N日目 */}
              </div>
              <div className="mt-1 text-xs text-gray-600">{d}</div> {/* ISO日付 */}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-600">�I���������̏ڍוҏW�́u�A�N�e�B�r�e�B�v��ʂōs���܂��B</p> {/* 注意 */}
    </section>
  )
}

function formatISODate(d: Date) { // ISO日付フォーマット
  return new Date(d).toISOString().slice(0, 10) // YYYY-MM-DD
}

