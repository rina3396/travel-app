import { createServer } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const supabase = createServer() // SSR対応

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "ログインが必要です" }, { status: 401 })
    }

    const { title } = await req.json()
    const { data, error } = await supabase
        .from("trips")
        .insert([{ title }])
        .select("id")
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ id: data.id })
}
