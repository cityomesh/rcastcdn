import { Client } from "ssh2";
import { Server } from "../types/server";

export async function executeSSHCommand(
  server: Server,
  command: string
): Promise<string> {
  const conn = new Client();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      conn.end();
      reject(new Error("Connection timeout"));
    }, 10000);

    conn.on("ready", () => {
      clearTimeout(timeout);
      conn.exec(command, (err, stream) => {
        if (err) {
          conn.end();
          reject(new Error(`Command execution failed: ${err.message}`));
          return;
        }

        let data = "";
        let errorData = "";

        stream.on("data", (chunk: string) => (data += chunk));
        stream.stderr.on("data", (chunk) => (errorData += chunk));

        stream.on("close", () => {
          conn.end();
          if (errorData) {
            reject(new Error(errorData));
          } else {
            resolve(data);
          }
        });
      });
    });

    conn.on("error", (err) => {
      clearTimeout(timeout);
      reject(new Error(`SSH connection failed: ${err.message}`));
    });

    conn.connect({
      host: server.ipAddress,
      port: server.port,
      username: server.sshUsername,
      password: server.sshPassword,
      readyTimeout: 5000,
      keepaliveInterval: 2000,
    });
  });
}

export async function writeConfigFile(
  server: Server,
  filePath: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any
): Promise<void> {
  const jsonContent = JSON.stringify(content, null, 2);
  const escapedContent = jsonContent.replace(/'/g, "'\\''");
  const command = `mkdir -p $(dirname '${filePath}') && echo '${escapedContent}' > '${filePath}'`;

  await executeSSHCommand(server, command);
}

export async function reloadNimble(server: Server): Promise<void> {
  await executeSSHCommand(server, "systemctl reload nimble");
}
