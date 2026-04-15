import React from "react";
import { OperationType } from "@/context/operations/operationType";
import { useFormContext, useFieldArray } from "react-hook-form";

interface ComparaisonProcessProps {
  currentOperation: string;
  suprcond1Save: number;
  suprcond2: number; 
  setStep: (step: string) => void;
  setExtraStep: (extraStep: string) => void;
  setSuprcond2: (suprcond2: number) => void; 
}

export const ComparaisonProcess: React.FC<ComparaisonProcessProps> = ({
  currentOperation,
  suprcond1Save,
  suprcond2,
  setStep,
  setExtraStep,
  setSuprcond2,  
}) => {
  const { getValues, setValue } = useFormContext();

  const handleSelect = (value: string) => {
    if (!["<", "<=", ">", ">=", "==", "!=", "%"].includes(value)) return;

    const type = value as "<" | "<=" | ">" | ">=" | "==" | "!=" | "%";
    const currentOps = getValues("operation_selected") || [];

    const updatedOps = currentOps.map((op: OperationType) => {
      if (op.as_nom !== currentOperation) return op;

      const updatedConditions = [...(op.conditions ?? [])];
      const targetIndex = suprcond1Save;

      if (!updatedConditions[targetIndex]) return op;

      const targetCond = updatedConditions[targetIndex];
      updatedConditions[targetIndex] = {
        ...targetCond,
        operateur_comparaison: type,
      };

      return { ...op, conditions: updatedConditions };
    });

    setValue("operation_selected", updatedOps);

    const count = suprcond2 + 1;
    setSuprcond2(count);
    setExtraStep(`supr_cond2_attr_${count}`);
    setStep("attr");
  };

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1 mb-1">
        Comparaison
      </p>
      {["<", "<=", ">", ">=", "==", "!=", "%"].map((op) => (
        <button
          key={op}
          type="button"
          onClick={() => handleSelect(op)}
          className="w-full text-left px-3 py-2 text-sm font-medium text-gray-800 rounded-md border border-gray-200 bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 cursor-pointer transition-colors"
        >
          {op}
        </button>
      ))}
    </div>
  );
};
