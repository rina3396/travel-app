// app/api/trips/route.ts
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function POST(req: Request) {
    // ✅ Next.js v15 では await が必須
    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: (cookiesToSet) => {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        // name, value, options の3引数でOK（Object渡しでも可）
                        cookieStore.set(name, value, options)
                    )
                },
            },
        }
    )

    // 認証チェック（ここで 401 になるならクッキーが読めてない）
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, start_date, end_date } = await req.json()

    const { data, error } = await supabase
        .from("trips")
        .insert({
            title,
            start_date,
            end_date,
            owner_id: user.id, // RLS 前提
        })
        .select("id")
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ id: data.id }, { status: 201 })
}
