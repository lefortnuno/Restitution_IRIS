import { useNavigate } from "react-router-dom";
import { flexRender, Row } from "@tanstack/react-table";
import { Eye, Edit, Copy, Trash2 } from "lucide-react";

type TableBodyProps = {
  rows: Row<any>[];
  onRowSelect: (rowId: string) => void;
  onDeleteRequest: (rowId: number) => void; // callback pour demande suppression
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  isDeleting?: boolean;
};

export default function TableBody({
  rows,
  onRowSelect,
  onDeleteRequest,
  isLoading = false,
  isError = false,
  isEmpty = false,
  isDeleting = false,
}: TableBodyProps) {
  const navigate = useNavigate();

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
            {isEmpty && <span>Aucune restitution trouvée.</span>}
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className="divide-y divide-gray-200 bg-white text-left">
      {rows.map((row) => (
        <tr
          key={row.original.id}
          className="hover:bg-gray-100 transition-all border-b border-gray-200"
          onClick={(e) => {
            e.stopPropagation();

            onRowSelect(row.original.id);
          }}
        >
          {row.getVisibleCells().map((cell) => (
            <td
              key={cell.id}
              className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-normal text-gray-900 sm:pl-6 text-left"
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}

          <td className="px-4 py-3 flex items-center space-x-2 text-gray-600">
            <button
              className="hover:text-green-600 transition"
              onClick={(e) => {
                e.stopPropagation();
                navigate(
                  `/visualisation/${row.original.id}?affichage=${row.original.affichages?.[0]?.nom_affichage}`
                );
              }}
              title="Visualiser"
            >
              <Eye size={18} />
            </button>
            <button
              title="Modifier"
              className="hover:text-blue-600 transition"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/modification/${row.original.id}`);
              }}
            >
              <Edit size={18} />
            </button>
            <button
              title="Dupliquer"
              className="hover:text-purple-600 transition"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/duplication/${row.original.id}`);
              }}
            >
              <Copy size={18} />
            </button>
            <button
              className="hover:text-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteRequest(row.original.id);
              }}
              title="Supprimer"
              disabled={isDeleting}
            >
              <Trash2 size={18} />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  );
}
