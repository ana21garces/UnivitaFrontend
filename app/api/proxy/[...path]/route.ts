import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const targetUrl = `${BACKEND_URL}/${path.join("/")}`

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  }

  const auth = req.headers.get("authorization")
  if (auth) headers["Authorization"] = auth

  const body = req.method !== "GET" && req.method !== "HEAD"
    ? await req.text()
    : undefined

  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
  })

  const data = await response.text()

  return new NextResponse(data, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  })
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
