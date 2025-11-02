// app/trips/[tripId]/page.tsx
import Link from "next/link"
import { createServer } from "@/lib/supabase/server"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"

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
        <h1 className="text-2xl font-bold text-red-600">Trip not found</h1>
        <p className="text-sm text-gray-600">tripId: {tripId}</p>
        {error && <p className="text-sm text-gray-500">{error.message}</p>}
        <Link className="underline" href="/trips/new">Create a new trip</Link>
      </section>
    )
  }

  const title = trip.title ?? "Untitled trip"
  const start = trip.start_date ?? "Unknown start"
  const end = trip.end_date ?? "Unknown end"
  const period = `${start} - ${end}`

  return (
    <section className="space-y-8 p-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Trip Dashboard</h1>
        <p className="text-sm text-gray-600">tripId: {tripId}</p>
      </header>

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-6 w-6 text-orange-500"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
              </svg>
              <h2 className="truncate text-2xl font-bold">{title}</h2>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-gray-700">
                {period}
              </span>
            </div>
          </div>
          <Button href={`/trips/${encodeURIComponent(tripId)}/settings`} variant="outline" size="sm">Edit</Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Button href={`/trips/${encodeURIComponent(tripId)}/activities`} variant="outline">Activities</Button>
        <Button href={`/trips/${encodeURIComponent(tripId)}/days`} variant="outline">Daily Schedule</Button>
        <Button href={`/trips/${encodeURIComponent(tripId)}/budget`} variant="outline">Budget</Button>
        <Button href={`/trips/${encodeURIComponent(tripId)}/tasks`} variant="outline">Tasks</Button>
        <Button href={`/trips/${encodeURIComponent(tripId)}/share`} variant="outline">Share</Button>
        <Button href={`/trips/${encodeURIComponent(tripId)}/settings`} variant="outline">Settings</Button>
        <Button href={`/trips/${encodeURIComponent(tripId)}/preview`} variant="primary">Preview</Button>
      </div>
    </section>
  )
}
