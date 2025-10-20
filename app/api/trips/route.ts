// app/api/trips/route.ts
import { cookies } from "next/headers"
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
    const cookieStore = await cookies()
    const pendingCookies: SupabaseSetCookie[] = []

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: async (cookiesToSet) => {
                pendingCookies.length = 0
                cookiesToSet.forEach(({ name, value, options }) => {
                    pendingCookies.push({ name, value, options })
                })
            },
        },
    })

    const respond = (body: unknown, init: ResponseInit) => {
        const response = NextResponse.json(body, init)
        pendingCookies.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...(options ?? {}) })
        })
        return response
    }

    const {
        data: { user },
        error: userErr,
    } = await supabase.auth.getUser()

    if (userErr || !user) {
        return respond({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await req.json().catch(() => ({}))) as TripPayload
    const title = body.title?.trim()

    if (!title) {
        return respond({ error: "タイトルを入力してください" }, { status: 400 })
    }

    const startDate = body.start_date ?? body.startDate ?? null
    const endDate = body.end_date ?? body.endDate ?? null

    const { data, error } = await supabase
        .from("trips")
        .insert({
            title,
            start_date: startDate,
            end_date: endDate,
            owner_id: user.id,
        })
        .select("id")
        .single()

    if (error) {
        return respond({ error: error.message }, { status: 400 })
    }

    return respond({ id: data.id }, { status: 201 })
}