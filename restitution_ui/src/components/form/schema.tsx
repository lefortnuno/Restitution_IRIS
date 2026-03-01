import { z } from "zod";

export const expressionSchema = z.array(
  z.object({
    valeur: z.union([z.string(), z.number()]).nullable(),
    operateur_arithmetique: z.string().nullable(),
    clause_regroupement: z
      .array(
        z.object({
          champs_cible: z.string().nullable(),
        }),
      )
      .optional(),
  }),
);

export const restitutionFormSchema = z.object({
  nom: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),

  formats_selected: z
    .array(z.object({ id_structure: z.number(), name_structure: z.string() }))
    .min(1, "Sélectionner au moins une format"),

  jointures: z
    .array(
      z.object({
        type: z.string(),
        reference1: z.object({
          format: z.string(),
          attribut: z.string(),
        }),
        reference2: z.object({
          format: z.string(),
          attribut: z.string(),
        }),
      }),
    )
    .optional(),

  filtres_pop: z
    .array(
      z.object({
        champs_cible: z.string(),
        operateur_comparaison: z.string(),
        parametre: z.union([z.string(), z.number()]),
        operateur_logique: z.enum(["ET", "OU"]).nullable(),
      }),
    )
    .optional(),

  affichages: z
    .array(z.object({ nom_affichage: z.string() }))
    .min(1, "L'affichage doit être choisi obligatoirement"),

  llmmodeles: z
    .array(z.object({ libelle_llm: z.string() }))
    .min(1, "Le modele d'IA doit être choisi obligatoirement"),

  operation_selected: z
    .array(
      z.object({
        as_nom: z.string(),

        conditions: z
          .array(
            z.object({
              cle_logique: z.enum(["si", "sinon si", "sinon"]).nullable(),
              champs_cible: expressionSchema,
              operateur_comparaison: z
                .enum(["<", "<=", ">", ">=", "==", "!=", "%"])
                .nullable(),
              valeur_reference: expressionSchema,
              operateur_logique: z.enum(["OU", "ET"]).nullable(),
            }),
          )
          .nullable(),

        expressions: expressionSchema.min(1, "Ajoutez au moins une expression"),

        clause_regroupement: z
          .array(
            z.object({
              champs_cible: z.string().nullable(),
            }),
          )
          .optional(),
      }),
    )
    .min(1, "Effectuer au moins une opération"),

  champs: z
    .array(
      z.object({
        nom: z.string().nullable(),
        as_nom: z.string().nullable(),
        type: z.string().nullable(),
        typeAttribut: z.string().nullable(),
        taille: z.number().nullable(),
        position: z.string().nullable(),
        parametre: z.string().nullable(),
        separateur: z.string().nullable(),
        transformation: z
          .object({
            type: z
              .enum([
                "op_",
                "none",
                "concat",
                "extract",
                "AxesX",
                "AxesY",
                "maps",
                "lat",
                "lon",
              ])
              .nullable(),
            typeAttribut: z.number().nullable(),
            taille: z.number().nullable(),
            position: z.string().nullable(),
            parametre: z.string().nullable(),
            separateur: z.string().nullable(),
          })
          .nullable(),
      }),
    )
    .optional(),

  description: z.string().nullable(),
  status_llm: z.boolean().nullable(),
});

export type RestitutionFormDataType = z.infer<typeof restitutionFormSchema>;

export const defaultRestitution: RestitutionFormDataType = {
  nom: "",
  formats_selected: [],
  jointures: [],
  filtres_pop: [],
  affichages: [],
  llmmodeles: [],
  operation_selected: [],
  champs: [],
  description: "",
  status_llm: true,
};
