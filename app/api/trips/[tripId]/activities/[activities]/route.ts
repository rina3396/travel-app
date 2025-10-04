// app/api/trips/[tripId]/activities/[activityId]/route.ts
import { NextResponse } from "next/server"


export async function PATCH(req: Request, { params }: { params: { tripId: string; activityId: string } }) {
    // TODO: アクティビティ更新
    return NextResponse.json({ ok: true, ...params })
}


export async function DELETE(_: Request, { params }: { params: { tripId: string; activityId: string } }) {
    // TODO: アクティビティ削除
    return NextResponse.json({ ok: true, ...params })
}