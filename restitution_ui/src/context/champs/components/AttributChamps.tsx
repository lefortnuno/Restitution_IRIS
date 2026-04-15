import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { AttributsMap } from "@/components/types/typage-global";
import { ChampsAVC } from "@/context/champs/champType";
import { useFormContext, useFieldArray } from "react-hook-form";

interface AttributProcessProps {
  formats: AttributsMap;
  step: string;
  setStep: (step: string) => void;
  setCurrentAttribut: (currentAttribut: ChampsAVC | null) => void;
  editingAs_nom?: string | null;
}

export const AttributChamps: React.FC<AttributProcessProps> = ({
  formats,
  step,
  setStep,
  setCurrentAttribut,
  editingAs_nom,
}) => {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const { getValues, setValue } = useFormContext();
  const { update } = useFieldArray({
    name: "champs",
  });

  const handleClick = (attribut: string, type: string) => {
    const currentOps = getValues("champs") || [];
    // En mode édition on conserve l'as_nom original, sinon on en génère un nouveau
    const as__nom = editingAs_nom ?? (currentOps.length + "-" + attribut);

    const new_champ = {
      nom: attribut,
      as_nom: as__nom,
        type: "none",
        typeAttribut: type,
        taille: null,
        position: null,
        parametre: null,
        separateur: null,
      transformation: {
        type: "none",
        typeAttribut: type,
        taille: null,
        position: null,
        parametre: null,
        separateur: null,
      },
    };
    setCurrentAttribut(new_champ);
    setStep("type");
  };

  return (
    <>
      {(formats ?? []).map((item, idx) =>
        item
          ? Object.entries(item).map(([key, formatMap]) =>
              Object.entries(formatMap).map(([formatName, attributs]) => (
                <div key={`${key}-${formatName}`}>
                  <div
                    className="cursor-pointer py-1 flex items-center justify-between font-medium text-gray-700 hover:text-teal-600 transition"
                    onClick={() =>
                      setSelectedCat(
                        selectedCat === formatName ? null : formatName
                      )
                    }
                  >
                    <span className="truncate">{formatName}</span>
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        selectedCat === formatName ? "rotate-90" : ""
                      }`}
                    />
                  </div>

                  {selectedCat === formatName && (
                    <div className="max-h-60 overflow-y-auto px-1 pl-4 space-y-1">
                      {attributs.map((attr) => {
                        const concat_attribut = `${formatName}.${attr.name}`;
                        const isChecked = (getValues("champs") || []).some(
                          (champ: ChampsAVC) => champ.nom === concat_attribut
                        );

                        return (
                          <label
                            key={attr.id}
                            htmlFor={`${formatName}-${attr.name}`}
                            className="flex items-center gap-2 text-sm cursor-pointer px-3 py-2 hover:bg-gray-100 rounded"
                            onMouseDown={() => handleClick(concat_attribut, attr.type)}
                            title={attr.name}
                          >
                            <input
                              id={`${formatName}-${attr.name}`}
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="shrink-0 h-4 w-4 text-teal-600 border-gray-300 rounded accent-blue-600"
                            />
                            <span className="truncate">{attr.name}</span>
                            <span className="text-xs text-gray-400">
                              ({attr.type})
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )
          : null
      )}
    </>
  );
};
