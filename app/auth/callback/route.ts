// app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function GET(req: NextRequest) {
    const url = new URL(req.url)
    const code = url.searchParams.get("code")
    const redirectTo = url.searchParams.get("redirectTo") || "/"

    // Cookieを書けるレスポンスを用意
    const res = NextResponse.redirect(new URL(redirectTo, url.origin))

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => req.cookies.getAll(),
                setAll: (cookiesToSet) => {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        res.cookies.set({ name, value, ...(options ?? {}) })
                    )
                },
            },
        }
    )

    if (code) {
        await supabase.auth.exchangeCodeForSession(code) // ← ここで res にセッションCookieが乗る
    }

    return res
}