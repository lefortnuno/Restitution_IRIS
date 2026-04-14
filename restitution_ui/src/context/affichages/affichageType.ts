export type Option = {
  value: string;
  label: string;
};

export const affichageOptions: Option[] = [
  { value: "table-simple", label: "Tableau simple" },
  { value: "table-pivot", label: "Tableau croisée dynamique" },
  { value: "chart-pie", label: "Diagramme circulaire" },
  { value: "chart-histo", label: "Histogramme" }, 
  { value: "chart-line", label: "Graphique linéaire" },
  { value: "maps-pie", label: "Cartographie" }, 
];

export type Props = {
  name: string;
  placeholder: string;
  error?: string;
};
