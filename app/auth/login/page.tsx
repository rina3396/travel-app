"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientBrowser } from "@/lib/supabase/client"

export default function LoginPage() {
    const router = useRouter()
    const supabase = useMemo(() => createClientBrowser(), [])

    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

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

    const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!email) {
            setError("メールアドレスを入力してください。")
            return
        }

        setLoading(true)
        setError(null)
        setMessage(null)

        const redirectTo = `${window.location.origin}/auth/callback`
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: redirectTo },
        })

        setLoading(false)

        if (error) {
            setError(error.message)
            return
        }

        setMessage("入力いただいたメールアドレス宛にログイン用リンクを送信しました。メールボックスをご確認ください。")
    }

    return (
        <section className="mx-auto max-w-sm space-y-4 p-4 text-sm">
            <h1 className="text-lg font-semibold">ログイン</h1>
            <p>メールアドレス宛に送信されるマジックリンクでログインします。</p>
            <form onSubmit={handleLogin} className="space-y-3">
                <label className="flex flex-col gap-2 text-sm">
                    <span className="font-medium">メールアドレス</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full rounded border px-3 py-2"
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                    />
                </label>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-blue-600 py-2 text-white disabled:opacity-50"
                >
                    {loading ? "送信中…" : "ログインリンクを送る"}
                </button>
            </form>
            {message && <p className="text-green-700">{message}</p>}
            {error && <p className="text-red-600">{error}</p>}
        </section>
    )
}
