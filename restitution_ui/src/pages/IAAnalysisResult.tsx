import { useEffect, useState } from "react";
import { checkTaskLLMStatus, relancerLLM } from "@/components/queries/useVisualisation";
import { LoadingBar } from "@/components/ui/LoadingBar";
import { RefreshCw } from "lucide-react";

interface IAAnalysisResultProps {
  llmTaskId: string;
  llmmodele: string;
  restitutionId: number;
  restitutionTaskId: string;
  exportMode?: boolean;
}

export default function IAAnalysisResult({
  llmTaskId,
  llmmodele,
  restitutionId,
  restitutionTaskId,
  exportMode,
}: IAAnalysisResultProps) {
  const [currentTaskId, setCurrentTaskId] = useState(llmTaskId);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"PENDING" | "SUCCESS" | "FAILURE">("PENDING");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [isRetrying, setIsRetrying] = useState(false);
  const now = new Date();

  useEffect(() => {
    if (!currentTaskId) return;

    setLoading(true);
    setStatus("PENDING");
    setResult(null);
    setError("");

    const interval = setInterval(async () => {
      try {
        const res = await checkTaskLLMStatus(currentTaskId);

        if (res.status === "SUCCESS") {
          let finalResult = res.result?.res_llm ?? {};
          if (typeof finalResult === "string") {
            try {
              finalResult = JSON.parse(finalResult);
            } catch {
              finalResult = { message: finalResult };
            }
          }

          setResult(finalResult);
          setStatus("SUCCESS");
          setLoading(false);
          clearInterval(interval);
        } else if (res.status === "FAILURE") {
          setError("Erreur lors de l'exécution de l'analyse IA.");
          setStatus("FAILURE");
          setLoading(false);
          clearInterval(interval);
        }
      } catch (e: any) {
        setError("Erreur lors du polling du serveur.");
        setStatus("FAILURE");
        setLoading(false);
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentTaskId]);

  const handleRetry = async () => {
    if (isRetrying) return;
    setIsRetrying(true);
    try {
      const res = await relancerLLM(restitutionId, restitutionTaskId);
      if (res.llm_task_id) {
        setCurrentTaskId(res.llm_task_id);
      } else {
        setError(res.error ?? "Impossible de relancer l'analyse.");
      }
    } catch (e: any) {
      setError("Erreur lors du relancement de l'analyse IA.");
    } finally {
      setIsRetrying(false);
    }
  };

  const RetryButton = () => (
    <button
      onClick={handleRetry}
      disabled={isRetrying}
      className="inline-flex items-center gap-2 mt-3 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
    >
      <RefreshCw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
      {isRetrying ? "Relancement…" : "Relancer l'analyse IA"}
    </button>
  );

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
        <p className="text-center text-sm text-gray-500 mb-2">
          L'analyse IA est en cours, merci de patienter…
        </p>
        <LoadingBar />
      </div>
    );
  }

  if (status === "FAILURE") {
    return (
      <div className="p-6 bg-red-50 rounded-xl shadow border border-red-200 text-center">
        <p className="text-red-600 font-medium">⚠️ {error}</p>
        <RetryButton />
      </div>
    );
  }

  if (status === "SUCCESS" && result) {
    const hasStructuredData = result.tendances_cles || result.anomalies_possibles;
    const isEmptyResult =
      !hasStructuredData &&
      result.message &&
      (result.message.includes("Aucun résultat") ||
        result.message.includes("FAILED") ||
        result.message.includes("ERROR"));

    return (
      <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 space-y-4">
        {result.anomalies_possibles && result.anomalies_possibles.length > 0 && (
          <div className="bg-red-100 p-6">
            <h3 className="text-lg font-semibold text-gray-700">Anomalies possibles:</h3>
            <ul className="list-disc list-inside text-gray-600">
              {result.anomalies_possibles.map((a: string, i: number) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        )}

        {isEmptyResult ? (
          <div className="text-center">
            <p className="text-sm text-gray-500 italic">{result.message}</p>
            <RetryButton />
          </div>
        ) : (
          !hasStructuredData &&
          result.message && (
            <pre className="p-4 bg-gray-100 rounded text-gray-700">{result.message}</pre>
          )
        )}

        <p className="text-sm text-end text-gray-500 italic">Modèle IA : {llmmodele}</p>
      </div>
    );
  }

  return null;
}
