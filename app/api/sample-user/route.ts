import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json().catch(() => ({ })) as { email?: string, password?: string }
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !serviceKey) {
            return NextResponse.json(
                { ok: false, error: "Server env missing: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY" },
                { status: 500 }
            )
        }

        const e = (email ?? "").trim().toLowerCase()
        const p = (password ?? "").trim()
        if (!e || !p) {
            return NextResponse.json(
                { ok: false, error: "email と password は必須です" },
                { status: 400 }
            )
        }

        const admin = createClient(supabaseUrl, serviceKey)

        // Helper: find user by email via listUsers
        async function findUserIdByEmail(target: string): Promise<string | null> {
            const maxPages = 10
            const perPage = 1000
            for (let page = 1; page <= maxPages; page++) {
                const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
                if (error) break
                const found = data?.users?.find((u: any) => (u.email ?? "").toLowerCase() === target)
                if (found) return found.id as string
                if (!data || data.users.length < perPage) break
            }
            return null
        }

        const existingId = await findUserIdByEmail(e)
        if (existingId) {
            // Update password to ensure sample login works
            const { error: updErr } = await admin.auth.admin.updateUserById(existingId, {
                password: p,
                email_confirm: true,
            })
            if (updErr) {
                return NextResponse.json(
                    { ok: false, error: `ユーザー更新に失敗しました: ${updErr.message}` },
                    { status: 500 }
                )
            }
            return NextResponse.json({ ok: true, created: false, updated: true })
        }

        // Create user when not exists
        const { error: createErr } = await admin.auth.admin.createUser({
            email: e,
            password: p,
            email_confirm: true,
        })
        if (createErr) {
            return NextResponse.json(
                { ok: false, error: `ユーザー作成に失敗しました: ${createErr.message}` },
                { status: 500 }
            )
        }
        return NextResponse.json({ ok: true, created: true, updated: false })
    } catch (err: any) {
        return NextResponse.json(
            { ok: false, error: `Unexpected error: ${err?.message ?? String(err)}` },
            { status: 500 }
        )
    }
}

