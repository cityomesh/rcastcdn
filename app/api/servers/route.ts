import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface Server {
  id: string;
  displayName: string;
  ipAddress: string;
  sshUsername: string;
  sshPassword: string;
  port: number;
  originIpWithPort: string;
  createdAt: string;
  serverType: "origin" | "edge";
  parentServerId?: string;
}

const DATA_FILE = path.join(process.cwd(), "data", "servers.json");

// Ensure data directory exists
const ensureDataDir = () => {
  const dir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
};

// GET /api/servers
export async function GET() {
  try {
    ensureDataDir();
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    const servers = JSON.parse(data);
    return NextResponse.json({
      success: true,
      data: servers,
    });
  } catch (error: unknown) {
    console.error("Error fetching servers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch servers",
      },
      { status: 500 }
    );
  }
}

// POST /api/servers
export async function POST(request: Request) {
  try {
    ensureDataDir();
    const data = await request.json();

    // Validate required fields
    const requiredFields = [
      "displayName",
      "ipAddress",
      "sshUsername",
      "sshPassword",
      "port",
      "originIpWithPort",
      "serverType",
    ];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate server type
    if (!["origin", "edge"].includes(data.serverType)) {
      return NextResponse.json(
        { error: "Server type must be either 'origin' or 'edge'" },
        { status: 400 }
      );
    }

    // If it's an edge server, verify parent server exists
    if (data.serverType === "edge" && data.parentServerId) {
      const existingServers = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      const parentServer = existingServers.find(
        (server: Server) => server.id === data.parentServerId
      );

      if (!parentServer) {
        return NextResponse.json(
          { error: "Parent server not found" },
          { status: 400 }
        );
      }

      // Prevent circular references
      let currentParentId = data.parentServerId;
      let depth = 0;
      const maxDepth = 10; // Safeguard against very deep hierarchies

      while (currentParentId && depth < maxDepth) {
        const parent = existingServers.find(
          (server: Server) => server.id === currentParentId
        );

        if (!parent) break;

        if (parent.id === data.id) {
          // Circular reference
          return NextResponse.json(
            { error: "Circular server reference detected" },
            { status: 400 }
          );
        }

        currentParentId = parent.parentServerId;
        depth++;
      }
    }

    // Validate port range
    if (data.port < 1 || data.port > 65535) {
      return NextResponse.json(
        { error: "Port must be between 1 and 65535" },
        { status: 400 }
      );
    }

    // Validate IP address format
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(data.ipAddress)) {
      return NextResponse.json(
        { error: "Invalid IP address format" },
        { status: 400 }
      );
    }

    // Validate originIpWithPort format
    const ipPortRegex = /^(\d{1,3}\.){3}\d{1,3}:\d{1,5}$/;
    if (!ipPortRegex.test(data.originIpWithPort)) {
      return NextResponse.json(
        { error: "Invalid origin IP:Port format (e.g., 192.168.1.1:8080)" },
        { status: 400 }
      );
    }
    const [ipPart, portPart] = data.originIpWithPort.split(":");
    // Validate IP part
    const ipOctets = ipPart.split(".").map(Number);
    const isValidIp = ipOctets.every(
      (octet: number) => octet >= 0 && octet <= 255
    );
    if (!isValidIp) {
      return NextResponse.json(
        { error: "Invalid origin IP address format" },
        { status: 400 }
      );
    }
    // Validate port part
    const portNum = parseInt(portPart);
    if (portNum < 1 || portNum > 65535) {
      return NextResponse.json(
        { error: "Origin port must be between 1 and 65535" },
        { status: 400 }
      );
    }

    // Read existing servers
    const existingData = fs.readFileSync(DATA_FILE, "utf-8");
    const servers = JSON.parse(existingData);

    // Add new server with ID and timestamp
    const newServer = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
    };

    servers.push(newServer);

    // Save updated servers
    fs.writeFileSync(DATA_FILE, JSON.stringify(servers, null, 2));

    return NextResponse.json(newServer, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating server:", error);
    return NextResponse.json(
      { error: "Failed to create server" },
      { status: 500 }
    );
  }
}

// DELETE /api/servers
export async function DELETE(request: Request) {
  try {
    ensureDataDir();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Server ID is required" },
        { status: 400 }
      );
    }

    // Read existing servers
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    const servers = JSON.parse(data);

    // Find server index
    const serverIndex = servers.findIndex((server: Server) => server.id === id);
    if (serverIndex === -1) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    // Remove the server
    servers.splice(serverIndex, 1);

    // Save updated servers
    fs.writeFileSync(DATA_FILE, JSON.stringify(servers, null, 2));

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting server:", error);
    return NextResponse.json(
      { error: "Failed to delete server" },
      { status: 500 }
    );
  }
}
