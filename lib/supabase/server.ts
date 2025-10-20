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
                get: (name) => cookieStore.get(name)?.value,
                set: (name, value, options) => cookieStore.set({ name, value, ...options }),
                remove: (name, options) => cookieStore.set({ name, value: "", ...options }),
            },
        }
    )
}
