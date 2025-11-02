// app/api/trips/[tripId]/route.ts
import { createServer } from "@/lib/supabase/server"

export async function DELETE(_: Request, { params }: { params: { tripId: string } }) {
  const { supabase } = await createServer()

  const { error } = await supabase
    .from("trips")
    .delete()
    .eq("id", params.tripId)

  if (error) return new Response(error.message, { status: 400 })
  return new Response(null, { status: 204 })
}

