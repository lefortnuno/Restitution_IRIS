import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  errorTextForm,
  labelForm,
} from "@/components/ui/styles";

type BooleanFieldProps = {
  label: string;
  name: string;
  placeholder?: string;
};

const BooleanField: React.FC<BooleanFieldProps> = ({ label, name }) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors?.[name]?.message as string | undefined;

  return (
    <div className="relative mt-4 mb-2 min-w-[120px] min-h-[48px]">
      <div
        className={`relative w-full min-h-[54px] border border-gray-500 rounded px-3 py-2 shadow-sm mr-4 focus-within:ring-1 focus-within:ring-teal-600 focus-within:border-teal-600 transition-all duration-300 ${
          error
            ? "border-red-500 focus:ring-red-300"
            : "border-gray-300 focus:ring-blue-300"
        }`}
      >
        <label htmlFor={name} className={labelForm}>
          {label}
        </label>
        <Controller
          control={control}
          name={name}
          defaultValue={true}  // ← ajout ici
          render={({ field }) => {
            const isActive = field.value === true || field.value === null ? true : !!field.value;
            return (
              <button
                id={name}
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() => field.onChange(!field.value)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                  isActive ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            );
          }}
        />
      </div>
      {error && <p className={errorTextForm}>{error}</p>}
    </div>
  );
};

export default BooleanField;