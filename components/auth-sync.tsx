// components/auth-sync.tsx
"use client"
import { useEffect } from "react"
import { createClientBrowser } from "@/lib/supabase/client"

export default function AuthSync() {
    const supabase = createClientBrowser()
    useEffect(() => {
        const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
                const token = session?.access_token
                if (token) {
                    await fetch("/auth/refresh", { method: "POST", headers: { Authorization: `Bearer ${token}` } })
                }
            }
            if (event === "SIGNED_OUT") {
                await fetch("/auth/refresh", { method: "POST" }) // サーバークッキー削除
            }
        })
        return () => sub.subscription.unsubscribe()
    }, [])
    return null
}
