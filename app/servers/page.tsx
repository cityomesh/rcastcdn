"use client";

import { useEffect, useState } from "react";
import { Paper, Stack, Text, Title } from "@mantine/core";
import { ServersTable } from "../components/ServersTable/servers-table";
// import { ServersTable } from "../components/ServersTable/servers-table";

interface Server {
  name: string;
  ipAddress: string;
}

export default function ServersPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await fetch("/api/servers");
        const data = await response.json();
        setServers(data);
      } catch (error) {
        console.error("Error fetching servers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
  }, []);

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
        {servers.length === 0 ? (
          <Text size="lg" c="dimmed" ta="center" py="xl">
            No servers found
          </Text>
        ) : (
          <ServersTable data={servers} />
        )}
      </Stack>
    </Paper>
  );
}
