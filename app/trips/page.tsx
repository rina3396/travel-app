// app/trips/page.tsx
import Link from "next/link"
import Button from "@/components/ui/Button"
import { createServer } from "@/lib/supabase/server"

type Trip = {
  id: string
  title: string | null
  start_date: string | null
  end_date: string | null
}

export default async function TripsIndexPage() {
  const { supabase } = await createServer()

  // Fetch trips (RLS handles auth)
  const { data: trips, error } = await supabase
    .from("trips")
    .select("id, title, start_date, end_date")
    .order("updated_at", { ascending: false })

  if (error) {
    return (
      <section className="mx-auto w-full max-w-2xl space-y-4 p-4">
        <h1 className="text-2xl font-bold">Trips</h1>
        <p className="text-sm text-red-600">{error.message}</p>
      </section>
    )
  }

  const items: Trip[] = trips ?? []

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trips</h1>
      </header>

      <ul className="grid grid-cols-1 gap-3">
        {items.map((t) => (
          <li key={t.id} className="rounded-2xl border bg-white p-4 hover:bg-orange-50">
            <div className="flex items-center justify-between gap-3">
              <Link href={`/trips/${encodeURIComponent(t.id)}`} className="min-w-0 flex-1">
                <div className="truncate text-base font-medium">{t.title || "Untitled trip"}</div>
                <div className="truncate text-xs text-gray-600">{(t.start_date ?? "Unknown start") + " - " + (t.end_date ?? "Unknown end")}</div>
              </Link>
              <Button href={`/trips/${encodeURIComponent(t.id)}`} variant="outline" size="sm">View</Button>
            </div>
          </li>
        ))}
        <li key="__new__" className="rounded-2xl border bg-white p-4 hover:bg-orange-50">
          <Link href="/trips/new" className="block">
            <div className="flex h-16 items-center justify-center text-orange-700">
              <span className="text-sm font-medium">Create a new trip</span>
            </div>
          </Link>
        </li>
      </ul>
    </section>
  )
}