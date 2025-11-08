// app/trips/[tripId]/preview/page.tsx — 旅行のプレビュー（サーバーコンポーネント）
import Card from "@/components/ui/Card"
import { createServer } from "@/lib/supabase/server"
import type { DbActivity, DbExpense, DbTask } from "@/types/trips"

export default async function TripPreviewPage({ params }: { params: { tripId: string } }) {
  const { tripId } = params
  const { supabase } = await createServer()

  const { data: trip, error: tripErr } = await supabase
    .from("trips")
    .select("id, title, start_date, end_date")
    .eq("id", tripId)
    .single()

  let activities: DbActivity[] = []
  let dayMap: Record<string, string> = {}
  let expenses: DbExpense[] = []
  let tasks: DbTask[] = []

  try {
    const { data, error } = await supabase
      .from("activities")
      .select("id, trip_id, title, start_time, end_time, location, day_id, note, order_no")
      .eq("trip_id", tripId)
    if (!error && data) activities = data
  } catch {
    activities = []
  }

  try {
    const { data: days, error: dayErr } = await supabase
      .from("trip_days")
      .select("id, date")
      .eq("trip_id", tripId)
    if (!dayErr && days) {
      dayMap = Object.fromEntries((days as { id: string; date: string }[]).map((d) => [d.id, d.date]))
    }
  } catch {
    dayMap = {}
  }

  try {
    const { data, error } = await supabase
      .from("expenses")
      .select("id, date, title, category, amount, paid_by")
      .eq("trip_id", tripId)
      .order("date", { ascending: true })
    if (!error && data) expenses = data as DbExpense[]
  } catch {
    expenses = []
  }

  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("id, title, kind, done")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: true })
    if (!error && data) tasks = data as DbTask[]
  } catch {
    tasks = []
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

  // 並び替え: 日付 -> 開始時間 -> タイトル
  const orderedActivities = [...activities].sort((a, b) => {
    const aDate = a.day_id ? dayMap[a.day_id] : undefined
    const bDate = b.day_id ? dayMap[b.day_id] : undefined
    if (aDate && bDate && aDate !== bDate) return aDate.localeCompare(bDate)
    if (aDate && !bDate) return -1
    if (!aDate && bDate) return 1
    const tA = a.start_time || ''
    const tB = b.start_time || ''
    if (tA !== tB) return tA.localeCompare(tB)
    return a.title.localeCompare(b.title)
  })

  // 日付ごとにグループ（未設定は最後）
  const grouped = (() => {
    const map = new Map<string, DbActivity[]>()
    for (const a of orderedActivities) {
      const d = a.day_id ? (dayMap[a.day_id] ?? '未設定') : '未設定'
      if (!map.has(d)) map.set(d, [])
      map.get(d)!.push(a)
    }
    const keys = Array.from(map.keys())
    const unsetIdx = keys.indexOf('未設定')
    const dated = keys.filter(k => k !== '未設定').sort((x, y) => x.localeCompare(y))
    if (unsetIdx !== -1) dated.push('未設定')
    return dated.map(k => ({ date: k, items: map.get(k)! }))
  })()

  const totalAmount = expenses.reduce((s, x) => s + (Number(x.amount) || 0), 0)
  const formatJPY = (v: number) => new Intl.NumberFormat('ja-JP').format(Math.round(v))

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

      {/* Activities */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">アクティビティ</h2>
        {orderedActivities.length === 0 ? (
          <Card><div className="p-3 text-sm text-gray-500">アクティビティがありません。</div></Card>
        ) : (
          grouped.map(({ date, items }) => (
            <Card key={date}>
              <div className="border-b p-3 text-sm text-gray-600">{date}</div>
              <ul className="divide-y">
                {items.map((a) => (
                  <li key={a.id} className="p-3 text-sm">
                    <div className="font-medium">{a.title}</div>
                    <div className="mt-0.5 text-xs text-gray-600">{a.start_time ?? '?'} {a.location ? `@ ${a.location}` : ''}</div>
                  </li>
                ))}
              </ul>
            </Card>
          ))
        )}
      </section>

      {/* Expenses */}
      <section className="space-y-2">
        <h2 className="text-base font-semibold">予算</h2>
        <Card>
          <div className="flex items-center justify-between p-3 text-sm">
            <div className="text-gray-700">合計</div>
            <div className="font-semibold">\{formatJPY(totalAmount)}</div>
          </div>
        </Card>
        {expenses.length > 0 && (
          <Card>
            <ul className="divide-y text-sm">
              {expenses.map((x) => (
                <li key={x.id} className="flex items-center justify-between p-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{x.title}</div>
                    <div className="text-xs text-gray-600">{x.date} ・ {x.category}</div>
                  </div>
                  <div className="text-right font-medium">\{formatJPY(Number(x.amount) || 0)}</div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      {/* Tasks */}
      <section className="space-y-2">
        <h2 className="text-base font-semibold">TODO</h2>
        {tasks.length === 0 ? (
          <Card><div className="p-3 text-sm text-gray-500">TODOはありません。</div></Card>
        ) : (
          <Card>
            <ul className="divide-y text-sm">
              {tasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between p-3">
                  <div className="truncate">{t.title}</div>
                  <div className="text-xs text-gray-600">{t.done ? '完了' : '未完了'}</div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </section>
  )
}

