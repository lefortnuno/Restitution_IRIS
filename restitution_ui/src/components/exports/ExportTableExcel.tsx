import { useState } from "react";
import * as XLSX from "xlsx";
import { checkTableTaskStatus } from "@/components/queries/useVisualisation";

interface ExportExcelProps {
  titre: string;
  count: number;
  headers?: string[];
  restitutionTaskID: string;
  ordering: string;
  search: string;
  advanced_filters: any;
}

export default function ExportTableExcel({
  titre,
  count,
  headers,
  restitutionTaskID,
  ordering,
  search,
  advanced_filters,
}: ExportExcelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const exportAsExcel = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await checkTableTaskStatus(
        restitutionTaskID,
        1,
        count,
        ordering,
        search,
        advanced_filters
      );

      if (res.status !== "SUCCESS") {
        setError("Les données ne sont pas encore prêtes.");
        return;
      }

      const results = res.result.resultats;
      if (!results || results.length === 0) {
        setError("Pas de données à exporter.");
        return;
      }

      const keys = headers || Object.keys(results[0]);

      const formattedData = results.map((row: any) => {
        const newRow: Record<string, any> = {};
        keys.forEach((key) => {
          const raw = row[key];
          if (Array.isArray(raw)) {
            newRow[key] = raw.join(" | ");
          } else if (typeof raw === "object" && raw !== null) {
            newRow[key] = JSON.stringify(raw);
          } else {
            newRow[key] = raw ?? "";
          }
        });
        return newRow;
      });

      // Iinsèrtion titre avant les données
      const dataWithTitle = [
        [titre], // Ligne 1 : titre
        keys, // Ligne 2 : en-têtes
        ...formattedData.map((obj: any) => keys.map((k) => obj[k])),
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(dataWithTitle);

      // Fusionner la cellule du titre sur toutes les colonnes
      worksheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: keys.length - 1 } },
      ];

      // Largeur automatique des colonnes
      const colWidths = keys.map((k) => ({
        wch:
          Math.max(
            k.length,
            ...formattedData.map((row: any) => String(row[k] || "").length)
          ) + 2,
      }));
      worksheet["!cols"] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Données");

      XLSX.writeFile(workbook, `${titre}.xlsx`);
    } catch (err) {
      setError("Erreur lors de l'export Excel");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 justify-center rounded-md border border-transparent px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors bg-teal-600 hover:bg-teal-700"
      onClick={exportAsExcel}
      disabled={loading}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 50 50"
        width="20px"
        height="20px"
        fill="currentColor"
      >
        <path d="M29.638,0.229c-0.23-0.19-0.533-0.268-0.825-0.212l-28,5.333C0.341,5.44,0,5.853,0,6.333v37.334c0,0.48,0.341,0.893,0.813,0.982l28,5.333C28.875,49.994,28.938,50,29,50c0.23,0,0.457-0.08,0.638-0.229C29.867,49.58,30,49.298,30,49V1C30,0.702,29.867,0.419,29.638,0.229z M18.517,34.377L18.517,34.377l-3.221-6.088c-0.122-0.227-0.248-0.645-0.378-1.252h-0.052c-0.061,0.287-0.205,0.722-0.431,1.304l-3.233,6.037h-5.02l5.959-9.349l-5.45-9.35h5.125l2.673,5.607c0.209,0.443,0.396,0.969,0.561,1.578h0.05c0.104-0.365,0.3-0.909,0.587-1.63l2.973-5.555h4.694l-5.607,9.271l5.764,9.427H18.517z"></path>
        <path d="M47,6H32v7h2v2h-2v5h2v2h-2v5h2v2h-2v6h2v2h-2v7h15c1.103,0,2-0.897,2-2V8C49,6.897,48.103,6,47,6z M44,37h-8v-2h8V37z M44,29h-8v-2h8V29z M44,22h-8v-2h8V22z M44,15h-8v-2h8V15z"></path>
      </svg>
      <span className="hidden sm:inline">Excel</span>
    </button>
  );
}
