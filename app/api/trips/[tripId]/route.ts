// app/api/trips/[tripId]/route.ts // 特定の旅(trip)の削除API
import { NextRequest } from "next/server" // Next.js のリクエスト型
import { createServer } from "@/lib/supabase/server" // サーバー側Supabaseクライアント

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ tripId: string }> }) { // DELETEハンドラ
  const { supabase } = await createServer() // Supabaseクライアントを生成

  const { tripId } = await params // パスパラメータからtripIdを取得
  const { error } = await supabase // Supabaseで削除を実行
    .from("trips") // tripsテーブル
    .delete() // 削除
    .eq("id", tripId) // 対象レコードをidで絞り込み

  if (error) return new Response(error.message, { status: 400 }) // 失敗時: 400を返す
  return new Response(null, { status: 204 }) // 成功時: No Content
}

