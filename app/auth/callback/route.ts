// app/auth/callback/route.ts
import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies, headers } from "next/headers"

export async function GET(req: Request) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: (cookiesToSet) => {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options)
                    })
                },
            },
            //（なくても動きますが）一応 Authorization を委譲
            global: { headers: { Authorization: (await headers()).get("Authorization") ?? "" } },
        }
    )

    // ここで ?code=… をサーバークッキーのセッションに交換
    await supabase.auth.exchangeCodeForSession()

    // ログイン後は一覧へ
    return NextResponse.redirect(new URL("/trips", req.url))
}
