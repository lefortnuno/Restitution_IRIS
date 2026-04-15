import React from "react";
import { CleLogique, OperationType } from "@/context/operations/operationType";
import { useFieldArray, useFormContext } from "react-hook-form";

interface ConditionProcessProps {
  currentOperation: string;
  hasExistingCondition: boolean;
  step: string;
  extraStep: string;
  suprattr: number;
  suprcond1: number;
  operationSelectedField: OperationType[];
  setStep: (extraStep: string) => void;
  setExtraStep: (extraStep: string) => void;
  setCurrentOperation: (name: string) => void;
  setSuprattr: (suprattr: number) => void;
  setSuprcond1: (suprcond1: number) => void;
  setUltimeStep: (ultime: string) => void;
}

export const ConditionProcess: React.FC<ConditionProcessProps> = ({
  currentOperation,
  step,
  extraStep,
  suprattr,
  suprcond1,
  hasExistingCondition,
  operationSelectedField,
  setStep,
  setExtraStep,
  setCurrentOperation,
  setSuprattr,
  setSuprcond1,
  setUltimeStep,
}) => {
  const { control, getValues, setValue } = useFormContext();
  const { fields, append } = useFieldArray({
    control,
    name: "operation_selected",
  });

  const options = hasExistingCondition ? ["sinon si", "sinon"] : ["si"];

  const handleSelect = (type: CleLogique) => {
    if (!type) return;

    if (type === "si" || type === "sinon si") {
      if (extraStep === "") {
        const default_nom_operation =
          "operation" + (operationSelectedField.length + 1);

        const newOp: OperationType = {
          as_nom: default_nom_operation,
          conditions: [
            {
              cle_logique: type,
              champs_cible: [],
              operateur_comparaison: null,
              valeur_reference: [],
              operateur_logique: null,
            },
          ],
          expressions: [],
        };

        append(newOp);
        setCurrentOperation(default_nom_operation);
        const count: number = suprcond1 + 1;
        const next_step: string = `supr_cond1_attr_${count}`;
        setSuprcond1(count);
        setExtraStep(next_step);
      } else {
        setExtraStep("supr_cond1_attr_");
      }
    }

    if (type === "sinon") {
      const default_nom_operation =
        "operation" + (operationSelectedField.length + 1);

      const newOp: OperationType = {
        as_nom: default_nom_operation,
        conditions: [
          {
            cle_logique: type,
            champs_cible: [],
            operateur_comparaison: null,
            valeur_reference: [],
            operateur_logique: null,
          },
        ],
        expressions: [],
      };

      append(newOp);
      setCurrentOperation(default_nom_operation);
      const count: number = suprattr + 1;
      const next_step: string = `supr_attr_${count}`;
      setSuprattr(count);
      setExtraStep(next_step);
      setUltimeStep("ultime");
    }

    setStep("attr");
  };

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1 mb-1">
        Conditions
      </p>
      {options.map((op) => (
        <button
          key={op}
          type="button"
          onClick={() => handleSelect(op as CleLogique)}
          className="w-full text-left px-3 py-2 text-sm font-medium text-gray-800 rounded-md border border-gray-200 bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 cursor-pointer transition-colors"
        >
          {op.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
