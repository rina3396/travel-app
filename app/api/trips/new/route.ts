// app/api/trips/new/route.ts
import { NextResponse } from "next/server"
import { createServer } from "@/lib/supabase/server"

type WizardPayload = {
  title?: string
  start_date?: string | null
  end_date?: string | null
  startDate?: string | null
  endDate?: string | null
  participants?: string[]
  budget?: { amount?: number; currency?: string }
  share?: { public?: boolean }
}

export async function POST(req: Request) {
  const { supabase, applyPendingCookies } = await createServer()

  const authHeader = req.headers.get("authorization") ?? ""
  const token = authHeader.replace(/^Bearer\s+/i, "") || undefined

  // 認証ユーザー（Cookie or Bearer）
  let { data: { user }, error: userErr } = await supabase.auth.getUser()
  if ((!user || userErr) && token) {
    const r = await supabase.auth.getUser(token)
    user = r.data.user
    userErr = r.error
  }
  if (userErr || !user) {
    const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    applyPendingCookies?.(res)
    return res
  }

  const body = (await req.json().catch(() => ({}))) as WizardPayload
  const title = body.title?.trim()
  if (!title) {
    const res = NextResponse.json({ error: "タイトルを入力してください" }, { status: 400 })
    applyPendingCookies?.(res)
    return res
  }

  const startDate = body.start_date ?? body.startDate ?? null
  const endDate = body.end_date ?? body.endDate ?? null

  // 1) trips 作成（owner_id）
  const { data: trip, error: tripErr } = await supabase
    .from("trips")
    .insert({ title, start_date: startDate, end_date: endDate, owner_id: user.id })
    .select("id")
    .single()
  if (tripErr || !trip) {
    const res = NextResponse.json({ error: tripErr?.message ?? "Failed to create trip" }, { status: 400 })
    applyPendingCookies?.(res)
    return res
  }

  const tripId = trip.id as string

  // 2) 参加者（メール）→ UUID 解決して trip_members に登録
  const participants = (body.participants ?? [])
    .map((x) => (typeof x === "string" ? x.trim().toLowerCase() : ""))
    .filter((x) => x)

  if (participants.length > 0) {
    try {
      const admin = (await import("@/lib/supabase/admin")).createAdmin()
      const lookups = await Promise.all(participants.map((email) => admin.auth.admin.getUserByEmail(email)))
      const userIds = lookups.map(r => r.data?.user?.id).filter(Boolean) as string[]
      if (userIds.length > 0) {
        const rows = userIds.map((uid) => ({ trip_id: tripId, user_id: uid, role: "viewer" as const }))
        await supabase.from("trip_members").insert(rows)
      }
    } catch (e: any) {
      const res = NextResponse.json({ id: tripId, warning: `members: ${e?.message ?? 'lookup failed'}` }, { status: 201 })
      applyPendingCookies?.(res)
      return res
    }
  }

  // 3) 共有設定（公開リンク）
  const enablePublic = !!body.share?.public
  if (enablePublic) {
    await supabase.from("share_links").insert({ trip_id: tripId, is_enabled: true }).select("id").maybeSingle()
  }

  // 4) 予算 upsert
  if (body.budget && (typeof body.budget.amount === "number" || body.budget.currency)) {
    const amount = typeof body.budget.amount === "number" ? body.budget.amount : 0
    const currency = body.budget.currency ?? "JPY"
    try {
      await supabase.from("budgets").upsert(
        { trip_id: tripId, amount, currency },
        { onConflict: "trip_id" }
      )
    } catch {
      // ignore
    }
  }

  const res = NextResponse.json({ id: tripId }, { status: 201 })
  applyPendingCookies?.(res)
  return res
}

