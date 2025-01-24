"use client";

import { AgGridTable } from "../AgGridTable/ag-grid-table";
import { ColDef } from "ag-grid-community";

interface Server {
  name: string;
  ipAddress: string;
}

interface ServersTableProps {
  data: Server[];
}

export const ServersTable = ({ data }: ServersTableProps) => {
  const columnDefs: ColDef[] = [
    {
      headerName: "Name",
      field: "name",
      flex: 1,
      sortable: true,
    },
    {
      headerName: "IP Address",
      field: "ipAddress",
      flex: 1,
      sortable: true,
    },
  ];

  return (
    <AgGridTable
      data={data}
      columnDefs={columnDefs}
      height="600px"
      gridOptions={{
        rowStyle: { cursor: "pointer" },
        defaultColDef: {
          headerClass: "custom-header",
        },
      }}
      theme="alpine"
    />
  );
};
