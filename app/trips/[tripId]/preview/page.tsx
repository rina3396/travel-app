// app/trips/[tripId]/preview/page.tsx // 旅のプレビュー（サーバーコンポーネント）
import Card from "@/components/ui/Card" // カード
import { createServer } from "@/lib/supabase/server" // サーバーSupabase
import type { DbActivity, DbExpense, DbTask } from "@/types/trips" // 型

export default async function TripPreviewPage({ params }: { params: { tripId: string } }) { // ページ
  const { tripId } = params // パラメータ
  const { supabase } = await createServer() // クライアント

  const { data: trip, error: tripErr } = await supabase // 旅行情報
    .from("trips") // テーブル
    .select("id, title, start_date, end_date") // カラム
    .eq("id", tripId) // 絞り込み
    .single() // 単一

  let activities: DbActivity[] = [] // 活動一覧
  let dayMap: Record<string, string> = {} // day_id→日付のマップ
  let expenses: DbExpense[] = [] // 支出一覧
  let tasks: DbTask[] = [] // タスク一覧

  try { // アクティビティ取得
    const { data, error } = await supabase
      .from("activities")
      .select("id, trip_id, title, start_time, end_time, location, day_id, note, order_no")
      .eq("trip_id", tripId)
    if (!error && data) activities = data
  } catch { // 失敗時は空
    activities = []
  }

  try { // 日付テーブル取得
    const { data: days, error: dayErr } = await supabase
      .from("trip_days")
      .select("id, date")
      .eq("trip_id", tripId)
    if (!dayErr && days) {
      dayMap = Object.fromEntries((days as { id: string; date: string }[]).map((d) => [d.id, d.date]))
    }
  } catch { // 失敗は空
    dayMap = {}
  }

  // Expenses // 支出
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

  // Tasks // タスク
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

  if (tripErr || !trip) { // 旅行が取得できない場合
    return (
      <section className="mx-auto max-w-2xl space-y-4 p-6"> {/* エラー表示 */}
        <h1 className="text-xl font-bold text-red-600">�v���r���[��\���ł��܂���</h1>
        <p className="text-sm text-gray-600">tripId: {tripId}</p>
        {tripErr && <p className="text-sm text-gray-500">{tripErr.message}</p>}
      </section>
    )
  }

  const title = trip.title || "�^�C�g�����ݒ�" // タイトル
  const period = `${trip.start_date ?? "���ݒ�"} - ${trip.end_date ?? "���ݒ�"}` // 期間

  // Sort activities: date asc -> time asc -> title asc // 活動の並べ替え
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

  // Group by date (���ݒ� last) // 日付ごとにグループ化（未設定は最後）
  const grouped = (() => {
    const map = new Map<string, DbActivity[]>()
    for (const a of orderedActivities) {
      const d = a.day_id ? (dayMap[a.day_id] ?? '���ݒ�') : '���ݒ�'
      if (!map.has(d)) map.set(d, [])
      map.get(d)!.push(a)
    }
    const keys = Array.from(map.keys())
    const unsetIdx = keys.indexOf('���ݒ�')
    const dated = keys.filter(k => k !== '���ݒ�').sort((x, y) => x.localeCompare(y))
    if (unsetIdx !== -1) dated.push('���ݒ�')
    return dated.map(k => ({ date: k, items: map.get(k)! }))
  })()

  const totalAmount = expenses.reduce((s, x) => s + (Number(x.amount) || 0), 0) // 支出合計
  const formatJPY = (v: number) => new Intl.NumberFormat('ja-JP').format(Math.round(v)) // 円整形

  return ( // 描画
    <section className="mx-auto w-full max-w-2xl space-y-6 p-4 print:max-w-none print:p-8"> {/* コンテナ */}
      <header className="space-y-1"> {/* ヘッダー */}
        <h1 className="text-2xl font-semibold">�v���r���[</h1> {/* タイトル */}
        <p className="text-sm text-gray-600">tripId: {tripId}</p> {/* ID */}
      </header>

      <Card> {/* 概要 */}
        <div className="flex items-center justify-between"> {/* 行 */}
          <div className="min-w-0"> {/* 左領域 */}
            <div className="truncate text-lg font-semibold">{title}</div> {/* タイトル */}
            <div className="mt-1 text-xs text-gray-600"> {/* 期間 */}
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-gray-700">{period}</span> {/* バッジ */}
            </div>
          </div>
        </div>
      </Card>

      {/* Activities */} {/* 活動 */}
      <section className="space-y-3"> {/* セクション */}
        <h2 className="text-base font-semibold">�A�N�e�B�r�e�B</h2> {/* 見出し */}
        {orderedActivities.length === 0 ? ( // 空
          <Card><div className="p-3 text-sm text-gray-500">���݈͂����Ă��܂���B</div></Card>
        ) : (
          grouped.map(({ date, items }) => ( // グループ
            <Card key={date}> {/* カード */}
              <div className="border-b p-3 text-sm text-gray-600">{date}</div> {/* 見出し */}
              <ul className="divide-y"> {/* リスト */}
                {items.map((a) => ( // 行
                  <li key={a.id} className="p-3 text-sm"> {/* アイテム */}
                    <div className="font-medium">{a.title}</div> {/* タイトル */}
                    <div className="mt-0.5 text-xs text-gray-600">{a.start_time ?? '—'} {a.location ? `@ ${a.location}` : ''}</div> {/* 時刻・場所 */}
                  </li>
                ))}
              </ul>
            </Card>
          ))
        )}
      </section>

      {/* Expenses */} {/* 支出 */}
      <section className="space-y-2"> {/* セクション */}
        <h2 className="text-base font-semibold">�\�Z</h2> {/* 見出し */}
        <Card>
          <div className="flex items-center justify-between p-3 text-sm"> {/* 合計 */}
            <div className="text-gray-700">���v</div>
            <div className="font-semibold">\{formatJPY(totalAmount)}</div>
          </div>
        </Card>
        {expenses.length > 0 && ( // 明細
          <Card>
            <ul className="divide-y text-sm"> {/* リスト */}
              {expenses.map((x) => (
                <li key={x.id} className="flex items-center justify-between p-3"> {/* 行 */}
                  <div className="min-w-0">
                    <div className="truncate font-medium">{x.title}</div> {/* タイトル */}
                    <div className="text-xs text-gray-600">{x.date} · {x.category}</div> {/* 日付カテゴリ */}
                  </div>
                  <div className="text-right font-medium">\{formatJPY(Number(x.amount) || 0)}</div> {/* 金額 */}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      {/* Tasks */} {/* タスク */}
      <section className="space-y-2"> {/* セクション */}
        <h2 className="text-base font-semibold">TODO</h2> {/* 見出し */}
        {tasks.length === 0 ? ( // 空
          <Card><div className="p-3 text-sm text-gray-500">TODO���Ȃ��܂���B</div></Card>
        ) : (
          <Card>
            <ul className="divide-y text-sm"> {/* リスト */}
              {tasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between p-3"> {/* 行 */}
                  <div className="truncate">{t.title}</div> {/* タイトル */}
                  <div className="text-xs text-gray-600">{t.done ? 'done' : 'open'}</div> {/* 状態 */}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </section>
  )
}

