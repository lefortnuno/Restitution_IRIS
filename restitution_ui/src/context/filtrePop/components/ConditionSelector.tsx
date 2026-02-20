import { FiltrePop } from "@/context/filtrePop/filtrePopType";
import {
  divPackForm,
  divForm,
  inputSearcForm,
  labelForm,
} from "@/components/ui/styles";

const joinTypes: NonNullable<FiltrePop["operateur_comparaison"]>[] = [
  "<",
  "<=",
  ">",
  ">=",
  "==",
  "!=",
  "%",
];

type Props = {
  joinType: FiltrePop["operateur_comparaison"];
  onChange: (value: FiltrePop["operateur_comparaison"]) => void;
};

export const ConditionSelector = ({ joinType, onChange }: Props) => (
  <div className={`${divPackForm} w-full md:w-[calc(20%-20px)]`}>
    <div className={divForm}>
      <label className={labelForm}>Condition</label>
      <select
        value={joinType ?? ""}
        onChange={(e) =>
          onChange(e.target.value as FiltrePop["operateur_comparaison"])
        }
        className={inputSearcForm}
      >
        <option value="" disabled>
          Choisir...
        </option>
        {joinTypes.map((type) => (
          <option key={type} value={type}>
            {type.charAt(0) + type.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
    </div>
  </div>
);
