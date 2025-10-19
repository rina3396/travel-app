// app/api/trips/route.ts
import { createServer } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const supabase = await createServer() // ← await 必須

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 })

    const { title } = await req.json()
    const { data, error } = await supabase
        .from("trips")
        .insert([{ title, user_id: user.id }]) // user_id を入れる
        .select("id")
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ id: data.id })
}
