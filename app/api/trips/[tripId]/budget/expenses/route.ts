// app/api/trips/[tripId]/budget/expenses/route.ts
import { NextRequest } from "next/server"
import { createServer } from "@/lib/supabase/server"

export async function GET(_: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
    const { supabase: s } = await createServer()
    const { tripId } = await params
    const { data, error } = await s.from("expenses").select("*").eq("trip_id", tripId).order("date", { ascending: false })
    if (error) return new Response(error.message, { status: 500 })
    return Response.json(data)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
    const { supabase: s } = await createServer()
    const b = await req.json()
    const { tripId } = await params
    const { data, error } = await s.from("expenses").insert({
        trip_id: tripId,
        date: b.date,
        title: b.title,
        category: b.category ?? null,
        amount: b.amount,
        paid_by: b.paidBy,
        split_with: b.splitWith ?? [],
    }).select("id").single()
    if (error) return new Response(error.message, { status: 400 })
    return Response.json(data, { status: 201 })
}
