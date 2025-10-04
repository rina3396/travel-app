// app/api/trips/route.ts
import { NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import { getUserId } from "@/lib/auth"


export async function GET() {
    // TODO: 自分の旅一覧を返す
    // const userId = await getUserId()
    // const trips = await prisma.trip.findMany({ where: { ownerId: userId } })
    return NextResponse.json({ trips: [] })
}


export async function POST(req: Request) {
    // TODO: 旅の新規作成
    // const userId = await getUserId()
    // const body = await req.json()
    // const trip = await prisma.trip.create({ data: { title: body.title, ownerId: userId } })
    return NextResponse.json({ ok: true })
}