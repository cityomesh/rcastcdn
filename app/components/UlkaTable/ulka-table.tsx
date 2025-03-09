"use client";

import { AgGridTable } from "../AgGridTable/ag-grid-table";
import { ColDef, SelectionChangedEvent } from "ag-grid-community";
import { useState } from "react";
import "./ulka-table.css";
import { ActionIcon, Group, Stack, Paper } from "@mantine/core";
import { IconQuestionMark, IconPencil, IconTrash } from "@tabler/icons-react";

interface Server {
  id: string;
  displayName: string;
}

interface RouteServerAssignment {
  id?: string;
  priority: number;
  route_kind: string;
  from: string;
  to: string;
  servers: Server[];
}

interface UlkaTableProps {
  data: RouteServerAssignment[];
}

export const UlkaTable = ({ data }: UlkaTableProps) => {
  const [selectedRows, setSelectedRows] = useState<RouteServerAssignment[]>([]);

  const columnDefs: ColDef[] = [
    {
      headerName: "",
      field: "selection",
      width: 50,
      headerCheckboxSelection: true,
      checkboxSelection: true,
      showDisabledCheckboxes: false,
    },
    {
      headerName: "Request comes to ...",
      field: "from",
      flex: 1,
      sortable: true,
    },
    {
      headerName: "... and is redirected to",
      field: "to",
      flex: 1.5,
      sortable: true,
    },
    {
      headerName: "Assigned servers",
      field: "servers",
      flex: 1,
      sortable: true,
      cellStyle: { color: "#097bd3" },
      valueFormatter: (params: { value: Server[] | undefined }) => {
        if (!params.value) return "";
        return params.value
          .map((server: Server) => server.displayName)
          .join(", ");
      },
    },
    {
      headerName: "",
      field: "actions",
      flex: 0.5,
      sortable: false,
      cellRenderer: () => (
        <Group gap="xs" justify="flex-end">
          <ActionIcon variant="subtle" color="#097bd3">
            <IconQuestionMark size={18} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="#097bd3">
            <IconPencil size={18} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="#097bd3">
            <IconTrash size={18} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  const onSelectionChanged = (event: SelectionChangedEvent) => {
    const selectedNodes = event.api.getSelectedNodes();
    const selectedData = selectedNodes.map(
      (node) => node.data as RouteServerAssignment
    );
    setSelectedRows(selectedData);
  };

  return (
    <Paper
      shadow="sm"
      p="md"
      style={{
        boxShadow:
          "0 0.5em 1em -0.125em rgba(10, 10, 10, 0.1), 0 0px 0 1px rgba(10, 10, 10, 0.02)",
      }}
    >
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          {selectedRows.length > 0 && (
            <ActionIcon
              variant="filled"
              color="red"
              size="lg"
              onClick={() => {
                // TODO: Implement delete functionality
                console.log("Deleting:", selectedRows);
              }}
            >
              <IconTrash size={18} />
            </ActionIcon>
          )}
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
            rowSelection: "multiple",
            onSelectionChanged: onSelectionChanged,
          }}
          theme="alpine"
        />
      </Stack>
    </Paper>
  );
};
