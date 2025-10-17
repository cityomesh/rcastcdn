// import { NextResponse } from "next/server";
// import { NodeSSH } from "node-ssh";

// export async function POST(request: Request) {
//   try {
//     const { ipAddress, sshUsername, sshPrivateKeyPath, sshPassphrase } =
//       await request.json();

//     if (!ipAddress || !sshUsername || !sshPrivateKeyPath) {
//       return NextResponse.json({ success: false, message: "Missing parameters" }, { status: 400 });
//     }

//     const ssh = new NodeSSH();
//     await ssh.connect({
//       host: ipAddress,
//       username: sshUsername,
//       privateKey: sshPrivateKeyPath,
//       passphrase: sshPassphrase || undefined,
//     });

//     const result = await ssh.execCommand(
//       'curl -X POST http://127.0.0.1:8083/manage/reload_config'
//     );

//     ssh.dispose();

//     if (result.stderr) {
//       return NextResponse.json({ success: false, message: result.stderr });
//     }

//     return NextResponse.json({
//       success: true,
//       message: `✅ Nimble config reloaded successfully on ${ipAddress}`,
//     });
//   } catch (error: any) {
//     console.error("SSH Reload Error:", error);
//     return NextResponse.json({ success: false, message: error.message || "Reload failed" });
//   }
// }



// import { NextResponse } from "next/server";
// import { exec } from "child_process";
// import util from "util";

// const execPromise = util.promisify(exec);

// export async function POST(req: Request) {
//   try {
//     const { ipAddress, sshUsername, sshPrivateKeyPath, serviceName, port } = await req.json();

//     if (!ipAddress || !sshUsername || !sshPrivateKeyPath || !serviceName) {
//       return NextResponse.json({ success: false, error: "Missing required parameters." }, { status: 400 });
//     }

//     // ✅ Use dynamic SSH port (default to 22)
//     const sshPort = port || 22;

//     const command = `ssh -i ${sshPrivateKeyPath} -p ${sshPort} -o StrictHostKeyChecking=no ${sshUsername}@${ipAddress} "sudo service ${serviceName} restart"`;

//     console.log("Running SSH command:", command);

//     const { stdout, stderr } = await execPromise(command);

//     if (stderr) {
//       console.error("SSH stderr:", stderr);
//     }

//     console.log("SSH stdout:", stdout);

//     return NextResponse.json({
//       success: true,
//       message: `Service '${serviceName}' restarted successfully.`,
//       stdout,
//       stderr,
//     });
//   } catch (error: any) {
//     console.error("Error executing SSH command:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: error.message || "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }


// // /app/api/reload-server/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { NodeSSH } from "node-ssh";

// export async function POST(req: NextRequest) {
//   const ssh = new NodeSSH();

//   try {
//     const { ipAddress, port, sshUsername, sshPassword, serviceName } = await req.json();

//     if (!ipAddress || !sshUsername || !sshPassword || !serviceName) {
//       return NextResponse.json(
//         { success: false, error: "Missing required parameters" },
//         { status: 400 }
//       );
//     }

//     await ssh.connect({
//       host: ipAddress,
//       username: sshUsername,
//       password: sshPassword,
//       port: Number(port) || 22,
//     });

//     const command = `sudo service ${serviceName} restart`;
//     const result = await ssh.execCommand(command);
//     ssh.dispose();

//     if (result.stderr) {
//       return NextResponse.json(
//         { success: false, error: result.stderr },
//         { status: 500 }
//       );
//     }

//     return NextResponse.json({ success: true, output: result.stdout });
//   } catch (error: any) {
//     return NextResponse.json(
//       { success: false, error: error.message },
//       { status: 500 }
//     );
//   }
// }

//app/api/reload-server/route.ts
import { NextRequest, NextResponse } from "next/server";
import { NodeSSH } from "node-ssh";

export async function POST(req: NextRequest) {
  const ssh = new NodeSSH();

  try {
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

    // Ikkada output empty avvatledu, command message send chestunnam
    return NextResponse.json({ 
      success: true, 
      output: `Command "${command}" executed successfully on ${ipAddress}` 
    });
  } catch (error: any) {
    console.error("SSH restart error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "SSH restart failed" },
      { status: 500 }
    );
  }
}
