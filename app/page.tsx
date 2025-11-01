// app/page.tsx
import { redirect } from "next/navigation"
import { createServer } from "@/lib/supabase/server"

export default async function HomePage() {
  const { supabase, applyPendingCookies } = await createServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    redirect("/trips")
  }
  // 未ログイン時はログイン画面へ
  redirect("/auth/login")
}
