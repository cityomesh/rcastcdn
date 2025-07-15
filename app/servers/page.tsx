"use client";

import { Paper, Stack, Title } from "@mantine/core";
import { ServersTable } from "../components/ServersTable/servers-table";
import { ProtectedRoute } from "../components/ProtectedRoute/protected-route";
import { useData, Server } from "../contexts/DataContext";
import { api } from "../utils/api";

export default function ServersPage() {
  const { servers, loading, refreshData } = useData();

  const handleCreateServer = async (
    serverData: Omit<Server, "id" | "createdAt">
  ) => {
    try {
      await api.post("api/servers", serverData);
      await refreshData();
    } catch (error) {
      console.error("Error creating server:", error);
    }
  };

  const handleUpdateServer = async (
    id: string,
    serverData: Omit<Server, "id" | "createdAt">
  ) => {
    try {
      await api.put(`api/servers/${id}`, serverData);
      await refreshData();
    } catch (error) {
      console.error("Error updating server:", error);
    }
  };

  const handleDeleteServer = async (id: string) => {
    try {
      await api.delete(`api/servers/${id}`);
      await refreshData();
    } catch (error) {
      console.error("Error deleting server:", error);
    }
  };

  const handleCheckHealth = async (id: string) => {
    try {
      await api.get(`api/servers/health?id=${id}`);
      await refreshData();
    } catch (error) {
      console.error("Error checking server health:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ProtectedRoute>
      <Paper
        p="md"
        style={{
          boxShadow:
            "0 0.5em 1em -0.125em rgba(10, 10, 10, 0.1), 0 0px 0 1px rgba(10, 10, 10, 0.02)",
        }}
      >
        <Stack gap="lg">
          <Title order={2}>Servers</Title>
          <ServersTable
            data={servers}
            onCreateServer={handleCreateServer}
            onUpdateServer={handleUpdateServer}
            onDeleteServer={handleDeleteServer}
            onCheckHealth={handleCheckHealth}
          />
        </Stack>
      </Paper>
    </ProtectedRoute>
  );
}
