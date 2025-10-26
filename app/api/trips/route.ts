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
    const { supabase, applyPendingCookies } = await createServer()

    // Authorization 取得（SSR のグローバルヘッダと Bearer の両方を考慮）
    const authHeader = req.headers.get("authorization") ?? ""
    const token = authHeader.replace(/^Bearer\s+/i, "") || undefined

    // まずは通常の getUser（SSR のヘッダ連携）
    let { data: { user }, error: userErr } = await supabase.auth.getUser()
    // ダメなら Bearer トークンで再取得
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
    // DB の型定義では trips.user_id が存在するため、まず user_id を試し、無ければ owner_id を試す
    const columnFallbackOrder = ["user_id", "owner_id"] as const

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

        const raw = error?.message ?? ""
        const isMissingColumn = !!raw && (
            raw.includes(`column \"${columnName}\" does not exist`) ||
            raw.includes(`column \"${columnName}\" of relation \"trips\" does not exist`) ||
            raw.includes(`Could not find the '${columnName}' column of 'trips' in the schema cache`) ||
            (raw.toLowerCase().includes("schema cache") && raw.includes(columnName))
        )

        if (!isMissingColumn) {
            const friendly = raw.includes("row-level security")
                ? "RLS のポリシーにより操作が拒否されました。Supabase の設定を確認してください。"
                : raw || "Unknown error"
            const res = NextResponse.json({ error: friendly }, { status: 400 })
            applyPendingCookies?.(res)
            return res
        }
        // 別のカラムへフォールバック継続
    }

    const res = NextResponse.json(
        { error: "trips テーブルに所有者カラム（owner_id / user_id）が存在しません" },
        { status: 400 }
    )
    applyPendingCookies?.(res)
    return res
}

