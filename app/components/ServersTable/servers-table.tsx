"use client";

import { useState, useCallback, useRef } from "react";
import { AgGridTable } from "../AgGridTable/ag-grid-table";
import { ColDef } from "ag-grid-community";
import { Button, Group, Text, ActionIcon, Badge } from "@mantine/core";
import { ServerForm } from "../ServerForm/server-form";
import { Server } from "@/app/contexts/DataContext";
import {
  IconEdit,
  IconPlus,
  IconTrash,
  IconRefresh,
  IconServer,
  IconServerCog,
} from "@tabler/icons-react";
import { AgGridTableRef } from "../AgGridTable/ag-grid-table";

interface ServersTableProps {
  data: Server[];
  onCreateServer: (server: Omit<Server, "id" | "createdAt">) => void;
  onUpdateServer: (id: string, server: Omit<Server, "id" | "createdAt">) => void;
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
  const gridRef = useRef<AgGridTableRef>(null); // ✅ use table ref

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
      No servers found. Click the "Add Server" button above to create one.
    </Text>
  );

  const columnDefs: ColDef[] = [
    { headerName: "", checkboxSelection: true, headerCheckboxSelection: true, width: 50, pinned: "left" },
    { headerName: "Display Name", field: "displayName", flex: 1, sortable: true },
    {
      headerName: "Server Type",
      field: "serverType",
      width: 130,
      sortable: true,
      cellRenderer: (params: any) => (
        <Group gap="xs" wrap="nowrap" align="center" style={{ height: "100%" }}>
          {params.value === "origin" ? <IconServer size={16} /> : <IconServerCog size={16} />}
          <Text size="sm">{params.value === "origin" ? "Origin" : "Edge"}</Text>
        </Group>
      ),
    },
    {
      headerName: "Parent Server",
      field: "parentServerId",
      width: 150,
      sortable: true,
      valueGetter: (params: any) => getParentServerName(params.data.parentServerId),
    },
    { headerName: "IP Address", field: "ipAddress", flex: 1, sortable: true },
    { headerName: "Port", field: "port", width: 100, sortable: true },
    { headerName: "Output IP:Port", field: "originIpWithPort", flex: 1, sortable: true },
    {
      headerName: "Status",
      field: "status",
      width: 120,
      cellRenderer: (params: any) => (
        <Badge color={params.value === "online" ? "green" : params.value === "offline" ? "red" : "yellow"}>
          {params.value || "unknown"}
        </Badge>
      ),
    },
    {
      headerName: "Last Checked",
      field: "lastChecked",
      flex: 1,
      sortable: true,
      valueFormatter: (params: any) => (params.value ? new Date(params.value).toLocaleString() : "Never"),
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
          <ActionIcon color="red" onClick={() => onDeleteServer(params.data.id)}>
            <IconTrash size={18} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  const onSelectionChanged = useCallback((event: any) => {
    const selected = event.api.getSelectedRows();
    setSelectedServers(selected);
  }, []);

  const handleApplySSHKeyRestart = async () => {
    if (selectedServers.length === 0) {
      alert("Please select at least one server.");
      return;
    }

    try {
      const results = await Promise.all(
        selectedServers.map((server) =>
          fetch("/api/reload-server", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              serverId: server.id,
              ipAddress: server.ipAddress,
              port: server.port,
              sshUsername: server.sshUsername,
              sshPassword: server.sshPassword,
              serviceName: "nimble",
            }),
          }).then((res) => res.json())
        )
      );

      const successMessages = results
        .map((res, idx) => {
          const server = selectedServers[idx];
          return res.success
            ? `✅ ${server.displayName}: ${res.output}`
            : `❌ ${server.displayName}: ${res.error}`;
        })
        .join("\n");

      alert(successMessages);

      // ✅ Clear state & checkboxes
      setSelectedServers([]);
      gridRef.current?.deselectAll();
    } catch (err: any) {
      console.error(err);
      alert(`❌ SSH restart failed: ${err.message}`);
    }
  };

  return (
    <>
      <Group justify="space-between" mb="md">
        <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateModalOpen(true)} variant="filled" color="red">
          Add Server
        </Button>

        {selectedServers.length > 0 && (
          <Group>
            <Button variant="filled" color="blue" onClick={handleApplySSHKeyRestart} leftSection={<IconServerCog size={16} />}>
              Service Restart({selectedServers.length})
            </Button>
          </Group>
        )}
      </Group>

      <AgGridTable
        ref={gridRef} // ✅ Pass ref
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
          if (selectedServer) onUpdateServer(selectedServer.id, values);
          setEditModalOpen(false);
          setSelectedServer(null);
        }}
      />
    </>
  );
};
