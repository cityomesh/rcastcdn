"use client";

import { useEffect, useState } from "react";
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
  Select,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { RouteServerAssignment } from "@/app/components/NimbleHomeContent/nimble-home-content.types";
import { StreamType } from "@/app/types/server";

interface ServerOption {
  value: string;
  label: string;
}

export default function RouteServerEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverOptions, setServerOptions] = useState<ServerOption[]>([]);

  const form = useForm({
    initialValues: {
      id: "",
      priority: 10,
      route_kind: "HLS",
      from: "",
      to: "",
      servers: [] as string[],
    },
    validate: {
      from: (value) => (value ? null : "Request path is required"),
      to: (value) => (value ? null : "Redirect path is required"),
      servers: (value) =>
        value.length > 0 ? null : "At least one server must be selected",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id && id !== "") {
        router.push("/");
        return;
      }

      try {
        setLoading(true);

        // Fetch servers for the dropdown
        const serversResponse = await fetch("/api/servers");
        const serversResult = await serversResponse.json();

        if (serversResult.success) {
          const options = serversResult.data.map(
            (server: { id: string; displayName: string }) => ({
              value: server.id,
              label: server.displayName,
            })
          );
          setServerOptions(options);
        }

        // If editing existing assignment, fetch details
        if (id) {
          const assignmentsResponse = await fetch("/api/route-servers");
          const assignmentsResult = await assignmentsResponse.json();

          if (assignmentsResult.success) {
            const assignment = assignmentsResult.data.find(
              (a: RouteServerAssignment) => a.id === id
            );

            if (assignment) {
              // Update form values
              form.setValues({
                id: assignment.id || "",
                priority: assignment.priority,
                route_kind: assignment.route_kind,
                from: assignment.from,
                to: assignment.to,
                servers: assignment.servers.map(
                  (server: { id: string; displayName: string }) => server.id
                ),
              });
            } else {
              notifications.show({
                title: "Error",
                message: "Assignment not found",
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
  }, [id, router]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setSaving(true);

      const selectedServers = values.servers.map((serverId: string) => {
        const server = serverOptions.find(
          (opt: ServerOption) => opt.value === serverId
        );
        return {
          id: serverId,
          displayName: server?.label || "Unknown",
        };
      });

      const payload = {
        ...values,
        servers: selectedServers,
      };

      const response = await fetch("/api/route-servers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        notifications.show({
          title: "Success",
          message: "Assignment saved successfully",
          color: "green",
        });
        router.push("/");
      } else {
        notifications.show({
          title: "Error",
          message: result.error || "Failed to save assignment",
          color: "red",
        });
      }
    } catch (error) {
      console.error("Error saving assignment:", error);
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
          <Title order={3}>{id ? "Edit" : "Add"} Route Server Assignment</Title>
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
          <Stack gap="md">
            <NumberInput
              label="Priority"
              placeholder="10"
              min={1}
              max={100}
              {...form.getInputProps("priority")}
            />

            <Select
              label="Route Kind"
              placeholder="Select route kind"
              data={Object.values(StreamType).map((type) => ({
                value: type,
                label: type,
              }))}
              {...form.getInputProps("route_kind")}
              required
            />

            <TextInput
              label="Request Path"
              placeholder="/path/to/content"
              {...form.getInputProps("from")}
              required
            />

            <TextInput
              label="Redirect To"
              placeholder="http://origin-server/path"
              {...form.getInputProps("to")}
              required
            />

            <MultiSelect
              label="Assigned Servers"
              placeholder="Select servers"
              data={serverOptions}
              {...form.getInputProps("servers")}
              required
              searchable
              clearable
            />

            <Group justify="flex-end" mt="xl">
              <Button
                type="submit"
                leftSection={<IconDeviceFloppy size={14} />}
                loading={saving}
              >
                Save
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
