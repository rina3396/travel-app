// app/trips/[tripId]/page.tsx
import Link from "next/link"
import { createServer } from "@/lib/supabase/server"

export default async function TripDashboardPage({ params }: { params: { tripId: string } }) {
  const { tripId } = params
  const { supabase } = await createServer()

  const { data: trip, error } = await supabase
    .from("trips")
    .select("id, title, start_date, end_date")
    .eq("id", tripId)
    .single()

  if (error || !trip) {
    return (
      <section className="p-4 space-y-4">
        <h1 className="text-xl font-bold text-red-600">旅行が見つかりません</h1>
        <p className="text-sm text-gray-600">tripId: {tripId}</p>
        <p className="text-sm text-gray-500">{error?.message}</p>
        <Link className="underline" href="/trips/new">新しい旅行を作成する</Link>
      </section>
    )
  }

  const title = trip.title || "タイトル未設定"
  const start = trip.start_date ?? "未設定"
  const end = trip.end_date ?? "未設定"
  const period = `${start} 〜 ${end}`

  return (
    <section className="space-y-6 p-4">
      <header className="space-y-1">
        <h1 className="text-xl font-bold">ダッシュボード</h1>
        <p className="text-sm text-gray-600">tripId: {tripId}</p>
      </header>

      <div className="rounded-2xl border bg-white p-4">
        <div className="text-lg font-semibold">{title}</div>
        <div className="text-sm text-gray-600">期間: {period}</div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Link href={`/trips/${tripId}/activities`} className="rounded-xl border border-orange-500 px-3 py-3 text-center text-sm font-medium text-orange-700 hover:bg-orange-50">アクティビティ</Link>
        <Link href={`/trips/${tripId}/days`} className="rounded-xl border border-orange-500 px-3 py-3 text-center text-sm font-medium text-orange-700 hover:bg-orange-50">日別スケジュール</Link>
        <Link href={`/trips/${tripId}/budget`} className="rounded-xl border border-orange-500 px-3 py-3 text-center text-sm font-medium text-orange-700 hover:bg-orange-50">予算・費用</Link>
        <Link href={`/trips/${tripId}/tasks`} className="rounded-xl border border-orange-500 px-3 py-3 text-center text-sm font-medium text-orange-700 hover:bg-orange-50">TODO・持ち物</Link>
        <Link href={`/trips/${tripId}/share`} className="rounded-xl border border-orange-500 px-3 py-3 text-center text-sm font-medium text-orange-700 hover:bg-orange-50">共有</Link>
        <Link href={`/trips/${tripId}/settings`} className="rounded-xl border border-orange-500 px-3 py-3 text-center text-sm font-medium text-orange-700 hover:bg-orange-50">設定</Link>
        <Link href={`/trips/${tripId}/preview`} className="rounded-xl bg-orange-500 px-3 py-3 text-center text-sm font-medium text-white hover:bg-orange-600">プレビュー</Link>
      </div>
    </section>
  )
}

