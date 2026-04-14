import { RestitutionFormDataType } from "@/components/form/schema";

// Fonction utilitaire : nettoie récursivement clause_regroupement
const cleanClauseRegroupement = (clause: any): any => {
  if (!clause) return clause;

  if (Array.isArray(clause)) {
    return clause.map((item) => cleanClauseRegroupement(item));
  }

  if (typeof clause === "object") {
    const { id, ...rest } = clause; // on retire seulement id
    return {
      ...rest,
      clause_regroupement: cleanClauseRegroupement(rest.clause_regroupement),
    };
  }

  return clause;
};

// Nettoie les données pour duplication (suppression des IDs)
export const removeIdsFromFormData = (
  data: RestitutionFormDataType
): RestitutionFormDataType => {
  const cleanedData: RestitutionFormDataType = {
    nom: data.nom,
    description: data.description,
    status_llm: data.status_llm,

    formats_selected: data.formats_selected.map((format) => ({
      id_structure: format.id_structure,
      name_structure: format.name_structure,
    })) as any,

    jointures:
      data.jointures?.map((jointure) => ({
        type: jointure.type,
        reference1: jointure.reference1,
        reference2: jointure.reference2,
      })) || [],

    filtres_pop:
      data.filtres_pop?.map((filtre) => ({
        champs_cible: filtre.champs_cible,
        operateur_comparaison: filtre.operateur_comparaison,
        parametre: filtre.parametre,
        operateur_logique: filtre.operateur_logique,
      })) || [],

    affichages: data.affichages.map((affichage) => ({
      nom_affichage: affichage.nom_affichage,
    })) as any,
    
    llmmodeles: data.llmmodeles.map((llmmodele) => ({
      libelle_llm: llmmodele.libelle_llm,
    })) as any,

    operation_selected: data.operation_selected.map((operation) => ({
      as_nom: operation.as_nom,
      conditions:
        operation.conditions?.map((condition) => ({
          cle_logique: condition.cle_logique,
          champs_cible: condition.champs_cible.map((expr) => ({
            valeur: expr.valeur,
            operateur_arithmetique: expr.operateur_arithmetique,
            clause_regroupement: cleanClauseRegroupement(
              expr.clause_regroupement
            ),
          })),
          operateur_comparaison: condition.operateur_comparaison,
          valeur_reference: condition.valeur_reference.map((expr) => ({
            valeur: expr.valeur,
            operateur_arithmetique: expr.operateur_arithmetique,
            clause_regroupement: cleanClauseRegroupement(
              expr.clause_regroupement
            ),
          })),
          operateur_logique: condition.operateur_logique,
        })) || null,
      expressions: operation.expressions.map((expr) => ({
        valeur: expr.valeur,
        operateur_arithmetique: expr.operateur_arithmetique,
        clause_regroupement: cleanClauseRegroupement(expr.clause_regroupement),
      })),
      clause_regroupement: cleanClauseRegroupement(
        operation.clause_regroupement
      ),
    })),

    champs:
      data.champs?.map((champ) => ({
        nom: champ.nom,
        as_nom: champ.as_nom,
        type: champ.type,
        typeAttribut: champ.typeAttribut,
        taille: champ.taille,
        position: champ.position,
        parametre: champ.parametre,
        separateur: champ.separateur,
        transformation: champ.transformation,
      })) || [],
  };

  return cleanedData;
};
