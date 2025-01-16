import { NextResponse } from "next/server";
import { Client } from "ssh2";

// const SSH_CONFIG = {
//   host: process.env.SSH_HOST,
//   port: Number(process.env.SSH_PORT),
//   username: process.env.SSH_USERNAME,
//   password: process.env.SSH_PASSWORD,
// };
const SSH_CONFIG = {
  host: "202.62.72.221",
  port: 9229,
  username: "ulkaadminmini",
  password: "streamer#4066",
};

export async function GET() {
  return new Promise((resolve) => {
    const conn = new Client();

    conn.on("ready", () => {
      conn.exec("cat /etc/nimble/rules.conf", (err, stream) => {
        if (err) {
          conn.end();
          return resolve(
            NextResponse.json(
              {
                success: false,
                error: "Failed to read configuration file",
              },
              { status: 500 }
            )
          );
        }

        let data = "";

        stream.on("data", (chunk: string) => {
          data += chunk;
        });

        stream.on("end", () => {
          console.log("Raw file content:", data);

          try {
            const jsonString = data.split("\n").slice(1).join("\n");
            const rulesData = JSON.parse(jsonString);
            conn.end();
            resolve(
              NextResponse.json({
                success: true,
                data: rulesData,
              })
            );
          } catch (error: unknown) {
            console.error(error);
            conn.end();
            resolve(
              NextResponse.json(
                {
                  success: false,
                  error: "Failed to parse configuration file",
                  rawContent: data,
                },
                { status: 500 }
              )
            );
          }
        });
      });
    });

    conn.on("error", (err) => {
      console.error("SSH connection error details:", {
        message: err.message,

        level: err.level,
      });
      resolve(
        NextResponse.json(
          {
            success: false,
            error: `Connection failed: ${err.message}`,
          },
          { status: 500 }
        )
      );
    });

    conn.connect(SSH_CONFIG);
  });
}
