// //app/api/restart-server/route.ts
// import { NextResponse } from "next/server";
// import { exec } from "child_process";
// import util from "util";

// const execPromise = util.promisify(exec);

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const { serverId } = body;

//     if (!serverId) {
//       return NextResponse.json({ success: false, error: "Missing serverId" }, { status: 400 });
//     }

//     const sshUser = "speedtest";
//     const serverIp = "202.62.72.221";
//     const sshPort = 9229;
//     const serviceName = "nimble";

//     const command = `ssh -p ${sshPort} ${sshUser}@${serverIp} "sudo service ${serviceName} restart"`;
//     console.log("Executing:", command);

//     const { stdout, stderr } = await execPromise(command);

//     return NextResponse.json({
//       success: true,
//       message: `Restart executed successfully on ${serverIp}`,
//       output: stdout || stderr,
//     });
//   } catch (error: any) {
//     console.error("Error restarting server:", error);
//     return NextResponse.json(
//       { success: false, error: error.message || "Failed to restart server" },
//       { status: 500 }
//     );
//   }
// }


// // import { NextResponse } from "next/server";

// // export async function POST(request: Request) {
// //   try {
// //     const { ipAddress } = await request.json();

// //     if (!ipAddress) {
// //       return NextResponse.json(
// //         { success: false, message: "IP Address missing" },
// //         { status: 400 }
// //       );
// //     }

// //     // Nimble Streamer Config Reload URL
// //     const reloadConfigUrl = `http://${ipAddress}:8083/manage/reload_config`;

// //     // POST to Nimble Streamer directly
// //     const response = await fetch(reloadConfigUrl, {
// //       method: "POST",
// //     });

// //     if (!response.ok) {
// //       throw new Error(`Reload failed with status ${response.status}`);
// //     }

// //     // ✅ If you want also SSL reload, uncomment this:
// //     // const reloadSSLUrl = `http://${ipAddress}:8082/manage/reload_ssl_certificates`;
// //     // await fetch(reloadSSLUrl, { method: "POST" });

// //     return NextResponse.json({
// //       success: true,
// //       message: `Config reloaded successfully for ${ipAddress}`,
// //     });
// //   } catch (error: any) {
// //     console.error("Reload Error:", error);
// //     return NextResponse.json({
// //       success: false,
// //       message: error.message || "Reload failed",
// //     });
// //   }
// // }


// app/api/restart-server/route.ts
import { NextResponse } from "next/server";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { serverId, ipAddress, sshUsername, port, serviceName } = body;

    // Validate required fields
    if (!serverId || !ipAddress || !sshUsername || !port || !serviceName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Construct the SSH command dynamically
    const command = `ssh -p ${port} ${sshUsername}@${ipAddress} "sudo service ${serviceName} restart"`;
    console.log("Executing:", command);

    const { stdout, stderr } = await execPromise(command);

    return NextResponse.json({
      success: true,
      message: `Restart executed successfully on ${ipAddress}`,
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
