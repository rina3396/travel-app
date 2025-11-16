// app/api/trips/[tripId]/budget/route.ts — 予算額の取得・更新
import { NextRequest } from "next/server"
import { createServer } from "@/lib/supabase/server"

type BudgetPayload = {
  amount: number
  currency: string
}

const DEFAULT_BUDGET: BudgetPayload = { amount: 0, currency: "JPY" }

export async function GET(_: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
  const { supabase } = await createServer()
  const { tripId } = await params

  const { data, error } = await supabase
    .from("budgets")
    .select("amount, currency")
    .eq("trip_id", tripId)
    .maybeSingle()

  if (error && error.code !== "PGRST116") {
    return new Response(error.message, { status: 400 })
  }

  const payload: BudgetPayload = {
    amount: Number(data?.amount) || 0,
    currency: (data?.currency || DEFAULT_BUDGET.currency) as string,
  }

  return Response.json(payload)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
  const { supabase } = await createServer()
  const { tripId } = await params
  const body = (await req.json().catch(() => ({}))) as Partial<BudgetPayload>

  const nextAmount = typeof body.amount === "number" && Number.isFinite(body.amount) ? body.amount : undefined
  const nextCurrency = typeof body.currency === "string" && body.currency.trim()
    ? body.currency.trim().toUpperCase()
    : undefined

  if (nextAmount === undefined && nextCurrency === undefined) {
    return new Response("amount か currency のいずれかは必須です", { status: 400 })
  }

  const { data: current, error: currentErr } = await supabase
    .from("budgets")
    .select("amount, currency")
    .eq("trip_id", tripId)
    .maybeSingle()

  if (currentErr && currentErr.code !== "PGRST116") {
    return new Response(currentErr.message, { status: 400 })
  }

  const payload = {
    trip_id: tripId,
    amount: nextAmount ?? Number(current?.amount) ?? DEFAULT_BUDGET.amount,
    currency: nextCurrency ?? (current?.currency as string) ?? DEFAULT_BUDGET.currency,
  }

  const { data, error } = await supabase
    .from("budgets")
    .upsert(payload, { onConflict: "trip_id" })
    .select("amount, currency")
    .single()

  if (error) {
    return new Response(error.message, { status: 400 })
  }

  return Response.json({
    amount: Number(data.amount) || 0,
    currency: (data.currency as string) || DEFAULT_BUDGET.currency,
  })
}
