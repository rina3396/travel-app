// app/auth/login/page.tsx
"use client"
// フォーム送信や OAuth ボタンなどクライアント処理用
import { useState } from "react"
import { createClientBrowser } from "@/lib/supabase/client"


export default function LoginPage() {
    const [email, setEmail] = useState("")
    const supabase = createClientBrowser()


    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Supabase でメールログイン or OAuth
        // supabaseの機能を使用して、メールでログインする
        // client.tsでsupabaseのURLを呼び出し
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`, // ← 必須
                // shouldCreateUser: true, // 既存ユーザー限定にしたいなら false
            },
        })
    }


    return (
        <div className="space-y-4">
            <h1 className="text-xl font-bold">サインイン</h1>
            <form onSubmit={onSubmit} className="space-y-3">
                <input className="w-full rounded border p-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                <button className="rounded bg-black px-4 py-2 text-white">ログイン</button>
            </form>
        </div>
    )
}