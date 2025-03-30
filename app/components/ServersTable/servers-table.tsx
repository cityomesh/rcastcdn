"use client";

import { useState, useCallback } from "react";
import { AgGridTable } from "../AgGridTable/ag-grid-table";
import { ColDef } from "ag-grid-community";
import { Button, Group, Text, ActionIcon, Badge } from "@mantine/core";
import { ServerForm } from "../ServerForm/server-form";
import {
  IconEdit,
  IconPlus,
  IconTrash,
  IconRefresh,
  IconServer,
  IconServerCog,
} from "@tabler/icons-react";
import { Server } from "@/app/contexts/DataContext";

interface ServersTableProps {
  data: Server[];
  onCreateServer: (server: Omit<Server, "id" | "createdAt">) => void;
  onUpdateServer: (
    id: string,
    server: Omit<Server, "id" | "createdAt">
  ) => void;
  onDeleteServer: (id: string) => void;
  onCheckHealth: (id: string) => void;
}

export const ServersTable = ({
  data,
  onCreateServer,
  onUpdateServer,
  onDeleteServer,
  onCheckHealth,
}: ServersTableProps) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);

  const getParentServerName = useCallback(
    (parentId: string | undefined) => {
      if (!parentId) return "None";
      const parent = data.find((server) => server.id === parentId);
      return parent ? parent.displayName : "Unknown";
    },
    [data]
  );

  const NoRowsOverlay = () => (
    <Text size="lg" c="dimmed" ta="center" py="xl">
      No servers found. Click the &quot;Add Server&quot; button above to create
      one.
    </Text>
  );

  const columnDefs: ColDef[] = [
    {
      headerName: "Display Name",
      field: "displayName",
      flex: 1,
      sortable: true,
    },
    {
      headerName: "Server Type",
      field: "serverType",
      width: 130,
      sortable: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cellRenderer: (params: any) => (
        <Group gap="xs" wrap="nowrap">
          {params.value === "origin" ? (
            <IconServer size={16} />
          ) : (
            <IconServerCog size={16} />
          )}
          <Text size="sm">{params.value === "origin" ? "Origin" : "Edge"}</Text>
        </Group>
      ),
    },
    {
      headerName: "Parent Server",
      field: "parentServerId",
      width: 150,
      sortable: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      valueGetter: (params: any) =>
        getParentServerName(params.data.parentServerId),
      hide: false,
    },
    {
      headerName: "IP Address",
      field: "ipAddress",
      flex: 1,
      sortable: true,
    },
    {
      headerName: "Port",
      field: "port",
      width: 100,
      sortable: true,
    },
    {
      headerName: "Origin IP:Port",
      field: "originIpWithPort",
      flex: 1,
      sortable: true,
    },
    {
      headerName: "Status",
      field: "status",
      width: 120,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cellRenderer: (params: any) => (
        <Badge
          color={
            params.value === "online"
              ? "green"
              : params.value === "offline"
              ? "red"
              : "yellow"
          }
        >
          {params.value || "unknown"}
        </Badge>
      ),
    },
    {
      headerName: "Last Checked",
      field: "lastChecked",
      flex: 1,
      sortable: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      valueFormatter: (params: any) => {
        if (!params.value) return "Never";
        return new Date(params.value).toLocaleString();
      },
    },
    {
      headerName: "Actions",
      field: "actions",
      width: 200,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cellRenderer: (params: any) => (
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={() => onCheckHealth(params.data.id)}
          >
            <IconRefresh size={18} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={() => {
              setSelectedServer(params.data);
              setEditModalOpen(true);
            }}
          >
            <IconEdit size={18} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => onDeleteServer(params.data.id)}
          >
            <IconTrash size={18} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setCreateModalOpen(true)}
          variant="filled"
          color="blue"
        >
          Add Server
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

      <ServerForm
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add New Server"
        onSubmit={(values) => {
          onCreateServer(values);
          setCreateModalOpen(false);
        }}
      />

      <ServerForm
        opened={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedServer(null);
        }}
        title="Edit Server"
        initialValues={selectedServer || undefined}
        onSubmit={(values) => {
          if (selectedServer) {
            onUpdateServer(selectedServer.id, values);
          }
          setEditModalOpen(false);
          setSelectedServer(null);
        }}
      />
    </>
  );
};
