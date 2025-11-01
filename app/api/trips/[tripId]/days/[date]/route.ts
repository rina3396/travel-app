// app/api/trips/[tripId]/days/[date]/route.ts
import { NextResponse } from "next/server"
import { createServer } from "@/lib/supabase/server"

// 取得: 該当日の trip_days があれば id を返す（無ければ dayId: null）
export async function GET(_: Request, { params }: { params: { tripId: string; date: string } }) {
  const { supabase } = await createServer()
  const { data, error } = await supabase
    .from("trip_days")
    .select("id")
    .eq("trip_id", params.tripId)
    .eq("date", params.date)
    .maybeSingle()
  if (error) return new Response(error.message, { status: 400 })
  return NextResponse.json({ tripId: params.tripId, date: params.date, dayId: data?.id ?? null })
}

// 作成: 無ければ作成して id を返す（存在すれば既存の id）
export async function POST(_: Request, { params }: { params: { tripId: string; date: string } }) {
  const { supabase } = await createServer()
  // 既存チェック
  const existing = await supabase
    .from("trip_days")
    .select("id")
    .eq("trip_id", params.tripId)
    .eq("date", params.date)
    .maybeSingle()
  if (existing.data?.id) return NextResponse.json({ dayId: existing.data.id })

  const { data, error } = await supabase
    .from("trip_days")
    .insert({ trip_id: params.tripId, date: params.date })
    .select("id")
    .single()
  if (error) return new Response(error.message, { status: 400 })
  return NextResponse.json({ dayId: data.id }, { status: 201 })
}
