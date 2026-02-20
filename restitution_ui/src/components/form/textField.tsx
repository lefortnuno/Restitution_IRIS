type TextFieldProps = {
  label: string;
  placeholder?: string;
  field: any;
};

export const TextField = ({ label, placeholder, field }: TextFieldProps) => {
  return (
    <div className="mb-4">
      <label htmlFor={field.name} className="block font-medium mb-1">
        {label}
      </label>
      <input
        id={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {field.state.meta.errors?.length > 0 && (
        <p className="text-sm text-red-600 mt-1">
          {field.state.meta.errors.join(", ")}
        </p>
      )}
    </div>
  );
};
