// app/api/trips/[tripId]/days/[date]/activities/reorder/route.ts // アクティビティの並び替え
import { NextRequest } from "next/server" // Next.js のリクエスト型
import { createServer } from "@/lib/supabase/server" // サーバー側Supabaseクライアント

export async function POST(req: NextRequest, { params }: { params: Promise<{ tripId: string; date: string }> }) { // 並び替え適用
  const { supabase: s } = await createServer() // クライアント生成
  const body: { orders: { id: string; order_no: number }[] } = await req.json() // 並び順の配列
  const { tripId } = await params // パラメータ取得

  const updates = body.orders.map((o) => // 各要素を更新するクエリに変換
    s.from("activities").update({ order_no: o.order_no }).eq("id", o.id).eq("trip_id", tripId)
  )
  const results = await Promise.all(updates) // 並列で更新
  const err = results.find((r) => r.error)?.error // いずれかのエラーを取得
  if (err) return new Response(err.message, { status: 400 }) // 失敗時レスポンス
  return new Response(null, { status: 204 }) // 成功
}

