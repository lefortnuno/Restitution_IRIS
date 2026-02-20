import { FiltrePop } from "@/context/filtrePop/filtrePopType";
import {
  divPackForm,
  divForm,
  inputSearcForm,
  labelForm,
} from "@/components/ui/styles";

type Props = {
  joinType: FiltrePop["parametre"];
  onChange: (value: FiltrePop["parametre"]) => void;
};

export const ValueSelector = ({ joinType, onChange }: Props) => (
  <div className={`${divPackForm} w-full md:w-[calc(40%-20px)]`}>
    <div className={divForm}>
      <label className={labelForm}>Valeur</label>
      <input
        type="text"
        placeholder="Entrer une valeur"
        value={joinType ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={inputSearcForm}
      />
    </div>
  </div>
);
