// lib/supabase/client.ts
'use client'

import { createBrowserClient } from "@supabase/ssr"

// クライアント専用の Supabase クライアントを返すヘルパ。
// ビルド時/SSR の静的プリレンダーでも安全に評価されるよう、
// 環境変数が未設定のサーバ側ではダミークライアントを返して例外を出さない。
export function createClientBrowser() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    // サーバ（SSR/ビルド）側ではダミーを返して評価エラーを避ける
    if ((!url || !anon) && typeof window === "undefined") {
        // 使われるのはクライアント側のみなので、呼び出し側の型を満たす最小限のスタブを返す
        const stub = {
            auth: {
                async getSession() { return { data: { session: null }, error: null } },
                onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } } },
                async signOut() { return { error: null } },
            },
        } as unknown as ReturnType<typeof createBrowserClient>
        return stub
    }
    // ブラウザ側で未設定なら明示的にエラー
    if (!url || !anon) {
        throw new Error("Supabase env missing")
    }
    return createBrowserClient(url, anon)
}