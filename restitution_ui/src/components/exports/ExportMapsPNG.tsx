import React from "react";
import L from "leaflet";

interface ExportPNGProps {
  titre: string;
  mapRef: React.RefObject<L.Map | null>;
  legend: {
    label: string;
    value: number;
    color: string;
  }[];
}

export default function ExportMapsPNG({
  titre,
  mapRef,
  legend,
}: ExportPNGProps) {
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

  const createImageWithLegend = async (
    mapImageSrc: string
  ): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      const mapImg = new Image();
      mapImg.onload = () => {
        // Calculer les dimensions
        const mapWidth = mapImg.width;
        const mapHeight = mapImg.height;
        const legendHeight = Math.max(100, legend.length * 25 + 60);
        const titleHeight = 60;
        const padding = 20;

        canvas.width = mapWidth + padding * 2;
        canvas.height = mapHeight + legendHeight + titleHeight + padding * 3;

        // Fond blanc
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Titre
        ctx.fillStyle = "#1f2937";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(titre, canvas.width / 12, padding + 30);

        // Image de la carte
        ctx.drawImage(mapImg, padding, titleHeight + padding);

        // Légende
        const legendStartY = titleHeight + mapHeight + padding * 2;

        // Titre de la légende
        ctx.fillStyle = "#374151";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "left";
        ctx.fillText("Légende:", padding, legendStartY + 20);

        // Éléments de la légende
        legend.forEach((item, index) => {
          const y = legendStartY + 45 + index * 25;

          // Carré de couleur
          ctx.fillStyle = item.color;
          ctx.fillRect(padding + 20, y - 12, 15, 15);

          // Bordure du carré
          ctx.strokeStyle = "#666";
          ctx.lineWidth = 1;
          ctx.strokeRect(padding + 20, y - 12, 15, 15);

          // Texte de la légende
          ctx.fillStyle = "#374151";
          ctx.font = "14px Arial";
          ctx.fillText(
            `${item.label}: ${formatCurrency(item.value)}`,
            padding + 45,
            y
          );
        });

        resolve(canvas.toDataURL("image/png"));
      };

      mapImg.src = mapImageSrc;
    });
  };
  
  const handleExportPNG = async () => {
    if (!mapRef.current) {
      console.error("Map reference is not available");
      return;
    }

    const map = mapRef.current;

    if (!(map as any)._simpleMapScreenshoter) {
      console.error("Simple Map Screenshoter plugin is not initialized");
      return;
    }

    try {
      // Utiliser le plugin leaflet-simple-map-screenshoter
      const screenshoter = (map as any)._simpleMapScreenshoter;

      // Prendre la capture d'écran de la carte seulement (sans caption)
      screenshoter
        .takeScreen("image", {
          mimeType: "image/png",
          quality: 0.9,
        })
        .then(async (mapImage: string) => {
          // Créer l'image finale avec titre et légende
          const finalImage = await createImageWithLegend(mapImage);

          // Créer un lien de téléchargement
          const link = document.createElement("a");
          link.download = `${titre}.png`;
          link.href = finalImage;
          link.click();
        })
        .catch((error: any) => {
          console.error("Error taking screenshot:", error);

          // Fallback vers html2canvas si disponible
          fallbackToHtml2Canvas();
        });
    } catch (error) {
      console.error("Error with screenshoter:", error);
      fallbackToHtml2Canvas();
    }
  };

  const fallbackToHtml2Canvas = async () => {
    try {
      // Import dynamique de html2canvas comme fallback
      const html2canvas = (await import("html2canvas")).default;

      // Trouver l'élément de la carte
      const mapContainer = mapRef.current?.getContainer();
      if (!mapContainer) return;

      const canvas = await html2canvas(mapContainer, {
        useCORS: true,
        allowTaint: true,
        scale: 2, // Meilleure qualité
      });

      // Créer l'image finale avec titre et légende
      const mapImageSrc = canvas.toDataURL("image/png");
      const finalImage = await createImageWithLegend(mapImageSrc);

      const link = document.createElement("a");
      link.download = `${titre}_fallback.png`;
      link.href = finalImage;
      link.click();
    } catch (error) {
      console.error("Fallback export also failed:", error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExportPNG}
      className="inline-flex items-center gap-2 justify-center rounded-md border border-transparent px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors bg-teal-600 hover:bg-teal-700"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
        className="w-5 h-5 flex-shrink-0"
      >
        <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM5 5h14v10.586l-4.293-4.293a1 1 0 0 0-1.414 0L9 16l-2.293-2.293a1 1 0 0 0-1.414 0L5 14.586V5zm0 14v-1.414l3-3L11 18H5zm8.5-11.5a1.5 1.5 0 1 1-3.001-.001A1.5 1.5 0 0 1 13.5 7.5z" />
      </svg>
      <span className="hidden sm:inline">PNG</span>
    </button>
  );
}
