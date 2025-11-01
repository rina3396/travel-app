// app/trips/[tripId]/preview/page.tsx
import { createServer } from "@/lib/supabase/server"

type Trip = {
  id: string
  title: string | null
  start_date: string | null
  end_date: string | null
}

type DbActivity = {
  id: string
  title: string
  start_time: string | null
  end_time: string | null
  location: string | null
}

export default async function TripPreviewPage({ params }: { params: { tripId: string } }) {
  const { tripId } = params

  const { supabase } = await createServer()

  // 旅行情報の取得
  const { data: trip, error: tripErr } = await supabase
    .from("trips")
    .select("id, title, start_date, end_date")
    .eq("id", tripId)
    .single()

  // アクティビティ一覧（なければ空にフォールバック）
  let activities: DbActivity[] = []
  try {
    const { data, error } = await supabase
      .from("activities")
      .select("id, title, start_time, end_time, location")
      .eq("trip_id", tripId)
      .order("start_time", { ascending: true, nullsFirst: true })
    if (!error && data) activities = data
  } catch (_) {
    activities = []
  }

  if (tripErr || !trip) {
    return (
      <section className="mx-auto max-w-2xl p-6 space-y-4">
        <h1 className="text-xl font-bold text-red-600">プレビューを表示できません</h1>
        <p className="text-sm text-gray-600">tripId: {tripId}</p>
        {tripErr && <p className="text-sm text-gray-500">{tripErr.message}</p>}
      </section>
    )
  }

  const period = [trip.start_date ?? "未設定", trip.end_date ?? "未設定"].join(" 〜 ")

  return (
    <section className="mx-auto w-full max-w-2xl p-4 space-y-6 print:max-w-none print:p-8">
      {/* ヘッダー */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">完成プレビュー</h1>
        <p className="text-sm text-gray-600">tripId: {tripId}</p>
      </header>

      {/* 旅行概要 */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-lg font-medium">{trip.title || "タイトル未設定"}</div>
        <div className="text-sm text-gray-600">期間: {period}</div>
      </div>

      {/* アクティビティ（簡易） */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">アクティビティ</h2>
        <ul className="divide-y rounded-2xl border bg-white">
          {activities.length === 0 ? (
            <li className="p-4 text-sm text-gray-500">登録されたアクティビティはありません。</li>
          ) : (
            activities.map((a) => (
              <li key={a.id} className="flex items-start gap-3 p-3">
                <div className="w-16 shrink-0 pt-0.5 text-sm text-gray-600">
                  {a.start_time || "--:--"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{a.title}</div>
                  {a.location && (
                    <div className="truncate text-xs text-gray-600">{a.location}</div>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      {/* 印刷メモ */}
      <p className="text-center text-xs text-gray-500 print:hidden">
        ブラウザの印刷機能で紙やPDFに保存できます。
      </p>
    </section>
  )
}
