// app/api/trips/[tripId]/route.ts
import { NextRequest } from "next/server"
import { createServer } from "@/lib/supabase/server"

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
  const { supabase } = await createServer()

  const { tripId } = await params
  const { error } = await supabase
    .from("trips")
    .delete()
    .eq("id", tripId)

  if (error) return new Response(error.message, { status: 400 })
  return new Response(null, { status: 204 })
}

