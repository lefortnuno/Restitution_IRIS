import { useState } from "react";
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
  condSelector: string;
};

export const ValueSelectorDate = ({
  joinType,
  onChange,
  condSelector,
}: Props) => {
  const [dateDebut, setDateDebut] = useState<string>("");
  const [dateFin, setDateFin] = useState<string>("");

  const isBetween = condSelector === "between";

  const handleChange = (debut: string, fin: string) => {
    if (isBetween) {
      onChange(debut && fin ? `${debut},${fin}` : null);
    } else {
      onChange(debut || null);
    }
  };

  return (
    <div className={`${divPackForm} w-full md:w-[calc(40%-20px)]`}>
      <div className={divForm}>
        <label className={labelForm}>Date de début</label>
        <input
          type="date"
          value={dateDebut}
          onChange={(e) => {
            setDateDebut(e.target.value);
            handleChange(e.target.value, dateFin);
          }}
          className={inputSearcForm}
        />
      </div>

      <div
        className={`${divForm} mt-4 transition-opacity duration-200 ${!isBetween ? "opacity-40 pointer-events-none" : ""}`}
      >
        <label className={`${labelForm} ${!isBetween ? "text-gray-400" : ""}`}>
          Date de fin
        </label>
        <input
          type="date"
          value={dateFin}
          disabled={!isBetween}
          onChange={(e) => {
            setDateFin(e.target.value);
            handleChange(dateDebut, e.target.value);
          }}
          className={`${inputSearcForm} ${!isBetween ? "bg-gray-100 cursor-not-allowed" : ""}`}
        />
      </div>
    </div>
  );
};
