"use client";

import { useState } from "react";
import {
  Button,
  MultiSelect,
  Select,
  Paper,
  Group,
  Skeleton,
  Divider,
  Text,
  Stack,
  Alert,
} from "@mantine/core";
import { v4 as uuidv4 } from "uuid";
import { useData } from "@/app/contexts/DataContext";
import { ComboboxItem } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { StreamType } from "@/app/types/server";

interface RouteServerAssignment {
  id?: string;
  priority: number;
  route_kind: string;
  from: string;
  to: string;
  servers: Array<{
    id: string;
    displayName: string;
    ipAddress: string;
    port: number;
    originIpWithPort: string;
  }>;
}

interface RouteServerFormProps {
  onSubmit: (values: RouteServerAssignment) => void;
}

interface RouteOption {
  value: string;
  label: string;
}

interface ValidationErrors {
  from?: string;
  to?: string;
  servers?: string;
  route_kind?: string;
  general?: string;
}

export default function RouteServerForm({ onSubmit }: RouteServerFormProps) {
  const { routes, servers, loading } = useData();
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedServerIds, setSelectedServerIds] = useState<string[]>([]);
  const [selectedRouteKind, setSelectedRouteKind] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  const handleRouteChange = (value: string | null) => {
    setSelectedRoute(value || "");
    setValidationErrors({});
  };

  const handleServerChange = (values: string[]) => {
    setSelectedServerIds(values);
    setValidationErrors({});
  };

  const handleRouteKindChange = (value: string | null) => {
    setSelectedRouteKind(value || "");
    setValidationErrors({});
  };

  const validateRouteAssignment = (
    values: RouteServerAssignment
  ): ValidationErrors => {
    const errors: ValidationErrors = {};

    // 1. Validate route kind
    if (!Object.values(StreamType).includes(values.route_kind as StreamType)) {
      errors.route_kind = "Invalid stream type selected";
      return errors;
    }

    // 2. Find matching route
    const matchingRoute = routes.find((route) => route.path === values.from);
    if (!matchingRoute) {
      errors.from = "No matching route found";
      return errors;
    }

    // 3. Validate 'to' field matches origin
    const expectedTo = `${matchingRoute.origin}${matchingRoute.origin_path}`;
    if (values.to !== expectedTo) {
      errors.to = "Origin path mismatch";
      return errors;
    }

    // 4. Validate servers have correct origin configuration
    for (const serverRef of values.servers) {
      const fullServer = servers.find((s) => s.id === serverRef.id);
      if (!fullServer) {
        errors.servers = "Server not found";
        return errors;
      }

      const [originIp] = fullServer.originIpWithPort.split(":");
      if (!matchingRoute.origin.includes(originIp)) {
        errors.servers = `Server ${fullServer.displayName} has mismatched origin IP`;
        return errors;
      }
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedRoute ||
      selectedServerIds.length === 0 ||
      !selectedRouteKind
    ) {
      return;
    }

    try {
      setSubmitting(true);
      const [from, to] = selectedRoute.split("|");

      const selectedServers = selectedServerIds.map((id) => {
        const server = servers.find((s) => s.id === id);
        if (!server) throw new Error(`Server not found: ${id}`);
        return {
          id,
          displayName: server.displayName,
          ipAddress: server.ipAddress,
          port: server.port,
          originIpWithPort: server.originIpWithPort,
        };
      });

      const formattedData = {
        id: uuidv4(),
        priority: 0,
        route_kind: selectedRouteKind,
        from,
        to,
        servers: selectedServers,
      };

      const errors = validateRouteAssignment(formattedData);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      await onSubmit(formattedData);

      // Reset form
      setSelectedRoute("");
      setSelectedServerIds([]);
      setSelectedRouteKind("");
      setValidationErrors({});
    } catch (error) {
      setValidationErrors({
        general: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !routes || !servers) {
    return (
      <Paper p="md" withBorder>
        <Skeleton height={70} mb="md" />
        <Skeleton height={4} width="30%" mb="xl" />
        <Skeleton height={70} mb="md" />
        <Skeleton height={4} width="30%" mb="xl" />
        <Group justify="flex-end">
          <Skeleton height={36} width={120} />
        </Group>
      </Paper>
    );
  }

  console.log("Routes data received:", routes);

  // First, deduplicate routes based on path and origin
  const uniqueRoutes = new Map();
  routes.forEach((route) => {
    const key = `${route.path}|${route.origin}${route.origin_path}`;
    if (!uniqueRoutes.has(key)) {
      uniqueRoutes.set(key, route);
    }
  });

  console.log("Unique routes:", Array.from(uniqueRoutes.values()));

  // Group unique routes by host
  const routesByHost = Array.from(uniqueRoutes.values()).reduce(
    (acc, route) => {
      const host = route.host || "No Host";
      if (!acc[host]) {
        acc[host] = [];
      }
      acc[host].push({
        value: `${route.path}|${route.origin}${route.origin_path}`,
        label: `${route.path} → ${route.origin}${route.origin_path}`,
      });
      return acc;
    },
    {} as Record<string, RouteOption[]>
  );

  console.log("Routes by host:", routesByHost);

  // Convert to Mantine's group format
  const routeOptions = Object.entries(routesByHost).map(([host, items]) => ({
    group: host,
    items: items as ComboboxItem[],
  }));

  const serverOptions = servers.map((server) => ({
    value: server.id,
    label: server.displayName,
    description: `${server.ipAddress}:${server.port}`,
  }));

  const streamTypeOptions = Object.values(StreamType).map((type) => ({
    value: type,
    label: type,
  }));

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {validationErrors.general && (
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            {validationErrors.general}
          </Alert>
        )}

        <Select
          label="Select Route"
          description="Choose a route to assign servers to"
          placeholder="Choose a route"
          data={routeOptions}
          value={selectedRoute}
          onChange={handleRouteChange}
          searchable
          required
          clearable
          maxDropdownHeight={400}
          nothingFoundMessage="No routes found"
          error={
            validationErrors.from ||
            (!selectedRoute ? "Route is required" : null)
          }
          mb="md"
        />

        <Select
          label="Stream Type"
          description="Select the type of stream"
          placeholder="Choose stream type"
          data={streamTypeOptions}
          value={selectedRouteKind}
          onChange={handleRouteKindChange}
          required
          clearable
          error={
            validationErrors.route_kind ||
            (!selectedRouteKind ? "Stream type is required" : null)
          }
          mb="md"
        />

        <Divider my="md" variant="dashed" />

        <MultiSelect
          label="Select Servers"
          description="Choose one or more servers to handle this route"
          placeholder="Choose servers"
          data={serverOptions}
          value={selectedServerIds}
          onChange={handleServerChange}
          searchable
          required
          clearable
          maxDropdownHeight={400}
          nothingFoundMessage="No servers found"
          error={
            validationErrors.servers ||
            (selectedServerIds.length === 0
              ? "At least one server must be selected"
              : null)
          }
          mb="md"
        />

        {validationErrors.to && (
          <Text c="red" size="sm">
            {validationErrors.to}
          </Text>
        )}

        <Group justify="flex-end" mt="xl">
          <Button
            type="submit"
            loading={submitting}
            disabled={
              !selectedRoute ||
              selectedServerIds.length === 0 ||
              !selectedRouteKind
            }
          >
            Create Assignment
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
