// app/api/migrations/budgets/route.ts
// 目的: trips.description に残っている wizardBudget を budgets テーブルへ移行
// 権限: 認証ユーザーの所有する trip のみ対象（全体移行はサービスロールを使う別導線を推奨）

import { NextResponse } from "next/server"
import { createServer } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const { supabase, applyPendingCookies } = await createServer()

  // 認証ユーザー取得
  const { data: userRes, error: userErr } = await supabase.auth.getUser()
  const user = userRes?.user
  if (userErr || !user) {
    const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    applyPendingCookies?.(res)
    return res
  }

  // 自分の trip のみ取得（description を含める）
  const { data: trips, error: tripsErr } = await supabase
    .from("trips")
    .select("id, description")
    .eq("user_id", user.id)
  if (tripsErr) {
    const res = NextResponse.json({ error: tripsErr.message }, { status: 400 })
    applyPendingCookies?.(res)
    return res
  }

  const migrated: string[] = []
  const skipped: string[] = []
  for (const t of trips ?? []) {
    const desc = (t as any).description as string | null
    if (!desc) { skipped.push(t.id); continue }
    let obj: any
    try { obj = JSON.parse(desc) } catch { skipped.push(t.id); continue }
    const wb = obj?.wizardBudget
    if (!wb || (typeof wb.amount !== "number" && !wb.currency)) { skipped.push(t.id); continue }

    const amount = typeof wb.amount === "number" ? wb.amount : 0
    const currency = typeof wb.currency === "string" ? wb.currency : "JPY"
    const { error: upErr } = await supabase
      .from("budgets")
      .upsert({ trip_id: t.id, amount, currency }, { onConflict: "trip_id" })
    if (upErr) { skipped.push(t.id); continue }

    // description から wizardBudget を除去して更新（他の内容は維持）
    try {
      delete obj.wizardBudget
      await supabase.from("trips").update({ description: JSON.stringify(obj) }).eq("id", t.id)
    } catch {
      // 失敗してもスキップ扱いにはしない
    }
    migrated.push(t.id)
  }

  const res = NextResponse.json({ migrated, skipped }, { status: 200 })
  applyPendingCookies?.(res)
  return res
}

