// app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function GET(req: NextRequest) {
    const url = new URL(req.url)
    const code = url.searchParams.get("code")

    // リダイレクト先（任意）
    const redirectTo = url.searchParams.get("redirectTo") || "/"
    const res = NextResponse.redirect(new URL(redirectTo, url.origin))

    // Cookie を「書ける」クライアントを作る（ここがポイント）
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

    if (code) {
        await supabase.auth.exchangeCodeForSession(code) // ← これで res にセッションCookieが乗る
    }

    return res
}
