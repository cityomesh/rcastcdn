"use client";

import { Paper, Stack, Title } from "@mantine/core";
import { RoutesTable } from "../components/RoutesTable/routes-table";
import { useData } from "../contexts/DataContext";
import { Route } from "../types/server";

export default function RoutesPage() {
  const { servers, routes, loading, refreshData } = useData();

  const handleCreateRoute = async (
    serverId: string,
    routeData: Omit<Route, "id">
  ) => {
    try {
      const response = await fetch("/api/servers/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serverId,
          route: routeData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create route");
      }

      await refreshData();
    } catch (error) {
      console.error("Error creating route:", error);
    }
  };

  const handleDeleteRoute = async (serverId: string, routeId: string) => {
    try {
      const response = await fetch(
        `/api/servers/routes?serverId=${serverId}&routeId=${routeId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete route");
      }

      await refreshData();
    } catch (error) {
      console.error("Error deleting route:", error);
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
        <Title order={2}>Routes</Title>
        <RoutesTable
          data={routes}
          servers={servers}
          onCreateRoute={handleCreateRoute}
          onDeleteRoute={handleDeleteRoute}
        />
      </Stack>
    </Paper>
  );
}
