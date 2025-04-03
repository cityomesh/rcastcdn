"use client";

import { AgGridTable } from "../AgGridTable/ag-grid-table";
import { ColDef } from "ag-grid-community";
import { useState } from "react";
import "./ulka-table.css";
import { ActionIcon, Group, Paper, Modal, Text, Button } from "@mantine/core";
import {
  IconQuestionMark,
  IconPencil,
  IconTrash,
  IconCheck,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { api } from "@/app/utils/api";

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
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] =
    useState<RouteServerAssignment | null>(null);

  const handleDelete = async (item: RouteServerAssignment) => {
    if (!item || !item.id) return;

    try {
      setIsDeleting(true);

      const result = await api.delete(`api/route-servers/${item.id}`);

      if (result.success) {
        notifications.show({
          title: "Success",
          message: "Assignment deleted successfully",
          color: "green",
          icon: <IconCheck size={18} />,
        });

        if (onDataChange) {
          onDataChange();
        }
      } else {
        notifications.show({
          title: "Error",
          message: "Failed to delete assignment",
          color: "red",
        });
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
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

  const confirmDelete = (item: RouteServerAssignment) => {
    setItemToDelete(item);
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
        <AgGridTable
          data={data}
          columnDefs={columnDefs}
          height="600px"
          gridOptions={{
            rowStyle: { cursor: "pointer" },
            defaultColDef: {
              headerClass: "custom-header",
            },
            onRowClicked: (event) => {
              showDetails(event.data);
            },
          }}
          theme="alpine"
        />
      </Paper>

      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Confirm Delete"
        centered
      >
        <Text mb="md">Are you sure you want to delete this assignment?</Text>
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
            onClick={() => itemToDelete && handleDelete(itemToDelete)}
            loading={isDeleting}
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </>
  );
};
