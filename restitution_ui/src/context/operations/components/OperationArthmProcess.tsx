import React, { useEffect, useState } from "react";
import { OperationType } from "@/context/operations/operationType";
import { useFormContext, useFieldArray } from "react-hook-form";
import { functions } from "@/components/types/func_list";

interface OperationArithmetiqueProcessProps {
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

export const OperationArithmetiqueProcess: React.FC<
  OperationArithmetiqueProcessProps
> = ({
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
  const [selectedType, setSelectedType] = useState<string>("");
  const [currentOperationName, setCurrentOperationName] = useState<string>("");
  const { getValues, setValue } = useFormContext();
  const { update } = useFieldArray({
    name: "operation_selected",
  });
  const currentOps = getValues("operation_selected") || [];

  useEffect(() => {
    setSelectedType("");
  }, [extraStep]);

  useEffect(() => {
    if (currentOperation) {
      const currentOp = currentOps.find(
        (op: OperationType) => op.as_nom === currentOperation,
      );

      let allValues: string[] = [];

      // 1. conditions.champs_cible[] + conditions.valeur_reference[]
      if (currentOp?.conditions) {
        currentOp.conditions.forEach((cond: any) => {
          // champs_cible est un tableau d'expressions
          if (Array.isArray(cond?.champs_cible)) {
            cond.champs_cible.forEach((exp: any) => {
              if (typeof exp?.valeur === "string") {
                allValues.push(exp.valeur);
              }
            });
          }

          // valeur_reference est un tableau d'expressions
          if (Array.isArray(cond?.valeur_reference)) {
            cond.valeur_reference.forEach((exp: any) => {
              if (typeof exp?.valeur === "string") {
                allValues.push(exp.valeur);
              }
            });
          }
        });
      }

      // 2. expressions (toujours un tableau d'expressions)
      if (currentOp?.expressions) {
        currentOp.expressions.forEach((expr: any) => {
          if (typeof expr?.valeur === "string") {
            allValues.push(expr.valeur);
          }
        });
      }

      // Recherche de la dernière fonction utilisée
      const lastFunction = [...allValues]
        .reverse()
        .find((val) => functions.includes(val));

      if (lastFunction) {
        setCurrentOperationName(lastFunction);
      }
    }
  }, [currentOperation, currentOps]);
  const handleSelect = (type: string) => {
    if (!type) return;
    setSelectedType(type);

    if (type === ")") {
      if (extraStep.startsWith("supr_attr_")) {
        const match = extraStep.match(/^supr_attr_(\d+)$/);
        if (match) {
          const count = parseInt(match[1], 10);
          const nextCount = count - 1;

          const currentOps = getValues("operation_selected") || [];

          const updatedOps = currentOps.map((op: OperationType) => {
            if (op.as_nom !== currentOperation) return op;

            const updatedExpressions = [...(op.expressions ?? [])];
            const targetIndex = suprattrSaveChamp;

            // Si l'index existe, on met à jour sa valeur
            if (updatedExpressions[targetIndex]) {
              updatedExpressions[targetIndex] = {
                ...updatedExpressions[targetIndex],
                operateur_arithmetique: type,
              };
            } else {
              // Sinon, on ajoute une nouvelle expression
              updatedExpressions.push({
                valeur: null,
                operateur_arithmetique: type,
              });
            }

            return {
              ...op,
              expressions: updatedExpressions,
            };
          });

          setValue("operation_selected", updatedOps);
          setSuprattr(suprattr - 1);
          setSuprattrSaveChamp(suprattrSaveChamp + 1);

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
                type: "op_",
                typeAttribut: null,
                taille: null,
                position: null,
                parametre: null,
                separateur: null,
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

            // Si la condition cible n'existe pas, on la laisse telle quelle
            if (!updatedConditions[targetIndex]) return op;

            const targetCond = updatedConditions[targetIndex];
            const updatedChampsCible = [...(targetCond.champs_cible ?? [])];

            // Si l'index du champ existe, on le met à jour
            if (updatedChampsCible[targetChampIndex]) {
              updatedChampsCible[targetChampIndex] = {
                ...updatedChampsCible[targetChampIndex],
                operateur_arithmetique: type,
              };
            } else {
              // Sinon, on ajoute un nouveau champ
              updatedChampsCible.push({
                valeur: null,
                operateur_arithmetique: type,
              });
            }

            // Mise à jour de la condition cible avec le champs_cible modifié
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
          setSuprcond1SaveChamp(suprcond1SaveChamp + 1);

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

            // Si la condition cible n'existe pas, on la laisse telle quelle
            if (!updatedConditions[targetIndex]) return op;

            const targetCond = updatedConditions[targetIndex];
            const updatedChampsCible = [...(targetCond.valeur_reference ?? [])];

            // Si l'index du champ existe, on le met à jour
            if (updatedChampsCible[targetChampIndex]) {
              updatedChampsCible[targetChampIndex] = {
                ...updatedChampsCible[targetChampIndex],
                operateur_arithmetique: type,
              };
            } else {
              // Sinon, on ajoute un nouveau champ
              updatedChampsCible.push({
                valeur: null,
                operateur_arithmetique: type,
              });
            }

            // Mise à jour de la condition cible avec valeur_reference modifié
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
          setSuprcond2SaveChamp(suprcond2SaveChamp + 1);

          if (nextCount > 0) {
            setExtraStep(`supr_cond2_attr_${nextCount}`);
            setStep("op_arthm");
          } else {
            setExtraStep("supr_cond2_attr");
            setStep("sub_cond");
          }
        }
      }
    } else if (type === "groupBY") {
      if (extraStep.startsWith("supr_attr_")) {
        const match = extraStep.match(/^supr_attr_(\d+)$/);
        if (match) {
          const currentOps = getValues("operation_selected") || [];

          const updatedOps = currentOps.map((op: OperationType) => {
            if (op.as_nom !== currentOperation) return op;

            const updatedExpressions = [...(op.expressions ?? [])];
            const targetIndex = suprattrSaveChamp;

            // Si l'index existe, on met à jour sa valeur
            if (updatedExpressions[targetIndex]) {
              updatedExpressions[targetIndex] = {
                ...updatedExpressions[targetIndex],
                operateur_arithmetique: ",(",
                clause_regroupement: [],
              };
            } else {
              // Sinon, on ajoute une nouvelle expression
              updatedExpressions.push({
                valeur: null,
                operateur_arithmetique: ",(",
                clause_regroupement: [],
              });
            }

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

            // Si la condition cible n'existe pas, on la laisse telle quelle
            if (!updatedConditions[targetIndex]) return op;

            const targetCond = updatedConditions[targetIndex];
            const updatedChampsCible = [...(targetCond.champs_cible ?? [])];

            // Si l'index du champ existe, on le met à jour
            if (updatedChampsCible[targetChampIndex]) {
              updatedChampsCible[targetChampIndex] = {
                ...updatedChampsCible[targetChampIndex],
                operateur_arithmetique: ",(",
                clause_regroupement: [],
              };
            } else {
              // Sinon, on ajoute un nouveau champ
              updatedChampsCible.push({
                valeur: null,
                operateur_arithmetique: ",(",
                clause_regroupement: [],
              });
            }

            // Mise à jour de la condition cible avec le champs_cible modifié
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

            // Si la condition cible n'existe pas, on la laisse telle quelle
            if (!updatedConditions[targetIndex]) return op;

            const targetCond = updatedConditions[targetIndex];
            const updatedChampsCible = [...(targetCond.valeur_reference ?? [])];

            // Si l'index du champ existe, on le met à jour
            if (updatedChampsCible[targetChampIndex]) {
              updatedChampsCible[targetChampIndex] = {
                ...updatedChampsCible[targetChampIndex],
                operateur_arithmetique: ",(",
                clause_regroupement: [],
              };
            } else {
              // Sinon, on ajoute un nouveau champ
              updatedChampsCible.push({
                valeur: null,
                operateur_arithmetique: ",(",
                clause_regroupement: [],
              });
            }

            // Mise à jour de la condition cible avec valeur_reference modifié
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
        }
      }

      setStep("group_by");
    } else if (type === "paramétrage") {
      setStep("paramétrage");
    } else {
      if (extraStep.startsWith("supr_attr_")) {
        const match = extraStep.match(/^supr_attr_(\d+)$/);
        if (match) {
          const count = parseInt(match[1], 10);

          const currentOps = getValues("operation_selected") || [];

          const updatedOps = currentOps.map((op: OperationType) => {
            if (op.as_nom !== currentOperation) return op;

            const updatedExpressions = [...(op.expressions ?? [])];

            const targetIndex = suprattrSaveChamp;

            // Si l'index existe, on met à jour sa valeur
            if (updatedExpressions[targetIndex]) {
              updatedExpressions[targetIndex] = {
                ...updatedExpressions[targetIndex],
                operateur_arithmetique: type,
              };
            } else {
              // Sinon, on ajoute une nouvelle expression
              updatedExpressions.push({
                valeur: null,
                operateur_arithmetique: type,
              });
            }

            return {
              ...op,
              expressions: updatedExpressions,
            };
          });

          setValue("operation_selected", updatedOps);
          setExtraStep(`supr_attr_${count}`);
          setSuprattrSaveChamp(suprattrSaveChamp + 1);
        }
      }

      if (extraStep.startsWith("supr_cond1_attr_")) {
        const match = extraStep.match(/^supr_cond1_attr_(\d+)$/);

        if (match) {
          const count = parseInt(match[1], 10);

          const currentOps = getValues("operation_selected") || [];

          const updatedOps = currentOps.map((op: OperationType) => {
            if (op.as_nom !== currentOperation) return op;

            const updatedConditions = [...(op.conditions ?? [])];
            const targetIndex = suprcond1Save;
            const targetChampIndex = suprcond1SaveChamp;

            // Si la condition cible n'existe pas, on la laisse telle quelle
            if (!updatedConditions[targetIndex]) return op;

            const targetCond = updatedConditions[targetIndex];
            const updatedChampsCible = [...(targetCond.champs_cible ?? [])];

            // Si l'index du champ existe, on le met à jour
            if (updatedChampsCible[targetChampIndex]) {
              updatedChampsCible[targetChampIndex] = {
                ...updatedChampsCible[targetChampIndex],
                operateur_arithmetique: type,
              };
            } else {
              // Sinon, on ajoute un nouveau champ
              updatedChampsCible.push({
                valeur: null,
                operateur_arithmetique: type,
              });
            }

            // Mise à jour de la condition cible avec le champs_cible modifié
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
          setExtraStep(`supr_cond1_attr_${count}`);
          setSuprcond1SaveChamp(suprcond1SaveChamp + 1);
        }
      }

      if (extraStep.startsWith("supr_cond2_attr_")) {
        const match = extraStep.match(/^supr_cond2_attr_(\d+)$/);
        if (match) {
          const count = parseInt(match[1], 10);

          const currentOps = getValues("operation_selected") || [];

          const updatedOps = currentOps.map((op: OperationType) => {
            if (op.as_nom !== currentOperation) return op;

            const updatedConditions = [...(op.conditions ?? [])];
            const targetIndex = suprcond1Save;
            const targetChampIndex = suprcond2SaveChamp;

            // Si la condition cible n'existe pas, on la laisse telle quelle
            if (!updatedConditions[targetIndex]) return op;

            const targetCond = updatedConditions[targetIndex];
            const updatedChampsCible = [...(targetCond.valeur_reference ?? [])];

            // Si l'index du champ existe, on le met à jour
            if (updatedChampsCible[targetChampIndex]) {
              updatedChampsCible[targetChampIndex] = {
                ...updatedChampsCible[targetChampIndex],
                operateur_arithmetique: type,
              };
            } else {
              // Sinon, on ajoute un nouveau champ
              updatedChampsCible.push({
                valeur: null,
                operateur_arithmetique: type,
              });
            }

            // Mise à jour de la condition cible avec valeur_reference modifié
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
          setExtraStep(`supr_cond2_attr_${count}`);
          setSuprcond2SaveChamp(suprcond2SaveChamp + 1);
        }
      }

      setStep("attr");
    }
  };

  const arithmOptions = (() => {
      const isCond2Attr = extraStep === "supr_cond2_attr";
      const isAttr2GroupBy =
        extraStep === "supr_attr_2" && suprattr > 1 && suprattrSaveChamp > 2;
      const isCond1GroupBy =
        extraStep === "supr_cond1_attr_2" &&
        suprattr === 0 &&
        suprattrSaveChamp === 0;
      const isCond2GroupBy =
        extraStep === "supr_cond2_attr_2" &&
        suprattr === 0 &&
        suprattrSaveChamp === 0;

      let options = isCond2Attr
        ? ["+", "-", "*", "/", "%"]
        : isAttr2GroupBy || isCond1GroupBy || isCond2GroupBy
          ? ["groupBY", ")", "paramétrage"]
          : [")", "+", "-", "*", "/", "%"];

      if (!["var", "qp", "tc"].includes(currentOperationName)) {
        options = options.filter((op) => op !== "paramétrage");
      } else if (["var", "qp", "tc"].includes(currentOperationName)) {
        options = options.filter((op) => op !== "groupBY");
      }

      return options;
    })();

    return (
      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1 mb-1">
          Opérateur
        </p>
        {arithmOptions.map((op) => (
          <button
            key={op}
            type="button"
            onClick={() => handleSelect(op)}
            className="w-full text-left px-3 py-2 text-sm font-medium text-gray-800 rounded-md border border-gray-200 bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 cursor-pointer transition-colors"
          >
            {op}
          </button>
        ))}
      </div>
  );
};
