import Navbar from "@/layout/asides/Asides";
import Header from "@/layout/headers/Header";
import { defaults } from "chart.js/auto";

import { Url } from "@/layout/content/url";
import {
  getRestitution,
  checkTaskStatus,
  checkTableTaskStatus,
} from "@/components/queries/useVisualisation";
import { useParams, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";

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
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(0);

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
              reject("Erreur lors de l'exécution du calcul.");
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
              reject("Erreur lors de l'exécution du calcul.");
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
      setError(String(err));
      setLoading(false);
    },
  });

  useEffect(() => {
    if (!result && !error) {
      launch.mutate();
    }
  }, []);

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
    const ia = result?.llm_generative_task_id ? (
      <IAAnalysisResult llmTaskId={result.llm_generative_task_id} llmmodele={result.llmmodele} exportMode />
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

      case "Graphique en barres":
        return (
          <DualChartComponent
            titre={result.nom}
            backendData={result.resultats}
            views={true}
          >
            {ia}
          </DualChartComponent>
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
                error={error}
                onRetry={() => {
                  setError("");
                  setLoading(true);
                  setResult(null);
                  launch.mutate();
                }}
              />
            )}

            {result && (
              <>
                {renderComponent()}

                {/* <pre className="p-4 bg-gray-100 text-sm rounded">
                  {JSON.stringify(result, null, 2)}
                </pre> */}

                <br />
                {result?.llm_generative_task_id !== undefined &&
                  result?.llm_generative_task_id !== 0 &&
                  (result?.affichage === "Tableau croisée dynamique" ||
                    result?.affichage === "Tableau simple") && (
                    <IAAnalysisResult
                      llmTaskId={result.llm_generative_task_id}
                      llmmodele={result.llmmodele}
                      exportMode
                    />
                  )}

                {result?.llm_generative_task_id === 0 && (
                  <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 space-y-4">
                    <div className="bg-red-100 p-6">
                      <p className="text-sm text-gray-500 italic">
                        Modèle analyse IA désactivé
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
