import { useNavigate } from "react-router-dom";
import { flexRender, Row } from "@tanstack/react-table";

type TableBodyProps = {
  rows: Row<any>[];
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
};

export default function TableSimpleBody({
  rows,
  isLoading = false,
  isError = false,
  isEmpty = false,
}: TableBodyProps) {
  if (isLoading || isError || isEmpty) {
    return (
      <tbody className="bg-white">
        <tr>
          <td colSpan={100} className="text-center py-10 text-gray-500 text-sm">
            {isLoading && (
              <span className="animate-pulse">Chargement des données...</span>
            )}
            {isError && (
              <span className="text-red-600">
                Erreur lors du chargement des données.
              </span>
            )}
            {isEmpty && <span>Aucune donnée.</span>}
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className="divide-y divide-gray-200 bg-white text-left">
      {rows.map((row, i) => (
        <tr
          key={`${row.id}_${i}`}
          className="hover:bg-gray-100 transition-all border-b border-gray-200"
          onClick={(e) => {
            e.stopPropagation();
            // onRowSelect(row.original.id);
          }}
        >
          {row.getVisibleCells().map((cell, j) => (
            <td
              key={`${row.id}_${cell.column.id}_${j}`}
              className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-normal text-gray-900 sm:pl-6 text-left"
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
