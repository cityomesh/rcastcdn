import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import {
  writeConfigFile,
  reloadNimble,
  executeSSHCommand,
} from "@/app/utils/ssh";
import { Server, Route } from "@/app/types/server";

const SERVERS_FILE = path.join(process.cwd(), "data", "servers.json");
const ROUTES_FILE = path.join(process.cwd(), "data", "routes.json");

// Ensure data files exist
const ensureDataFiles = () => {
  const dir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  if (!fs.existsSync(ROUTES_FILE)) {
    fs.writeFileSync(ROUTES_FILE, JSON.stringify([]));
  }
};

// GET /api/servers/routes
export async function GET() {
  try {
    ensureDataFiles();
    const data = fs.readFileSync(ROUTES_FILE, "utf-8");
    const routes: Route[] = JSON.parse(data);

    return NextResponse.json({
      success: true,
      data: routes,
    });
  } catch (error) {
    console.error("Error fetching routes:", error);
    return NextResponse.json(
      { error: "Failed to fetch routes" },
      { status: 500 }
    );
  }
}

// POST /api/servers/routes
export async function POST(request: NextRequest) {
  try {
    const { serverId, route } = await request.json();

    if (!serverId || !route) {
      return NextResponse.json(
        { error: "Server ID and route configuration are required" },
        { status: 400 }
      );
    }

    // Read server data
    const serverData = fs.readFileSync(SERVERS_FILE, "utf-8");
    const servers: Server[] = JSON.parse(serverData);
    const server = servers.find((s) => s.id === serverId);

    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    // Validate route
    if (!route.path || !route.origin || !route.origin_path) {
      return NextResponse.json(
        { error: "Missing required route fields" },
        { status: 400 }
      );
    }

    // Validate origin matches server's configuration
    const [originIp] = server.originIpWithPort.split(":");
    if (!route.origin.includes(originIp)) {
      return NextResponse.json(
        {
          error: "Route origin must match server's origin IP configuration",
          expected: server.originIpWithPort,
          received: route.origin,
        },
        { status: 400 }
      );
    }

    // Add ID to route
    const newRoute: Route = {
      id: uuidv4(),
      ...route,
      use_ssl: route.use_ssl || false,
      playlist_caching_interval: route.playlist_caching_interval || "2",
    };

    // Save route to file
    ensureDataFiles();
    const routesData = fs.readFileSync(ROUTES_FILE, "utf-8");
    const routes: Route[] = JSON.parse(routesData);
    routes.push(newRoute);
    fs.writeFileSync(ROUTES_FILE, JSON.stringify(routes, null, 2));

    // Write route configuration to server
    const routeConfig = {
      path: newRoute.path,
      origin: newRoute.origin,
      origin_path: newRoute.origin_path,
      use_ssl: newRoute.use_ssl,
      playlist_caching_interval: newRoute.playlist_caching_interval,
    };

    await writeConfigFile(
      server,
      `/etc/nimble/routes.d/${newRoute.id}.conf`,
      routeConfig
    );

    // Reload Nimble
    await reloadNimble(server);

    return NextResponse.json({
      success: true,
      data: newRoute,
    });
  } catch (error) {
    console.error("Error creating route:", error);
    return NextResponse.json(
      { error: "Failed to create route" },
      { status: 500 }
    );
  }
}

// DELETE /api/servers/routes?serverId=xxx&routeId=yyy
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serverId = searchParams.get("serverId");
    const routeId = searchParams.get("routeId");

    if (!serverId || !routeId) {
      return NextResponse.json(
        { error: "Server ID and Route ID are required" },
        { status: 400 }
      );
    }

    // Read server data
    const serverData = fs.readFileSync(SERVERS_FILE, "utf-8");
    const servers: Server[] = JSON.parse(serverData);
    const server = servers.find((s) => s.id === serverId);

    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    // Remove route file from server
    await executeSSHCommand(
      server,
      `rm -f /etc/nimble/routes.d/${routeId}.conf`
    );

    // Remove route from local file
    const routesData = fs.readFileSync(ROUTES_FILE, "utf-8");
    let routes: Route[] = JSON.parse(routesData);
    routes = routes.filter((r) => r.id !== routeId);
    fs.writeFileSync(ROUTES_FILE, JSON.stringify(routes, null, 2));

    // Reload Nimble
    await reloadNimble(server);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting route:", error);
    return NextResponse.json(
      { error: "Failed to delete route" },
      { status: 500 }
    );
  }
}
