import Navbar from "@/layout/asides/Asides";
import Header from "@/layout/headers/Header";
import { defaults } from "chart.js/auto";

import { Url } from "@/layout/content/url";
import {
  getRestitution,
  checkTaskStatus,
  checkTableTaskStatus,
  relancerLLM,
} from "@/components/queries/useVisualisation";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Edit, Copy } from "lucide-react";
import { useAllRestitutionIds } from "@/components/queries/useAllRestitutionIds";

import TableSimple from "@/components/table_simple/TableSimple";
import PieChartComponent from "@/components/graphs/PieChartComponent";
import DualChartComponent from "@/components/graphs/DualChartComponent";
import HistogrammeComponent from "@/components/graphs/HistogrammeComponent";
import DualMapsComponent from "@/components/graphs/DualMapsComponent";
import { SortingState } from "@tanstack/react-table";
import IAAnalysisResult from "./IAAnalysisResult";
import { ErrorState } from "./ErrorState";
import { LoadingBar } from "@/components/ui/LoadingBar";

defaults.maintainAspectRatio = false;
defaults.responsive = true;

defaults.plugins.title.display = true;
defaults.plugins.title.align = "start";
defaults.plugins.title.font = {
  size: 20,
  //   family: "Arial",
  //   weight: "bold",
};

defaults.plugins.title.color = "black";

