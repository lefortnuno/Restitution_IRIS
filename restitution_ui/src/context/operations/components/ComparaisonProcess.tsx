import React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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
  const { update } = useFieldArray({
    name: "operation_selected",
  });
  return (
    <Select
      onValueChange={(value: string) => {
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

          return {
            ...op,
            conditions: updatedConditions,
          };
        });

        setValue("operation_selected", updatedOps);

        const count = suprcond2 + 1;
        const next_step = `supr_cond2_attr_${count}`; 
        setSuprcond2(count);
        setExtraStep(next_step);
        setStep("attr");
      }}
    >
      <SelectTrigger className="w-full border-0 border-b border-gray-700 rounded shadow-none focus:ring-0 focus:border-b focus:border-black">
        <SelectValue placeholder="Sélectionner une comparaison..." />
      </SelectTrigger>
      <SelectContent className="bg-white">
        {["<", "<=", ">", ">=", "==", "!=", "%"].map((op) => (
          <SelectItem key={op} value={op}>
            {op}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
