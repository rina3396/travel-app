// app/api/trips/[tripId]/index/route.ts // 特定の旅の基本情報取得
import { NextRequest } from "next/server" // Next.js のリクエスト型
import { createServer } from "@/lib/supabase/server" // サーバー側Supabaseクライアント

export async function GET(_: NextRequest, { params }: { params: Promise<{ tripId: string }> }) { // GETハンドラ
    const { supabase } = await createServer() // クライアント生成
    const { tripId } = await params // パラメータ取得
    const { data, error } = await supabase // 取得クエリ
        .from("trips") // テーブル
        .select("id,title,start_date,end_date,description") // 必要カラム
        .eq("id", tripId) // id一致
        .single() // 単一行
    if (error) return new Response(error.message, { status: 404 }) // 見つからない
    return Response.json(data) // JSON返却
}

