// app/api/trips/[tripId]/budget/expenses/route.ts
import { createServer } from "@/lib/supabase/server"

export async function GET(_: Request, { params }: { params: { tripId: string } }) {
    const s = createServer()
    const { data, error } = await s.from("expenses").select("*").eq("trip_id", params.tripId).order("date", { ascending: false })
    if (error) return new Response(error.message, { status: 500 })
    return Response.json(data)
}

export async function POST(req: Request, { params }: { params: { tripId: string } }) {
    const s = createServer()
    const b = await req.json()
    const { data, error } = await s.from("expenses").insert({
        trip_id: params.tripId,
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
