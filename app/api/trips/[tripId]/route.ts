// app/trips/[tripId]/page.tsx
import { createServer } from "@/lib/supabase/server"

export default async function TripDashboardPage({ params }: { params: { tripId: string } }) {
    const supabase = await createServer() // ← await
    // ...
}
