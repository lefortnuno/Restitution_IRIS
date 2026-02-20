import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { AttributsMap } from "@/components/types/typage-global";
import { useFormContext } from "react-hook-form";
import { OperationType } from "@/context/operations/operationType";

interface AttributProcessProps {
  formats: AttributsMap;
  currentOperation: string;
  extraStep: string;
  suprattr: number;
  suprcond1: number;
  suprcond2: number;
  suprattrSaveChamp: number;
  suprcond1Save: number;
  suprcond1SaveChamp: number;
  suprcond2SaveChamp: number;
  setStep: (step: string) => void;
  setExtraStep: (extraStep: string) => void;
  saveTransformation: () => void;
  setSuprattr: (suprattr: number) => void;
  setSuprcond1: (suprcond1: number) => void;
  setSuprcond2: (suprcond2: number) => void;
  setSuprattrSaveChamp: (suprattrSaveChamp: number) => void;
  setSuprcond1SaveChamp: (suprcond1SaveChamp: number) => void;
  setSuprcond2SaveChamp: (suprcond2SaveChamp: number) => void;
}

export const GroupByProcess: React.FC<AttributProcessProps> = ({
  formats,
  currentOperation,
  extraStep,
  suprattr,
  suprcond1,
  suprcond2,
  suprattrSaveChamp,
  suprcond1Save,
  suprcond1SaveChamp,
  suprcond2SaveChamp,
  setStep,
  setExtraStep,
  saveTransformation,
  setSuprattr,
  setSuprcond1,
  setSuprcond2,
  setSuprattrSaveChamp,
  setSuprcond1SaveChamp,
  setSuprcond2SaveChamp,
}) => {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [nbrGroupBY, setNbrGoupBY] = useState<number>(0);
  const { getValues, setValue } = useFormContext();

  const handleClick = (attribut: string) => {
    if (extraStep.startsWith("supr_attr_")) {
      const match = extraStep.match(/^supr_attr_(\d+)$/);
      if (match) {
        const currentOps = getValues("operation_selected") || [];

        const updatedOps = currentOps.map((op: OperationType) => {
          if (op.as_nom !== currentOperation) return op;

          const updatedExpressions = [...(op.expressions ?? [])];
          const targetIndex = suprattrSaveChamp;
          const currentExpr = updatedExpressions[targetIndex];

          const currentClause = currentExpr.clause_regroupement ?? [];

          const alreadySelected = currentClause.some(
            (item: any) => item.champs_cible === attribut
          );

          const newClauseRegroupement = alreadySelected
            ? currentClause.filter(
                (item: any) => item.champs_cible !== attribut
              ) // suppression
            : [...currentClause, { champs_cible: attribut }];
          setNbrGoupBY(alreadySelected ? nbrGroupBY - 1 : nbrGroupBY + 1);

          updatedExpressions[targetIndex] = {
            ...currentExpr,
            clause_regroupement: newClauseRegroupement,
          };

          return {
            ...op,
            expressions: updatedExpressions,
          };
        });

        setValue("operation_selected", updatedOps);
      }
    }

    if (extraStep.startsWith("supr_cond1_attr_")) {
      const match = extraStep.match(/^supr_cond1_attr_(\d+)$/);
      if (match) {
        const currentOps = getValues("operation_selected") || [];

        const updatedOps = currentOps.map((op: OperationType) => {
          if (op.as_nom !== currentOperation) return op;

          const updatedConditions = [...(op.conditions ?? [])];
          const targetIndex = suprcond1Save;
          const targetChampIndex = suprcond1SaveChamp;

          const targetCond = updatedConditions[targetIndex];
          if (!targetCond || !targetCond.champs_cible?.[targetChampIndex])
            return op;

          const targetExpr = targetCond.champs_cible[targetChampIndex];

          const existingClause = targetExpr.clause_regroupement ?? [];

          const alreadySelected = existingClause.some(
            (item) => item.champs_cible === attribut
          );

          const newClauseRegroupement = alreadySelected
            ? existingClause.filter((item) => item.champs_cible !== attribut)
            : [...existingClause, { champs_cible: attribut }];

          // MAJ de l'expression cible
          const updatedChampCible = {
            ...targetExpr,
            clause_regroupement: newClauseRegroupement,
          };

          // Remplacement de l'expression dans le tableau
          const updatedChampsCible = [...targetCond.champs_cible];
          updatedChampsCible[targetChampIndex] = updatedChampCible;

          updatedConditions[targetIndex] = {
            ...targetCond,
            champs_cible: updatedChampsCible,
          };

          setNbrGoupBY(alreadySelected ? nbrGroupBY - 1 : nbrGroupBY + 1);

          return {
            ...op,
            conditions: updatedConditions,
          };
        });

        setValue("operation_selected", updatedOps);
      }
    }

    if (extraStep.startsWith("supr_cond2_attr_")) {
      const match = extraStep.match(/^supr_cond2_attr_(\d+)$/);
      if (match) {
        const currentOps = getValues("operation_selected") || [];

        const updatedOps = currentOps.map((op: OperationType) => {
          if (op.as_nom !== currentOperation) return op;

          const updatedConditions = [...(op.conditions ?? [])];
          const targetIndex = suprcond1Save;
          const targetChampIndex = suprcond2SaveChamp;

          const targetCond = updatedConditions[targetIndex];
          if (!targetCond || !targetCond.valeur_reference?.[targetChampIndex])
            return op;

          const targetExpr = targetCond.valeur_reference[targetChampIndex];

          const existingClause = targetExpr.clause_regroupement ?? [];

          const alreadySelected = existingClause.some(
            (item) => item.champs_cible === attribut
          );

          const newClauseRegroupement = alreadySelected
            ? existingClause.filter((item) => item.champs_cible !== attribut)
            : [...existingClause, { champs_cible: attribut }];
            
          // MAJ de l'expression cible
          const updatedChampCible = {
            ...targetExpr,
            clause_regroupement: newClauseRegroupement,
          };

          // Remplacement de l'expression dans le tableau
          const updatedChampsCible = [...targetCond.valeur_reference];
          updatedChampsCible[targetChampIndex] = updatedChampCible;

          updatedConditions[targetIndex] = {
            ...targetCond,
            valeur_reference: updatedChampsCible,
          };

          setNbrGoupBY(alreadySelected ? nbrGroupBY - 1 : nbrGroupBY + 1);

          return {
            ...op,
            conditions: updatedConditions,
          };
        });

        setValue("operation_selected", updatedOps);
      }
    }
  };

  const handleClickEnd = () => {
    if (extraStep.startsWith("supr_attr_")) {
      const match = extraStep.match(/^supr_attr_(\d+)$/);
      if (match) {
        const count = parseInt(match[1], 10);
        const nextCount = count - 1;

        const currentOps = getValues("operation_selected") || [];

        const updatedOps = currentOps.map((op: OperationType) => {
          if (op.as_nom !== currentOperation) return op;

          const updatedExpressions = [...(op.expressions ?? [])];

          //  on ajoute une nouvelle expression
          updatedExpressions.push(
            {
              valeur: null,
              operateur_arithmetique: ")", 
            },
            {
              valeur: null,
              operateur_arithmetique: ")", 
            }
          );

          return {
            ...op,
            expressions: updatedExpressions,
          };
        });

        setValue("operation_selected", updatedOps);
        setSuprattr(suprattr - 1);
        setSuprattrSaveChamp(suprattrSaveChamp + 3);

        if (nextCount > 0) {
          setExtraStep(`supr_attr_${nextCount}`);
          setStep("op_arthm");
        } else {
          const mes_champs = getValues("champs") || [];
          const updateChamps = [
            ...mes_champs,
            {
              nom: currentOperation,
              as_nom: currentOperation,
              transformation: {
                type: "op_",
                taille: null,
                position: null,
                parametre: null,
                separateur: null,
              },
            },
          ];
          setValue("champs", updateChamps);
          saveTransformation();
        }
      }
    }

    if (extraStep.startsWith("supr_cond1_attr_")) {
      const match = extraStep.match(/^supr_cond1_attr_(\d+)$/);
      if (match) {
        const count = parseInt(match[1], 10);
        const nextCount = count - 1;

        const currentOps = getValues("operation_selected") || [];

        const updatedOps = currentOps.map((op: OperationType) => {
          if (op.as_nom !== currentOperation) return op;

          const updatedConditions = [...(op.conditions ?? [])];
          const targetIndex = suprcond1Save;
          const targetChampIndex = suprcond1SaveChamp;

          if (!updatedConditions[targetIndex]) return op;

          const targetCond = updatedConditions[targetIndex];
          const updatedChampsCible = [...(targetCond.champs_cible ?? [])];

          //  on ajoute une nouvelle expression
          updatedChampsCible.push(
            {
              valeur: null,
              operateur_arithmetique: ")", 
            },
            {
              valeur: null,
              operateur_arithmetique: ")", 
            }
          );
          updatedConditions[targetIndex] = {
            ...targetCond,
            champs_cible: updatedChampsCible,
          };

          return {
            ...op,
            conditions: updatedConditions,
          };
        });

        setValue("operation_selected", updatedOps);
        setSuprcond1(suprcond1 - 1);
        setSuprcond1SaveChamp(suprcond1SaveChamp + 3);

        if (nextCount > 0) {
          setExtraStep(`supr_cond1_attr_${nextCount}`);
          setStep("op_arthm");
        } else {
          setExtraStep("supr_cond1_attr");
          setStep("comp_cond");
        }
      }
    }

    if (extraStep.startsWith("supr_cond2_attr_")) {
      const match = extraStep.match(/^supr_cond2_attr_(\d+)$/);
      if (match) {
        const count = parseInt(match[1], 10);
        const nextCount = count - 1;

        const currentOps = getValues("operation_selected") || [];

        const updatedOps = currentOps.map((op: OperationType) => {
          if (op.as_nom !== currentOperation) return op;

          const updatedConditions = [...(op.conditions ?? [])];
          const targetIndex = suprcond1Save;
          const targetChampIndex = suprcond2SaveChamp;

          if (!updatedConditions[targetIndex]) return op;

          const targetCond = updatedConditions[targetIndex];
          const updatedChampsCible = [...(targetCond.valeur_reference ?? [])];

          //  on ajoute une nouvelle expression
          updatedChampsCible.push(
            {
              valeur: null,
              operateur_arithmetique: ")", 
            },
            {
              valeur: null,
              operateur_arithmetique: ")", 
            }
          );
          updatedConditions[targetIndex] = {
            ...targetCond,
            valeur_reference: updatedChampsCible,
          };

          return {
            ...op,
            conditions: updatedConditions,
          };
        });

        setValue("operation_selected", updatedOps);
        setSuprcond2(suprcond2 - 1);
        setSuprcond2SaveChamp(suprcond2SaveChamp + 3);

        if (nextCount > 0) {
          setExtraStep(`supr_cond2_attr_${nextCount}`);
          setStep("op_arthm");
        } else {
          setExtraStep("supr_cond2_attr");
          setStep("sub_cond");
        }
      }
    }

    setNbrGoupBY(0);
  };

  const isAlreadySelected = (attribut: string): boolean => {
    const currentOps = getValues("operation_selected") || [];
    const currentOp = currentOps.find(
      (op: OperationType) => op.as_nom === currentOperation
    );
    if (!currentOp) return false;

    if (extraStep.startsWith("supr_attr_")) {
      const expression = currentOp.expressions?.[suprattrSaveChamp];
      const selectedAttrs = expression?.clause_regroupement ?? [];
      return selectedAttrs.some((item: any) => item.champs_cible === attribut);
    }

    if (extraStep.startsWith("supr_cond1_attr_")) {
      const cond = currentOp.conditions?.[suprcond1Save];
      const champ = cond?.champs_cible?.[suprcond1SaveChamp];
      const selectedAttrs = champ?.clause_regroupement ?? [];
      return selectedAttrs.some((item: any) => item.champs_cible === attribut);
    }

    if (extraStep.startsWith("supr_cond2_attr_")) {
      const cond = currentOp.conditions?.[suprcond1Save]; 
      const champ = cond?.valeur_reference?.[suprcond2SaveChamp];
      const selectedAttrs = champ?.clause_regroupement ?? [];
      return selectedAttrs.some((item: any) => item.champs_cible === attribut);
    }

    return false;
  };

  return (
    <>
      {nbrGroupBY > 0 && (
        <label
          key={0}
          htmlFor={`groupBY`}
          className={`flex items-center gap-2 text-sm px-3 py-2 rounded transition cursor-pointer hover:bg-gray-100 text-gray-800 `}
          title={"END-GROUPBY"}
          onMouseDown={(e) => {
            handleClickEnd();
          }}
        >
          <span className="truncate"> &#41; </span>
          <span className="text-xs text-gray-400">(fin groupBY)</span>
        </label>
      )}

      {(formats ?? []).map((item) =>
        item
          ? Object.entries(item).map(([key, formatMap]) =>
              Object.entries(formatMap).map(([formatName, attributs]) => (
                <div key={`${key}-${formatName}`}>
                  <div
                    className="cursor-pointer py-1 flex items-center justify-between font-medium text-gray-700 hover:text-teal-600 transition"
                    onClick={() =>
                      setSelectedCat(
                        selectedCat === formatName ? null : formatName
                      )
                    }
                    title={formatName}
                  >
                    <span className="truncate">{formatName}</span>
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        selectedCat === formatName ? "rotate-90" : ""
                      }`}
                    />
                  </div>

                  {selectedCat === formatName && (
                    <div className="max-h-60 overflow-y-auto px-1 pl-4 space-y-1">
                      {attributs.map((attr) => {
                        const concat_attribut = `${formatName}.${attr.name}`;
                        const alreadySelected =
                          isAlreadySelected(concat_attribut);

                        return (
                          <label
                            key={attr.id}
                            htmlFor={`${formatName}-${attr.name}`}
                            className={`flex items-center gap-2 text-sm px-3 py-2 rounded transition ${
                              alreadySelected
                                ? "cursor-not-allowed text-gray-400 bg-gray-100"
                                : "cursor-pointer hover:bg-gray-100 text-gray-800"
                            }`}
                            onMouseDown={(e) => {
                              handleClick(concat_attribut);
                            }}
                            title={attr.name}
                          >
                            <input
                              id={`${formatName}-${attr.name}`}
                              type="checkbox"
                              checked={alreadySelected}
                              readOnly
                              className="shrink-0 h-4 w-4 text-teal-600 border-gray-300 rounded"
                            />
                            <span className="truncate">{attr.name}</span>
                            <span className="text-xs text-gray-400">
                              ({attr.type})
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )
          : null
      )}
    </>
  );
};
