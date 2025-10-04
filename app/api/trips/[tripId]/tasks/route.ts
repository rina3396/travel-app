// app/api/trips/[tripId]/tasks/route.ts
import { NextResponse } from "next/server"


export async function GET(_: Request, { params }: { params: { tripId: string } }) {
    // TODO: 一覧
    return NextResponse.json({ tasks: [], tripId: params.tripId })
}


export async function POST(req: Request, { params }: { params: { tripId: string } }) {
    // TODO: 追加
    return NextResponse.json({ ok: true, tripId: params.tripId })
}