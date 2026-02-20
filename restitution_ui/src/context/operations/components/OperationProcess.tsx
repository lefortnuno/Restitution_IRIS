import React, { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  OperationType,
  operationsOptions,
  operationsConditions,
} from "@/context/operations/operationType";

interface OperationProcessProps {
  currentOperation: string;
  operationSelectedField: OperationType[];
  step: string;
  extraStep: string;
  suprattr: number;
  suprcond1: number;
  suprcond2: number;
  suprcond1Save: number;
  suprattrSaveChamp: number;
  suprcond1SaveChamp: number;
  suprcond2SaveChamp: number;
  setOpen: (val: boolean) => void;
  setStep: (step: string) => void;
  setCurrentOperation: (name: string) => void;
  setExtraStep: (extraStep: string) => void;
  setSuprattr: (suprattr: number) => void;
  setSuprcond1: (suprcond1: number) => void;
  setSuprcond2: (suprcond2: number) => void;
  setSuprattrSaveChamp: (suprattrSaveChamp: number) => void;
  setSuprcond1SaveChamp: (suprcond1SaveChamp: number) => void;
  setSuprcond2SaveChamp: (suprcond2SaveChamp: number) => void;
  setUltimeStep: (ultime: string) => void;
}

export const OperationProcess: React.FC<OperationProcessProps> = ({
  currentOperation,
  step,
  extraStep,
  suprattr,
  suprcond1,
  suprcond2,
  suprcond1Save,
  suprattrSaveChamp,
  suprcond1SaveChamp,
  suprcond2SaveChamp,
  operationSelectedField,
  setOpen,
  setStep,
  setCurrentOperation,
  setExtraStep,
  setSuprattr,
  setSuprcond1,
  setSuprcond2,
  setSuprattrSaveChamp,
  setSuprcond1SaveChamp,
  setSuprcond2SaveChamp,
  setUltimeStep,
}) => {
  const { control, getValues, setValue } = useFormContext();
  const { fields, append } = useFieldArray({
    control,
    name: "operation_selected",
  });

  const [operationSelectionner, setOperationSelectionner] =
    useState<string>("");

  const handleClick = (operationSelectionner: string) => {
    if (!operationSelectionner) return;
    setOperationSelectionner(operationSelectionner);

    if (step === "operation") {
      const count: number = suprattr + 2;

      const default_nom_operation =
        operationSelectionner + (operationSelectedField.length + 1);

      const newOp: OperationType = {
        as_nom: default_nom_operation,
        expressions: [
          { valeur: null, operateur_arithmetique: "(" },
          { valeur: operationSelectionner, operateur_arithmetique: "(" },
        ],
      };

      append(newOp);
      setCurrentOperation(default_nom_operation);
      setSuprattr(count);
      setExtraStep("supr_attr_");
      setSuprattrSaveChamp(suprattrSaveChamp + 2);
    }

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
            valeur: operationSelectionner,
          };
        } else {
          // Sinon, on ajoute une nouvelle expression
          updatedExpressions.push({
            valeur: operationSelectionner,
            operateur_arithmetique: "(",
          });
        }

        return {
          ...op,
          expressions: updatedExpressions,
        };
      });

      setValue("operation_selected", updatedOps);
      const count: number = suprattr + 1;
      setSuprattr(count);
      setExtraStep(`supr_attr_${count}`);
      setSuprattrSaveChamp(targetIndex + 1);
      setUltimeStep("");
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
            valeur: operationSelectionner,
          };
        } else {
          // Sinon, on ajoute un nouveau champ
          updatedChampsCible.push({
            valeur: operationSelectionner,
            operateur_arithmetique: "(",
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
      const count: number = suprcond1 + 1;
      setSuprcond1(count);
      setExtraStep(`supr_cond1_attr_${count}`);
      setSuprcond1SaveChamp(targetChampIndex + 1);
    } 

    setStep("attr");

    setOpen(false);
    setOperationSelectionner("");
  };

  return (
    <div className="space-y-2">
      <select
        value={operationSelectionner}
        onChange={(e) => handleClick(e.target.value)}
        className="w-full h-10 px-3 text-sm text-gray-800 font-medium border border-gray-300 rounded-md bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition"
      >
        <option value="" disabled>
          Choisir une opération
        </option>
        {extraStep.startsWith("supr_cond1_attr_") ||
        extraStep.startsWith("supr_cond2_attr_") ? (
          <>
            {operationsConditions.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </>
        ) : (
          <>
            {operationsOptions.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </>
        )}
      </select>
    </div>
  );
};
