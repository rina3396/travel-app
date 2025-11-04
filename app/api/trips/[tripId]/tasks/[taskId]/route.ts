// app/api/trips/[tripId]/tasks/[taskId]/route.ts
import { NextRequest } from "next/server"
import { createServer } from "@/lib/supabase/server"

type TaskUpdateBody = Partial<{
  title: string
  kind: 'todo' | 'packing'
  done: boolean
  sort_order: number
}>

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ tripId: string; taskId: string }> }) {
  const body = (await req.json().catch(() => ({}))) as TaskUpdateBody
  const { supabase: s } = await createServer()
  const { tripId, taskId } = await params

  const updates: Record<string, unknown> = {}
  if (typeof body.title === "string") updates.title = body.title
  if (typeof body.kind === "string") updates.kind = body.kind
  if (typeof body.done === "boolean") updates.done = body.done
  if (typeof body.sort_order === "number") updates.sort_order = body.sort_order

  if (Object.keys(updates).length === 0) return new Response("No fields", { status: 400 })

  const { error } = await s
    .from("tasks")
    .update(updates)
    .eq("trip_id", tripId)
    .eq("id", taskId)

  if (error) return new Response(error.message, { status: 400 })
  return new Response(null, { status: 204 })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ tripId: string; taskId: string }> }) {
  const { supabase: s } = await createServer()
  const { tripId, taskId } = await params
  const { error } = await s
    .from("tasks")
    .delete()
    .eq("trip_id", tripId)
    .eq("id", taskId)

  if (error) return new Response(error.message, { status: 400 })
  return new Response(null, { status: 204 })
}
