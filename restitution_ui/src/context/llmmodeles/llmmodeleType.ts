export type Option = {
  value: string;
  label: string;
};

export const affichageOptions: Option[] = [
  { value: "qwen/qwen3-32b", label: "qwen/qwen3-32b" },
  { value: "llama-3.3-70b-versatile", label: "llama-3.3-70b-versatile" },
];

export type Props = {
  name: string;
  placeholder: string;
  error?: string;
};
