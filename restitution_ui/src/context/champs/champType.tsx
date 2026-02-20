import { FieldApi } from "@tanstack/react-form";

export type ChampsAVC = {
  nom: string | null;
  as_nom: string | null;
  type: string | null;
  typeAttribut: string | null;
  position?: number | null;
  taille?: number | null;
  separateur?: string | null;
  parametre?: string | number | null;
  transformation: {
    type: string | null;
    typeAttribut: string | null;
    position?: number | null;
    taille?: number | null;
    separateur?: string | null;
    parametre?: string | number | null;
  };
};

export type Props = {
  name: string;
  placeholder: string;
  label: string;
  attributsMapName: string;
  error?: string;
};

export type MapsProps = {
  label: string;
  champsField: FieldApi<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >;
};
