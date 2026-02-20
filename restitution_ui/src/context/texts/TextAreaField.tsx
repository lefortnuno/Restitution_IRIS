import React from "react";
import { useFormContext } from "react-hook-form";
import {
  divForm,
  divPackForm,
  errorTextForm,
  labelForm,
  placeholderForm,
} from "@/components/ui/styles";

type TextAreaFieldProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  name: string;
};

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  name,
  id,
  ...rest
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const textareaId = id || name;
  const error = errors?.[name]?.message as string | undefined;

  return (
    <div className={divPackForm}>
      <div
        className={`${divForm} ${
          error
            ? "border-red-500 focus:ring-red-300"
            : "border-gray-300 focus:ring-blue-300"
        }`}
      >
        <label htmlFor={textareaId} className={labelForm}>
          {label}
        </label>
        <textarea
          id={textareaId}
          className={`min-h-[120px] ${placeholderForm} overflow-y-auto scrollbar-hide`}
          {...register(name)}
          {...rest}
        />
      </div>
      {error && <p className={errorTextForm}>{error}</p>}
    </div>
  );
};

export default TextAreaField;
