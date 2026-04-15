type BackendError = string | {
  message?: string;
  sqlstate?: string;
  pgerror?: string;
  requete_sql?: string;
};

interface ErrorStateProps {
  error: BackendError;
  msgP?: string;
  onRetry?: () => void;
}

export function ErrorState({ error, msgP, onRetry }: ErrorStateProps) {
  const errorObj =
    typeof error === "string"
      ? { message: error }
      : error;

  const handleCopy = () => {
    const content = [
      msgP               ? `Message : ${msgP}`                          : null,
      errorObj.message   ? `Détail : ${errorObj.message}`               : null,
      errorObj.sqlstate  ? `SQLSTATE : ${errorObj.sqlstate}`            : null,
      errorObj.pgerror   ? `Erreur PostgreSQL : ${errorObj.pgerror}`    : null,
      errorObj.requete_sql ? `Requête SQL : ${errorObj.requete_sql}`    : null,
    ]
      .filter(Boolean)
      .join("\n\n");
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 border border-red-200 bg-red-50 rounded-xl shadow-sm">

      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-red-200">
        <h2 className="text-lg font-semibold text-red-700">
          <span className="text-red-600 text-2xl mr-4">⚠️</span>
          Une erreur est survenue lors du traitement
        </h2>
      </div>

      {/* Message contextuel (étape d'échec) */}
      {msgP && (
        <div className="px-6 py-3 text-red-900 font-medium border-b border-red-100">
          {msgP}
        </div>
      )}

      {/* Détails techniques */}
      <details className="px-6 pb-4">
        <summary className="cursor-pointer text-sm text-red-700 font-medium mt-3">
          Détails techniques
        </summary>

        <div className="mt-3 bg-white border border-red-200 rounded-lg p-4 text-sm text-gray-800 space-y-2">

          <div className="text-red-800 whitespace-pre-wrap">
            {errorObj.message || "Une erreur inattendue est survenue."}
          </div>

          {errorObj.sqlstate && (
            <div>
              <span className="font-semibold">SQLSTATE :</span>{" "}
              <code>{errorObj.sqlstate}</code>
            </div>
          )}

          {errorObj.pgerror && (
            <div>
              <span className="font-semibold">Erreur PostgreSQL :</span>
              <pre className="mt-1 whitespace-pre-wrap text-xs bg-gray-100 p-2 rounded">
                {errorObj.pgerror}
              </pre>
            </div>
          )}

          {errorObj.requete_sql && (
            <div>
              <span className="font-semibold">Requête SQL :</span>
              <pre className="mt-1 whitespace-pre-wrap text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                {errorObj.requete_sql}
              </pre>
            </div>
          )}
        </div>
      </details>

      {/* Actions */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-red-200">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
          >
            Réessayer
          </button>
        )}

        <button
          onClick={handleCopy}
          className="px-4 py-2 rounded-md border border-red-300 text-red-700 hover:bg-red-100 transition"
        >
          Copier l'erreur
        </button>
      </div>
    </div>
  );
}
