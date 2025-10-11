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
  const [selectedServers, setSelectedServers] = useState<Server[]>([]);

  // ✅ Get parent server name
  const getParentServerName = useCallback(
    (parentId: string | undefined) => {
      if (!parentId) return "None";
      const parent = data.find((server) => server.id === parentId);
      return parent ? parent.displayName : "Unknown";
    },
    [data]
  );

  // ✅ When there are no servers
  const NoRowsOverlay = () => (
    <Text size="lg" c="dimmed" ta="center" py="xl">
      No servers found. Click the &quot;Add Server&quot; button above to create one.
    </Text>
  );

  // ✅ AG Grid Columns
  const columnDefs: ColDef[] = [
    {
      headerName: "",
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      pinned: "left",
    },
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
      cellRenderer: (params: any) => (
        <Group gap="xs" wrap="nowrap" align="center" style={{ height: "100%" }}>
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
      valueGetter: (params: any) =>
        getParentServerName(params.data.parentServerId),
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
      headerName: "Output IP:Port",
      field: "originIpWithPort",
      flex: 1,
      sortable: true,
    },
    {
      headerName: "Status",
      field: "status",
      width: 120,
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
      valueFormatter: (params: any) => {
        if (!params.value) return "Never";
        return new Date(params.value).toLocaleString();
      },
    },
    {
      headerName: "Actions",
      field: "actions",
      width: 200,
      pinned: "right",
      cellRenderer: (params: any) => (
        <Group gap="xs" align="center" style={{ height: "100%" }}>
          <ActionIcon color="blue" onClick={() => onCheckHealth(params.data.id)}>
            <IconRefresh size={18} />
          </ActionIcon>
          <ActionIcon
            color="blue"
            onClick={() => {
              setSelectedServer(params.data);
              setEditModalOpen(true);
            }}
          >
            <IconEdit size={18} />
          </ActionIcon>
          <ActionIcon
            color="red"
            onClick={() => onDeleteServer(params.data.id)}
          >
            <IconTrash size={18} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  // ✅ On row selection change
  const onSelectionChanged = useCallback((event: any) => {
    const selected = event.api.getSelectedRows();
    setSelectedServers(selected);
  }, []);

  // ✅ Apply Restart Command
  const handleApplyCommand = async () => {
    if (selectedServers.length === 0) return;

    try {
      for (const server of selectedServers) {
        // You can replace this fetch URL with your backend API endpoint
        await fetch("/api/restart-server", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serverId: server.id }),
        });
      }

      alert("Restart command applied successfully to selected servers!");
      setSelectedServers([]);
    } catch (error) {
      console.error("Error applying restart command:", error);
      alert("Failed to apply restart command.");
    }
  };

  return (
    <>
      {/* Top Button */}
      <Group justify="space-between" mb="md">
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setCreateModalOpen(true)}
          variant="filled"
          color="red"
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
          Add Server
        </Button>

        {/* ✅ Apply Button visible only when servers selected */}
        {selectedServers.length > 0 && (
          <Button
            variant="filled"
            color="green"
            onClick={handleApplyCommand}
            leftSection={<IconRefresh size={16} />}
          >
            Apply Restart Command ({selectedServers.length})
          </Button>
        )}
      </Group>

      {/* AG Grid Table */}
      <AgGridTable
        data={data}
        columnDefs={columnDefs}
        height="600px"
        gridOptions={{
          rowSelection: "multiple",
          onSelectionChanged,
          rowStyle: { cursor: "pointer" },
          defaultColDef: { headerClass: "custom-header" },
          noRowsOverlayComponent: NoRowsOverlay,
        }}
        theme="alpine"
      />

      {/* Add Server Form */}
      <ServerForm
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add New Server"
        onSubmit={(values) => {
          onCreateServer(values);
          setCreateModalOpen(false);
        }}
      />

      {/* Edit Server Form */}
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
