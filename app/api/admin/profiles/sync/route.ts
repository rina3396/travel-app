// app/api/admin/profiles/sync/route.ts
// auth.users → public.profiles を同期（display_name はメールローカル部を初期値）
import { NextResponse } from "next/server"
import { createAdmin } from "@/lib/supabase/admin"
import { adminGuard } from "@/lib/server/adminGuard"

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const guard = adminGuard(req)
  if (guard) return guard
  try {
    const admin = createAdmin()
    // ページング（最大1,000件までの簡易版）
    let page = 1
    const pageSize = 200
    const upserts: any[] = []
    // @ts-ignore
    while (true) {
      // @ts-ignore
      const r = await admin.auth.admin.listUsers({ page, perPage: pageSize })
      if (r.error) throw r.error
      const users = r.data?.users ?? []
      for (const u of users) {
        const email = (u.email || "").toString()
        const local = email.includes("@") ? email.split("@")[0] : email
        upserts.push({ id: u.id, display_name: local })
      }
      if (users.length < pageSize) break
      page += 1
      if (page > 5) break // 安全弁: 最大 1000 ユーザー
    }
    if (upserts.length > 0) {
      const res = await admin.from("profiles").upsert(upserts, { onConflict: "id" })
      if (res.error) throw res.error
    }
    return NextResponse.json({ ok: true, upserted: upserts.length })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "sync failed" }, { status: 500 })
  }
}

