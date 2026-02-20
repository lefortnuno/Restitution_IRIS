import React from "react";
import L from "leaflet";

interface ExportSVGProps {
  titre: string;
  mapRef: React.RefObject<L.Map | null>;
  legend: {
    label: string;
    value: number;
    color: string;
  }[];
}

export default function ExportMapsSVG({
  titre,
  mapRef,
  legend,
}: ExportSVGProps) {
  const formatCurrency = (value: number): string => {
    if (value === 0) return "0 Dhs";
    const abs = Math.abs(value);
    const sign = value < 0 ? "-" : "";
    if (abs >= 1_000_000_000)
      return `${sign}${(abs / 1_000_000_000).toFixed(1)}B Dhs`;
    if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M Dhs`;
    if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}K Dhs`;
    return `${sign}${abs} Dhs`;
  };

  const handleExportSVG = async () => {
    const map = mapRef.current;

    if (!map) {
      console.error("Map reference is not available");
      return;
    }

    const screenshoter = (map as any)._simpleMapScreenshoter;
    if (!screenshoter) {
      console.error("Simple Map Screenshoter plugin is not initialized");
      return;
    }

    try {
      const mapImageBase64: string = await screenshoter.takeScreen("image", {
        mimeType: "image/png",
        quality: 0.95,
      });

      const mapImg = new Image();
      mapImg.onload = () => {
        const imgWidth = mapImg.width;
        const imgHeight = mapImg.height;

        // Dimensions SVG
        const padding = 20;
        const titleHeight = 40;
        const legendBox = 14;
        const legendLine = 18;
        const legendGap = 10;
        const legendTitleHeight = 24;

        const legendWidth = 260;
        const legendHeight =
          legend.length * (legendLine + legendGap) + legendTitleHeight;

        const contentHeight = imgHeight + padding * 2 + legendHeight + padding;
        const svgWidth = imgWidth + legendWidth + padding * 3;
        const svgHeight = titleHeight + contentHeight + padding;

        const mapX = padding;
        const mapY = titleHeight + padding;
        const legendX = padding;
        const legendY = mapY + imgHeight + padding * 2;
        const legendStartY = legendY + legendTitleHeight + 10;

        // Création du SVG
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">`;

        // Styles globaux
        svg += `
          <style>
            .title {
              font: bold 26px 'Segoe UI', sans-serif;
              fill: #0f172a;
            }
            .legend-title {
              font: bold 16px 'Segoe UI', sans-serif;
              fill: #111827;
            }
            .legend-label {
              font: 13px 'Segoe UI', sans-serif;
              fill: #374151;
            }
            .legend-box {
              rx: 3;
              ry: 3;
            }
            .map-shadow {
              filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.2));
            }
          </style>
        `;

        // Fond blanc
        svg += `<rect width="100%" height="100%" fill="white" />`;

        // Titre souligné
        svg += `<text x="${svgWidth / 12}" y="${
          padding + 26
        }" text-anchor="middle" class="title">${titre}</text>`;
        svg += `<line x1="${padding}" x2="${svgWidth - padding}" y1="${
          padding + 32
        }" y2="${padding + 32}" stroke="#e5e7eb" stroke-width="1" />`;

        // Image carte avec ombre
        svg += `<image href="${mapImageBase64}" x="${mapX}" y="${mapY}" width="${imgWidth}" height="${imgHeight}" class="map-shadow" />`;

        // Boîte de légende sous la carte
        svg += `<rect x="${legendX - 16}" y="${
          legendY - 16
        }" width="${legendWidth}" height="${
          legendHeight + 32
        }" fill="#f9fafb" stroke="#d1d5db" rx="12" ry="12" />`;

        // Titre légende
        svg += `<text x="${legendX}" y="${legendY}" class="legend-title">Légende</text>`;

        // Lignes de la légende
        legend.forEach((item, index) => {
          const y = legendStartY + index * (legendLine + legendGap);
          svg += `<rect x="${legendX}" y="${
            y - legendBox + 4
          }" width="${legendBox}" height="${legendBox}" fill="${
            item.color
          }" class="legend-box" />`;
          svg += `<text x="${
            legendX + legendBox + 10
          }" y="${y}" class="legend-label">${item.label}: ${formatCurrency(
            item.value
          )}</text>`;
        });

        svg += `</svg>`;

        // Téléchargement
        const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${titre}.svg`;
        link.click();

        URL.revokeObjectURL(url);
      };

      mapImg.src = mapImageBase64;
    } catch (error) {
      console.error("Erreur lors de la génération du SVG :", error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExportSVG}
      className="inline-flex items-center gap-2 justify-center rounded-md border border-transparent px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors bg-teal-600 hover:bg-teal-700"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
        className="w-5 h-5 flex-shrink-0"
      >
        <path d="M20 2H8C6.897 2 6 2.897 6 4v1H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h4v1c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 18H8V4h12v16zM4 7h2v10H4V7zm13 4h-1v1h1v3h-2v-4h-1v4h-1v-4h-1v4h-2v-6h7v2z" />
      </svg>
      <span className="hidden sm:inline">SVG</span>
    </button>
  );
}
