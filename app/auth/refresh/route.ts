// app/auth/refresh/route.ts
import { cookies, headers } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export async function POST() {
    const cookieStore = await cookies()
    const authHeader = (await headers()).get("Authorization") ?? undefined

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
            ...(authHeader ? { global: { headers: { Authorization: authHeader } } } : {}),
        }
    )

    // これにより最新トークンでサーバークッキーを同期
    await supabase.auth.getUser()
    return new Response(null, { status: 204 })
}
