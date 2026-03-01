type BackendError = string | {
  message?: string;
  sqlstate?: string;
  pgerror?: string;
  requete_sql?: string;
};

interface ErrorStateProps {
  error: BackendError;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const errorObj =
    typeof error === "string"
      ? { message: error }
      : error;

  return (
    <div className="max-w-4xl mx-auto mt-10 border border-red-200 bg-red-50 rounded-xl shadow-sm">
      
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-red-200">
        <span className="text-red-600 text-2xl"></span>
        <h2 className="text-lg font-semibold text-red-700">
          Une erreur est survenue lors du traitement
        </h2>
      </div>

      {/* Message principal */} 
      <div className="px-6 py-4 text-red-800 whitespace-pre-wrap">
        {errorObj.message || "Une erreur inattendue est survenue."}
      </div>


      {/* Détails techniques */}
      <details className="px-6 pb-4">
        <summary className="cursor-pointer text-sm text-red-700 font-medium">
          Détails techniques
        </summary>

        <div className="mt-3 bg-white border border-red-200 rounded-lg p-4 text-sm text-gray-800 space-y-2">
          
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
          onClick={() =>
            navigator.clipboard.writeText(
              JSON.stringify(errorObj, null, 2)
            )
          }
          className="px-4 py-2 rounded-md border border-red-300 text-red-700 hover:bg-red-100 transition"
        >
          Copier l’erreur
        </button>
      </div>
    </div>
  );
}
