// app/api/trips/[tripId]/activities/route.ts
import { NextResponse } from "next/server"


export async function POST(req: Request, { params }: { params: { tripId: string } }) {
    // TODO: アクティビティ追加
    return NextResponse.json({ ok: true, tripId: params.tripId })
}