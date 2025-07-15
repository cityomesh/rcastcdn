export interface Server {
  id: string;
  displayName: string;
  ipAddress: string;
  sshUsername: string;
  sshPassword: string;
  port: number;
  originIpWithPort: string;
  createdAt: string;
  serverType: "origin" | "edge";
  parentServerId?: string; // Reference to parent server ID if this is an edge server
  status?: "online" | "offline" | "error";
  lastChecked?: string;
}

export interface RouteServerAssignment {
  id?: string;
  priority: number;
  route_kind: string;
  from: string;
  to: string;
  servers: Server[];
  source?: string; // Optional field to indicate source: 'local' or 'rules_conf'
}

export enum StreamType {
  DASH = "DASH",
  HLS = "HLS",
  CMAF = "CMAF",
}

export interface Route {
  id: string;
  path: string;
  origin: string;
  origin_path: string;
  use_ssl: boolean;
  playlist_caching_interval: string;
}

export interface VODConfig {
  vod_root_path: string;
  allowed_extensions: string[];
  cache_time: number;
}

export interface ServerHealth {
  status: "online" | "offline" | "error";
  diskSpace?: string;
  error?: string;
  lastChecked: string;
}
