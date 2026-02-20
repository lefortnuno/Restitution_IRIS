import { StructTableType } from "@/components/queries/useStructTable";
import { AttributsMap } from "@/components/types/typage-global";

export type Option = {
  value: string;
  label: string;
};

export const operationsConditions: Option[] = [
  { value: "count", label: "Comptage" },
  { value: "sum", label: "Somme" },
  { value: "max", label: "Maximum" },
  { value: "min", label: "Minimum" },
  { value: "avg", label: "Moyenne" },
  { value: "med", label: "Médiane" },
];

export const operationsOptions: Option[] = [
  { value: "show", label: "Affichage" },
  { value: "count", label: "Comptage" },
  { value: "sum", label: "Somme" },
  { value: "max", label: "Maximum" },
  { value: "min", label: "Minimum" },
  { value: "avg", label: "Moyenne" },
  { value: "med", label: "Médiane" },
  { value: "mod", label: "Mode" },
  { value: "ecart", label: "Écart-type" },
  { value: "var", label: "Variance" },
  { value: "qp", label: "Quartiles et percentiles" },
  { value: "tc", label: "Taux de croissance" },
];

export type Props = {
  name: string;
  placeholder: string;
  label: string;
  attributsMapName: string;
  error?: string | null;
  operationValues?: any;
  setCompletOP: (b: boolean) => void;
};

export type OpFieldProps = {
  numIndex: number;
  continuity: boolean;
  onClose: () => void;
  formats: AttributsMap;
  name: string;
  currentOperation: string;
  error?: string | null;
  setCurrentOperation: (currentOperation: string) => void;
  setCurrOpComplet: (s: boolean) => void;
  setContinuity: (s: boolean) => void;
  onDeleteComponent: () => void;
};

export type OperateurArithmetique = string | null;
export type CleLogique = "si" | "sinon si" | "sinon" | null;

export type ExpressionType = {
  valeur: string | number | boolean | null;
  operateur_arithmetique: string | null;
  clause_regroupement?: { champs_cible: string }[] | null;
}[];

export type OperationType = {
  as_nom: string;

  conditions?: {
    cle_logique: CleLogique;
    champs_cible?: ExpressionType;
    operateur_comparaison?: "<" | "<=" | ">" | ">=" | "==" | "!=" | "%" | null;
    valeur_reference?: ExpressionType;
    operateur_logique?: "OU" | "ET" | null;
  }[];

  expressions: ExpressionType;

  clause_regroupement?: { champs_cible: string }[] | null;
};

export type HandleChangeFunction = (
  currentOperation: string,
  key: string,
  value: any,
  etape: string,
  actionIndex?: number,
  expressionIndex?: number,
  conditionIndex?: number,
  champCibleIndex?: number,
  valeurReferenceIndex?: number,
  fonctionAgregationIndex?: number,
  subExpressionIndex?: number
) => void;

export interface Format {
  name: string;
  attributs: StructTableType[];
}
