import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Chart as ChartInstance,
} from "chart.js";
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { professionalColors } from "@/components/ui/colors";
import ExportSVG from "@/components/exports/ExportSVG";
import ExportPDF from "@/components/exports/ExportPDF";
import ExportPNG from "@/components/exports/ExportPNG";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
);

type BackendDataset = {
  label: string;
  data: number[];
};

type BackendResponse = {
  labelsX: (string | number)[];
  datasets: BackendDataset[];
};

type DualChartProps = {
  titre: string;
  backendData: BackendResponse;
  views: boolean;
  colorIndex?: number;
  children?: ReactNode;
};

const formatCurrency = (value: number, titre?: string): string => {
  const tmp = "Evolution Payement en Retard des Clients";
  if (value === 0) return titre === tmp ? "0 jour" : "0 Dhs";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000_000)
    return titre === tmp
      ? `${sign}${(abs / 1_000_000_000).toFixed(1)}B jours`
      : `${sign}${(abs / 1_000_000_000).toFixed(1)}B Dhs`;
  if (abs >= 1_000_000)
    return titre === tmp
      ? `${sign}${(abs / 1_000_000).toFixed(1)}M jours`
      : `${sign}${(abs / 1_000_000).toFixed(1)}M Dhs`;
  if (abs >= 1_000)
    return titre === tmp
      ? `${sign}${(abs / 1_000).toFixed(1)}K jours`
      : `${sign}${(abs / 1_000).toFixed(1)}K Dhs`;
  return titre === tmp ? `${sign}${abs} jours` : `${sign}${abs} Dhs`;
};

const DualChartComponent: React.FC<DualChartProps> = ({
  titre,
  backendData,
  views,
  colorIndex,
  children,
}) => {
  const [hiddenDatasets, setHiddenDatasets] = useState<Set<string>>(new Set());
  const [isTheDual, setIsTheDual] = useState(views);
  const exportRef = useRef<HTMLDivElement>(null);
  const lineChartRef = useRef<ChartInstance<"line"> | null>(null);
  const barChartRef = useRef<ChartInstance<"bar"> | null>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const { labels, datasets } = useMemo(() => {
    const { labelsX, datasets = [] } = backendData;

    const coloredDatasets = datasets.map((ds, i) => {
      const color =
        colorIndex !== undefined
          ? professionalColors[colorIndex % professionalColors.length]
          : professionalColors[i % professionalColors.length];

      return {
        ...ds,
        backgroundColor: color,
        borderColor: color,
        pointBorderColor: color,
        pointBackgroundColor: color,
        fill: false, // 👈 pas de remplissage sous la ligne
        borderWidth: 3,
        tension: 0.4,
        hidden: hiddenDatasets.has(ds.label),
      };
    });

    const formattedLabels = labelsX.map((val) => {
      if (typeof val === "string" && val.includes("T")) {
        return new Date(val).toLocaleDateString();
      }
      return String(val);
    });

    return { labels: formattedLabels, datasets: coloredDatasets };
  }, [backendData, colorIndex, hiddenDatasets]);

  const histoChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: false,
      },
      datalabels: {
        display: true,
        color: "black",
        font: {
          weight: 600 as const,
          size: 12,
          family: "Arial",
        },
        anchor: "end" as const,
        align: "top" as const,
        formatter: (value: number) => formatCurrency(value, titre),
      },
      legend: {
        display: true,
        onClick: (_evt: any, legendItem: any) => {
          const label = legendItem.text;
          setHiddenDatasets((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(label)) newSet.delete(label);
            else newSet.add(label);
            return newSet;
          });
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            return `${label}: ${formatCurrency(value, titre)}`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (tickValue: string | number) {
            const value =
              typeof tickValue === "number" ? tickValue : parseFloat(tickValue);
            return formatCurrency(value, titre);
          },
        },
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: false },
      datalabels: { display: false },
      legend: {
        display: true,
        onClick: (_evt: any, legendItem: any) => {
          const label = legendItem.text;
          setHiddenDatasets((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(label)) newSet.delete(label);
            else newSet.add(label);
            return newSet;
          });
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            return `${label}: ${formatCurrency(value, titre)}`;
          },
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 3,
      },
      point: {
        radius: 4,
        hitRadius: 10,
        hoverRadius: 6,
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (tickValue: string | number) {
            const value =
              typeof tickValue === "number" ? tickValue : parseFloat(tickValue);
            return formatCurrency(value, titre);
          },
        },
      },
    },
  };

  const chartData = {
    labels,
    datasets,
  };

  useEffect(() => {
    exportCanvasRef.current = isTheDual
      ? (barChartRef.current?.canvas ?? null)
      : (lineChartRef.current?.canvas ?? null);
  }, [isTheDual, datasets]);

  return (
    <>
      <div className="flex items-center gap-3 justify-end mb-4 mr-4">
        <ExportSVG titre={titre} exportRef={exportCanvasRef} legend={[]} />

        <ExportPDF titre={titre} exportRef={exportRef} />

        <ExportPNG titre={titre} exportRef={exportRef} />

        <button
          onClick={() => setIsTheDual((prev) => !prev)}
          className="inline-flex items-center gap-2 justify-center rounded-md border border-transparent px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors bg-teal-600 hover:bg-teal-700"
        >
          {isTheDual
            ? "Basculer en Graphique linéaire"
            : "Basculer en  Graphique à barres"}
        </button>
      </div>

      <div
        className="px-4 sm:px-6 lg:px-8"
        ref={exportRef}
      >
        <div className="flex items-center justify-between my-3">
          <h1 className="text-2xl font-semibold text-gray-900">{titre}</h1>
        </div>
        <div style={{ position: "relative", width: "100%", height: "500px" }}>
          {isTheDual ? (
            <Bar
              ref={barChartRef}
              data={chartData}
              options={histoChartOptions}
            />
          ) : (
            <Line
              ref={lineChartRef}
              data={chartData}
              options={lineChartOptions}
            />
          )}
        </div>

        <br />
        {children}
      </div>
    </>
  );
};

export default DualChartComponent;
