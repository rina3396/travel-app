// app/api/trips/[tripId]/days/[date]/route.ts // 指定日のdayレコード取得・作成
import { NextRequest, NextResponse } from "next/server" // Next.js の型
import { createServer } from "@/lib/supabase/server" // サーバー側Supabaseクライアント

export async function GET(_: NextRequest, { params }: { params: Promise<{ tripId: string; date: string }> }) { // 取得
  const { supabase } = await createServer() // クライアント
  const { tripId, date } = await params // パラメータ
  const { data, error } = await supabase // 取得クエリ
    .from("trip_days") // テーブル
    .select("id") // idのみ
    .eq("trip_id", tripId) // trip一致
    .eq("date", date) // 日付一致
    .maybeSingle() // 0件または1件
  if (error) return new Response(error.message, { status: 400 }) // 失敗
  return NextResponse.json({ tripId, date, dayId: data?.id ?? null }) // 結果を返却
}

export async function POST(_: NextRequest, { params }: { params: Promise<{ tripId: string; date: string }> }) { // 作成
  const { supabase } = await createServer() // クライアント
  const { tripId, date } = await params // パラメータ
  const existing = await supabase // 既存確認
    .from("trip_days") // テーブル
    .select("id") // id
    .eq("trip_id", tripId) // trip一致
    .eq("date", date) // 日付一致
    .maybeSingle() // 既存チェック
  if (existing.data?.id) return NextResponse.json({ dayId: existing.data.id }) // 既にあればそのまま返す

  const { data, error } = await supabase // 新規作成
    .from("trip_days") // テーブル
    .insert({ trip_id: tripId, date }) // 挿入
    .select("id") // id取得
    .single() // 単一行
  if (error) return new Response(error.message, { status: 400 }) // 失敗
  return NextResponse.json({ dayId: data.id }, { status: 201 }) // 作成成功
}

