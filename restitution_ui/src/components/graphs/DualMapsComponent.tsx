import L from "leaflet";
import "leaflet-simple-map-screenshoter";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  MapContainerProps,
  TileLayer,
  CircleMarker,
  Popup,
  useMapEvents,
  Rectangle,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { professionalColors } from "@/components/ui/colors";
import ExportMapsSVG from "@/components/exports/ExportMapsSVG";
import ExportMapsPDF from "@/components/exports/ExportMapsPDF";
import ExportMapsPNG from "@/components/exports/ExportMapsPNG";

type BackendResponse = {
  labelsX: {
    region: string;
    lat: number;
    lon: number;
  }[];
  datasets: {
    label: string;
    value: number[];
  }[];
  proportion: number[];
};

type CircleMapComponentProps = {
  titre: string;
  backendData: BackendResponse;
  views: boolean;
  colorIndex?: number;
  children?: ReactNode;
};

// Composant pour suivre le zoom
const ZoomListener = ({ setZoom }: { setZoom: (zoom: number) => void }) => {
  useMapEvents({
    zoomend: (e) => setZoom(e.target.getZoom()),
  });
  return null;
};

// Composant pour initialiser le plugin screenshoter
const MapScreenshoterInit = ({
  mapRef,
}: {
  mapRef: React.MutableRefObject<L.Map | null>;
}) => {
  const map = useMap();

  useEffect(() => {
    mapRef.current = map;

    // Initialiser le plugin si pas encore fait
    if (map && !(map as any)._simpleMapScreenshoter) {
      const screenshoter = (L as any).simpleMapScreenshoter({
        hidden: true, // Cacher le bouton par défaut
      });
      map.addControl(screenshoter);
      (map as any)._simpleMapScreenshoter = screenshoter;
    }
  }, [map, mapRef]);

  return null;
};

