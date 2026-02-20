import React from "react";
import html2canvas from "html2canvas";

interface ExportPNGProps {
  titre: string;
  exportRef: React.RefObject<HTMLDivElement | null>;
}

export default function ExportPNG({ titre, exportRef }: ExportPNGProps) {
  const handleExportPNG = async () => {
    if (!exportRef.current) return;

    const canvas = await html2canvas(exportRef.current,{
      backgroundColor: 'white', // important pour éviter le fond gris
      scale: 2 // meilleure qualité
    });
    const link = document.createElement("a");
    link.download = `${titre}.png`;
    link.href = canvas.toDataURL();
    link.click();
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
