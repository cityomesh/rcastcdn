// app/api/reload-server/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // ✅ Dynamic import (only when API executes, not during build)
    const { NodeSSH } = await import("node-ssh");
    const ssh = new NodeSSH();

    const { serverId, ipAddress, port, sshUsername, sshPassword, serviceName } = await req.json();

    if (!serverId || !ipAddress || !sshUsername || !sshPassword || !serviceName) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }

    await ssh.connect({
      host: ipAddress,
      username: sshUsername,
      password: sshPassword,
      port: Number(port) || 22,
    });

    const command = `sudo service ${serviceName} restart`;
    const result = await ssh.execCommand(command);
    ssh.dispose();

    if (result.stderr) {
      return NextResponse.json(
        { success: false, error: result.stderr },
        { status: 500 }
      );
    }

    console.log(`Server ${serverId} (${ipAddress}) restarted successfully`);

    return NextResponse.json({
      success: true,
      output: `Command "${command}" executed successfully on ${ipAddress}`,
    });
  } catch (error: any) {
    console.error("SSH restart error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "SSH restart failed" },
      { status: 500 }
    );
  }
}
