import { NextResponse } from "next/server";

export async function GET() {
  // This is mock data - replace with actual data fetching logic
  const servers = [
    {
      name: "BSNL VIJAYAWADA",
      ipAddress: "169.254.86.100",
    },
    {
      name: "City Media Main CDN",
      ipAddress: "202.62.66.125",
    },
    {
      name: "Ulka Test",
      ipAddress: "202.62.72.221",
    },
    {
      name: "Rlitel_Kolkatta CDN",
      ipAddress: "173.26.147.14",
    },
  ];

  return NextResponse.json(servers);
}
