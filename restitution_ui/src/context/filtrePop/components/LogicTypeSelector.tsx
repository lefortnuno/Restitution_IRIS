import { FiltrePop } from "@/context/filtrePop/filtrePopType";

const joinTypes: NonNullable<FiltrePop["operateur_logique"]>[] = ["ET", "OU"];

type Props = {
  joinType: FiltrePop["operateur_logique"];
  onChange: (value: FiltrePop["operateur_logique"]) => void;
};

export const LogicTypeSelector = ({ joinType, onChange }: Props) => (
  <div className="relative">
    <select
      value={joinType ?? ""}
      onChange={(e) =>
        onChange(e.target.value as FiltrePop["operateur_logique"])
      }
      className="w-[140px] text-sm rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer transition"
    >
      <option value="" disabled>
        Et/Ou
      </option>
      {joinTypes.map((type) => (
        <option key={type} value={type}>
          {type.charAt(0) + type.slice(1).toLowerCase()}
        </option>
      ))}
    </select>
  </div>
);
