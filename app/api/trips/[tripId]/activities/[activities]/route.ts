// app/api/trips/[tripId]/activities/[activityId]/route.ts
import { createServer } from "@/lib/supabase/server"

export async function GET(_: Request, { params }: { params: { tripId: string, activityId: string } }) {
    const s = createServer()
    const { data, error } = await s.from("activities")
        .select("*")
        .eq("trip_id", params.tripId)
        .eq("id", params.activityId)
        .single()
    if (error) return new Response(error.message, { status: 404 })
    return Response.json(data)
}

export async function PATCH(req: Request, { params }: { params: { tripId: string, activityId: string } }) {
    const body = await req.json()
    const s = createServer()
    const { error } = await s.from("activities")
        .update({
            title: body.title,
            start_time: body.startTime ?? null,
            end_time: body.endTime ?? null,
            location: body.location ?? null,
            note: body.note ?? null,
            day_id: body.dayId ?? null,
            order_no: body.order_no ?? null,
        })
        .eq("trip_id", params.tripId)
        .eq("id", params.activityId)
    if (error) return new Response(error.message, { status: 400 })
    return new Response(null, { status: 204 })
}

export async function DELETE(_: Request, { params }: { params: { tripId: string, activityId: string } }) {
    const s = createServer()
    const { error } = await s.from("activities")
        .delete()
        .eq("trip_id", params.tripId)
        .eq("id", params.activityId)
    if (error) return new Response(error.message, { status: 400 })
    return new Response(null, { status: 204 })
}
