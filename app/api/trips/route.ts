// app/api/trips/route.ts
import { NextResponse } from "next/server"
import { createServer } from "@/lib/supabase/server"

type TripPayload = {
    title?: string
    start_date?: string | null
    end_date?: string | null
    startDate?: string | null
    endDate?: string | null
}

export async function POST(req: Request) {
    // createServer は async 版を使っている前提（未対応なら下のコメント参照）
    const { supabase, applyPendingCookies } = await createServer()

    // Authorization を取得
    const authHeader = req.headers.get("authorization") ?? ""
    const token = authHeader.replace(/^Bearer\s+/i, "") || undefined

    // ① 通常ルート（global ヘッダでクライアントが認識できる）
    let { data: { user }, error: userErr } = await supabase.auth.getUser()

    // ② フォールバック（明示トークン引数で照会）
    if ((!user || userErr) && token) {
        const r = await supabase.auth.getUser(token)
        user = r.data.user
        userErr = r.error
    }

    if (userErr || !user) {
        const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        applyPendingCookies?.(res)
        return res
    }

    const body = (await req.json().catch(() => ({}))) as TripPayload
    const title = body.title?.trim()
    if (!title) {
        const res = NextResponse.json({ error: "タイトルを入力してください" }, { status: 400 })
        applyPendingCookies?.(res)
        return res
    }

    const startDate = body.start_date ?? body.startDate ?? null
    const endDate = body.end_date ?? body.endDate ?? null

    const basePayload = { title, start_date: startDate, end_date: endDate }
    const columnFallbackOrder = ["owner_id", "user_id"] as const

    for (const columnName of columnFallbackOrder) {
        const { data, error } = await supabase
            .from("trips")
            .insert({ ...basePayload, [columnName]: user.id })
            .select("id")
            .single()

        if (!error && data) {
            const res = NextResponse.json({ id: data.id }, { status: 201 })
            applyPendingCookies?.(res)
            return res
        }

        const isMissingColumn =
            !!error?.message &&
            (error.message.includes(`column "${columnName}" does not exist`) ||
                error.message.includes(`column "${columnName}" of relation "trips" does not exist`))

        if (!isMissingColumn) {
            const msg = error?.message?.includes("row-level security")
                ? "RLS のポリシーにより操作が拒否されました。Supabase の設定を確認してください。"
                : error?.message ?? "Unknown error"
            const res = NextResponse.json({ error: msg }, { status: 400 })
            applyPendingCookies?.(res)
            return res
        }
    }

    const res = NextResponse.json(
        { error: "trips テーブルに所有者カラム(owner_id / user_id)が存在しません" },
        { status: 400 }
    )
    applyPendingCookies?.(res)
    return res
}
