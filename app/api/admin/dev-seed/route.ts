// app/api/admin/dev-seed/route.ts
// 開発用シード: サービスロールでユーザー作成→各テーブルへ初期データ投入
// 注意: 本番では絶対に有効化しないこと。ロールキー必須。
import { NextResponse } from "next/server"
import { createAdmin } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  try {
    const admin = createAdmin()
    const body = await req.json().catch(() => ({} as any))
    const baseDate: string = body?.baseDate || new Date().toISOString().slice(0, 10) // YYYY-MM-DD

    function isoAdd(d: string, delta: number) {
      const t = new Date(d + "T00:00:00Z")
      t.setUTCDate(t.getUTCDate() + delta)
      return t.toISOString().slice(0, 10)
    }

    // 1) 開発ユーザーを2名準備
    async function ensureUser(email: string, password = "Passw0rd!") {
      const r = await admin.auth.admin.getUserByEmail(email)
      if (r.data?.user) return r.data.user
      const c = await admin.auth.admin.createUser({ email, password, email_confirm: true })
      if (c.error) throw c.error
      return c.data.user
    }

    const u1 = await ensureUser("dev-owner@example.com")
    const u2 = await ensureUser("dev-editor@example.com")

    // 2) profiles を同期（表示名）
    await admin.from("profiles").upsert([
      { id: u1.id, display_name: "Dev Owner" },
      { id: u2.id, display_name: "Dev Editor" },
    ], { onConflict: "id" })

    // 3) trips を作成（3日間）
    const startDate = baseDate
    const endDate = isoAdd(baseDate, 2)
    const tripIns = await admin.from("trips").insert({
      owner_id: u1.id,
      title: "開発用サンプルトリップ",
      start_date: startDate,
      end_date: endDate,
      currency_code: "JPY",
    }).select("id").single()
    if (tripIns.error) throw tripIns.error
    const tripId = tripIns.data.id as string

    // 4) メンバー追加（u2 を editor）
    await admin.from("trip_members").upsert({ trip_id: tripId, user_id: u2.id, role: "editor" })

    // 5) trip_days（3日分）
    const dayRows = [0,1,2].map(offset => ({ trip_id: tripId, date: isoAdd(baseDate, offset) }))
    const daysIns = await admin.from("trip_days").insert(dayRows).select("id,date").order("date")
    if (daysIns.error) throw daysIns.error

    // 6) activities（各日1件）
    const activities = daysIns.data.map((d: any, i: number) => ({
      trip_id: tripId,
      title: `アクティビティ #${i+1}`,
      start_time: "09:30",
      location: "サンプルスポット",
      note: "開発用データ",
      day_id: d.id,
      order_no: i,
    }))
    await admin.from("activities").insert(activities)

    // 7) budgets + expenses
    await admin.from("budgets").upsert({ trip_id: tripId, amount: 50000, currency: "JPY" }, { onConflict: "trip_id" })
    await admin.from("expenses").insert([
      { trip_id: tripId, date: startDate, title: "朝食", category: "meal", amount: 800, paid_by: u1.id, split_with: [u1.id, u2.id] },
      { trip_id: tripId, date: isoAdd(baseDate,1), title: "バス移動", category: "transport", amount: 1200, paid_by: u2.id, split_with: [u1.id, u2.id] },
    ])

    // 8) tasks
    await admin.from("tasks").insert([
      { trip_id: tripId, title: "チケット手配", kind: "todo", done: false },
      { trip_id: tripId, title: "日焼け止め", kind: "packing", done: false },
    ])

    return NextResponse.json({ ok: true, tripId, users: [{ id: u1.id, email: u1.email }, { id: u2.id, email: u2.email }] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "seed failed" }, { status: 500 })
  }
}

