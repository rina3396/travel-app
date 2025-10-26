"use client"

import { useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientBrowser } from "@/lib/supabase/client"

export default function LogonPage() {
    const router = useRouter()
    const params = useSearchParams()
    const email = params.get("email") || ""
    const supabase = useMemo(() => createClientBrowser(), [])

    useEffect(() => {
        let mounted = true
        ;(async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (mounted && session) router.replace("/trips/new")
        })()
        const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
            if (session) router.replace("/trips/new")
        })
        return () => {
            mounted = false
            sub.subscription.unsubscribe()
        }
    }, [router, supabase])

    return (
        <section className="mx-auto max-w-sm space-y-4 p-4 text-sm">
            <h1 className="text-lg font-semibold">ログオン</h1>
            <p>
                入力いただいた{email ? `「${email}」` : "メールアドレス"}宛に、ログイン用のマジックリンクを送信しました。
                メールボックスをご確認のうえ、リンクをクリックしてログインを完了してください。
            </p>
            <p>
                メールが届かない場合は、迷惑メールフォルダをご確認いただくか、数分待ってから再度お試しください。
            </p>
            <button
                className="w-full rounded border py-2"
                onClick={() => router.push("/auth/login")}
            >
                ログイン画面に戻る
            </button>
        </section>
    )
}

