import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  divForm,
  divPackForm,
  errorTextForm,
  labelForm,
} from "@/components/ui/styles";

type BooleanFieldProps = {
  label: string;
  name: string;
  placeholder?: string;
};

const BooleanField: React.FC<BooleanFieldProps> = ({ name }) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors?.[name]?.message as string | undefined;

  return (
    <div className={`${divPackForm} min-w-[120px]`}>
      <div
        className={`${divForm} ${error ? "border-red-500" : ""}`}
      >
        <Controller
          control={control}
          name={name}
          defaultValue={true}
          render={({ field }) => {
            const isActive = field.value === true || field.value === null ? true : !!field.value;
            return (
              <>
                <label htmlFor={name} className={labelForm}>
                  {isActive ? "Activé" : "Désactivé"} :
                </label>
                <button
                  id={name}
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  onClick={() => field.onChange(!field.value)}
                  className={`relative w-full h-8 rounded-full transition-colors duration-300 ease-in-out focus:outline-none active:scale-[0.98] ${
                    isActive ? "bg-teal-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300 ease-in-out ${
                      isActive ? "right-1 left-auto" : "left-1 right-auto"
                    }`}
                  />
                </button>
              </>
            );
          }}
        />
      </div>
      {error && <p className={errorTextForm}>{error}</p>}
    </div>
  );
};

export default BooleanField;