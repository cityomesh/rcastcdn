"use client";

import { useState } from "react";
import {
  Container,
  Title,
  Group,
  Button,
  Paper,
  Text,
  Loader,
  Flex,
} from "@mantine/core";
import { Notifications, notifications } from "@mantine/notifications";
import {
  IconPlus,
  IconArrowLeft,
  IconDeviceDesktopStar,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import RouteServerForm from "../components/RouteServerForm/route-server-form";
import { ProtectedRoute } from "../components/ProtectedRoute/protected-route";
import { useData } from "../contexts/DataContext";
import Link from "next/link";
import { api } from "@/app/utils/api";

interface Server {
  id: string;
  displayName: string;
  ipAddress: string;
  port: number;
  originIpWithPort: string;
}

interface RouteServerAssignment {
  id?: string;
  priority: number;
  route_kind: string;
  from: string;
  to: string;
  servers: Server[];
}

export default function RouteServersPage() {
  const { refreshData } = useData();
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, { toggle: toggleForm }] = useDisclosure(true); // Default to showing the form

  const handleSubmit = async (values: RouteServerAssignment) => {
    try {
      setRefreshing(true);
      const data = await api.post("api/route-servers", values);

      if (data.success) {
        notifications.show({
          title: "Success",
          message: "Re-streaming route created successfully",
          color: "green",
          icon: <IconDeviceDesktopStar size={16} />,
        });
        await refreshData();
        toggleForm();
      } else {
        throw new Error(data.error || "Failed to create route");
      }
    } catch (error) {
      console.error("Error creating route:", error);
      notifications.show({
        title: "Error",
        message:
          error instanceof Error ? error.message : "Failed to create route",
        color: "red",
      });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ProtectedRoute>
      <>
        <Notifications />
        <Container size="xl" py="xl">
          <Flex direction="column" gap="lg">
            <Group justify="space-between" align="center" mb="md">
              <Group gap="md">
                <Link href="/" style={{ textDecoration: "none" }}>
                  <Button
                    variant="subtle"
                    leftSection={<IconArrowLeft size={16} />}
                    color="blue"
                  >
                    Back to Overview
                  </Button>
                </Link>
                <Title order={2}>Create Re-streaming Route</Title>
              </Group>
              {refreshing && <Loader size="sm" />}
            </Group>

            <Paper p="xl" withBorder>
              {showForm ? (
                <RouteServerForm onSubmit={handleSubmit} />
              ) : (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  mih={300}
                  gap="md"
                >
                  <Text size="xl" fw={500}>
                    Route created successfully!
                  </Text>
                  <Text c="dimmed" ta="center" maw={600} mb="lg">
                    Your re-streaming route has been created. You can view it on
                    the home page.
                  </Text>
                  <Group>
                    <Link href="/" style={{ textDecoration: "none" }}>
                      <Button color="blue">Go to Overview</Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={toggleForm}
                      leftSection={<IconPlus size={16} />}
                    >
                      Create Another Route
                    </Button>
                  </Group>
                </Flex>
              )}
            </Paper>
          </Flex>
        </Container>
      </>
    </ProtectedRoute>
  );
}
