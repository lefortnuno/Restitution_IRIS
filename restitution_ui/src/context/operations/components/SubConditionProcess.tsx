import React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useFieldArray, useFormContext } from "react-hook-form";
import { OperationType } from "@/context/operations/operationType";

interface SubConditionProcessProps {
  currentOperation: string;
  suprattr: number;
  suprcond1: number;
  suprcond1Save: number;
  setExtraStep: (extraStep: string) => void;
  setStep: (step: string) => void;
  setSuprattr: (suprattr: number) => void;
  setSuprcond1: (suprcond1: number) => void;
  setSuprcond1Save: (setSuprcond1Save: number) => void;
  setUltimeStep: (ultime: string) => void;
  setSuprcond1SaveChamp: (suprcond1SaveChamp: number) => void;
  setSuprcond2SaveChamp: (suprcond2SaveChamp: number) => void;
}

export const SubConditionProcess: React.FC<SubConditionProcessProps> = ({
  currentOperation,
  suprattr,
  suprcond1,
  setExtraStep,
  setStep,
  setSuprattr,
  setSuprcond1,
  suprcond1Save,
  setSuprcond1Save,
  setUltimeStep,
  setSuprcond1SaveChamp,
  setSuprcond2SaveChamp,
}) => {
  const { control, getValues, setValue } = useFormContext();
  const { fields, append } = useFieldArray({
    control,
    name: "operation_selected",
  });

  return (
    <Select
      onValueChange={(type) => {
        if (!type) return;

        if (type === "ALORS") {
          const count: number = suprattr + 1;
          const next_step: string = `supr_attr_${count}`;
          setSuprattr(count);
          setExtraStep(next_step);
          setUltimeStep("ultime");
        }

        if (type === "OU" || type === "ET") {
          const currentOps = getValues("operation_selected") || [];

          const updatedOps = currentOps.map((op: OperationType) => {
            if (op.as_nom !== currentOperation) return op;

            const updatedConditions = [...(op.conditions ?? [])];
            const targetIndex = suprcond1Save;

            const cle_logique =
              updatedConditions[targetIndex]?.cle_logique ?? "si";
              
            updatedConditions.push({
              cle_logique: cle_logique,
              champs_cible: [],
              operateur_comparaison: null,
              valeur_reference: [],
              operateur_logique: type,
            });

            return {
              ...op,
              conditions: updatedConditions,
            };
          });

          setValue("operation_selected", updatedOps);
          const count: number = suprcond1 + 1;
          setSuprcond1(count);
          setExtraStep(`supr_cond1_attr_${count}`);
          setSuprcond1SaveChamp(0);
          setSuprcond2SaveChamp(0);
          setSuprcond1Save(suprcond1Save + 1);
        }

        setStep("attr");
      }}
    >
      <SelectTrigger className="w-full border-0 border-b border-gray-700 rounded shadow-none focus:ring-0 focus:border-b focus:border-black">
        <SelectValue placeholder="SUB CONDITION" />
      </SelectTrigger>
      <SelectContent className="bg-white">
        {["ALORS", "OU", "ET"].map((op) => (
          <SelectItem key={op} className="cursor-pointer" value={op}>
            {op}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