const mapProps: MapContainerProps = {
  center: [38.6031, 1.8883],
  zoom: 2,
  scrollWheelZoom: true,
  style: { height: "400px", width: "100%", zIndex: 0 },
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

export default function DualMapsComponent({
  titre,
  backendData,
  views,
  colorIndex,
  children,
}: CircleMapComponentProps) {
  const [zoom, setZoom] = useState(2);
  const [hiddenDatasets, setHiddenDatasets] = useState<Set<string>>(new Set());
  const [isTheDual, setIsTheDual] = useState(views);
  const exportRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const { labels, datasets, proportion } = useMemo(() => {
    const { labelsX: rawLabelsX, datasets: rawDatasets } = backendData;

    const coloredDatasets = rawDatasets.map((ds, i) => {
      const color =
        colorIndex !== undefined
          ? professionalColors[colorIndex % professionalColors.length]
          : professionalColors[i % professionalColors.length];

      return {
        ...ds,
        backgroundColor: color,
        borderColor: color,
        hidden: hiddenDatasets.has(ds.label),
      };
    });

    return {
      labels: backendData.labelsX,
      datasets: coloredDatasets,
      proportion: backendData.proportion,
    };
  }, [backendData, colorIndex, hiddenDatasets]);

  const toggleDataset = (label: string) => {
    setHiddenDatasets((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };
  const legend = datasets
    .filter((ds) => !hiddenDatasets.has(ds.label))
    .map((d) => ({
      label: d.label,
      value: d.value.reduce((a, b) => a + b, 0),
      color: d.backgroundColor,
    }));
  return (
    <>
      <div className="flex items-center gap-3 justify-end mb-4 mr-4">
        <ExportMapsSVG titre={titre} mapRef={mapRef} legend={legend} />

        <ExportMapsPDF titre={titre} mapRef={mapRef} legend={legend} />

        <ExportMapsPNG titre={titre} mapRef={mapRef} legend={legend} />

        <button
          onClick={() => setIsTheDual((prev) => !prev)}
          className="inline-flex items-center gap-2 justify-center rounded-md border border-transparent px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors bg-teal-600 hover:bg-teal-700"
        >
          {isTheDual
            ? "Basculer en Cartographie en barres"
            : "Basculer en Cartographie circulaires"}
        </button>
      </div>

      <div
        ref={exportRef}
        className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8"
      >
        <div className="flex items-center justify-between my-3">
          <h1 className="text-2xl font-semibold text-gray-900">{titre}</h1>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {[...new Set(datasets.map((d) => d.label))].map((label) => {
            const color =
              datasets.find((d) => d.label === label)?.backgroundColor ||
              "#ccc";
            const isHidden = hiddenDatasets.has(label);
            return (
              <button
                key={label}
                onClick={() => toggleDataset(label)}
                className={`flex items-center space-x-2 text-sm font-medium px-3 py-1 rounded-full transition
          ${
            isHidden
              ? "opacity-40 line-through"
              : "opacity-90 hover:opacity-100"
          }`}
                style={{
                  border: `1px solid ${color}`,
                  backgroundColor: `${color}20`,
                }}
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                ></span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        <MapContainer {...mapProps}>
          <MapScreenshoterInit mapRef={mapRef} />
          <ZoomListener setZoom={setZoom} />
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          {labels.map((labelObj, idx) =>
            datasets
              .filter((ds) => !hiddenDatasets.has(ds.label))
              .map((ds, i) => {
                const value = ds.value[idx];
                if (value === 0) return null;

                const radius =
                  zoom >= 7
                    ? Math.sqrt(Math.abs(value)) / proportion[0]
                    : zoom >= 2
                      ? Math.sqrt(Math.abs(value)) / proportion[1]
                      : Math.sqrt(Math.abs(value)) / proportion[2];

                const direction = value < 0 ? -1 : 1;
                const barHeight =
                  zoom >= 9
                    ? labelObj.lat +
                      direction *
                        (Math.sqrt(Math.abs(value)) / proportion[2]) *
                        0.03
                    : zoom >= 7
                      ? labelObj.lat +
                        direction *
                          (Math.sqrt(Math.abs(value)) / proportion[2]) *
                          0.15
                      : labelObj.lat +
                        direction *
                          (Math.sqrt(Math.abs(value)) / proportion[1]) *
                          0.2;

                const barWidth = zoom >= 7 ? 0.2 : 0.6;
                const barSpacing = zoom >= 7 ? 0.25 : 0.7;

                return (
                  <>
                    {isTheDual ? (
                      <Rectangle
                        key={`${labelObj.region}-${ds.label}-rect`}
                        bounds={[
                          [labelObj.lat, labelObj.lon + i * barSpacing - 0.05],
                          [barHeight, labelObj.lon + i * barSpacing + barWidth],
                        ]}
                        pathOptions={{
                          fillOpacity: 0.8,
                          color: ds.borderColor,
                          fillColor: ds.backgroundColor,
                        }}
                      >
                        <Popup>
                          <strong>{labelObj.region}</strong>
                          <br />
                          Label: {ds.label}
                          <br />
                          Valeur: {formatCurrency(value)}
                        </Popup>
                      </Rectangle>
                    ) : (
                      <CircleMarker
                        key={`${labelObj.region}-${ds.label}`}
                        center={[labelObj.lat, labelObj.lon]}
                        radius={radius}
                        pathOptions={{
                          fillOpacity: 0.6,
                          color: value < 0 ? "#000" : ds.backgroundColor,
                          fillColor: ds.backgroundColor,
                        }}
                      >
                        <Popup>
                          <strong>{labelObj.region}</strong>
                          <br />
                          Label: {ds.label}
                          <br />
                          Valeur: {formatCurrency(value)}
                        </Popup>
                      </CircleMarker>
                    )}
                  </>
                );
              }),
          )}
        </MapContainer>

        <br />
        {children}
      </div>
    </>
  );
}
