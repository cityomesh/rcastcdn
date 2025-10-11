import { NextResponse } from "next/server";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { serverId } = body;

    if (!serverId) {
      return NextResponse.json({ success: false, error: "Missing serverId" }, { status: 400 });
    }

    const sshUser = "speedtest";
    const serverIp = "202.62.72.221";
    const sshPort = 9229;
    const serviceName = "nimble";

    const command = `ssh -p ${sshPort} ${sshUser}@${serverIp} "sudo service ${serviceName} restart"`;
    console.log("Executing:", command);

    const { stdout, stderr } = await execPromise(command);

    return NextResponse.json({
      success: true,
      message: `Restart executed successfully on ${serverIp}`,
      output: stdout || stderr,
    });
  } catch (error: any) {
    console.error("Error restarting server:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to restart server" },
      { status: 500 }
    );
  }
}
