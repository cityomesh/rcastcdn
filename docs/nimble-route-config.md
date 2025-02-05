# Nimble Route Configuration Guide

## Overview

This document outlines the configuration and relationships between servers, routes, and route-server assignments in the Nimble streaming system.

## Components

### 1. Server Configuration

Servers represent both origin and edge nodes in the streaming infrastructure.

```typescript
interface Server {
  id: string; // Unique identifier
  displayName: string; // Friendly name for the server
  ipAddress: string; // Edge server's IP address
  sshUsername: string; // SSH credentials for server management
  sshPassword: string; // SSH credentials for server management
  port: number; // Edge server's listening port
  originIpWithPort: string; // Origin server's IP:PORT (e.g., "192.168.1.1:8080")
  createdAt: string; // Creation timestamp in ISO format
}
```

### 2. Routes

Routes define the paths and origins for content delivery.

```typescript
interface Route {
  host: string; // Domain name (e.g., "streaming.example.com")
  path: string; // Public access path (e.g., "/live/stream1")
  origin: string; // Origin server URL (e.g., "http://192.168.1.1")
  origin_path: string; // Path on origin server (e.g., "/source/stream1")
  use_ssl: string; // SSL configuration ("yes" or "no")
  geo: string; // Geographic routing configuration
  range: string; // IP range restrictions
  playlist_caching_interval: string; // Caching interval for playlists
}
```

### 3. Route-Server Assignments

Route-server assignments map routes to specific edge servers.

```typescript
interface RouteServerAssignment {
  id?: string; // Optional unique identifier
  priority: number; // Route priority (higher number = higher priority)
  route_kind: string; // Stream type ("HLS", "DASH", "RTMP", etc.)
  from: string; // Public access path (must match Route.path)
  to: string; // Full origin path (must match Route.origin + Route.origin_path)
  servers: Server[]; // Array of edge servers handling this route
}
```

## Field Relationships

### Origin Server Configuration

- Origin server is defined in `Server.originIpWithPort`
- Format must be `"ip_address:port"` (e.g., "192.168.1.1:8080")
- This server hosts the original streaming content

### Edge Server Configuration

- Edge servers are defined by `Server.ipAddress` and `Server.port`
- SSH access (`sshUsername` and `sshPassword`) is required for server management
- Each edge server must have a valid origin server configuration

### Route Mapping

1. Public Access Path

   - Defined in `Route.path`
   - Must match exactly with `RouteServerAssignment.from`
   - Example: `"/live/stream1"`

2. Origin Path
   - Created by combining `Route.origin` and `Route.origin_path`
   - Must match exactly with `RouteServerAssignment.to`
   - Example: `"http://192.168.1.1/source/stream1"`

## Example Configuration

```typescript
// Example Server Configuration
const server = {
  id: "server1",
  displayName: "Edge-1",
  ipAddress: "10.0.0.1",
  port: 8080,
  sshUsername: "admin",
  sshPassword: "secure_password",
  originIpWithPort: "192.168.1.1:8080",
  createdAt: "2024-03-20T12:00:00Z",
};

// Example Route Configuration
const route = {
  host: "streaming.example.com",
  path: "/live/stream1",
  origin: "http://192.168.1.1",
  origin_path: "/source/stream1",
  use_ssl: "yes",
  geo: "",
  range: "",
  playlist_caching_interval: "5",
};

// Example Route-Server Assignment
const assignment = {
  id: "assignment1",
  priority: 1,
  route_kind: "HLS",
  from: "/live/stream1",
  to: "http://192.168.1.1/source/stream1",
  servers: [server],
};
```

## Validation Rules

1. Route Path Matching

   - `RouteServerAssignment.from` must exactly match an existing `Route.path`
   - Case-sensitive matching is required
   - Leading/trailing slashes must match

2. Origin Path Matching

   - `RouteServerAssignment.to` must match the concatenation of `Route.origin` and `Route.origin_path`
   - Protocol (http/https) must be consistent
   - No double slashes allowed in path combination

3. Server Origin Matching
   - Edge server's `originIpWithPort` must match the IP and port from the route's origin server
   - Protocol is not included in `originIpWithPort`

## Best Practices

1. Server Naming

   - Use descriptive `displayName` for servers (e.g., "Edge-London-01")
   - Include location or purpose in the name
   - Maintain consistent naming convention

2. Route Organization

   - Group related streams under common path prefixes
   - Use consistent naming conventions
   - Document path structure

3. Security
   - Use strong SSH credentials
   - Implement IP range restrictions where needed
   - Enable SSL for public access
   - Regularly rotate credentials

## Troubleshooting

Common issues and solutions:

1. Route Not Found

   - Verify exact path matching between route and assignment
   - Check for case sensitivity issues
   - Verify leading/trailing slashes
   - Confirm route exists in configuration

2. Origin Connection Failed

   - Verify origin server IP and port are correct
   - Check network connectivity between edge and origin
   - Verify SSH credentials are valid
   - Check firewall rules

3. Stream Not Accessible
   - Verify edge server configuration
   - Check route-server assignment priority
   - Verify access permissions
   - Check SSL configuration if enabled
