import { Table } from "@tanstack/react-table";
import { Search, Printer, Download, X } from "lucide-react";
import { useState } from "react";
import ColumnVisibilityMenu from "@/components/table_simple/ColumnVisibilityMenu";
import AdvancedSearchModal from "@/components/table_simple/AdvancedSearchModal";
import ExportTableCSV from "@/components/exports/ExportTableCSV";
import ExportTableExcel from "@/components/exports/ExportTableExcel";
import ExportTablePDF from "@/components/exports/ExportTablePDF";

type TableToolbarProps = {
  restitutionTaskID: string;
  count: number;
  titre: string;
  table: Table<any>;
  search: string;
  ordering: string;
  setSearch: (value: string) => void;
  setPageSize: (page: number) => void;
  advanced_filters: any;
  setAdvanced_filters: (s: any) => void;
};

export default function TableSimpleToolbar({
  restitutionTaskID,
  count,
  titre,
  table,
  search,
  ordering,
  setSearch,
  setPageSize,
  advanced_filters,
  setAdvanced_filters,
}: TableToolbarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAdvancedFilter = (
    filters: { column: string; operator: string; value: string }[]
  ) => {
    setAdvanced_filters(filters);
  };

  const columnNames = table
    .getAllColumns()
    .filter((col) => col.getIsVisible() && typeof col.id === "string")
    .map((col) => ({
      id: col.id,
      typeAttribut: col.columnDef.meta?.typeAttribut,
    }));

  return (
    <>
      {advanced_filters?.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-2">
          {advanced_filters.map((filter: any, index: number) => (
            <div
              key={index}
              className="flex items-center gap-1 px-2 py-1 rounded bg-teal-100 text-teal-800 text-sm"
            >
              <span>{filter.column}</span>
              <span>{filter.operator}</span>
              <span>{filter.value}</span>
              <button
                onClick={() =>
                  setAdvanced_filters((prev: any[]) =>
                    prev.filter((_, i) => i !== index)
                  )
                }
                className="ml-1 text-red-900 hover:text-red-600"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="w-full divide-y divide-gray-200 overflow-visible rounded-lg bg-white ">
        <div className="flex items-center justify-end p-2 border-t border-gray-300">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Recherche"
              className="p-2 mr-2 shadow-sm border outline-0 focus:ring-teal-500 focus:border-teal-500 sm:text-sm border-gray-300 rounded-md"
              id="recherche"
              name="recherche"
              autoComplete="off"
            />

            <div className="min-h-[calc(20px)] w-px bg-gray-500 mx-2" />

            <Search
              size={18}
              className="cursor-pointer text-gray-600 hover:text-black"
              onClick={() => setIsModalOpen(true)}
            />
            <ExportTableExcel
              restitutionTaskID={restitutionTaskID}
              titre={titre}
              count={count}
              headers={columnNames.map((col) => col.id)}
              search={search}
              advanced_filters={advanced_filters}
              ordering={ordering}
            />

            <ExportTableCSV
              restitutionTaskID={restitutionTaskID}
              titre={titre}
              count={count}
              headers={columnNames.map((col) => col.id)}
              search={search}
              advanced_filters={advanced_filters}
              ordering={ordering}
            />

            <ExportTablePDF
              restitutionTaskID={restitutionTaskID}
              titre={titre}
              count={count}
              headers={columnNames.map((col) => col.id)}
              search={search}
              advanced_filters={advanced_filters}
              ordering={ordering}
            />
            <div className="min-h-[calc(20px)] w-px bg-gray-500 mx-2" />

            <ColumnVisibilityMenu table={table} />
          </div>
        </div>
      </div>

      <AdvancedSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={handleAdvancedFilter}
        columns={columnNames}
        initialFilters={advanced_filters}
      />
    </>
  );
}
