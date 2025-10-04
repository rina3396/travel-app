// app/api/trips/[tripId]/route.ts
import { NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"


export async function GET(_: Request, { params }: { params: { tripId: string } }) {
    // TODO: tripId で取得
    return NextResponse.json({ tripId: params.tripId })
}