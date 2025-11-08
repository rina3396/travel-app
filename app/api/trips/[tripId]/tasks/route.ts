// app/api/trips/[tripId]/tasks/route.ts // タスク一覧取得・作成
import { NextRequest } from "next/server" // Next.js のリクエスト型
import { createServer } from "@/lib/supabase/server" // サーバー側Supabaseクライアント

export async function GET(_: NextRequest, { params }: { params: Promise<{ tripId: string }> }) { // 一覧取得
    const { supabase: s } = await createServer() // クライアント生成
    const { tripId } = await params // パラメータ
    const { data, error } = await s.from("tasks").select("*").eq("trip_id", tripId).order("created_at", { ascending: false }) // 取得
    if (error) return new Response(error.message, { status: 500 }) // 失敗
    return Response.json(data) // 成功
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ tripId: string }> }) { // 作成
    const { supabase: s } = await createServer() // クライアント
    const b = await req.json() // ボディ
    const { tripId } = await params // パラメータ
    const { data, error } = await s.from("tasks").insert({ // 挿入
        trip_id: tripId, // 紐づく旅
        title: b.title, // タイトル
        kind: b.kind ?? "todo", // 種別（既定はTODO）
        done: false, // 既定で未完了
    }).select("id").single() // 生成IDを取得
    if (error) return new Response(error.message, { status: 400 }) // 失敗
    return Response.json(data, { status: 201 }) // 201 Created
}

