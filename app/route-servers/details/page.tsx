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
  List,
  Loader,
  Stack,
  Box,
  Divider,
  Badge,
} from "@mantine/core";
import { IconArrowLeft, IconPencil, IconTrash } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { RouteServerAssignment } from "@/app/components/NimbleHomeContent/nimble-home-content.types";
import { api } from "@/app/utils/api";

export default function RouteServerDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<RouteServerAssignment | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        router.push("/");
        return;
      }

      try {
        setLoading(true);
        // Fetch the assignments and find the one with matching ID
        const result = await api.get("api/route-servers");

        if (result.success) {
          const assignment = result.data.find(
            (a: RouteServerAssignment) => a.id === id
          );
          if (assignment) {
            setAssignment(assignment);
          } else {
            notifications.show({
              title: "Error",
              message: "Assignment not found",
              color: "red",
            });
            router.push("/");
          }
        } else {
          notifications.show({
            title: "Error",
            message: "Failed to fetch assignment details",
            color: "red",
          });
        }
      } catch (error) {
        console.error("Error fetching assignment details:", error);
        notifications.show({
          title: "Error",
          message: "An error occurred while fetching assignment details",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleEdit = () => {
    if (id) {
      router.push(`/route-servers/edit?id=${id}`);
    }
  };

  const handleDelete = async () => {
    if (!id || !assignment) return;

    try {
      const result = await api.delete(`api/route-servers/${id}`);

      if (result.success) {
        notifications.show({
          title: "Success",
          message: "Assignment deleted successfully",
          color: "green",
        });
        router.push("/");
      } else {
        notifications.show({
          title: "Error",
          message: "Failed to delete assignment",
          color: "red",
        });
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
      notifications.show({
        title: "Error",
        message: "An error occurred while deleting",
        color: "red",
      });
    }
  };

  if (loading) {
    return (
      <Container size="md" py="xl">
        <Stack align="center" justify="center" h="60vh">
          <Loader size="lg" />
          <Text>Loading assignment details...</Text>
        </Stack>
      </Container>
    );
  }

  if (!assignment) {
    return (
      <Container size="md" py="xl">
        <Paper p="xl" shadow="sm" radius="md" withBorder>
          <Text>Assignment not found</Text>
          <Button
            leftSection={<IconArrowLeft size={14} />}
            onClick={() => router.push("/")}
            mt="md"
          >
            Back to list
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Paper p="xl" shadow="sm" radius="md" withBorder>
        <Group justify="space-between" mb="lg">
          <Title order={3}>Route Server Assignment Details</Title>
          <Group>
            <Button
              leftSection={<IconArrowLeft size={14} />}
              variant="outline"
              onClick={() => router.push("/")}
            >
              Back
            </Button>
            <Button leftSection={<IconPencil size={14} />} onClick={handleEdit}>
              Edit
            </Button>
            <Button
              leftSection={<IconTrash size={14} />}
              color="red"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Group>
        </Group>

        <Divider mb="md" />

        <Stack gap="md">
          <Group>
            <Text fw={700} w={150}>
              Route Kind:
            </Text>
            <Badge color="blue">{assignment.route_kind}</Badge>
          </Group>

          <Group>
            <Text fw={700} w={150}>
              Priority:
            </Text>
            <Text>{assignment.priority}</Text>
          </Group>

          <Group>
            <Text fw={700} w={150}>
              Request Path:
            </Text>
            <Text>{assignment.from}</Text>
          </Group>

          <Group>
            <Text fw={700} w={150}>
              Redirect To:
            </Text>
            <Text>{assignment.to}</Text>
          </Group>

          <Box>
            <Text fw={700} mb="xs">
              Assigned Servers:
            </Text>
            <List>
              {assignment.servers.map(
                (server: { id: string; displayName: string }) => (
                  <List.Item key={server.id}>{server.displayName}</List.Item>
                )
              )}
            </List>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
