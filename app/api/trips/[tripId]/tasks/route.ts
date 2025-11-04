// app/api/trips/[tripId]/tasks/route.ts
import { NextRequest } from "next/server"
import { createServer } from "@/lib/supabase/server"

export async function GET(_: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
    const { supabase: s } = await createServer()
    const { tripId } = await params
    const { data, error } = await s.from("tasks").select("*").eq("trip_id", tripId).order("created_at", { ascending: false })
    if (error) return new Response(error.message, { status: 500 })
    return Response.json(data)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
    const { supabase: s } = await createServer()
    const b = await req.json()
    const { tripId } = await params
    const { data, error } = await s.from("tasks").insert({
        trip_id: tripId,
        title: b.title,
        kind: b.kind ?? "todo",
        done: false,
    }).select("id").single()
    if (error) return new Response(error.message, { status: 400 })
    return Response.json(data, { status: 201 })
}
