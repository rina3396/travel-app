// app/api/trips/route.ts
import { cookies, headers } from "next/headers"
import { NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

type TripPayload = {
    title?: string
    start_date?: string | null
    end_date?: string | null
    startDate?: string | null
    endDate?: string | null
}

type SupabaseSetCookie = {
    name: string
    value: string
    options?: CookieOptions
}

export async function POST(req: Request) {
    // Next.js 15: cookies()/headers() は await 必須
    const cookieStore = await cookies()
    const headerStore = await headers()

    const pendingCookies: SupabaseSetCookie[] = []

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // クライアントから渡された Authorization をサーバークライアントへ委譲（401対策）
    const authHeader = headerStore.get("Authorization") ?? undefined

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: (cookiesToSet) => {
                // レスポンス生成時にまとめてSet-Cookieする
                pendingCookies.length = 0
                cookiesToSet.forEach(({ name, value, options }) => {
                    pendingCookies.push({ name, value, options })
                })
            },
        },
        // 重要: API呼び出しに付いてきた Bearer を Supabase にも渡す
        ...(authHeader ? { global: { headers: { Authorization: authHeader } } } : {}),
    })

    const respond = (body: unknown, init: ResponseInit) => {
        const res = NextResponse.json(body, init)
        pendingCookies.forEach(({ name, value, options }) => {
            res.cookies.set({ name, value, ...(options ?? {}) })
        })
        return res
    }

    // 認証ユーザー確認（Authorization or Cookie のどちらかで通る）
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) {
        return respond({ error: "Unauthorized" }, { status: 401 })
    }

    // 入力取得
    const body = (await req.json().catch(() => ({}))) as TripPayload
    const title = body.title?.trim()
    if (!title) {
        return respond({ error: "タイトルを入力してください" }, { status: 400 })
    }

    const startDate = body.start_date ?? body.startDate ?? null
    const endDate = body.end_date ?? body.endDate ?? null

    const basePayload = {
        title,
        start_date: startDate, // "YYYY-MM-DD" を期待（date型）
        end_date: endDate,
    }

    // DBに存在する方へ自動フォールバック
    const columnFallbackOrder = ["owner_id", "user_id"] as const

    for (const columnName of columnFallbackOrder) {
        const { data, error } = await supabase
            .from("trips")
            .insert({
                ...basePayload,
                [columnName]: user.id,
            })
            .select("id")
            .single()

        if (!error && data) {
            return respond({ id: data.id }, { status: 201 })
        }

        // カラム未存在なら次へフォールバック
        const isMissingColumnError =
            !!error?.message &&
            (error.message.includes(`column "${columnName}" does not exist`)
                // 一部エラーバリアントもケア
                || error.message.includes(`column "${columnName}" of relation "trips" does not exist`))

        if (!isMissingColumnError) {
            // ポリシー/RLS/型エラー等は即返す
            return respond({ error: error?.message ?? "Unknown error" }, { status: 400 })
        }
    }

    return respond({ error: "trips テーブルに所有者カラム(owner_id / user_id)が存在しません" }, { status: 400 })
}
