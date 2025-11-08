// app/api/trips/[tripId]/activities/[activityId]/route.ts // アクティビティ詳細取得・更新・削除

import { NextRequest } from "next/server" // Next.js のリクエスト型
import { createServer } from "@/lib/supabase/server" // サーバー側Supabaseクライアント

export async function GET(_: NextRequest, { params }: { params: Promise<{ tripId: string; activityId: string }> }) { // 取得
  const { tripId, activityId } = await params // パラメータ取得
  const { supabase: s } = await createServer() // クライアント生成
  const { data, error } = await s // 1件取得
    .from("activities") // テーブル
    .select("*") // 全カラム
    .eq("trip_id", tripId) // trip一致
    .eq("id", activityId) // id一致
    .single() // 単一行
  if (error) return new Response(error.message, { status: 404 }) // 見つからない
  return Response.json(data) // JSON返却
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ tripId: string; activityId: string }> }) { // 更新
  const { tripId, activityId } = await params // パラメータ
  const body = await req.json() // ボディ
  const { supabase: s } = await createServer() // クライアント
  const { error } = await s // 更新実行
    .from("activities") // テーブル
    .update({ // 更新フィールド
      title: body.title, // タイトル
      start_time: body.startTime ?? null, // 開始
      end_time: body.endTime ?? null, // 終了
      location: body.location ?? null, // 場所
      note: body.note ?? null, // メモ
      day_id: body.dayId ?? null, // 紐づく日
      order_no: body.order_no ?? null, // 表示順
    })
    .eq("trip_id", tripId) // trip一致
    .eq("id", activityId) // id一致
  if (error) return new Response(error.message, { status: 400 }) // 失敗
  return new Response(null, { status: 204 }) // 成功
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ tripId: string; activityId: string }> }) { // 削除
  const { tripId, activityId } = await params // パラメータ
  const { supabase: s } = await createServer() // クライアント
  const { error } = await s // 削除実行
    .from("activities") // テーブル
    .delete() // 削除
    .eq("trip_id", tripId) // trip一致
    .eq("id", activityId) // id一致
  if (error) return new Response(error.message, { status: 400 }) // 失敗
  return new Response(null, { status: 204 }) // 成功
}

