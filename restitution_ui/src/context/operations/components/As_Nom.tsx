import React, { useEffect, useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import {
  divForm,
  divPackForm,
  errorTextForm,
  labelForm,
  placeholderForm,
} from "@/components/ui/styles";
import { OperationType } from "@/context/operations/operationType";

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  numIndex: number;
  currentOperation: string;
  setCurrentOperation: (currentOperation: string) => void;
};

const As_Nom: React.FC<InputFieldProps> = ({
  label,
  name,
  numIndex,
  currentOperation,
  setCurrentOperation,
  id,
  ...rest
}) => {
  const {
    register,
    formState: { errors },
    watch,
    getValues,
    setValue,
  } = useFormContext();

  const { fields, update } = useFieldArray({
    name: "operation_selected",
  });

  const operationSelected = watch("operation_selected");

  useEffect(() => {
    if (operationSelected?.[numIndex]) {
      setValue(name, operationSelected[numIndex]?.as_nom ?? "");
    } else {
      setValue(name, "");
    }
  }, [operationSelected, numIndex, name, setValue]);

  const value = operationSelected[numIndex]?.as_nom;
  const hasValue = typeof value === "string" && value.trim() !== "";
  const error = errors?.[name]?.message as string | undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(name, newValue);

    if (operationSelected?.[numIndex]) {
      update(numIndex, {
        ...operationSelected[numIndex],
        as_nom: newValue,
      });

      const champs = getValues("champs") || [];
      const updatedChamps = champs.map((ch: any) => {
        if (ch.nom === operationSelected[numIndex]?.as_nom) {
          return {
            ...ch,
            nom: newValue,
            as_nom: newValue,
          };
        }
        return ch;
      });

      setValue("champs", updatedChamps);
    }
  };

  const inputId = id || name;

  return (
    <>
      <input
        id={inputId}
        className={`w-full px-2 py-1 rounded border text-sm text-gray-900 placeholder-gray-400 outline-none
        ${hasValue ? "bg-gray-100" : ""}
        ${
          error
            ? "border-red-500 focus:ring-red-300"
            : "border-gray-300 focus:ring-teal-500"
        }
      `}
        value={value || ""}
        onChange={handleChange}
        autoComplete="off"
        {...rest}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </>
  );
};

export default As_Nom;