export default function Visualisation() {
  const { restitutionId } = useParams();
  const [searchParams] = useSearchParams();
  const nomAffichage = searchParams.get("affichage");
  const navigate = useNavigate();

  const { data: allIds } = useAllRestitutionIds();
  const currentIndex =
    allIds?.findIndex((r) => r.id === Number(restitutionId)) ?? -1;
  const prevItem = currentIndex > 0 ? allIds![currentIndex - 1] : null;
  const nextItem =
    currentIndex >= 0 && currentIndex < (allIds?.length ?? 0) - 1
      ? allIds![currentIndex + 1]
      : null;
  console.log("[VISUALISATION] nextItem=", nextItem);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [restitutionTaskID, setRestitutionTaskID] = useState("");
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState("");
  const [advanced_filters, setAdvanced_filters] = useState([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [data, setData] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [manualLlmTaskId, setManualLlmTaskId] = useState<string | null>(null);
  const [llmTriggering, setLlmTriggering] = useState(false);

  const launch = useMutation({
    mutationFn: async () => {
      const restitution = await getRestitution(Number(restitutionId));
      const res_taskID = restitution?.task_id;
      setRestitutionTaskID(res_taskID);
      if (
        nomAffichage == "Tableau croisée dynamique" ||
        nomAffichage == "Tableau simple"
      ) {
        return new Promise((resolve, reject) => {
          const interval = setInterval(async () => {
            const statusRes = await checkTableTaskStatus(
              restitution.task_id,
              page,
              pageSize,
              ordering,
              search,
              advanced_filters,
            );
            if (statusRes.status === "SUCCESS") {
              clearInterval(interval);
              resolve(statusRes.result);
            } else if (statusRes.status === "FAILURE") {
              clearInterval(interval);
              reject(statusRes.result ?? "Erreur lors de l'exécution du calcul.");
            }
          }, 2000);
        });
      } else {
        return new Promise((resolve, reject) => {
          const interval = setInterval(async () => {
            const statusRes = await checkTaskStatus(restitution.task_id);
            if (statusRes.status === "SUCCESS") {
              clearInterval(interval);
              resolve(statusRes.result);
            } else if (statusRes.status === "FAILURE") {
              clearInterval(interval);
              reject(statusRes.result ?? "Erreur lors de l'exécution du calcul.");
            }
          }, 2000);
        });
      }
    },
    onSuccess: (data: any) => {
      setResult(data);
      setData(data.resultats);
      setCount(data.count);
      setCount(data.count);
      setTotalPages(data.total_pages);
      setLoading(false);
    },
    onError: (err: any) => {
      setError(err ?? "Erreur lors de l'exécution du calcul.");
      setLoading(false);
    },
  });

  useEffect(() => {
    setResult(null);
    setData([]);
    setCount(0);
    setTotalPages(0);
    setLoading(true);
    setError(null);
    setRestitutionTaskID("");
    setManualLlmTaskId(null);
    setLlmTriggering(false);
    launch.mutate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restitutionId]);

  useEffect(() => {
    if (!result && !restitutionTaskID) return;
    setLoading(true);

    checkTableTaskStatus(
      restitutionTaskID,
      page,
      pageSize,
      ordering,
      search,
      advanced_filters,
    )
      .then((res) => {
        if (res.status === "SUCCESS") {
          setData(res.result.resultats);
          setCount(res.result.count);
          setTotalPages(res.result.total_pages);
        } else {
          console.log("Tâche en cours...");
        }
      })
      .catch((err) => {
        setError("Erreur lors de la pagination");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page, pageSize, ordering, search, advanced_filters]);

  // 🔄 Rendu dynamique selon le type d'affichage
  const renderComponent = () => {
    const activeLlmTaskId = manualLlmTaskId || (result?.llm_generative_task_id !== 0 ? result?.llm_generative_task_id : null);
    const ia = activeLlmTaskId ? (
      <IAAnalysisResult
        llmTaskId={activeLlmTaskId}
        llmmodele={result.llmmodele}
        restitutionId={Number(restitutionId)}
        restitutionTaskId={restitutionTaskID}
        exportMode
      />
    ) : null;

    switch (result?.affichage) {
      case "Tableau simple":
        return (
          <TableSimple
            restitutionTaskID={restitutionTaskID}
            titre={result.nom}
            champs={result.champs}
            isLoading={loading}
            isError={error ? true : false}
            dataRes={data}
            count={count}
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            setPageSize={setPageSize}
            search={search}
            setSearch={setSearch}
            advanced_filters={advanced_filters}
            setAdvanced_filters={setAdvanced_filters}
            ordering={ordering}
            setOrdering={setOrdering}
            sorting={sorting}
            setSorting={setSorting}
          >
            {ia}
          </TableSimple>
        );

      case "Tableau croisée dynamique":
        return (
          <TableSimple
            restitutionTaskID={restitutionTaskID}
            titre={result.nom}
            champs={result.champs}
            isLoading={loading}
            isError={error ? true : false}
            dataRes={data}
            count={count}
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            setPageSize={setPageSize}
            search={search}
            setSearch={setSearch}
            advanced_filters={advanced_filters}
            setAdvanced_filters={setAdvanced_filters}
            ordering={ordering}
            setOrdering={setOrdering}
            sorting={sorting}
            setSorting={setSorting}
          >
            {ia}
          </TableSimple>
        );

      case "Diagramme circulaire":
        return (
          <PieChartComponent titre={result.nom} sourceData={result.resultats}>
            {ia}
          </PieChartComponent>
        );

      case "Graphique linéaire":
        return (
          <DualChartComponent
            titre={result.nom}
            backendData={result.resultats}
            views={false}
          >
            {ia}
          </DualChartComponent>
        );

      case "Histogramme":
        return (
          <HistogrammeComponent
            titre={result.nom}
            backendData={result.resultats}
            views={false}
          >
            {ia}
          </HistogrammeComponent>
        );

      case "Cartographie":
        return (
          <DualMapsComponent
            titre={result.nom}
            backendData={result.resultats}
            views={false}
          >
            {ia}
          </DualMapsComponent>
        );

      case "Courbe":
        return <div className="p-4">📈 À venir : composant Courbe</div>;

      default:
        return (
          <div className="p-8 text-center text-red-600">
            Type d'affichage inconnu: {result?.affichage}
          </div>
        );
    }
  };

  return (
    <>
      <Navbar />

      <div className="md:pl-64 flex flex-col flex-1">
        <Header />

        <main className="flex-1">
          <Url />

          <div className="py-2">
            {loading && <LoadingBar />}

            {error && (
              <ErrorState
                error={typeof error === "object" ? error : String(error)}
                msgP={typeof error === "object" ? error?.msgP : undefined}
                onRetry={() => {
                  setError(null);
                  setLoading(true);
                  setResult(null);
                  launch.mutate();
                }}
              />
            )}

            {result && !error && (
              <>
                {renderComponent()}

                {/* <pre className="p-4 bg-gray-100 text-sm rounded">
                  {JSON.stringify(result, null, 2)}
                </pre> */}

                <br />
                <div className="px-4 sm:px-6 lg:px-8">
                  {(() => {
                    const activeLlmTaskId = manualLlmTaskId || (result?.llm_generative_task_id !== 0 ? result?.llm_generative_task_id : null);
                    const isTableAffichage = result?.affichage === "Tableau croisée dynamique" || result?.affichage === "Tableau simple";

                    if (activeLlmTaskId && isTableAffichage) {
                      return (
                        <IAAnalysisResult
                          llmTaskId={activeLlmTaskId}
                          llmmodele={result.llmmodele}
                          restitutionId={Number(restitutionId)}
                          restitutionTaskId={restitutionTaskID}
                          exportMode
                        />
                      );
                    }

                    if (result?.llm_generative_task_id === 0 && !manualLlmTaskId) {
                      return (
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-500 italic">
                            Modèle analyse IA désactivé
                          </p>
                          <button
                            disabled={llmTriggering}
                            onClick={async () => {
                              setLlmTriggering(true);
                              try {
                                const res = await relancerLLM(Number(restitutionId), restitutionTaskID);
                                setManualLlmTaskId(res.llm_task_id);
                              } catch {
                                /* silencieux */
                              } finally {
                                setLlmTriggering(false);
                              }
                            }}
                            className="ml-4 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-md transition-colors"
                          >
                            {llmTriggering ? "Lancement…" : "Lancer l'analyse IA"}
                          </button>
                        </div>
                      );
                    }

                    return null;
                  })()}
                </div>
              </>
            )}
          </div>

          {/* Barre d'actions : navigation + Modifier / Dupliquer */}
          <div className="bg-white border-b border-gray-100 mb-4">
            <div className="px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    prevItem &&
                    navigate(
                      `/visualisation/${prevItem.id}?affichage=${prevItem.affichage ?? ""}`,
                    )
                  }
                  disabled={!prevItem}
                  title={prevItem?.nom}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} />
                  Précédent
                </button>
                <button
                  onClick={() =>
                    nextItem &&
                    navigate(
                      `/visualisation/${nextItem.id}?affichage=${nextItem.affichage ?? ""}`,
                    )
                  }
                  disabled={!nextItem}
                  title={nextItem?.nom}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Suivant
                  <ChevronRight size={14} />
                </button>
                {allIds && currentIndex >= 0 && (
                  <span className="ml-2 text-xs text-gray-400">
                    {currentIndex + 1} / {allIds.length}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/modification/${restitutionId}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Edit size={14} />
                  Modifier
                </button>
                <button
                  onClick={() => navigate(`/duplication/${restitutionId}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 transition-colors"
                >
                  <Copy size={14} />
                  Dupliquer
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
