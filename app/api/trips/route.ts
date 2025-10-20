// app/api/trips/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function POST(req: NextRequest) {
    // Cookie書き込み可能なレスポンス（必要時）
    const res = NextResponse.next()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: (name) => req.cookies.get(name)?.value,
                set: (name, value, options) => res.cookies.set({ name, value, ...options }),
                remove: (name, options) => res.cookies.set({ name, value: "", ...options }),
            },
        }
    )

    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (!user || userErr) {
        return NextResponse.json({ error: "ログインが必要です" }, { status: 401 })
    }

    const { title } = await req.json()
    const { data, error } = await supabase
        .from("trips")
        .insert([{ title, user_id: user.id }]) // ← RLS用に user_id を必ず入れる
        .select("id")
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // res.headers を引き継ぐ（Cookie更新があれば維持）
    return NextResponse.json({ id: data.id }, { headers: res.headers })
}
