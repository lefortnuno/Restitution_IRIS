import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Chart as ChartInstance,
} from "chart.js";
import React, { ReactNode, useMemo, useRef, useState } from "react";
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
);

type BackendDataset = {
  label: string;
  data: number[];
};

type BackendResponse = {
  labelsX: (string | number)[];
  datasets: BackendDataset[];
};

type HistogrammeComponentProps = {
  titre: string;
  backendData: BackendResponse;
  views: boolean;
  colorIndex?: number;
  children?: ReactNode;
};

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

const HistogrammeComponent: React.FC<HistogrammeComponentProps> = ({
  titre,
  backendData,
  views,
  colorIndex,
  children,
}) => {
  const [hiddenXLabels, setHiddenXLabels] = useState<Set<string>>(new Set());
  const exportRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ChartInstance<"bar"> | null>(null);

  const { labels, datasets } = useMemo(() => {
    const { labelsX, datasets } = backendData;
    const stringLabels = labelsX.map((val) => String(val));

    const colorMap = stringLabels.reduce(
      (acc, label, idx) => {
        const color = professionalColors[idx % professionalColors.length];
        acc[label] = color;
        return acc;
      },
      {} as Record<string, string>,
    );

    const filteredDatasets = datasets.map((ds) => ({
      label: ds.label,
      backgroundColor: stringLabels.map((label) => colorMap[label]),
      borderColor: stringLabels.map((label) => colorMap[label]),
      borderWidth: 1,
      data: ds.data.map((value, index) =>
        hiddenXLabels.has(stringLabels[index]) ? 0 : value,
      ),
      categoryPercentage: 1.0,
      barPercentage: 1.0,
    }));

    return { labels: stringLabels, datasets: filteredDatasets };
  }, [backendData, colorIndex, hiddenXLabels]);

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
        formatter: (value: number) => formatCurrency(value),
      },
      legend: {
        display: true,
        onClick: (_evt: any, legendItem: any) => {
          const labelClicked = legendItem.text;
          setHiddenXLabels((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(labelClicked)) newSet.delete(labelClicked);
            else newSet.add(labelClicked);
            return newSet;
          });
        },
        labels: {
          generateLabels: (chart: any) => {
            const labelsX = chart.data.labels as string[];
            return labelsX.map((labelX: string, index: number) => ({
              text: labelX,
              fillStyle: professionalColors[index % professionalColors.length],
              strokeStyle: "#808080",
              lineWidth: 1,
              hidden: hiddenXLabels.has(labelX),
              index,
            }));
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            return `${label}: ${formatCurrency(value)}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "category" as const,
        title: {
          display: false,
          text: "Classe",
        },
        ticks: {
          stepSize: 1,
          autoSkip: true,
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
        ticks: {
          callback: function (tickValue: string | number) {
            const value =
              typeof tickValue === "number" ? tickValue : parseFloat(tickValue);
            return formatCurrency(value);
          },
        },
      },
    },
  };

  const chartData = {
    labels,
    datasets,
  };

  return (
    <>
      <div className="flex items-center gap-3 justify-end mb-4 mr-4">
        <ExportSVG
          titre={titre}
          exportRef={{
            current: chartRef.current?.canvas ?? null,
          }}
          legend={[]}
        />

        <ExportPDF titre={titre} exportRef={exportRef} />

        <ExportPNG titre={titre} exportRef={exportRef} />
      </div>

      <div className="w-full h-px mb-4 bg-gray-300/40 backdrop-blur-sm shadow-sm"></div>

      <div
        className="px-4 sm:px-6 lg:px-8"
        ref={exportRef}
      >
        <div className="flex items-center justify-between my-3">
          <h1 className="text-2xl font-semibold text-gray-900">{titre}</h1>
        </div>
        <div style={{ position: "relative", width: "100%", height: "500px" }}>
          <Bar
            ref={chartRef}
            data={chartData}
            options={histoChartOptions}
          />
        </div>
        
        <br />
        {children}
      </div>
    </>
  );
};

export default HistogrammeComponent;
