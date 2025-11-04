// app/api/trips/[tripId]/activities/route.ts
import { NextRequest } from "next/server"
import { createServer } from "@/lib/supabase/server"

export async function GET(_: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
    const { supabase } = await createServer()
    const { tripId } = await params
    const { data, error } = await supabase
        .from("activities")
        .select("id,trip_id,title,start_time,end_time,location,note,day_id,order_no")
        .eq("trip_id", tripId)
        .order("order_no", { ascending: true })
    if (error) return new Response(error.message, { status: 500 })
    return Response.json(data)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
    const { supabase } = await createServer()
    const body = await req.json()
    const { tripId } = await params
    const { data, error } = await supabase
        .from("activities")
        .insert({
            trip_id: tripId,
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
