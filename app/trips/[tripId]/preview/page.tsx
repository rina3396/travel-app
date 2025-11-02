// app/trips/[tripId]/preview/page.tsx
import Card from "@/components/ui/Card"
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

  const { data: trip, error: tripErr } = await supabase
    .from("trips")
    .select("id, title, start_date, end_date")
    .eq("id", tripId)
    .single()

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
      <section className="mx-auto max-w-2xl space-y-4 p-6">
        <h1 className="text-xl font-bold text-red-600">プレビューを表示できません</h1>
        <p className="text-sm text-gray-600">tripId: {tripId}</p>
        {tripErr && <p className="text-sm text-gray-500">{tripErr.message}</p>}
      </section>
    )
  }

  const title = trip.title || "タイトル未設定"
  const period = `${trip.start_date ?? "未設定"} - ${trip.end_date ?? "未設定"}`

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 p-4 print:max-w-none print:p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">プレビュー</h1>
        <p className="text-sm text-gray-600">tripId: {tripId}</p>
      </header>

      <Card>
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold">{title}</div>
            <div className="mt-1 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-gray-700">{period}</span>
            </div>
          </div>
        </div>
      </Card>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">アクティビティ</h2>
        <Card className="p-0 overflow-hidden">
          <ul className="divide-y">
            {activities.length === 0 ? (
              <li className="p-4 text-sm text-gray-500">登録されたアクティビティはありません。</li>
            ) : (
              activities.map((a) => (
                <li key={a.id} className="flex items-start gap-3 p-3">
                  <div className="w-16 shrink-0 pt-0.5 text-sm text-gray-600">{a.start_time || "--:--"}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{a.title}</div>
                    {a.location && <div className="truncate text-xs text-gray-600">{a.location}</div>}
                  </div>
                </li>
              ))
            )}
          </ul>
        </Card>
      </section>

      <p className="print:hidden text-center text-xs text-gray-500">ブラウザの印刷機能で紙や PDF に保存できます。</p>
    </section>
  )
}