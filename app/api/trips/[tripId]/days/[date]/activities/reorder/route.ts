// app/api/trips/[tripId]/days/[date]/activities/reorder/route.ts
import { createServer } from "@/lib/supabase/server"

export async function POST(req: Request, { params }: { params: { tripId: string, date: string } }) {
  const { supabase: s } = await createServer()
  const body: { orders: { id: string; order_no: number }[] } = await req.json()

  // バルク更新（簡易トランザクション相当）
  const updates = body.orders.map(o => s.from("activities").update({ order_no: o.order_no }).eq("id", o.id).eq("trip_id", params.tripId))
  const results = await Promise.all(updates)
  const err = results.find(r => r.error)?.error
  if (err) return new Response(err.message, { status: 400 })
  return new Response(null, { status: 204 })
}