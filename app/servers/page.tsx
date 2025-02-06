"use client";

import { Paper, Stack, Title } from "@mantine/core";
import { ServersTable } from "../components/ServersTable/servers-table";
import { useData, Server } from "../contexts/DataContext";

export default function ServersPage() {
  const { servers, loading, refreshData } = useData();

  const handleCreateServer = async (
    serverData: Omit<Server, "id" | "createdAt">
  ) => {
    try {
      const response = await fetch("/api/servers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serverData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create server");
      }

      await refreshData();
    } catch (error) {
      console.error("Error creating server:", error);
    }
  };

  const handleUpdateServer = async (
    id: string,
    serverData: Omit<Server, "id" | "createdAt">
  ) => {
    console.log("Update not implemented yet", { id, serverData });
  };

  const handleDeleteServer = async (id: string) => {
    try {
      const response = await fetch(`/api/servers?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete server");
      }

      await refreshData();
    } catch (error) {
      console.error("Error deleting server:", error);
    }
  };

  const handleCheckHealth = async (id: string) => {
    try {
      const response = await fetch(`/api/servers/health?id=${id}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to check server health");
      }

      await refreshData();
    } catch (error) {
      console.error("Error checking server health:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
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
  );
}
