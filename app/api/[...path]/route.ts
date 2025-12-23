import { NextRequest, NextResponse } from "next/server";

// మీ బ్యాకెండ్ సర్వర్ IP
const BACKEND_URL = "http://103.189.178.124:3001";

async function proxyHandler(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const search = req.nextUrl.search;
  
  // ఇది సర్వర్ కి వెళ్ళే ఫుల్ URL: http://103.189.178.124:3001/api/rules
  const targetUrl = `${BACKEND_URL}${pathname}${search}`;

  const token = req.headers.get("authorization");
  const method = req.method;
  
  let body = null;
  if (method !== "GET" && method !== "HEAD") {
    try {
      body = await req.text();
    } catch (e) {
      body = null;
    }
  }

  try {
    const res = await fetch(targetUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: token }),
      },
      body: body ? body : undefined,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Proxy Error:", error.message);
    return NextResponse.json(
      { success: false, error: "Backend Unreachable" },
      { status: 500 }
    );
  }
}

export const GET = proxyHandler;
export const POST = proxyHandler;
export const PUT = proxyHandler;
export const DELETE = proxyHandler;
