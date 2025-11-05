// app/page.tsx
import { redirect } from "next/navigation"
import { createServer } from "@/lib/supabase/server"
import Landing from "@/components/marketing/Landing"

export default async function HomePage() {
  const { supabase } = await createServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect("/trips")
  }

  return <Landing />
}
