// lib/supabase/server.ts
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export async function createServer() {
    const cookieStore = await cookies() // ← await が必要
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: (cookiesToSet) => {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set({ name, value, ...(options ?? {}) })
                    )
                },
            },
        }
    )
}