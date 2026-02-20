import React from "react";
import { useFormContext } from "react-hook-form";
import {
  divForm,
  divPackForm,
  errorTextForm,
  labelForm,
  placeholderForm,
} from "@/components/ui/styles";

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  error?: string | null;
};

const TextField: React.FC<InputFieldProps> = ({ label, name, id, error, ...rest }) => {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext();

  const inputId = id || name;
  const value = watch(name);
  const hasValue = typeof value === "string" && value.trim() !== "";
  // const error = errors?.[name]?.message as string | undefined;

  return (
    <div className={`${divPackForm} min-w-[250px]`}>
      <div
        className={`${divForm} ${
          error
            ? "border-red-500 focus:ring-red-300"
            : "border-gray-300 focus:ring-blue-300"
        }`}
      >
        <label htmlFor={inputId} className={labelForm}>
          {label}
        </label>
        <input
          id={inputId}
          className={`${placeholderForm} truncate ${
            hasValue ? "bg-gray-100" : ""
          }`}
          {...register(name)}
          {...rest}
          autoComplete="off"
        />
      </div>
      {error && <p className={errorTextForm}>{error}</p>}
    </div>
  );
};

export default TextField;
