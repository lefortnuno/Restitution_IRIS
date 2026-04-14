import { FiltrePop } from "@/context/filtrePop/filtrePopType";
import {
  divPackForm,
  divForm,
  inputSearcForm,
  labelForm,
} from "@/components/ui/styles";

const joinTypes: NonNullable<FiltrePop["operateur_comparaison"]>[] = [
  "<",
  ">",
  "==",
  "!=",
];
const joinTypesVarchar: NonNullable<FiltrePop["operateur_comparaison"]>[] = [
  "==",
  "!=",
  "%%",
  "A%",
  "%A",
];
const joinTypesDate: NonNullable<FiltrePop["operateur_comparaison"]>[] = [
  "<",
  ">",
  "==",
  "!=",
  "between",
];

export const joinTypeLabels: Record<string, string> = {
  "<": "Inférieur à",
  ">": "Supérieur à",
  "==": "Égal à",
  "!=": "Différent de",
  "%%": "Contient",
  "A%": "Commence par",
  "%A": "Termine par",
  between: "Entre",
};

type Props = {
  joinType: FiltrePop["operateur_comparaison"];
  onChange: (value: FiltrePop["operateur_comparaison"]) => void;
  attributType: string;
  onCondSelectorChange: (value: string) => void;
};

const getTypeCategory = (
  attributType: string
): "varchar" | "date" | "number" => {
  const t = attributType.toLowerCase();
  if (t.includes("varchar") || t.includes("string") || t.includes("text"))
    return "varchar";
  if (t.includes("date") || t.includes("timestamp")) return "date";
  return "number";
};

export const ConditionSelector = ({
  joinType,
  onChange,
  attributType,
  onCondSelectorChange,
}: Props) => {
  const category = getTypeCategory(attributType);
  const options =
    category === "varchar"
      ? joinTypesVarchar
      : category === "date"
      ? joinTypesDate
      : joinTypes;

  return (
    <div className={`${divPackForm} w-full md:w-[calc(20%-20px)]`}>
      <div className={divForm}>
        <label className={labelForm}>Condition</label>
        <select
          value={joinType ?? ""}
          onChange={(e) => {
            const val = e.target.value as FiltrePop["operateur_comparaison"];
            onChange(val);
            onCondSelectorChange(val ?? "");
          }}
          className={inputSearcForm}
        >
          <option value="" disabled>
            Choisir...
          </option>
          {options.map((type) => (
            <option key={type} value={type}>
              {joinTypeLabels[type] ?? type}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
