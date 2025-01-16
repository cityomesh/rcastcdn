import {
  useCallback,
  useMemo,
  useImperativeHandle,
  forwardRef,
  useRef,
} from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  GridOptions,
  GridReadyEvent,
  FirstDataRenderedEvent,
  GridSizeChangedEvent,
  PaginationNumberFormatterParams,
  GridApi,
} from "ag-grid-community";
import { Box, Paper, LoadingOverlay } from "@mantine/core";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

export interface AgGridTableRef {
  exportToCSV: (fileName?: string) => void;
  getGridApi: () => GridApi | undefined;
}

interface AgGridTableProps<T> {
  data: T[];
  columnDefs: ColDef[];
  gridOptions?: Partial<GridOptions>;
  onGridReady?: (event: GridReadyEvent) => void;
  onSelectionChanged?: () => void;
  loading?: boolean;
  height?: number | string;
  width?: number | string;
  enableSelection?: boolean;
  suppressRowVirtualisation?: boolean;
  enablePagination?: boolean;
  paginationPageSize?: number;
  theme?: "alpine" | "alpine-dark" | "balham" | "balham-dark" | "material";
  className?: string;
}

export const AgGridTable = forwardRef<
  AgGridTableRef,
  AgGridTableProps<unknown>
>(
  (
    {
      data,
      columnDefs,
      gridOptions,
      onGridReady,
      onSelectionChanged,
      loading = false,
      height = "500px",
      width = "100%",
      suppressRowVirtualisation = false,
      enablePagination = true,
      paginationPageSize = 20,
      theme = "alpine",
      className,
    },
    ref
  ) => {
    const gridApiRef = useRef<GridApi | undefined>(undefined);

    useImperativeHandle(ref, () => ({
      exportToCSV: (fileName = "export.csv") => {
        if (gridApiRef.current) {
          gridApiRef.current.exportDataAsCsv({
            fileName,
            allColumns: true,
          });
        }
      },
      getGridApi: () => gridApiRef.current,
    }));

    // Memoize the default grid options
    const defaultGridOptions: Partial<GridOptions> = useMemo(
      () => ({
        // Pagination settings
        pagination: enablePagination,
        paginationPageSize,
        paginationPageSizeSelector: [20, 50, 100],
        suppressPaginationPanel: false,

        // Animation and selection
        animateRows: true,

        // Default column behavior
        defaultColDef: {
          sortable: true,
          filter: true,
          resizable: true,
          minWidth: 100,
          flex: 1,
        },

        // Performance settings
        suppressRowVirtualisation,
        rowBuffer: 10,

        // Row dimensions
        rowHeight: 48,
        headerHeight: 48,

        // Prevent cell selection when loading
        suppressCellFocus: loading,

        // Localization
        localeText: {
          noRowsToShow: "No data available",
          loadingOoo: "Loading...",
        },

        // Pagination text formatting
        paginationNumberFormatter: (
          params: PaginationNumberFormatterParams
        ) => {
          return params.value.toLocaleString();
        },
      }),
      [enablePagination, paginationPageSize, suppressRowVirtualisation, loading]
    );

    const mergedGridOptions = useMemo(
      () => ({ ...defaultGridOptions, ...gridOptions }),
      [defaultGridOptions, gridOptions]
    );

    const handleGridReady = useCallback(
      (params: GridReadyEvent) => {
        gridApiRef.current = params.api;
        if (onGridReady) {
          onGridReady(params);
        }
        params.api.sizeColumnsToFit();
      },
      [onGridReady]
    );

    const onFirstDataRendered = useCallback(
      (params: FirstDataRenderedEvent) => {
        params.api.sizeColumnsToFit();
      },
      []
    );

    const onGridSizeChanged = useCallback((params: GridSizeChangedEvent) => {
      params.api.sizeColumnsToFit();
    }, []);

    return (
      <Paper
        shadow="sm"
        radius="md"
        p="md"
        style={{ height, width }}
        pos="relative"
      >
        <LoadingOverlay visible={loading} />
        <Box
          className={`ag-theme-${theme} ${className || ""}`}
          style={{ height: "100%", width: "100%" }}
        >
          <AgGridReact
            rowData={data}
            columnDefs={columnDefs}
            gridOptions={mergedGridOptions}
            onGridReady={handleGridReady}
            onSelectionChanged={onSelectionChanged}
            onFirstDataRendered={onFirstDataRendered}
            onGridSizeChanged={onGridSizeChanged}
          />
        </Box>
      </Paper>
    );
  }
);

AgGridTable.displayName = "AgGridTable";
