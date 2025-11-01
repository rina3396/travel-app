// app/api/trips/[tripId]/activities/assign-day/route.ts
import { createServer } from "@/lib/supabase/server"

export async function POST(req: Request, { params }: { params: { tripId: string } }) {
  const { supabase: s } = await createServer()
  const body: { date?: string } = await req.json().catch(() => ({}))
  if (!body.date) return new Response("date is required", { status: 400 })

  const day = await s
    .from("trip_days")
    .select("id")
    .eq("trip_id", params.tripId)
    .eq("date", body.date)
    .maybeSingle()
  let dayId = day.data?.id as string | undefined
  if (!dayId) {
    const created = await s.from("trip_days").insert({ trip_id: params.tripId, date: body.date }).select("id").single()
    if (created.error) return new Response(created.error.message, { status: 400 })
    dayId = created.data.id
  }

  const { data, error } = await s
    .from("activities")
    .update({ day_id: dayId })
    .eq("trip_id", params.tripId)
    .is("day_id", null)
    .select("id")

  if (error) return new Response(error.message, { status: 400 })
  return Response.json({ updated: data?.length ?? 0 })
}
