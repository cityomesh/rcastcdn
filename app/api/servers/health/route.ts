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

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Server ID is required" },
      { status: 400 }
    );
  }

  try {
    const token = process.env.BACKEND_API_TOKEN;
    const res = await fetch(
      `http://103.189.178.118:3001/api/servers/health?id=${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    // ✅ Use unknown and type guard
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
