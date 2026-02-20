// schemas/user.ts
import { z } from "zod";

export const DisplayCategories = [
  "tableaux",
  "graphiques",
  "cartographiques",
] as const;
export const DisplayCategoryEnum = z.enum(DisplayCategories);
export type DisplayCategory = z.infer<typeof DisplayCategoryEnum>;

export const DisplayOptionsByCategory = {
  tableaux: [
    { value: "table-simple", label: "Tableau simple" },
    { value: "table-pivot", label: "Tableau croisée dynamique" },
  ],
  graphiques: [
    { value: "chart-histo", label: "Histogramme" },
    { value: "chart-bar", label: "Diagramme en bâton" },
    { value: "chart-circle", label: "Diagramme circulaires" },
    { value: "chart-pie", label: "Dagramme en secteurs" },
    { value: "chart-line", label: "Graphique linéaire" },
  ],
  cartographiques: [
    { value: "maps-pie", label: "Carte à cercles" },
    { value: "maps-bar", label: "Carte à barres" },
  ],
} as const;

const allDisplayValues = Object.values(DisplayOptionsByCategory)
  .flat()
  .map((opt) => opt.value) as [string, ...string[]];

export const ListeAffichage = z.enum(allDisplayValues);
export type ListeAffichage = z.infer<typeof ListeAffichage>;
