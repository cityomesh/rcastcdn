import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface Server {
  id: string;
  displayName: string;
  ipAddress: string;
  port: number;
  originIpWithPort: string;
}

interface Route {
  host: string;
  path: string;
  origin: string;
  origin_path: string;
  use_ssl: string;
  geo: string;
  range: string;
  playlist_caching_interval: string;
}

interface RouteServerAssignment {
  id?: string;
  priority: number;
  route_kind: string;
  from: string;
  to: string;
  servers: Server[];
}

const DATA_FILE = path.join(process.cwd(), "data", "route-servers.json");
const SERVERS_FILE = path.join(process.cwd(), "data", "servers.json");

const ensureDataDir = () => {
  const dir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  // Ensure all required JSON files exist
  const files = {
    [DATA_FILE]: [],
    [SERVERS_FILE]: [],
  };

  Object.entries(files).forEach(([file, defaultContent]) => {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(defaultContent));
    }
  });
};

export async function GET() {
  try {
    ensureDataDir();
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    const assignments = JSON.parse(data);
    return NextResponse.json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    console.error("Error fetching route-server assignments:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch route-server assignments",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    ensureDataDir();
    const assignment = await request.json();
    console.log("Received assignment:", assignment);

    // 1. Validate required fields
    if (
      !assignment.from ||
      !assignment.to ||
      !assignment.servers ||
      !assignment.route_kind
    ) {
      console.log("Missing required fields:", {
        from: !!assignment.from,
        to: !!assignment.to,
        servers: !!assignment.servers,
        route_kind: !!assignment.route_kind,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: from, to, servers, route_kind",
        },
        { status: 400 }
      );
    }

    // 2. Load routes and servers data
    const [routesResponse, serversData] = await Promise.all([
      fetch("http://localhost:3000/api/rules"),
      fs.promises.readFile(SERVERS_FILE, "utf-8"),
    ]);

    if (!routesResponse.ok) {
      throw new Error("Failed to fetch routes from SSH");
    }

    const rulesData = await routesResponse.json();
    const routes: Route[] = rulesData.data?.SyncResponse?.Routes || [];
    const servers: Server[] = JSON.parse(serversData);

    console.log("Loaded data:", {
      routesCount: routes.length,
      serversCount: servers.length,
      routes: routes,
    });

    // 3. Validate route path matching
    const matchingRoute = routes.find(
      (route) => route.path === assignment.from
    );
    if (!matchingRoute) {
      console.log("No matching route found for path:", assignment.from);
      console.log(
        "Available routes:",
        routes.map((r) => r.path)
      );
      return NextResponse.json(
        {
          success: false,
          error: "No matching route found for the given path",
        },
        { status: 400 }
      );
    }

    // 4. Validate origin path matching
    const expectedTo = `${matchingRoute.origin}${matchingRoute.origin_path}`;
    if (assignment.to !== expectedTo) {
      console.log("Origin path mismatch:", {
        expected: expectedTo,
        received: assignment.to,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Origin path mismatch. Expected: " + expectedTo,
        },
        { status: 400 }
      );
    }

    // 5. Validate server origin matching
    for (const serverRef of assignment.servers) {
      const server = servers.find((s) => s.id === serverRef.id);
      if (!server) {
        console.log("Server not found:", serverRef.id);
        return NextResponse.json(
          {
            success: false,
            error: `Server not found: ${serverRef.id}`,
          },
          { status: 400 }
        );
      }

      const [originIp] = server.originIpWithPort.split(":");
      if (!matchingRoute.origin.includes(originIp)) {
        console.log("Origin IP mismatch:", {
          serverOriginIp: originIp,
          routeOrigin: matchingRoute.origin,
          serverName: server.displayName,
        });
        return NextResponse.json(
          {
            success: false,
            error: `Server origin IP mismatch for server: ${server.displayName}`,
          },
          { status: 400 }
        );
      }
    }

    // 6. Save the assignment
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    const assignments: RouteServerAssignment[] = JSON.parse(data);

    const index = assignments.findIndex((a) => a.id === assignment.id);
    if (index !== -1) {
      assignments[index] = assignment;
    } else {
      assignments.push(assignment);
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(assignments, null, 2));

    return NextResponse.json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error("Error saving route-server assignment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save route-server assignment",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    ensureDataDir();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Assignment ID is required",
        },
        { status: 400 }
      );
    }

    const data = fs.readFileSync(DATA_FILE, "utf-8");
    const assignments: RouteServerAssignment[] = JSON.parse(data);

    // Find and remove the assignment
    const index = assignments.findIndex((a) => a.id === id);
    if (index === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Assignment not found",
        },
        { status: 404 }
      );
    }

    assignments.splice(index, 1);

    fs.writeFileSync(DATA_FILE, JSON.stringify(assignments, null, 2));

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting route-server assignment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete route-server assignment",
      },
      { status: 500 }
    );
  }
}
