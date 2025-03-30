import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { executeSSHCommand } from "@/app/utils/ssh";
import { Server, ServerHealth } from "@/app/types/server";

const SERVERS_FILE = path.join(process.cwd(), "data", "servers.json");

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serverId = searchParams.get("id");

    if (!serverId) {
      return NextResponse.json(
        { error: "Server ID is required" },
        { status: 400 }
      );
    }

    // Read server data
    const data = fs.readFileSync(SERVERS_FILE, "utf-8");
    const servers: Server[] = JSON.parse(data);
    const server = servers.find((s) => s.id === serverId);

    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    // Check Nimble service status
    const serviceStatus = await executeSSHCommand(
      server,
      "systemctl is-active nimble"
    ).catch(() => "error");

    // Check disk space
    const diskSpace = await executeSSHCommand(
      server,
      'df -h | grep "/$"'
    ).catch(() => "");

    const health: ServerHealth = {
      status: serviceStatus.trim() === "active" ? "online" : "error",
      diskSpace: diskSpace.trim(),
      lastChecked: new Date().toISOString(),
    };

    // Update server status in file
    server.status = health.status;
    server.lastChecked = health.lastChecked;
    fs.writeFileSync(SERVERS_FILE, JSON.stringify(servers, null, 2));

    return NextResponse.json({
      success: true,
      data: health,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error checking server health:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to check server health",
      },
      { status: 500 }
    );
  }
}
