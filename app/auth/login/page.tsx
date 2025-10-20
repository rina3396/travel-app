// app/auth/login/page.tsx
"use client"
// フォーム送信や OAuth ボタンなどクライアント処理用
import { useState, type FormEvent } from "react"
import { createClientBrowser } from "@/lib/supabase/client"


export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [infoMessage, setInfoMessage] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const supabase = createClientBrowser()
    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setErrorMessage(null)
        setInfoMessage(null)
        if (!email.trim()) {
            setErrorMessage("メールアドレスを入力してください。")
            return
        }
        setIsSubmitting(true)
        try {
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

            if (error) {
                setErrorMessage(error.message)
            } else {
                setInfoMessage("メールを送信しました。受信ボックスをご確認ください。")
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "不明なエラーが発生しました"
            setErrorMessage(message)
        } finally {
            setIsSubmitting(false)
        }
    }


    return (
        <div className="space-y-4">
            <h1 className="text-xl font-bold">サインイン</h1>
            <form onSubmit={onSubmit} className="space-y-3">
                <input
                    type="email"
                    className="w-full rounded border p-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                />
                <button
                    type="submit"
                    className="rounded bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "送信中..." : "ログイン"}
                </button>
                {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
                {infoMessage && <p className="text-sm text-green-600">{infoMessage}</p>}
            </form>
        </div>
    )
}
