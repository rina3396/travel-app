// app/api/trips/[tripId]/budget/expenses/route.ts // 支出一覧取得・作成
import { NextRequest } from "next/server" // Next.js のリクエスト型
import { createServer } from "@/lib/supabase/server" // サーバー側Supabaseクライアント

export async function GET(_: NextRequest, { params }: { params: Promise<{ tripId: string }> }) { // 一覧取得
    const { supabase: s } = await createServer() // クライアント生成
    const { tripId } = await params // パラメータ
    const { data, error } = await s.from("expenses").select("*").eq("trip_id", tripId).order("date", { ascending: false }) // 取得
    if (error) return new Response(error.message, { status: 500 }) // 失敗
    return Response.json(data) // 成功
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ tripId: string }> }) { // 作成
    const { supabase: s } = await createServer() // クライアント
    const b = await req.json() // ボディ
    const { tripId } = await params // パラメータ
    const { data, error } = await s.from("expenses").insert({ // 挿入
        trip_id: tripId, // 紐づく旅
        date: b.date, // 日付
        title: b.title, // タイトル
        category: b.category ?? null, // カテゴリ
        amount: b.amount, // 金額
        paid_by: b.paidBy, // 支払者
        split_with: b.splitWith ?? [], // 按分対象
    }).select("id").single() // 生成ID
    if (error) return new Response(error.message, { status: 400 }) // 失敗
    return Response.json(data, { status: 201 }) // 201 Created
}

