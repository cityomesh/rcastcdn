"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Container,
  Title,
  Paper,
  Group,
  Button,
  Text,
  Loader,
  Stack,
  TextInput,
  NumberInput,
  MultiSelect,
  Divider,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { RouteServerAssignment, StreamType } from "@/app/types/server";
import { api } from "@/app/utils/api";

interface ServerOption {
  value: string;
  label: string;
  description?: string;
}

// Component that uses useSearchParams
function RouteServerEdit() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverOptions, setServerOptions] = useState<ServerOption[]>([]);
  const [streamExample, setStreamExample] = useState<string>("");

  const form = useForm({
    initialValues: {
      id: "",
      priority: 10,
      originUrl: "",
      servers: [] as string[],
    },
    validate: {
      originUrl: (value) => {
        if (!value) return "Origin stream URL is required";
        try {
          new URL(value);
          return null;
        } catch {
          return "Please enter a valid URL (including http:// or https://)";
        }
      },
      servers: (value) =>
        value.length > 0 ? null : "At least one server must be selected",
    },
  });

  // Update stream example whenever origin URL changes
  useEffect(() => {
    try {
      const url = new URL(form.values.originUrl);
      const path = url.pathname;
      if (path) {
        setStreamExample(`http://server.com${path}`);
      } else {
        setStreamExample("");
      }
    } catch {
      setStreamExample("");
    }
  }, [form.values.originUrl]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id && id !== "") {
        router.push("/");
        return;
      }

      try {
        setLoading(true);

        // Fetch servers for the dropdown
        const serversResult = await api.get("api/servers");

        if (serversResult.success) {
          // Include all servers (both origin and edge)
          const options = serversResult.data.map(
            (server: {
              id: string;
              displayName: string;
              ipAddress: string;
              port: number;
              serverType: string;
            }) => ({
              value: server.id,
              label: `${server.displayName} (${server.serverType})`,
              description: `${server.ipAddress}:${server.port}`,
            })
          );
          setServerOptions(options);
        }

        if (id) {
          const assignmentsResult = await api.get("api/route-servers");

          if (assignmentsResult.success) {
            const assignment = assignmentsResult.data.find(
              (a: RouteServerAssignment) => a.id === id
            );

            if (assignment) {
              form.setValues({
                id: assignment.id || "",
                priority: assignment.priority,
                originUrl: assignment.to,
                servers: assignment.servers.map(
                  (server: { id: string; displayName: string }) => server.id
                ),
              });
            } else {
              notifications.show({
                title: "Error",
                message: "Re-streaming route not found",
                color: "red",
              });
              router.push("/");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        notifications.show({
          title: "Error",
          message: "An error occurred while loading data",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setSaving(true);

      let fromPath = "";
      try {
        const url = new URL(values.originUrl);
        fromPath = url.pathname;
      } catch {
        notifications.show({
          title: "Error",
          message: "Invalid URL format",
          color: "red",
        });
        return;
      }

      const selectedServers = values.servers.map((serverId: string) => {
        const server = serverOptions.find(
          (opt: ServerOption) => opt.value === serverId
        );
        return {
          id: serverId,
          displayName: server?.label || "Unknown",
          ipAddress: server?.description?.split(":")[0] || "",
          port: parseInt(server?.description?.split(":")[1] || "0", 10),
          originIpWithPort: "", // This field is required by the API but not used in our new flow
        };
      });

      const payload = {
        id: values.id,
        priority: values.priority,
        route_kind: StreamType.HLS, // Default to HLS as in the creation flow
        from: fromPath, // Path component of the URL
        to: values.originUrl, // Full origin URL
        servers: selectedServers,
      };

      const result = await api.post("api/route-servers", payload);

      if (result.success) {
        notifications.show({
          title: "Success",
          message: "Re-streaming route saved successfully",
          color: "green",
        });
        router.push("/");
      } else {
        notifications.show({
          title: "Error",
          message: result.error || "Failed to save re-streaming route",
          color: "red",
        });
      }
    } catch (error) {
      console.error("Error saving route:", error);
      notifications.show({
        title: "Error",
        message: "An error occurred while saving",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container size="md" py="xl">
        <Stack align="center" justify="center" h="60vh">
          <Loader size="lg" />
          <Text>Loading...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Paper p="xl" shadow="sm" radius="md" withBorder>
        <Group justify="space-between" mb="lg">
          <Title order={3}>{id ? "Edit" : "Add"} Re-streaming Route</Title>
          <Button
            leftSection={<IconArrowLeft size={14} />}
            variant="outline"
            onClick={() => router.push("/")}
          >
            Cancel
          </Button>
        </Group>

        <Divider mb="xl" />

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg">
            <Text>
              Edit the re-streaming setup for servers. Enter the origin stream
              URL and select which servers should re-stream this content.
            </Text>

            <Box>
              <Title order={5}>1. Origin stream URL:</Title>
              <TextInput
                placeholder="e.g. http://origin.server:8080/application/mystream/playlist.m3u8"
                {...form.getInputProps("originUrl")}
                required
                mt="xs"
              />
            </Box>

            <Box>
              <Title order={5}>2. Select servers:</Title>
              <MultiSelect
                placeholder="Choose servers"
                data={serverOptions}
                {...form.getInputProps("servers")}
                required
                searchable
                clearable
                mt="xs"
              />
            </Box>

            <Box>
              <Title order={5}>3. Stream URL example:</Title>
              {streamExample ? (
                <Text mt="xs">{streamExample}</Text>
              ) : (
                <Text mt="xs" c="dimmed">
                  Please enter a valid origin stream URL to see example of
                  stream URL.
                </Text>
              )}
            </Box>

            <NumberInput
              label="Priority (Optional)"
              description="Lower number means higher priority"
              placeholder="10"
              min={0}
              max={100}
              {...form.getInputProps("priority")}
            />

            <Group justify="flex-end" mt="xl">
              <Button
                type="submit"
                leftSection={<IconDeviceFloppy size={14} />}
                loading={saving}
              >
                Save Re-streaming Route
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

// Main page component with Suspense
export default function RouteServerEditPage() {
  return (
    <Suspense
      fallback={
        <Container size="md" py="xl">
          <Stack align="center" justify="center" h="60vh">
            <Loader size="lg" />
            <Text>Loading...</Text>
          </Stack>
        </Container>
      }
    >
      <RouteServerEdit />
    </Suspense>
  );
}
