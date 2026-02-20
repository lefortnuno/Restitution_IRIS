import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
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

  const [isCondOpen, setIsCondOpen] = useState(false);

  const options = hasExistingCondition ? ["sinon si", "sinon"] : ["si"];

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const type = event.target.value as CleLogique;
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
    setIsCondOpen(false);
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setIsCondOpen(!isCondOpen);
      }}
      className="relative w-full"
    >
      <select
        onChange={handleChange}
        onBlur={() => setIsCondOpen(false)}
        defaultValue=""
        className="w-full h-10 px-3 text-sm text-gray-800 font-medium border border-gray-300 rounded-md bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition"
      >
        <option value="" disabled>
          Conditions
        </option>
        {options.map((op) => (
          <option key={op} value={op} className="cursor-pointer">
            {op.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
};
