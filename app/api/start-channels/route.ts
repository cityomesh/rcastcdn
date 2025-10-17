import { NextRequest, NextResponse } from "next/server";
import { NodeSSH } from "node-ssh";

const ssh = new NodeSSH();

export async function POST(req: NextRequest) {
  const { ipAddress, sshUsername, sshPrivateKeyPath, command } = await req.json();

  try {
    await ssh.connect({
      host: ipAddress,
      username: sshUsername,
      privateKey: sshPrivateKeyPath,
    });

    const result = await ssh.execCommand(command, { cwd: "/usr/local/nimble" });
    console.log(result.stdout, result.stderr);

    if (result.stderr) throw new Error(result.stderr);

    return NextResponse.json({ success: true, output: result.stdout });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    ssh.dispose();
  }
}
