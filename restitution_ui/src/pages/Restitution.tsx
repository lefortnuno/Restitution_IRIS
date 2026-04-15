import { useRef, useEffect, useMemo, useState } from "react";
import { Row, HeaderContext, SortingState } from "@tanstack/react-table";
import BasicTable from "@/components/table/BasicTable";
import Header from "@/layout/headers/Header";
import Asides from "@/layout/asides/Asides";
import { UrlRestitution } from "@/layout/content/url";
import useRestitutions, {
  RestitutionType,
} from "@/components/queries/useRestitutions";
import { ErrorBoundary } from "react-error-boundary";

function IndeterminateCheckbox({
  checked,
  indeterminate,
  onChange,
  disabled,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = !!indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      type="checkbox"
      id={`checkbox-${Math.random().toString(36).substr(2, 9)}`}
      name="select-row"
      ref={ref}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="w-4 h-4 cursor-pointer accent-blue-600"
    />
  );
}

export default function Restitution() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data, isLoading, isError } = useRestitutions(page, search, ordering);
  const totalPages = Math.ceil((data?.count ?? 0) / 6);

  const handleSortingChange = (sortingState: SortingState) => {
    setSorting(sortingState);

    if (sortingState.length > 0) {
      const { id, desc } = sortingState[0];
      setOrdering(desc ? `-${id}` : id);
    } else {
      setOrdering("");
    }
  };

  const resColumns = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }: HeaderContext<RestitutionType, unknown>) => (
          <IndeterminateCheckbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={(event) => table.getToggleAllRowsSelectedHandler()(event)}
          />
        ),
        cell: ({ row }: { row: Row<RestitutionType> }) => (
          <IndeterminateCheckbox
            checked={row.getIsSelected()}
            indeterminate={row.getIsSomeSelected()}
            disabled={!row.getCanSelect()}
            onChange={(event) => row.getToggleSelectedHandler()(event)}
          />
        ),
      },
      {
        header: "Numéro",
        accessorKey: "id",
      },
      {
        header: "Nom de la restitution",
        accessorKey: "nom",
      },
      {
        header: "Date de création",
        accessorKey: "created_at",
        cell: ({ row }: { row: Row<RestitutionType> }) => {
          const rawDate = row.original.created_at;
          const date = new Date(rawDate);
          const formatted = `Le ${date.toLocaleDateString(
            "fr-FR"
          )} à ${date.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}`;
          return formatted;
        },
      },
      {
        header: "Date de modification",
        accessorKey: "updated_at",
        cell: ({ row }: { row: Row<RestitutionType> }) => {
          const rawDate = row.original.updated_at;
          const date = new Date(rawDate);
          const formatted = `Le ${date.toLocaleDateString(
            "fr-FR"
          )} à ${date.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}`;
          return formatted;
        },
      },
      {
        header: "Créer par",
        // accessorKey: "created_by.username", // Desactiver le sorting ici 
        cell: ({ row }: { row: Row<RestitutionType> }) =>
          row.original.created_by?.first_name ?? "—",
      },
      {
        header: "Affichage sous forme", 
        cell: ({ row }: { row: Row<RestitutionType> }) =>
          row.original.affichages?.[0]?.nom_affichage ?? "—",
        // enableGlobalFilter: false,
        // enableSorting: false,
      },
    ],
    []
  );
 
  return (
    <>
      <Asides />

      <div className="md:pl-64 flex flex-col flex-1">
        <Header />

        <main className="flex-1">
          <UrlRestitution />
          <div className="py-2">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900 my-3">
                Restitution des données IP DU SERVEUR
              </h1>
            </div>
            <ErrorBoundary fallback={<div>Erreur dans le tableau.</div>}>
              <BasicTable
                data={data?.results ?? []}
                columns={resColumns}
                isLoading={isLoading}
                isError={isError}
                page={page}
                totalPages={totalPages}
                setPage={setPage}
                search={search}
                setSearch={setSearch}
                sorting={sorting}
                setSorting={setSorting}
                onSortingChange={handleSortingChange}
              />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </>
  );
}
