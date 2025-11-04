// app/api/trips/[tripId]/days/[date]/activities/reorder/route.ts
import { NextRequest } from "next/server"
import { createServer } from "@/lib/supabase/server"

export async function POST(req: NextRequest, { params }: { params: Promise<{ tripId: string; date: string }> }) {
  const { supabase: s } = await createServer()
  const body: { orders: { id: string; order_no: number }[] } = await req.json()
  const { tripId } = await params

  const updates = body.orders.map((o) =>
    s.from("activities").update({ order_no: o.order_no }).eq("id", o.id).eq("trip_id", tripId)
  )
  const results = await Promise.all(updates)
  const err = results.find((r) => r.error)?.error
  if (err) return new Response(err.message, { status: 400 })
  return new Response(null, { status: 204 })
}

