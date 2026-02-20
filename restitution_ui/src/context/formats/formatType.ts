
export interface FormatZod {
  id_structure: number;
  name_structure: string;
}

export interface FormatOption {
  id: number;
  name: string;
}

export interface FormatSelectFieldProps {
  name: string;
  options: FormatOption[];
  label?: string;
  isLoading?: boolean;
  error?: string;
}