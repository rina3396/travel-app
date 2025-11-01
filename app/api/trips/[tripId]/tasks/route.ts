// app/api/trips/[tripId]/tasks/route.ts
import { createServer } from "@/lib/supabase/server"

export async function GET(_: Request, { params }: { params: { tripId: string } }) {
    const { supabase: s } = await createServer()
    const { data, error } = await s.from("tasks").select("*").eq("trip_id", params.tripId).order("created_at", { ascending: false })
    if (error) return new Response(error.message, { status: 500 })
    return Response.json(data)
}

export async function POST(req: Request, { params }: { params: { tripId: string } }) {
    const { supabase: s } = await createServer()
    const b = await req.json()
    const { data, error } = await s.from("tasks").insert({
        trip_id: params.tripId,
        title: b.title,
        kind: b.kind ?? "todo",
        done: false,
    }).select("id").single()
    if (error) return new Response(error.message, { status: 400 })
    return Response.json(data, { status: 201 })
}
