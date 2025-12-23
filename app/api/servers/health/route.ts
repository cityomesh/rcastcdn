// import { NextRequest, NextResponse } from "next/server";

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const id = searchParams.get("id");

//   if (!id) {
//     return NextResponse.json(
//       { success: false, message: "Server ID is required" },
//       { status: 400 }
//     );
//   }

//   try {
//     const token = process.env.BACKEND_API_TOKEN; // env token
//     const res = await fetch(`http://103.189.178.118:3001/api/servers/health?id=${id}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     const data = await res.json();
//     return NextResponse.json(data);
//   } catch (error: any) {
//     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//   }
// }


//servers/health/route.ts
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
  }

  try {
    // Ikkada mee server IP (103.189.178.124) correct ga vundali
    const res = await fetch(`http://103.189.178.124:3001/api/servers/health?id=${id}`, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
        return NextResponse.json({ success: false, message: "Server not responding" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}