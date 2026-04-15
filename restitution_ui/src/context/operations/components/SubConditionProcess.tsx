import React from "react";
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

  const handleSelect = (type: string) => {
    if (!type) return;

    if (type === "ALORS") {
      const count: number = suprattr + 1;
      setSuprattr(count);
      setExtraStep(`supr_attr_${count}`);
      setUltimeStep("ultime");
    }

    if (type === "OU" || type === "ET") {
      const currentOps = getValues("operation_selected") || [];

      const updatedOps = currentOps.map((op: OperationType) => {
        if (op.as_nom !== currentOperation) return op;

        const updatedConditions = [...(op.conditions ?? [])];
        const cle_logique =
          updatedConditions[suprcond1Save]?.cle_logique ?? "si";

        updatedConditions.push({
          cle_logique: cle_logique,
          champs_cible: [],
          operateur_comparaison: null,
          valeur_reference: [],
          operateur_logique: type,
        });

        return { ...op, conditions: updatedConditions };
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
  };

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1 mb-1">
        Suite de la condition
      </p>
      {["ALORS", "OU", "ET"].map((op) => (
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
