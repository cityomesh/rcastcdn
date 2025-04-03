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
  Transition,
  Flex,
} from "@mantine/core";
import { Notifications, notifications } from "@mantine/notifications";
import { IconPlus, IconX, IconArrowLeft } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import RouteServerForm from "../components/RouteServerForm/route-server-form";
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
  const [showForm, { toggle: toggleForm }] = useDisclosure(false);

  const handleSubmit = async (values: RouteServerAssignment) => {
    try {
      setRefreshing(true);
      const data = await api.post("api/route-servers", values);

      if (data.success) {
        notifications.show({
          title: "Success",
          message: "Route-server assignment saved successfully",
          color: "green",
          icon: <IconPlus size={16} />,
        });
        await refreshData();
        toggleForm();
      } else {
        throw new Error(data.error || "Failed to save assignment");
      }
    } catch (error) {
      console.error("Error saving assignment:", error);
      notifications.show({
        title: "Error",
        message:
          error instanceof Error ? error.message : "Failed to save assignment",
        color: "red",
      });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <Notifications />
      <Container size="xl" py="xl">
        <Flex direction="column" gap="lg">
          <Group justify="space-between" align="center">
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
              <Title order={2}>Manage Route-Server Assignments</Title>
            </Group>
            <Group>
              {refreshing && <Loader size="sm" />}
              <Button
                onClick={toggleForm}
                leftSection={
                  showForm ? <IconX size={16} /> : <IconPlus size={16} />
                }
                color="red"
                variant="filled"
                styles={{
                  root: {
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    fontWeight: 500,
                    "&:hover": {
                      boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                    },
                  },
                }}
              >
                {showForm ? "Cancel" : "Add New Assignment"}
              </Button>
            </Group>
          </Group>

          <Transition mounted={showForm} transition="slide-down" duration={200}>
            {(styles) => (
              <Paper p="xl" withBorder style={styles}>
                <Title order={3} mb="lg">
                  New Route-Server Assignment
                </Title>
                <RouteServerForm onSubmit={handleSubmit} />
              </Paper>
            )}
          </Transition>

          {!showForm && (
            <Paper
              p="xl"
              withBorder
              style={{
                height: "400px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text size="lg" c="dimmed" ta="center" maw={600}>
                Click &quot;Add New Assignment&quot; above to create a new
                route-server assignment. You can view and manage all assignments
                on the home page.
              </Text>
            </Paper>
          )}
        </Flex>
      </Container>
    </>
  );
}
