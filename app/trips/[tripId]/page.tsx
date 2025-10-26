// app/trips/[tripId]/page.tsx
import Link from "next/link"
import { createServer } from "@/lib/supabase/server"

export default async function TripDashboardPage({ params }: { params: { tripId: string } }) {
    const { tripId } = params

    // SSR 用の Supabase クライアントを取得
    const { supabase } = await createServer()

    const { data: trip, error } = await supabase
        .from("trips")
        .select("id, title, start_date, end_date")
        .eq("id", tripId)
        .single()

    if (error || !trip) {
        return (
            <section className="p-4 space-y-4">
                <h1 className="text-xl font-bold text-red-600">旅が見つかりません</h1>
                <p className="text-sm text-gray-600">tripId: {tripId}</p>
                <p className="text-sm text-gray-500">{error?.message}</p>
                <Link className="underline" href="/trips/new">新しい旅を作成する</Link>
            </section>
        )
    }

    const title = trip.title || "タイトル未設定"
    const start = trip.start_date ?? "未設定"
    const end = trip.end_date ?? "未設定"

    return (
        <section className="space-y-4 p-4">
            <h1 className="text-xl font-bold">旅ダッシュボード</h1>
            <p className="text-sm text-gray-600">tripId: {tripId}</p>
            <p className="text-sm">タイトル: {title}／期間: {start} 〜 {end}</p>
            <ul className="list-disc pl-5 space-y-1">
                <li><Link className="underline" href={`/trips/${tripId}/preview`}>完成プレビュー</Link></li>
                <li><Link className="underline" href={`/trips/${tripId}/days/${new Date().toISOString().slice(0, 10)}`}>日別しおり編集</Link></li>
                <li><Link className="underline" href={`/trips/${tripId}/activities`}>アクティビティ</Link>（一覧/詳細）</li>
                <li><Link className="underline" href={`/trips/${tripId}/budget`}>予算・費用</Link></li>
                <li><Link className="underline" href={`/trips/${tripId}/tasks`}>TODO・持ち物</Link></li>
                <li><Link className="underline" href={`/trips/${tripId}/share`}>共有・メンバー</Link></li>
                <li><Link className="underline" href={`/trips/${tripId}/settings`}>旅の設定</Link></li>
            </ul>
        </section>
    )
}
