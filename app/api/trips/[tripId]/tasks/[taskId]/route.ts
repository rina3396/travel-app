// app/api/trips/[tripId]/tasks/[taskId]/route.ts // タスクの更新・削除
import { NextRequest } from "next/server" // Next.js のリクエスト型
import { createServer } from "@/lib/supabase/server" // サーバー側Supabaseクライアント

type TaskUpdateBody = Partial<{ // 更新可能フィールドの型
  title: string // タイトル
  kind: 'todo' | 'packing' // 種別
  done: boolean // 完了フラグ
  sort_order: number // 並び順
}>

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ tripId: string; taskId: string }> }) { // 更新
  const body = (await req.json().catch(() => ({}))) as TaskUpdateBody // ボディを取得（失敗時は空）
  const { supabase: s } = await createServer() // クライアント
  const { tripId, taskId } = await params // パラメータ

  const updates: Record<string, unknown> = {} // 更新内容のオブジェクト
  if (typeof body.title === "string") updates.title = body.title // タイトル
  if (typeof body.kind === "string") updates.kind = body.kind // 種別
  if (typeof body.done === "boolean") updates.done = body.done // 完了
  if (typeof body.sort_order === "number") updates.sort_order = body.sort_order // 並び順

  if (Object.keys(updates).length === 0) return new Response("No fields", { status: 400 }) // 何も更新しない場合

  const { error } = await s // 更新実行
    .from("tasks") // テーブル
    .update(updates) // 更新内容
    .eq("trip_id", tripId) // trip一致
    .eq("id", taskId) // id一致

  if (error) return new Response(error.message, { status: 400 }) // 失敗
  return new Response(null, { status: 204 }) // 成功
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ tripId: string; taskId: string }> }) { // 削除
  const { supabase: s } = await createServer() // クライアント
  const { tripId, taskId } = await params // パラメータ
  const { error } = await s // 削除実行
    .from("tasks") // テーブル
    .delete() // 削除
    .eq("trip_id", tripId) // trip一致
    .eq("id", taskId) // id一致

  if (error) return new Response(error.message, { status: 400 }) // 失敗
  return new Response(null, { status: 204 }) // 成功
}

