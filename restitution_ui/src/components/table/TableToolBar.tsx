import { Table } from "@tanstack/react-table";
import ColumnVisibilityMenu from "./ColumnVisibilityMenu";
import { Search, Printer, Download, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

type TableToolbarProps = {
  table: Table<any>;
  onBulkDelete: () => void;
  search: string;
  setSearch: (value: string) => void;
};

export default function TableToolbar({
  table,
  onBulkDelete,
  search,
  setSearch,
}: TableToolbarProps) {
  const selectedRowIds = table.getState().rowSelection;
  const selectedRowCount = Object.keys(selectedRowIds).length;

  const navigate = useNavigate();

  return (
    <div className="w-full divide-y divide-gray-200 overflow-visible rounded-lg bg-white ">
      <div className="flex items-center justify-end p-2 border-t border-gray-300">
        <div className="flex items-center gap-3">
          {/* Recherche rapide */}
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

          {selectedRowCount > 0 && (
            <button
              onClick={onBulkDelete} // ouvre la modal au lieu de window.confirm
              className="bg-transparent text-black border border-gray-500 px-4 py-1 rounded-sm flex items-center gap-2 hover:bg-red-500 hover:text-white transition"
            >
              <Trash2 size={18} className="hover:text-white" />
              Supprimer ({selectedRowCount})
            </button>
          )}

          {/* <Search
            size={18}
            className="cursor-pointer text-gray-600 hover:text-black"
          />
          <Printer
            size={18}
            className="cursor-pointer text-gray-600 hover:text-black"
          />
          <Download
            size={18}
            className="cursor-pointer text-gray-600 hover:text-black"
          /> */}
          <button
            className="capitalize inline-flex items-center justify-center border border-transparent bg-teal-600 px-4 py-2 mr-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:ring-offset-2 sm:w-auto"
            onClick={(e) => {
              e.stopPropagation();
              navigate("/parametrage");
            }}
          >
            <Plus size={18} />
            Ajouter
          </button>

          <div className="min-h-[calc(20px)] w-px bg-gray-500 mx-2" />

          <ColumnVisibilityMenu table={table} />
        </div>
      </div>
    </div>
  );
}
