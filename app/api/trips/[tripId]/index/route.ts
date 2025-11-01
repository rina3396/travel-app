// app/api/trips/[tripId]/index/route.ts
import { createServer } from "@/lib/supabase/server"

export async function GET(_: Request, { params }: { params: { tripId: string } }) {
    const { supabase } = await createServer()
    const { data, error } = await supabase
        .from("trips")
        .select("id,title,start_date,end_date,description")
        .eq("id", params.tripId)
        .single()
    if (error) return new Response(error.message, { status: 404 })
    return Response.json(data)
}
