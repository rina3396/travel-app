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
  day_id?: string | null
}

type DbExpense = {
  id: string
  date: string
  title: string
  category: string | null
  amount: number
  paid_by: string | null
}

type DbTask = {
  id: string
  title: string
  kind: 'todo' | 'packing'
  done: boolean
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
  let dayMap: Record<string, string> = {}
  let expenses: DbExpense[] = []
  let tasks: DbTask[] = []

  try {
    const { data, error } = await supabase
      .from("activities")
      .select("id, title, start_time, end_time, location, day_id")
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
      dayMap = Object.fromEntries(days.map((d: any) => [d.id as string, d.date as string]))
    }
  } catch {
    dayMap = {}
  }

  // Expenses
  try {
    const { data, error } = await supabase
      .from("expenses")
      .select("id, date, title, category, amount, paid_by")
      .eq("trip_id", tripId)
      .order("date", { ascending: true })
    if (!error && data) expenses = data as any
  } catch {
    expenses = []
  }

  // Tasks
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("id, title, kind, done")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: true })
    if (!error && data) tasks = data as any
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

  // Sort activities: date asc -> time asc -> title asc
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

  // Group by date (未設定 last)
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
          <Card className="p-0 overflow-hidden">
            <ul>
              <li className="p-4 text-sm text-gray-500">登録されたアクティビティはありません。</li>
            </ul>
          </Card>
        ) : (
          grouped.map(g => (
            <Card key={g.date} className="p-0 overflow-hidden">
              <div className="border-b bg-gray-50 p-3">
                <div className="text-xs font-medium text-gray-700">{g.date}</div>
              </div>
              <ul className="divide-y">
                {g.items.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 p-3">
                    <div className="w-16 shrink-0 pt-0.5 text-sm text-gray-600">{a.start_time || "--:--"}</div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{a.title}</div>
                      {a.location && <div className="truncate text-xs text-gray-600">{a.location}</div>}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          ))
        )}
      </section>

      {/* Budget & Expenses */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">予算・費用</h2>
        <Card className="text-sm">
          <div className="flex items-center justify-between">
            <div className="font-medium">合計</div>
            <div className="text-lg font-semibold">¥{formatJPY(totalAmount)}</div>
          </div>
        </Card>
        <Card className="p-0 overflow-hidden">
          <ul className="divide-y">
            {expenses.length === 0 ? (
              <li className="p-4 text-sm text-gray-500">登録された費用はありません。</li>
            ) : (
              expenses.map((e) => (
                <li key={e.id} className="grid grid-cols-3 items-start gap-2 p-3 text-sm">
                  <div className="text-gray-600">{e.date}</div>
                  <div className="min-w-0">
                    <div className="truncate font-medium">{e.title}</div>
                    {e.category && <div className="text-xs text-gray-500">{e.category}</div>}
                  </div>
                  <div className="text-right font-medium">¥{formatJPY(Number(e.amount) || 0)}</div>
                </li>
              ))
            )}
          </ul>
        </Card>
      </section>

      {/* TODO & Packing */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">TODO・持ち物</h2>
        <Card className="p-0 overflow-hidden">
          <div className="grid grid-cols-1 gap-0 sm:grid-cols-2">
            <div className="border-b p-3 sm:border-b-0 sm:border-r">
              <div className="mb-2 text-xs font-semibold text-gray-700">TODO</div>
              <ul className="space-y-1 text-sm">
                {tasks.filter(t => t.kind === 'todo').length === 0 ? (
                  <li className="text-gray-500">項目がありません</li>
                ) : (
                  tasks.filter(t => t.kind === 'todo').map(t => (
                    <li key={t.id} className="flex items-start gap-2">
                      <span className="mt-0.5 inline-block h-3 w-3 rounded-sm border bg-white">
                        {t.done ? '✔' : ''}
                      </span>
                      <span className={`truncate ${t.done ? 'line-through text-gray-400' : ''}`}>{t.title}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="p-3">
              <div className="mb-2 text-xs font-semibold text-gray-700">持ち物</div>
              <ul className="space-y-1 text-sm">
                {tasks.filter(t => t.kind === 'packing').length === 0 ? (
                  <li className="text-gray-500">項目がありません</li>
                ) : (
                  tasks.filter(t => t.kind === 'packing').map(t => (
                    <li key={t.id} className="flex items-start gap-2">
                      <span className="mt-0.5 inline-block h-3 w-3 rounded-sm border bg-white">
                        {t.done ? '✔' : ''}
                      </span>
                      <span className={`truncate ${t.done ? 'line-through text-gray-400' : ''}`}>{t.title}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </Card>
      </section>

      <p className="print:hidden text-center text-xs text-gray-500">ブラウザの印刷機能でPDFに保存できます。</p>
    </section>
  )
}

