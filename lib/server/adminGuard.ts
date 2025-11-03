import { NextResponse } from "next/server"

export function adminGuard(req: Request): Response | undefined {
  const secret = process.env.ADMIN_ENDPOINT_SECRET
  if (!secret) {
    return NextResponse.json({ error: "Missing ADMIN_ENDPOINT_SECRET" }, { status: 500 })
  }
  const header = req.headers.get("x-admin-secret")
  if (header !== secret) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }
  return undefined
}

