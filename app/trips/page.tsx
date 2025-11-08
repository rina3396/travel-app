// app/trips/page.tsx — 旅行一覧ページ
import Link from "next/link"
import Button from "@/components/ui/Button"
import type { DbTripSummary } from "@/types/trips"
import { createServer } from "@/lib/supabase/server"

export default async function TripsIndexPage() {
  const { supabase } = await createServer()

  const { data: trips, error } = await supabase
    .from("trips")
    .select("id, title, start_date, end_date")
    .order("updated_at", { ascending: false })

  if (error) {
    return (
      <section className="mx-auto w-full max-w-2xl space-y-4 p-4">
        <h1 className="text-2xl font-bold">旅行</h1>
        <p className="text-sm text-red-600">{error.message}</p>
      </section>
    )
  }

  const items: DbTripSummary[] = (trips ?? []) as DbTripSummary[]

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">旅行</h1>
      </header>

      <ul className="grid grid-cols-1 gap-3">
        {items.map((t) => (
          <li
            key={t.id}
            className="group rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none"
          >
            <div className="flex items-center justify-between gap-4">
              <Link href={`/trips/${encodeURIComponent(t.id)}`} className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-5 w-5 text-orange-500"
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
                  </svg>
                  <div className="truncate text-lg font-semibold">{t.title || "タイトル未設定"}</div>
                </div>
                <div className="mt-1 inline-flex items-center gap-2 truncate text-xs text-gray-600">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-gray-700">
                    {(t.start_date ?? "開始未設定") + " - " + (t.end_date ?? "終了未設定")}
                  </span>
                </div>
              </Link>
              <Button href={`/trips/${encodeURIComponent(t.id)}`} variant="outline" size="sm">詳細</Button>
            </div>
          </li>
        ))}
        <li
          key="__new__"
          className="group rounded-xl border border-dashed border-gray-200 bg-white p-4 text-orange-700 transition hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:shadow-md motion-reduce:transform-none"
        >
          <Link href="/trips/new" className="block">
            <div className="flex h-16 items-center justify-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-5 w-5"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
              </svg>
              <span className="text-sm font-medium">新規作成</span>
            </div>
          </Link>
        </li>
      </ul>
    </section>
  )
}

