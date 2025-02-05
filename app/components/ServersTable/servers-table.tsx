"use client";

import { useState } from "react";
import { AgGridTable } from "../AgGridTable/ag-grid-table";
import { ColDef } from "ag-grid-community";
import { Button, Group, Text, ActionIcon, Tooltip } from "@mantine/core";
import { ServerForm } from "../ServerForm/server-form";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { Server } from "@/app/contexts/DataContext";

interface ServersTableProps {
  data: Server[];
  onCreateServer: (server: Omit<Server, "id" | "createdAt">) => void;
  onUpdateServer: (
    id: string,
    server: Omit<Server, "id" | "createdAt">
  ) => void;
  onDeleteServer: (id: string) => void;
}

export const ServersTable = ({
  data,
  onCreateServer,
  onUpdateServer,
  onDeleteServer,
}: ServersTableProps) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);

  const NoRowsOverlay = () => (
    <Text size="lg" c="dimmed" ta="center" py="xl">
      No servers found. Click the &quot;Add Server&quot; button above to create
      one.
    </Text>
  );

  const columnDefs: ColDef[] = [
    {
      headerName: "Name",
      field: "displayName",
      flex: 1,
      sortable: true,
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
      flex: 1,
      sortable: true,
    },
    {
      headerName: "Origin Server",
      field: "originIpWithPort",
      flex: 1,
      sortable: true,
    },
    {
      headerName: "SSH Username",
      field: "sshUsername",
      flex: 1,
      sortable: true,
    },
    {
      headerName: "Created At",
      field: "createdAt",
      flex: 1,
      sortable: true,
      valueFormatter: (params) => {
        const date = new Date(params.value);
        return date.toLocaleString();
      },
    },
    {
      headerName: "Actions",
      field: "actions",
      flex: 1,
      sortable: false,
      cellRenderer: (params: { data: Server }) => (
        <Group gap="xs" justify="flex-end" pr="md">
          <Tooltip label="Edit Server">
            <ActionIcon
              variant="light"
              color="blue"
              size="lg"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedServer(params.data);
                setEditModalOpen(true);
              }}
            >
              <IconEdit style={{ width: "70%", height: "70%" }} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete Server">
            <ActionIcon
              variant="light"
              color="red"
              size="lg"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteServer(params.data.id);
              }}
            >
              <IconTrash style={{ width: "70%", height: "70%" }} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
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
