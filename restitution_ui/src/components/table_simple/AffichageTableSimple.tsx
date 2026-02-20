import { useState } from "react";
import {
  getCoreRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import Pagination from "@/components/table/Pagination";
import TableSimpleToolbar from "@/components/table_simple/TableSimpleToolbar";
import TableSimpleHeader from "@/components/table_simple/TableSimpleHeader";
import TableSimpleBody from "@/components/table_simple/TableSimpleBody";

type BasicTableProps = {
  restitutionTaskID: string;
  titre: string;
  count: number;
  data: any[];
  columns: any[];
  isLoading?: boolean;
  isError?: boolean;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  setPageSize: (page: number) => void;
  search: string;
  setSearch: (value: string) => void;
  advanced_filters: any;
  setAdvanced_filters: (s: any) => void;
  ordering: string;
  sorting: SortingState;
  setSorting: (value: SortingState) => void;
  onSortingChange: (sorting: SortingState) => void;
};

export default function AffichageTableSimple({
  restitutionTaskID,
  titre,
  count,
  data,
  columns,
  isLoading = false,
  isError = false,
  page,
  totalPages,
  setPage,
  setPageSize,
  search,
  setSearch,
  advanced_filters,
  setAdvanced_filters,
  ordering,
  sorting,
  setSorting,
  onSortingChange,
}: BasicTableProps) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});

  const table = useReactTable({
    data,
    columns,
    manualSorting: true,

    getCoreRowModel: getCoreRowModel(),
    getRowId: (row: any) => row.id.toString(),
    groupedColumnMode: "reorder",

    state: {
      rowSelection,
      columnVisibility,
      sorting,
    },

    onSortingChange: (updaterOrValue) => {
      const newSorting =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sorting)
          : updaterOrValue;

      onSortingChange(newSorting);
    },

    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
  });

  return (
    <>
      <div className="max-h-screen-xl p-4 w-[98%]">
        <TableSimpleToolbar
          restitutionTaskID={restitutionTaskID}
          count={count}
          titre={titre}
          table={table}
          search={search}
          ordering={ordering}
          setSearch={setSearch}
          setPageSize={setPageSize}
          advanced_filters={advanced_filters}
          setAdvanced_filters={setAdvanced_filters}
        />

        <div className="my-4 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <TableSimpleHeader headerGroups={table.getHeaderGroups()} />
                  <TableSimpleBody
                    rows={table.getRowModel().rows}
                    isLoading={isLoading}
                    isError={isError}
                    isEmpty={
                      !isLoading &&
                      !isError &&
                      table.getRowModel().rows.length === 0
                    }
                  />
                </table>
              </div>
            </div>
          </div>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>
    </>
  );
}
