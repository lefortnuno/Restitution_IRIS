interface ExportSVGProps {
  titre: string;
  exportRef: React.RefObject<HTMLCanvasElement | null>;
  legend: any;
}

export default function ExportSVG({
  titre,
  exportRef,
  legend,
}: ExportSVGProps) {
  const handleExportSVG = () => {
    if (!exportRef.current) return;

    const canvas = exportRef.current;
    const dataURL = canvas.toDataURL("image/png");

    const padding = 20;
    const fontSize = 24;
    const legendLineHeight = 20;
    const legendItemSpacing = 10;
    const legendXOffset = 20; // espace entre le graphe et la légende
    const legendBoxSize = 14;

    const legendHeight =
      legend.length > 0
        ? (legendLineHeight + legendItemSpacing) * legend.length
        : 0;

    const maxLegendWidth = 200;
    const svgWidth = canvas.width + maxLegendWidth + legendXOffset;
    const svgHeight = Math.max(
      canvas.height + fontSize + padding,
      legendHeight + fontSize + padding
    );

    const legendStartY = svgHeight / 3;

    const legendSVG = legend
      .map((item: any, idx: number) => {
        const y = legendStartY + idx * (legendLineHeight + legendItemSpacing);
        const x = canvas.width + legendXOffset;
        return `
        <rect x="${x}" y="${
          y - legendBoxSize + 2
        }" width="${legendBoxSize}" height="${legendBoxSize}" fill="${
          item.color
        }" />
        <text x="${
          x + legendBoxSize + 8
        }" y="${y}" font-size="12" fill="#333">${
          item.label
        }: ${item.value.toLocaleString()} Dhs</text>
      `;
      })
      .join("\n");

    const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">
      <style>
        .title { font: bold ${fontSize}px Arial, sans-serif; fill: #111; }
        .legend-title {
          font: bold 16px 'Segoe UI', sans-serif;
          fill: #111827;
        }
      </style>

      <!-- Titre principal -->
      <text x="${svgWidth / 12}" y="${
      fontSize + 10
    }" text-anchor="middle" class="title">${titre}</text>
    
      <!-- Image du graphe -->
      <image href="${dataURL}" x="0" y="${fontSize + padding}" width="${
      canvas.width
    }" height="${canvas.height}" />
      
      <!-- Titre de la légende  -->
      <text x="${canvas.width + legendXOffset}" y="${
      legendStartY - 25
    }" class="legend-title">Légende</text>

      <!-- Éléments de légende -->
      ${legendSVG}
    </svg>
  `;

    const blob = new Blob([svgContent], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${titre}.svg`;
    link.click();
    URL.revokeObjectURL(url);
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
