"use client";

import { useState } from "react";
import { AgGridTable } from "../AgGridTable/ag-grid-table";
import { ColDef } from "ag-grid-community";
import { Button, Group, Text, ActionIcon, Badge } from "@mantine/core";
import { RouteForm } from "../RouteForm/route-form";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { Server, Route } from "@/app/types/server";

interface RoutesTableProps {
  data: Route[];
  servers: Server[];
  onCreateRoute: (serverId: string, route: Omit<Route, "id">) => void;
  onDeleteRoute: (serverId: string, routeId: string) => void;
}

export const RoutesTable = ({
  data,
  servers,
  onCreateRoute,
  onDeleteRoute,
}: RoutesTableProps) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);

  const NoRowsOverlay = () => (
    <Text size="lg" c="dimmed" ta="center" py="xl">
      No routes found. Click the &quot;Add Route&quot; button above to create
      one.
    </Text>
  );

  const columnDefs: ColDef[] = [
    {
      headerName: "Path",
      field: "path",
      flex: 1,
      sortable: true,
    },
    {
      headerName: "Origin",
      field: "origin",
      flex: 1,
      sortable: true,
    },
    {
      headerName: "Origin Path",
      field: "origin_path",
      flex: 1,
      sortable: true,
    },
    {
      headerName: "SSL",
      field: "use_ssl",
      width: 100,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cellRenderer: (params: any) => (
        <Badge color={params.value ? "green" : "gray"}>
          {params.value ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      headerName: "Cache Interval",
      field: "playlist_caching_interval",
      width: 150,
      sortable: true,
    },
    {
      headerName: "Server",
      field: "server",
      flex: 1,
      sortable: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      valueGetter: (params: any) => {
        const origin = params.data.origin;
        const server = servers.find((s) => {
          const [originIp] = s.originIpWithPort.split(":");
          return origin.includes(originIp);
        });
        return server?.displayName || "Unknown";
      },
    },
    {
      headerName: "Actions",
      field: "actions",
      width: 100,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cellRenderer: (params: any) => {
        const origin = params.data.origin;
        const server = servers.find((s) => {
          const [originIp] = s.originIpWithPort.split(":");
          return origin.includes(originIp);
        });

        return (
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => server && onDeleteRoute(server.id, params.data.id)}
              disabled={!server}
            >
              <IconTrash size={18} />
            </ActionIcon>
          </Group>
        );
      },
    },
  ];

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            if (servers.length > 0) {
              setSelectedServerId(servers[0].id);
              setCreateModalOpen(true);
            }
          }}
          variant="filled"
          color="red"
          disabled={servers.length === 0}
          styles={{
            root: {
              boxShadow:
                "0 0.5em 1em -0.125em rgba(10, 10, 10, 0.1), 0 0px 0 1px rgba(10, 10, 10, 0.02)",
              fontWeight: 500,
              "&:hover": {
                boxShadow:
                  "0 0.6em 1.2em -0.1em rgba(10, 10, 10, 0.15), 0 0px 0 1px rgba(10, 10, 10, 0.03)",
              },
            },
          }}
        >
          Add Route
        </Button>
      </Group>

      <AgGridTable
        data={data}
        columnDefs={columnDefs}
        height="600px"
        gridOptions={{
          rowStyle: { cursor: "pointer" },
          defaultColDef: {
            headerClass: "custom-header",
          },
          noRowsOverlayComponent: NoRowsOverlay,
        }}
        theme="alpine"
      />

      {selectedServerId && (
        <RouteForm
          opened={createModalOpen}
          onClose={() => {
            setCreateModalOpen(false);
            setSelectedServerId(null);
          }}
          title="Add New Route"
          onSubmit={(values) => {
            onCreateRoute(selectedServerId, values);
            setCreateModalOpen(false);
            setSelectedServerId(null);
          }}
          servers={servers}
          selectedServerId={selectedServerId}
          onServerChange={setSelectedServerId}
        />
      )}
    </>
  );
};
