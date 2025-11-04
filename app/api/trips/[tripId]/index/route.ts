// app/api/trips/[tripId]/index/route.ts
import { NextRequest } from "next/server"
import { createServer } from "@/lib/supabase/server"

export async function GET(_: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
    const { supabase } = await createServer()
    const { tripId } = await params
    const { data, error } = await supabase
        .from("trips")
        .select("id,title,start_date,end_date,description")
        .eq("id", tripId)
        .single()
    if (error) return new Response(error.message, { status: 404 })
    return Response.json(data)
}
