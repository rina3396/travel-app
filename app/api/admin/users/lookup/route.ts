// app/api/admin/users/lookup/route.ts
import { NextResponse } from "next/server"
import { createAdmin } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "email is required" }, { status: 400 })
    }
    const admin = createAdmin()
    const { data, error } = await admin.auth.admin.getUserByEmail(email.trim().toLowerCase())
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    if (!data?.user) return NextResponse.json({ error: "User not found" }, { status: 404 })
    return NextResponse.json({ id: data.user.id, email: data.user.email })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "lookup failed" }, { status: 500 })
  }
}

