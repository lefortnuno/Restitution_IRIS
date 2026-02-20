export type FiltrePop = {
  champs_cible: string | null;
  operateur_comparaison: string | null;
  parametre: string | number | null;
  operateur_logique: "ET" | "OU" | null;
};
