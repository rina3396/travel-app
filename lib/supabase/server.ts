// lib/supabase/server.ts
import { cookies, headers } from "next/headers"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

type SupabaseSetCookie = {
    name: string
    value: string
    options?: CookieOptions
}

/**
 * Next.js 15 対応:
 * - await cookies()/headers() 必須
 * - Authorization ヘッダ（Bearer）を Supabase に委譲できるようにする
 */
export async function createServer() {
    const cookieStore = await cookies()
    const headerStore = await headers()
    const pendingCookies: SupabaseSetCookie[] = []

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Server configuration error")
    }

    const authHeader = headerStore.get("authorization") ?? undefined

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: (cookiesToSet) => {
                pendingCookies.length = 0
                cookiesToSet.forEach(({ name, value, options }) => {
                    pendingCookies.push({ name, value, options })
                })
            },
        },
        ...(authHeader ? { global: { headers: { Authorization: authHeader } } } : {}),
    })

    /**
     * API ルートで JSON を返す時に呼んでください。
     * Supabase が要求する Set-Cookie をここでまとめて反映します。
     */
    const applyPendingCookies = (res: Response) => {
        pendingCookies.forEach(({ name, value, options }) => {
            // @ts-expect-error NextResponse cookies helper
            res.cookies?.set?.({ name, value, ...(options ?? {}) })
        })
    }

    return { supabase, applyPendingCookies }
}
