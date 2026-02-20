import { StructTableType } from "@/components/queries/useStructTable";

export type Reference = {
  format: string;
  attribut: string;
};

export type Jointure = {
  type: string;
  reference1: Reference;
  reference2: Reference;
}; 