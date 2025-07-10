"use client";

import { Paper, Stack, Title, Loader, Text } from "@mantine/core";
import { RoutesTable } from "../components/RoutesTable/routes-table";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { Route } from "../types/server";
import { useEffect, useState } from "react";
import { api } from "../utils/api";

export default function RoutesPage() {
  const { servers, routes, refreshData } = useData();
  const { user, loading: authLoading } = useAuth();
  const [loadingRoutes, setLoadingRoutes] = useState(true);

  const handleCreateRoute = async (
    serverId: string,
    routeData: Omit<Route, "id">
  ) => {
    try {
      await api.post("api/servers/routes", {
        serverId,
        route: routeData,
      });

      await refreshData();
    } catch (error) {
      console.error("Error creating route:", error);
    }
  };

  const handleDeleteRoute = async (serverId: string, routeId: string) => {
    try {
      await api.delete(
        `api/servers/routes?serverId=${serverId}&routeId=${routeId}`
      );

      await refreshData();
    } catch (error) {
      console.error("Error deleting route:", error);
    }
  };

  // Fetch routes data
  useEffect(() => {
    const fetchRoutes = async () => {
      // Don't fetch data if user is not authenticated
      if (!user) {
        console.log("User not authenticated, skipping routes fetch");
        setLoadingRoutes(false);
        return;
      }

      setLoadingRoutes(true);
      try {
        const result = await api.get("api/rules");
        if (!result.success) {
          throw new Error("Failed to fetch routes");
        }
      } catch (error) {
        console.error("Error fetching routes:", error);
      } finally {
        setLoadingRoutes(false);
      }
    };

    // Only fetch data if auth is done loading
    if (!authLoading) {
      if (user) {
        console.log("User authenticated, fetching routes data");
        fetchRoutes();
      } else {
        console.log("User not authenticated, clearing routes loading state");
        setLoadingRoutes(false);
      }
    }
  }, [user, authLoading]);

  if (loadingRoutes) {
    return (
      <Paper
        p="md"
        style={{
          height: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack align="center" gap="xs">
          <Loader size="md" />
          <Text c="dimmed" size="sm">
            Loading routes...
          </Text>
        </Stack>
      </Paper>
    );
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
