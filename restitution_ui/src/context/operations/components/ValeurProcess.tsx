import React, { useState } from "react";
import { OperationType } from "@/context/operations/operationType";
import { useFormContext, useFieldArray } from "react-hook-form";

interface ValeurProcessProps {
  currentOperation: string;
  step: string;
  extraStep: string;
  suprattr: number;
  suprcond1: number;
  suprcond2: number;
  suprattrSaveChamp: number;
  suprcond1Save: number;
  suprcond1SaveChamp: number;
  suprcond2Save: number;
  suprcond2SaveChamp: number;
  setStep: (step: string) => void;
  setExtraStep: (extraStep: string) => void;
  setSuprcond2SaveChamp: (suprcond2SaveChamp: number) => void;
}

export const ValeurProcess: React.FC<ValeurProcessProps> = ({
  currentOperation,
  step,
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
  setSuprcond2SaveChamp,
}) => {
  const [currentValue, setCurrentValue] = useState<string | number>("");
  const { getValues, setValue } = useFormContext();
  const { update } = useFieldArray({
    name: "operation_selected",
  });

  const handleKeyDown =
    (currentValue: string | number) =>
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();

        if (extraStep === "select" || extraStep.startsWith("supr_attr_")) {
          const currentOps = getValues("operation_selected") || [];

          const updatedOps = currentOps.map((op: OperationType) => {
            if (op.as_nom !== currentOperation) return op;

            const updatedExpressions = [...(op.expressions ?? [])];
            const targetIndex = suprattrSaveChamp;

            // Si l'index existe, on met à jour sa valeur
            if (updatedExpressions[targetIndex]) {
              updatedExpressions[targetIndex] = {
                ...updatedExpressions[targetIndex],
                valeur: currentValue,
              };
            } else {
              // Sinon, on ajoute une nouvelle expression
              updatedExpressions.push({
                valeur: currentValue,
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
        }

        if (extraStep.startsWith("supr_cond1_attr_")) {
          const currentOps = getValues("operation_selected") || [];

          const updatedOps = currentOps.map((op: OperationType) => {
            if (op.as_nom !== currentOperation) return op;

            const updatedConditions = [...(op.conditions ?? [])];
            const targetIndex = suprcond1Save;
            const targetChampIndex = suprcond1SaveChamp;

            // Si la condition cible n'existe pas, on la laisse telle quelle
            if (!updatedConditions[targetIndex]) return op;

            const targetCond = updatedConditions[targetIndex];
            const updatedChampsCible = [...(targetCond.champs_cible ?? [])];

            // Si l'index du champ existe, on le met à jour
            if (updatedChampsCible[targetChampIndex]) {
              updatedChampsCible[targetChampIndex] = {
                ...updatedChampsCible[targetChampIndex],
                valeur: currentValue,
              };
            } else {
              // Sinon, on ajoute un nouveau champ
              updatedChampsCible.push({
                valeur: currentValue,
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
        }

        if (extraStep.startsWith("supr_cond2_attr_")) {
          const currentOps = getValues("operation_selected") || [];
          let targetChampIndex = suprcond2SaveChamp;

          const updatedOps = currentOps.map((op: OperationType) => {
            if (op.as_nom !== currentOperation) return op;

            const updatedConditions = [...(op.conditions ?? [])];
            const targetIndex = suprcond1Save;

            // Si la condition cible n'existe pas, on la laisse telle quelle
            if (!updatedConditions[targetIndex]) return op;

            const targetCond = updatedConditions[targetIndex];
            const updatedChampsCible = [...(targetCond.valeur_reference ?? [])];

            if (targetChampIndex === 0) {
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

              // Mise à jour de la condition cible avec valeur_reference modifié
              updatedConditions[targetIndex] = {
                ...targetCond,
                valeur_reference: updatedChampsCible,
              };

              targetChampIndex = targetChampIndex + 1;
            }

            // Si l'index du champ existe, on le met à jour
            if (updatedChampsCible[targetChampIndex]) {
              updatedChampsCible[targetChampIndex] = {
                ...updatedChampsCible[targetChampIndex],
                valeur: currentValue,
              };
            } else {
              // Sinon, on ajoute un nouveau champ
              updatedChampsCible.push({
                valeur: currentValue,
                operateur_arithmetique: null,
              });
            }

            // Mise à jour de la condition cible avec valeur_reference modifié
            updatedConditions[targetIndex] = {
              ...targetCond,
              valeur_reference: updatedChampsCible,
            };

            return {
              ...op,
              conditions: updatedConditions,
            };
          });

          setValue("operation_selected", updatedOps);
          setExtraStep(`supr_cond2_attr_${suprcond2}`);
          setSuprcond2SaveChamp(targetChampIndex + 1);
        }

        setStep("op_arthm");
      }
    };
  return (
    <>
      <input
        type="text"
        placeholder="Entrez une valeur"
        className="w-full h-10 px-3 text-sm text-gray-800 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition"
        onChange={(e) => setCurrentValue(e.target.value)}
        onKeyDown={handleKeyDown(currentValue)}
      />
    </>
  );
};
