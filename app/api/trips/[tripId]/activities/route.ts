// app/api/trips/[tripId]/activities/route.ts
import { createServer } from "@/lib/supabase/server"

export async function GET(_: Request, { params }: { params: { tripId: string } }) {
    const { supabase } = await createServer()
    const { data, error } = await supabase
        .from("activities")
        .select("id,trip_id,title,start_time,end_time,location,note,day_id,order_no")
        .eq("trip_id", params.tripId)
        .order("order_no", { ascending: true })
    if (error) return new Response(error.message, { status: 500 })
    return Response.json(data)
}

export async function POST(req: Request, { params }: { params: { tripId: string } }) {
    const { supabase } = await createServer()
    const body = await req.json()
    const { data, error } = await supabase
        .from("activities")
        .insert({
            trip_id: params.tripId,
            title: body.title,
            start_time: body.startTime ?? null,
            end_time: body.endTime ?? null,
            location: body.location ?? null,
            note: body.note ?? null,
            day_id: body.dayId ?? null,
            order_no: body.order_no ?? 0,
        })
        .select("id")
        .single()
    if (error) return new Response(error.message, { status: 400 })
    return Response.json(data, { status: 201 })
}
