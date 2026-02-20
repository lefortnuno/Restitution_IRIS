import { FieldApi, FormApi } from "@tanstack/react-form";
import { StructTableType } from "../queries/useStructTable";

export type AnyFormApi = FormApi<
  any, any, any, any, any, any, any, any, any, any
>;

export type AnyFieldApi = FieldApi<
  any, any, any, any, any, any, any, any, any, any,
  any, any, any, any, any, any, any, any, any
>;


export interface GlobalProps {
  label: string;
  name: string; 
  attributsMapName: string;  
}

export type AttributsMap = Array<Record<
  number,
  Record<string, StructTableType[]>
> | null> | null;