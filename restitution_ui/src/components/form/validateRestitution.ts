import { UseFormReturn } from "react-hook-form";
import { RestitutionFormDataType } from "@/components/form/schema";

export function validateRestitutionForm(
  rawData: RestitutionFormDataType,
  methods: UseFormReturn<RestitutionFormDataType>,
  checkLlmmodeles = false
): boolean {
  let hasError = false;

  if (!rawData.nom || rawData.nom.length < 3) {
    methods.setError("nom", {
      type: "manual",
      message: "Le nom doit contenir au moins 3 caractères",
    });
    hasError = true;
  }

  if (!rawData.formats_selected || rawData.formats_selected.length < 1) {
    methods.setError("formats_selected", {
      type: "manual",
      message: "Sélectionner au moins un format",
    });
    hasError = true;
  }

  if (!rawData.affichages || rawData.affichages.length < 1) {
    methods.setError("affichages", {
      type: "manual",
      message: "L'affichage doit être choisi obligatoirement",
    });
    hasError = true;
  }

  if (checkLlmmodeles && (!rawData.llmmodeles || rawData.llmmodeles.length < 1)) {
    methods.setError("llmmodeles", {
      type: "manual",
      message: "Le modèle d'IA doit être choisi obligatoirement",
    });
    hasError = true;
  }

  if (!rawData.operation_selected || rawData.operation_selected.length < 1) {
    methods.setError("operation_selected", {
      type: "manual",
      message: "Effectuer au moins une opération",
    });
    hasError = true;
  }

  const selectedAffichage = rawData.affichages?.[0]?.nom_affichage ?? "";

  const hasMapsNiv = rawData.champs?.some((c) => c.as_nom === "maps-niv");
  const hasEnoughChamps = rawData.champs && rawData.champs.length >= 4;
  if (
    ["Cartographie"].includes(selectedAffichage) &&
    (!hasMapsNiv || !hasEnoughChamps)
  ) {
    methods.setError("champs", {
      type: "manual",
      message: "Completez la configuration",
    });
    hasError = true;
  }

  if (
    ["Histogramme", "Graphique linéaire"].includes(selectedAffichage) &&
    (!rawData.champs || rawData.champs.length < 3)
  ) {
    methods.setError("champs", {
      type: "manual",
      message: "Completez la configuration",
    });
    hasError = true;
  }

  const hasTcWithoutDate = rawData.operation_selected?.some((op) => {
    const hasTc = op.expressions?.some((e) => e.valeur === "tc");
    if (!hasTc) return false;
    const dateArgs = op.expressions?.filter(
      (e) => e.operateur_arithmetique === ",["
    );
    return !dateArgs || dateArgs.length < 2;
  });
  if (hasTcWithoutDate) {
    methods.setError("operation_selected", {
      type: "manual",
      message:
        "Ajouter une date de reference au taux de croissance dans le parametrage",
    });
    hasError = true;
  }

  return hasError;
}
