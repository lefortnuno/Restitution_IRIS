import { ReactNode, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import AffichageTableSimple from "@/components/table_simple/AffichageTableSimple";
import { SortingState } from "@tanstack/react-table";

type TableSimpleProps = {
  restitutionTaskID: string;
  titre: string;
  champs: { nom: string; as_nom: string; typeAttribut: string | null }[];
  isLoading?: boolean;
  isError?: boolean;
  dataRes: any[];
  count: number;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  setPageSize: (page: number) => void;
  search: string;
  setSearch: (s: string) => void;
  advanced_filters: any;
  setAdvanced_filters: (s: any) => void;
  ordering: string;
  setOrdering: (s: string) => void;
  sorting: SortingState;
  setSorting: (s: SortingState) => void;
  children?: ReactNode;
};

export default function TableSimple({
  restitutionTaskID,
  titre,
  champs,
  isLoading,
  isError,
  dataRes,
  count,
  page,
  totalPages,
  setPage,
  setPageSize,
  search,
  setSearch,
  advanced_filters,
  setAdvanced_filters,
  ordering,
  setOrdering,
  sorting,
  setSorting,
  children,
}: TableSimpleProps) {
  const handleSortingChange = (sortingState: SortingState) => {
    setSorting(sortingState);

    if (sortingState.length > 0) {
      const { id, desc } = sortingState[0];
      setOrdering(desc ? `-${id}` : id);
    } else {
      setOrdering("");
    }
  };

  const resColumns = useMemo(() => {
    return champs.map((champ) => ({
      header: champ.nom,
      accessorFn: (row: any) => row[champ.nom],
      meta: { typeAttribut: champ.typeAttribut },
    }));
  }, [champs]);

  return (
    <>
      <div className="py-2">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 my-3">{titre}</h1>
        </div>
        <ErrorBoundary fallback={<div>Erreur dans le tableau.</div>}>
          <AffichageTableSimple
            restitutionTaskID={restitutionTaskID}
            count={count}
            titre={titre}
            data={dataRes ?? []}
            columns={resColumns}
            isLoading={isLoading}
            isError={isError}
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            setPageSize={setPageSize}
            search={search}
            setSearch={setSearch}
            advanced_filters={advanced_filters}
            setAdvanced_filters={setAdvanced_filters}
            ordering={ordering}
            sorting={sorting}
            setSorting={setSorting}
            onSortingChange={handleSortingChange}
          />
        </ErrorBoundary>
      </div>
    </>
  );
}
