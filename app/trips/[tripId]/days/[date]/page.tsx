import { redirect } from "next/navigation"

export default function TripDayRedirectPage({ params }: { params: { tripId: string; date: string } }) {
  const { tripId, date } = params
  redirect(`/trips/${encodeURIComponent(tripId)}/activities?date=${encodeURIComponent(date)}`)
}

