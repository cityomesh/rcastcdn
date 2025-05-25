"use client";

import { useState, useEffect } from "react";
import {
  Button,
  MultiSelect,
  Paper,
  Group,
  Skeleton,
  Text,
  Stack,
  Alert,
  TextInput,
  Box,
  Title,
} from "@mantine/core";
import { v4 as uuidv4 } from "uuid";
import { useData } from "@/app/contexts/DataContext";
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

interface ValidationErrors {
  originUrl?: string;
  servers?: string;
  route_kind?: string;
  general?: string;
}

export default function RouteServerForm({ onSubmit }: RouteServerFormProps) {
  const { servers, loading } = useData();
  const [originUrl, setOriginUrl] = useState("");
  const [selectedServerIds, setSelectedServerIds] = useState<string[]>([]);
  const [selectedRouteKind, setSelectedRouteKind] = useState<string>(
    StreamType.HLS
  );
  const [edgeStreamExample, setEdgeStreamExample] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  // Extract route from URL when origin URL changes
  useEffect(() => {
    if (originUrl) {
      try {
        const url = new URL(originUrl);
        const path = url.pathname;
        // Set edge stream example based on the origin URL
        if (path) {
          setEdgeStreamExample(`http://edge-server.com${path}`);
        }
      } catch {
        // Invalid URL, clear the example
        setEdgeStreamExample("");
      }
    } else {
      setEdgeStreamExample("");
    }
  }, [originUrl]);

  const handleOriginUrlChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setOriginUrl(event.currentTarget.value);
    setValidationErrors({});
  };

  const handleServerChange = (values: string[]) => {
    setSelectedServerIds(values);
    setValidationErrors({});
  };

  const validateRouteAssignment = (): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Validate origin URL
    if (!originUrl) {
      errors.originUrl = "Origin stream URL is required";
      return errors;
    }

    try {
      new URL(originUrl);
    } catch {
      errors.originUrl = "Invalid URL format";
      return errors;
    }

    // Validate servers
    if (selectedServerIds.length === 0) {
      errors.servers = "At least one server must be selected";
      return errors;
    }

    // Validate stream type
    if (!Object.values(StreamType).includes(selectedRouteKind as StreamType)) {
      errors.route_kind = "Invalid stream type selected";
      return errors;
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors = validateRouteAssignment();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setSubmitting(true);

      // Parse the origin URL to extract components
      const url = new URL(originUrl);
      const path = url.pathname;

      // Extract server info
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

      // Prepare data in the format expected by the API
      const formattedData = {
        id: uuidv4(),
        priority: 0,
        route_kind: selectedRouteKind,
        from: path, // The path part of the URL
        to: originUrl, // The full origin URL
        servers: selectedServers,
      };

      await onSubmit(formattedData);

      // Reset form
      setOriginUrl("");
      setSelectedServerIds([]);
      setSelectedRouteKind(StreamType.HLS);
      setEdgeStreamExample("");
      setValidationErrors({});
    } catch (error) {
      setValidationErrors({
        general: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !servers) {
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

  const serverOptions = servers.map((server) => ({
    value: server.id,
    label: `${server.displayName} (${server.serverType})`,
    description: `${server.ipAddress}:${server.port}`,
  }));

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="xl">
        <Title order={3}>Re-streaming setup wizard</Title>

        {validationErrors.general && (
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            {validationErrors.general}
          </Alert>
        )}

        <Box>
          <Title order={4}>1. Origin stream URL:</Title>
          <TextInput
            placeholder="e.g. http://origin.server:8080/application/mystream/playlist.m3u8"
            value={originUrl}
            onChange={handleOriginUrlChange}
            error={validationErrors.originUrl}
            required
            mt="xs"
          />
        </Box>

        <Box>
          <Title order={4}>2. Select servers:</Title>
          <MultiSelect
            placeholder="Choose servers"
            data={serverOptions}
            value={selectedServerIds}
            onChange={handleServerChange}
            searchable
            required
            clearable
            maxDropdownHeight={400}
            nothingFoundMessage="No servers found"
            error={validationErrors.servers}
            mt="xs"
          />
        </Box>

        <Box>
          <Title order={4}>3. Stream URL(s) example:</Title>
          {edgeStreamExample ? (
            <Text mt="xs">{edgeStreamExample}</Text>
          ) : (
            <Text mt="xs" c="dimmed">
              Please, enter valid origin stream URL to see example of stream
              URL.
            </Text>
          )}
        </Box>

        <Group justify="space-between" mt="xl">
          <Button variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={submitting}
            disabled={!originUrl || selectedServerIds.length === 0}
          >
            Create re-streaming route
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
