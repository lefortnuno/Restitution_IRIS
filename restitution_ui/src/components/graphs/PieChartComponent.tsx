import { Doughnut, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Chart as ChartInstance,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { professionalColors } from "@/components/ui/colors";
import { useState, useRef, ReactNode } from "react";
import ExportSVG from "@/components/exports/ExportSVG";
import ExportPDF from "@/components/exports/ExportPDF";
import ExportPNG from "@/components/exports/ExportPNG";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface PieChartComponentProps {
  titre: string;
  sourceData: { label: string; value: number; prc: string }[];
  colorIndex?: number;
  children?: ReactNode;
}

const formatCurrency = (value: number): string => {
  if (value === 0) return "0 Dhs";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(1)}B Dhs`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)}M Dhs`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(1)}K Dhs`;
  return `${sign}${abs.toLocaleString()} Dhs`;
};

export default function PieChartComponent({
  titre,
  sourceData,
  colorIndex,
  children,
}: PieChartComponentProps) {
  const [hiddenLabels, setHiddenLabels] = useState<Set<string>>(new Set());
  const [isDonut, setIsDonut] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ChartInstance<"pie"> | null>(null);

  const visibleData = sourceData.filter(
    (item) => !hiddenLabels.has(item.label),
  );

  const labelToColor = sourceData.reduce(
    (acc, item, index) => {
      acc[item.label] =
        colorIndex !== undefined
          ? professionalColors[colorIndex % professionalColors.length]
          : professionalColors[index % professionalColors.length];
      return acc;
    },
    {} as Record<string, string>,
  );

  const chartData = {
    labels: visibleData.map((item) => item.label),
    datasets: [
      {
        label: "Valeur",
        data: visibleData.map((item) => item.value),
        backgroundColor: visibleData.map((item) => labelToColor[item.label]),
        borderWidth: 1,
        cutout: isDonut ? "50%" : "0%",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: false },
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || "";
            const value = context.parsed;
            return `${label}: ${formatCurrency(value)}`;
          },
        },
      },
      datalabels: {
        display: true,
        color: "white",
        font: { size: 14, weight: "bold" as const },
        formatter: (value: number, context: any) => {
          const dataItem = visibleData[context.dataIndex];
          return dataItem ? dataItem.prc : "";
        },
      },
    },
  };

  const toggleLabel = (label: string) => {
    setHiddenLabels((prev) => {
      const newSet = new Set(prev);
      newSet.has(label) ? newSet.delete(label) : newSet.add(label);
      return newSet;
    });
  };

  const legendForExport = visibleData.map((item) => ({
    label: item.label,
    color: labelToColor[item.label],
    value: item.value,
  }));

  return (
    <>
      <div className="flex items-center gap-3 justify-end mb-4 mr-4">
        <ExportSVG
          titre={titre}
          exportRef={{
            current: chartRef.current?.canvas ?? null,
          }}
          legend={legendForExport}
        />
        <ExportPDF titre={titre} exportRef={exportRef} />
        <ExportPNG titre={titre} exportRef={exportRef} />
        <button
          onClick={() => setIsDonut((prev) => !prev)}
          className="inline-flex items-center gap-2 justify-center rounded-md border border-transparent px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors bg-teal-600 hover:bg-teal-700"
        >
          {isDonut ? "Basculer en camembert" : "Basculer en donut"}
        </button>
      </div>

      <div className="w-full h-px mb-4 bg-gray-300/40 backdrop-blur-sm shadow-sm"></div>

      {/* On capture uniquement ce bloc (toute cette bloc)*/}
      <div ref={exportRef}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between my-3">
            <h1 className="text-2xl font-semibold text-gray-900">{titre}</h1>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 px-4 sm:px-6 md:px-8 pb-6">
          {/* Graphique */}
          <div className="flex-1 h-[500px]">
            <div className="rounded-lg p-6 h-full flex items-center justify-center">
              <div className="w-full h-full">
                <Pie ref={chartRef} data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Légende */}
          <div className="w-full md:w-72 bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Légende
            </h3>
            <div
              className={`space-y-2 ${
                sourceData.length > 9 ? "overflow-y-auto max-h-96" : ""
              }`}
            >
              {sourceData.map((item) => {
                const isHidden = hiddenLabels.has(item.label);
                return (
                  <div
                    key={item.label}
                    className={`flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors ${
                      isHidden ? "opacity-50" : ""
                    }`}
                    onClick={() => toggleLabel(item.label)}
                  >
                    <div
                      className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                      style={{
                        backgroundColor: isHidden
                          ? "#d1d5db"
                          : labelToColor[item.label],
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate min-h-[26px] ${
                          isHidden
                            ? "text-gray-400 line-through"
                            : "text-gray-700"
                        }`}
                      >
                        {item.label}
                      </p>
                      <p
                        className={`text-xs ${
                          isHidden ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        {formatCurrency(item.value)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <br />
        {children}
      </div>
    </>
  );
}
