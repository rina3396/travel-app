// app/api/trips/[tripId]/activities/route.ts // アクティビティ一覧取得・作成API
import { NextRequest } from "next/server" // Next.js のリクエスト型
import { createServer } from "@/lib/supabase/server" // サーバー側Supabaseクライアント

export async function GET(_: NextRequest, { params }: { params: Promise<{ tripId: string }> }) { // 一覧取得
    const { supabase } = await createServer() // クライアント生成
    const { tripId } = await params // パラメータ取得
    const { data, error } = await supabase // 取得クエリ
        .from("activities") // 対象テーブル
        .select("id,trip_id,title,start_time,end_time,location,note,day_id,order_no") // 取得カラム
        .eq("trip_id", tripId) // tripで絞り込み
        .order("order_no", { ascending: true }) // 並び順
    if (error) return new Response(error.message, { status: 500 }) // エラーハンドリング
    return Response.json(data) // JSONレスポンス
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ tripId: string }> }) { // 作成
    const { supabase } = await createServer() // クライアント生成
    const body = await req.json() // リクエストボディ
    const { tripId } = await params // パラメータ取得
    const { data, error } = await supabase // 挿入
        .from("activities") // テーブル
        .insert({ // 行データ
            trip_id: tripId, // 紐づく旅ID
            title: body.title, // タイトル
            start_time: body.startTime ?? null, // 開始時刻
            end_time: body.endTime ?? null, // 終了時刻
            location: body.location ?? null, // 場所
            note: body.note ?? null, // メモ
            day_id: body.dayId ?? null, // 紐づく日
            order_no: body.order_no ?? 0, // 表示順
        })
        .select("id") // 生成IDを返す
        .single() // 単一行として取得
    if (error) return new Response(error.message, { status: 400 }) // バリデーションエラー等
    return Response.json(data, { status: 201 }) // 201 Created
}

