// app/api/trips/[tripId]/days/[date]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createServer } from "@/lib/supabase/server"

export async function GET(_: NextRequest, { params }: { params: Promise<{ tripId: string; date: string }> }) {
  const { supabase } = await createServer()
  const { tripId, date } = await params
  const { data, error } = await supabase
    .from("trip_days")
    .select("id")
    .eq("trip_id", tripId)
    .eq("date", date)
    .maybeSingle()
  if (error) return new Response(error.message, { status: 400 })
  return NextResponse.json({ tripId, date, dayId: data?.id ?? null })
}

export async function POST(_: NextRequest, { params }: { params: Promise<{ tripId: string; date: string }> }) {
  const { supabase } = await createServer()
  const { tripId, date } = await params
  const existing = await supabase
    .from("trip_days")
    .select("id")
    .eq("trip_id", tripId)
    .eq("date", date)
    .maybeSingle()
  if (existing.data?.id) return NextResponse.json({ dayId: existing.data.id })

  const { data, error } = await supabase
    .from("trip_days")
    .insert({ trip_id: tripId, date })
    .select("id")
    .single()
  if (error) return new Response(error.message, { status: 400 })
  return NextResponse.json({ dayId: data.id }, { status: 201 })
}

