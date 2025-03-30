"use client";

import { AgGridTable } from "../AgGridTable/ag-grid-table";
import { ColDef, SelectionChangedEvent } from "ag-grid-community";
import { useState } from "react";
import "./ulka-table.css";
import {
  ActionIcon,
  Group,
  Stack,
  Paper,
  Modal,
  Text,
  Button,
  Loader,
} from "@mantine/core";
import {
  IconQuestionMark,
  IconPencil,
  IconTrash,
  IconCheck,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/navigation";

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
  onDataChange?: () => void;
}

export const UlkaTable = ({ data, onDataChange }: UlkaTableProps) => {
  const router = useRouter();
  const [selectedRows, setSelectedRows] = useState<RouteServerAssignment[]>([]);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] =
    useState<RouteServerAssignment | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const handleDelete = async (item?: RouteServerAssignment) => {
    const assignments = item ? [item] : selectedRows;
    if (assignments.length === 0) return;

    try {
      setIsDeleting(true);
      item ? setIsBulkDeleting(false) : setIsBulkDeleting(true);

      const results = await Promise.all(
        assignments.map(async (assignment) => {
          if (!assignment.id) return false;

          const response = await fetch(
            `/api/route-servers?id=${assignment.id}`,
            {
              method: "DELETE",
            }
          );

          return response.ok;
        })
      );

      const allSuccessful = results.every((result) => result);

      if (allSuccessful) {
        notifications.show({
          title: "Success",
          message: `${
            assignments.length > 1 ? "Assignments" : "Assignment"
          } deleted successfully`,
          color: "green",
          icon: <IconCheck size={18} />,
        });

        if (onDataChange) {
          onDataChange();
        }
      } else {
        notifications.show({
          title: "Error",
          message: "Failed to delete one or more assignments",
          color: "red",
        });
      }
    } catch (error) {
      console.error("Error deleting assignment(s):", error);
      notifications.show({
        title: "Error",
        message: "An error occurred while deleting",
        color: "red",
      });
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  const confirmDelete = (item?: RouteServerAssignment) => {
    if (item) {
      setItemToDelete(item);
    } else {
      setItemToDelete(null);
    }
    openDeleteModal();
  };

  const handleEdit = (item: RouteServerAssignment) => {
    if (item.id) {
      router.push(`/route-servers/edit?id=${item.id}`);
    } else {
      notifications.show({
        title: "Error",
        message: "Cannot edit: Missing assignment ID",
        color: "red",
      });
    }
  };

  const showDetails = (item: RouteServerAssignment) => {
    if (item.id) {
      router.push(`/route-servers/details?id=${item.id}`);
    } else {
      notifications.show({
        title: "Error",
        message: "Cannot view details: Missing assignment ID",
        color: "red",
      });
    }
  };

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
      cellRenderer: (params: { data: RouteServerAssignment }) => (
        <Group gap="xs" justify="flex-end">
          <ActionIcon
            variant="subtle"
            color="#097bd3"
            onClick={(e) => {
              e.stopPropagation();
              showDetails(params.data);
            }}
            title="View details"
          >
            <IconQuestionMark size={18} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="#097bd3"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(params.data);
            }}
            title="Edit"
          >
            <IconPencil size={18} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="#097bd3"
            onClick={(e) => {
              e.stopPropagation();
              confirmDelete(params.data);
            }}
            title="Delete"
          >
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
    <>
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
                onClick={() => confirmDelete()}
                title={`Delete ${selectedRows.length} selected items`}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader size="xs" color="white" />
                ) : (
                  <IconTrash size={18} />
                )}
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
              onRowClicked: (event) => {
                showDetails(event.data);
              },
            }}
            theme="alpine"
          />
        </Stack>
      </Paper>

      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Confirm Delete"
        centered
      >
        <Text mb="md">
          {itemToDelete
            ? `Are you sure you want to delete this assignment?`
            : `Are you sure you want to delete ${selectedRows.length} selected assignments?`}
        </Text>
        <Group justify="flex-end" mt="xl">
          <Button
            variant="outline"
            onClick={closeDeleteModal}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            color="red"
            onClick={() => handleDelete(itemToDelete || undefined)}
            loading={isDeleting}
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </>
  );
};
