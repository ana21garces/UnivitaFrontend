import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const targetUrl = `${BACKEND_URL}/${path.join("/")}${req.nextUrl.search}`

  const headers: Record<string, string> = {
    "ngrok-skip-browser-warning": "true",
  }

  const contentType = req.headers.get("content-type")
  if (contentType) headers["Content-Type"] = contentType

  const auth = req.headers.get("authorization")
  if (auth) headers["Authorization"] = auth

  const body =
    req.method !== "GET" && req.method !== "HEAD"
      ? await req.arrayBuffer()
      : undefined

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...headers,
        ...(body && !headers["Content-Type"] ? { "Content-Type": "application/json" } : {}),
      },
      body: body && body.byteLength > 0 ? body : undefined,
    })

    const data = await response.arrayBuffer()

    const respHeaders: Record<string, string> = {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
    }
    const disposition = response.headers.get("content-disposition")
    if (disposition) respHeaders["Content-Disposition"] = disposition

    return new NextResponse(data, {
      status: response.status,
      headers: respHeaders,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error connecting to backend"
    return new NextResponse(JSON.stringify({ detail: message }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
