import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { AttributsMap } from "@/components/types/typage-global";
import { OperationType } from "@/context/operations/operationType";
import { useFormContext, useFieldArray } from "react-hook-form";

interface AttributProcessProps {
  currentOperation: string;
  formats: AttributsMap;
  extraStep: string;
  suprattr: number;
  suprcond1: number;
  suprcond2: number;
  suprattrSaveChamp: number;
  suprcond1Save: number;
  suprcond1SaveChamp: number;
  suprcond2SaveChamp: number;
  setStep: (step: string) => void;
  setExtraStep: (extraStep: string) => void;
  setSuprattrSaveChamp: (suprattrSaveChamp: number) => void;
  setSuprcond1SaveChamp: (suprcond1SaveChamp: number) => void;
  setSuprcond2SaveChamp: (suprcond2SaveChamp: number) => void;
}

export const AttributProcess: React.FC<AttributProcessProps> = ({
  currentOperation,
  formats,
  extraStep,
  suprattr,
  suprcond1,
  suprcond2,
  suprattrSaveChamp,
  suprcond1Save,
  suprcond1SaveChamp,
  suprcond2SaveChamp,
  setStep,
  setExtraStep,
  setSuprattrSaveChamp,
  setSuprcond1SaveChamp,
  setSuprcond2SaveChamp,
}) => {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const { getValues, setValue } = useFormContext();
  const { update } = useFieldArray({
    name: "operation_selected",
  });

  const handleClick = (attribut: string) => {
    if (extraStep.startsWith("supr_attr_")) {
      const currentOps = getValues("operation_selected") || [];
      let targetIndex = suprattrSaveChamp;

      const updatedOps = currentOps.map((op: OperationType) => {
        if (op.as_nom !== currentOperation) return op;

        const updatedExpressions = [...(op.expressions ?? [])];

        if (targetIndex === 0) {
          // Si l'index existe, on met à jour sa valeur
          if (updatedExpressions[targetIndex]) {
            updatedExpressions[targetIndex] = {
              ...updatedExpressions[targetIndex],
              valeur: null,
              operateur_arithmetique: "(",
            };
          } else {
            // Sinon, on ajoute une nouvelle expression
            updatedExpressions.push({
              valeur: null,
              operateur_arithmetique: "(",
            });
          }
          targetIndex = targetIndex + 1;
        }

        // Si l'index existe, on met à jour sa valeur
        if (updatedExpressions[targetIndex]) {
          updatedExpressions[targetIndex] = {
            ...updatedExpressions[targetIndex],
            valeur: attribut,
          };
        } else {
          // Sinon, on ajoute une nouvelle expression
          updatedExpressions.push({
            valeur: attribut,
            operateur_arithmetique: null,
          });
        }

        return {
          ...op,
          expressions: updatedExpressions,
        };
      });

      setValue("operation_selected", updatedOps);
      setExtraStep(`supr_attr_${suprattr}`);
      setSuprattrSaveChamp(targetIndex + 1);
    }

    if (extraStep.startsWith("supr_cond1_attr_")) {
      const currentOps = getValues("operation_selected") || [];
      let targetChampIndex = suprcond1SaveChamp;

      const updatedOps = currentOps.map((op: OperationType) => {
        if (op.as_nom !== currentOperation) return op;

        const updatedConditions = [...(op.conditions ?? [])];
        const targetIndex = suprcond1Save;

        // Si la condition cible n'existe pas, on la laisse telle quelle
        if (!updatedConditions[targetIndex]) return op;

        const targetCond = updatedConditions[targetIndex];
        const updatedChampsCible = [...(targetCond.champs_cible ?? [])];

        if (targetChampIndex === 0) {
          // Si l'index du champ existe, on le met à jour
          if (updatedChampsCible[targetChampIndex]) {
            updatedChampsCible[targetChampIndex] = {
              ...updatedChampsCible[targetChampIndex],
              valeur: null,
              operateur_arithmetique: "(",
            };
          } else {
            // Sinon, on ajoute un nouveau champ
            updatedChampsCible.push({
              valeur: null,
              operateur_arithmetique: "(",
            });
          }

          // Mise à jour de la condition cible avec le champs_cible modifié
          updatedConditions[targetIndex] = {
            ...targetCond,
            champs_cible: updatedChampsCible,
          };
          targetChampIndex = targetChampIndex + 1;
        }

        // Si l'index du champ existe, on le met à jour
        if (updatedChampsCible[targetChampIndex]) {
          updatedChampsCible[targetChampIndex] = {
            ...updatedChampsCible[targetChampIndex],
            valeur: attribut,
          };
        } else {
          // Sinon, on ajoute un nouveau champ
          updatedChampsCible.push({
            valeur: attribut,
            operateur_arithmetique: null,
          });
        }

        // Mise à jour de la condition cible avec le champs_cible modifié
        updatedConditions[targetIndex] = {
          ...targetCond,
          champs_cible: updatedChampsCible,
        };

        return {
          ...op,
          conditions: updatedConditions,
        };
      });

      setValue("operation_selected", updatedOps);
      setExtraStep(`supr_cond1_attr_${suprcond1}`);
      setSuprcond1SaveChamp(targetChampIndex + 1);
    } 
    
    setStep("op_arthm");
  };

  return (
    <>
      {(formats ?? []).map((item, idx) =>
        item
          ? Object.entries(item).map(([key, formatMap]) =>
              Object.entries(formatMap).map(([formatName, attributs]) => {
                // 🔍 Filtrer les attributs numériques
                const numericAttrs = attributs.filter((attr) =>
                  ["integer", "float", "number", "numerique"].includes(
                    attr.type.toLowerCase()
                  )
                );

                // ❌ Ignorer ce format s'il n'a aucun attribut numérique
                if (numericAttrs.length === 0) return null;

                return (
                  <div key={`${key}-${formatName}`}>
                    <div
                      className="cursor-pointer flex items-center justify-between font-medium text-gray-700 hover:text-teal-600 ml-4 py-2 transition"
                      onClick={() =>
                        setSelectedCat(
                          selectedCat === formatName ? null : formatName
                        )
                      }
                      title={formatName}
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
                        {numericAttrs.map((attr) => {
                          const concat_attribut = `${formatName}.${attr.name}`;
                          return (
                            <label
                              key={attr.id}
                              className="flex items-center gap-2 text-sm px-3 py-2 rounded transition cursor-pointer hover:bg-gray-100"
                              onClick={() => handleClick(concat_attribut)}
                              title={attr.name}
                            >
                              <input
                                id={`${formatName}-${attr.name}`}
                                type="checkbox" 
                                readOnly
                                className="shrink-0 h-4 w-4 text-teal-600 border-gray-300 rounded"
                              />
                              <span className="truncate">{attr.name}</span>
                              <span className="text-xs text-gray-400">
                                {" "}
                                ({attr.type})
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )
          : null
      )}
    </>
  );
};
