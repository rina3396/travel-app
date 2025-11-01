// app/trips/[tripId]/page.tsx
import Link from "next/link"
import { createServer } from "@/lib/supabase/server"
import Button from "@/components/ui/Button"

export default async function TripDashboardPage({ params }: { params: { tripId: string } }) {
  const { tripId } = params
  const { supabase } = await createServer()

  const { data: trip, error } = await supabase
    .from("trips")
    .select("id, title, start_date, end_date")
    .eq("id", tripId)
    .single()

  if (error || !trip) {
    return (
      <section className="p-4 space-y-4">
        <h1 className="text-2xl font-bold text-red-600">譌・｡後′隕九▽縺九ｊ縺ｾ縺帙ｓ</h1>
        <p className="text-sm text-gray-600">tripId: {tripId}</p>
        <p className="text-sm text-gray-500">{error?.message}</p>
        <Link className="underline" href="/trips/new">譁ｰ縺励＞譌・｡後ｒ菴懈・縺吶ｋ</Link>
      </section>
    )
  }

  const title = trip.title || "繧ｿ繧､繝医Ν譛ｪ險ｭ螳・
  const start = trip.start_date ?? "譛ｪ險ｭ螳・
  const end = trip.end_date ?? "譛ｪ險ｭ螳・
  const period = `${start} 縲・${end}`

  return (
    <section className="space-y-8 p-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">繝繝・す繝･繝懊・繝・/h1>
        <p className="text-sm text-gray-600">tripId: {tripId}</p>
      </header>

      <div className="rounded-2xl border bg-white p-4">
        <div className="text-lg font-semibold">{title}</div>
        <div className="text-sm text-gray-600">譛滄俣: {period}</div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Button href={`/trips/${tripId}/activities`} variant="outline">繧｢繧ｯ繝・ぅ繝薙ユ繧｣</Button>
        <Button href={`/trips/${tripId}/days`} variant="outline">譌･蛻･繧ｹ繧ｱ繧ｸ繝･繝ｼ繝ｫ</Button>
        <Button href={`/trips/${tripId}/budget`} variant="outline">莠育ｮ励・雋ｻ逕ｨ</Button>
        <Button href={`/trips/${tripId}/tasks`} variant="outline">TODO繝ｻ謖√■迚ｩ</Button>
        <Button href={`/trips/${tripId}/share`} variant="outline">蜈ｱ譛・/Button>
        <Button href={`/trips/${tripId}/settings`} variant="outline">險ｭ螳・/Button>
        <Button href={`/trips/${tripId}/preview`} variant="primary">繝励Ξ繝薙Η繝ｼ</Button>
      </div>
    </section>
  )
}

