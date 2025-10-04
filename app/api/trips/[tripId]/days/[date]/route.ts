// app/api/trips/[tripId]/days/[date]/route.ts
import { NextResponse } from "next/server"


export async function GET(_: Request, { params }: { params: { tripId: string; date: string } }) {
    // TODO: 指定日のアクティビティを返す
    return NextResponse.json({ tripId: params.tripId, date: params.date, activities: [] })
}