// app/trips/page.tsx
import Link from "next/link"
import { createServer } from "@/lib/supabase/server"

type Trip = {
  id: string
  title: string | null
  start_date: string | null
  end_date: string | null
}

export default async function TripsIndexPage() {
  const { supabase } = await createServer()

  // 認証はRLSに任せつつ、一覧を取得
  const { data: trips, error } = await supabase
    .from("trips")
    .select("id, title, start_date, end_date")
    .order("updated_at", { ascending: false })

  if (error) {
    return (
      <section className="mx-auto w-full max-w-2xl space-y-4 p-4">
        <h1 className="text-xl font-bold">旅行一覧</h1>
        <p className="text-sm text-red-600">{error.message}</p>
      </section>
    )
  }

  const items: Trip[] = trips ?? []

  return (
    <section className="mx-auto w-full max-w-2xl space-y-5 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">旅行一覧</h1>
      </header>

      <ul className="grid grid-cols-1 gap-3">
        {items.map((t) => (
          <li key={t.id} className="rounded-2xl border bg-white p-4 hover:bg-orange-50">
            <Link href={`/trips/${encodeURIComponent(t.id)}`} className="block">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-base font-medium">{t.title || "タイトル未設定"}</div>
                  <div className="truncate text-xs text-gray-600">
                    {(t.start_date ?? "未設定") + " 〜 " + (t.end_date ?? "未設定")}
                  </div>
                </div>
                <span className="shrink-0 rounded-md border border-orange-500 px-2 py-1 text-xs text-orange-700">詳細</span>
              </div>
            </Link>
          </li>
        ))}
        <li key="__new__" className="rounded-2xl border bg-white p-4 hover:bg-orange-50">
          <Link href="/trips/new" className="block">
            <div className="flex h-16 items-center justify-center text-orange-700">
              <span className="text-sm font-medium">＋ 新規作成</span>
            </div>
          </Link>
        </li>
      </ul>
    </section>
  )
}
