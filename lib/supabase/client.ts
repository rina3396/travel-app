// lib/supabase/client.ts
// import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// export function createClient() {
//     return createSupabaseClient(
//         process.env.NEXT_PUBLIC_SUPABASE_URL!,
//         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//     )
// }
'use client'

// import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// // 型を安全にするなら Database 型を追加してもOK
// // import type { Database } from '@/types/database'

// /**
//  * Supabase クライアント（ブラウザ用）
//  * - useEffect / onClick などクライアントサイドで利用
//  * - SSR やサーバーコンポーネントでは server.ts を使用
//  */
// export function createClientBrowser() {
//     const url = process.env.NEXT_PUBLIC_SUPABASE_URL
//     const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

//     if (!url || !key) {
//         console.warn('⚠️ Supabase環境変数が設定されていません')
//     }

//     return createSupabaseClient(
//         url!,
//         key!,
//         {
//             auth: {
//                 persistSession: true, // ローカルにセッションを保存
//                 autoRefreshToken: true, // トークン自動更新
//                 detectSessionInUrl: true, // MagicLink/OAuth対応
//             },
//         }
//     )
// }
'use client'
// lib/supabase/client.ts
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

// import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// export function createClientBrowser() {
//     const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
//     const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

//     if (!url || !key) {
//         throw new Error('Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY')
//     }
//     if (url.endsWith('/')) {
//         throw new Error('Supabase URL must not end with a trailing slash')
//     }

//     return createSupabaseClient(url, key, {
//         auth: {
//             persistSession: true,
//             autoRefreshToken: true,
//             detectSessionInUrl: true,
//         },
//     })
// }
