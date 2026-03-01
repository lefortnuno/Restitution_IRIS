import { useEffect, useState } from "react";
import { checkTaskLLMStatus } from "@/components/queries/useVisualisation";

interface IAAnalysisResultProps {
  llmTaskId: string;
  llmmodele: string;
  exportMode?: boolean;
}

export default function IAAnalysisResult({
  llmTaskId,
  llmmodele,
  exportMode,
}: IAAnalysisResultProps) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"PENDING" | "SUCCESS" | "FAILURE">(
    "PENDING",
  );
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const now = new Date();

  useEffect(() => {
    if (!llmTaskId) return;

    const interval = setInterval(async () => {
      try {
        const res = await checkTaskLLMStatus(llmTaskId);
        console.log("Polling LLM res === ", res);

        if (res.status === "SUCCESS") {
          // Assurer que result est un objet JSON et non texte brut
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
  }, [llmTaskId]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        L'analyse IA est en cours, merci de patienter…
        <div className="flex justify-center items-center p-8">
          <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-teal-400 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  if (status === "FAILURE") {
    return (
      <div className="p-8 text-center text-red-600 bg-red-100 rounded shadow">
        ⚠️ {error}
      </div>
    );
  }

  if (status === "SUCCESS" && result) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 space-y-4">
        {result.anomalies_possibles &&
          result.anomalies_possibles.length > 0 && (
            <div className="bg-red-100 p-6">
              <h3 className="text-lg font-semibold text-gray-700">
                Anomalies possibles:
              </h3>
              <ul className="list-disc list-inside text-gray-600">
                {result.anomalies_possibles.map((a: string, i: number) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}

        <p className="text-sm text-end text-gray-500 italic">
          Modèle IA : {llmmodele}
        </p>
        {/* Affiche le texte brut si aucune clé structurée n'est présente */}
        {!result.tendances_cles &&
          !result.anomalies_possibles &&
          result.message && (
            <pre className="p-4 bg-gray-100 rounded text-gray-700">
              {result.message}
            </pre>
          )}
      </div>
    );
  }

  if (exportMode && status === "SUCCESS" && result) {
    return (
      <div className="w-[1200px] bg-white text-black p-8 font-sans">
        {/* HEADER */}
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <img src="/ac2i.svg" alt="Logo société" className="h-12 w-12" />
          <h1 className="text-xl font-semibold"> </h1>
          <img src="/logo.svg" alt="Logo app" className="h-12 w-12" />
        </div>

        {/* CONTENT */}
        <div className="min-h-[600px]"> </div>

        {/* FOOTER */}
        <div className="border-t mt-8 pt-4 text-xs text-gray-600 flex justify-between">
          <span>
            Généré le {now.toLocaleDateString()} à {now.toLocaleTimeString()}
          </span>
          <span>ac2i@ac2i.ma | +212 6 42 35 95 84</span>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold mb-2">Analyse IA</h2>

          <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 space-y-4">
            {result.anomalies_possibles &&
              result.anomalies_possibles.length > 0 && (
                <div className="bg-red-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Anomalies possibles:
                  </h3>
                  <ul className="list-disc list-inside text-gray-600">
                    {result.anomalies_possibles.map((a: string, i: number) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </div>
      </div>
    );
  }
  return null;
}
