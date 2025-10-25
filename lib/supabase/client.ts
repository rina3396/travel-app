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

export function createClientBrowser() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) throw new Error("Supabase env missing")
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
