import React, { useEffect, useState } from "react";

import { AttributsMap } from "@/components/types/typage-global";
import { OperationType } from "@/context/operations/operationType";
import { ChevronRight } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { functions } from "@/components/types/func_list";

interface PrametrageProcessProps {
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

export const ParametrageProcess: React.FC<PrametrageProcessProps> = ({
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
  const [currentOperationName, setCurrentOperationName] = useState<string>("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [varianceSimple, setVarianceSimple] = useState<boolean>(false);
  const [percentile, setPercentile] = useState<number>(0);
  const [dateTCKey, setDateTCKey] = useState<string>("");
  const [tcGlobal, setTCGlobal] = useState<boolean>(false);
  const { getValues, setValue } = useFormContext();
  const currentOps = getValues("operation_selected") || [];

  useEffect(() => {
    if (currentOperation) {
      const currentOp = currentOps.find(
        (op: OperationType) => op.as_nom === currentOperation
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

  useEffect(() => {
    if (!currentOperationName) return;
    if (!["var", "qp", "tc"].includes(currentOperationName)) {
      setStep("attr");
    }
  }, [currentOperationName, setStep]);

  const handleChange = () => {
    if (currentOperationName === "var") {
      if (extraStep.startsWith("supr_attr_")) {
        const match = extraStep.match(/^supr_attr_(\d+)$/);

        if (match) {
          const count = parseInt(match[1], 10) - 1;
          const currentOps = getValues("operation_selected") || [];

          const updatedOps = currentOps.map((op: OperationType) => {
            if (op.as_nom !== currentOperation) return op;

            const updatedExpressions = [...(op.expressions ?? [])];
            const targetIndex = suprattrSaveChamp - 1;

            // on met à jour la valeur de l'index
            if (updatedExpressions[targetIndex]) {
              updatedExpressions[targetIndex] = {
                ...updatedExpressions[targetIndex],
                operateur_arithmetique: ",[",
              };
              updatedExpressions.push({
                valeur: varianceSimple,
                operateur_arithmetique: "]",
                clause_regroupement: [],
              });
              updatedExpressions.push({
                valeur: null,
                operateur_arithmetique: ")",
                clause_regroupement: [],
              });
            }

            return {
              ...op,
              expressions: updatedExpressions,
            };
          });

          setValue("operation_selected", updatedOps);
          setExtraStep(`supr_attr_${count}`);
          setSuprattrSaveChamp(suprattrSaveChamp + 2);
        }
      }

      if (extraStep.startsWith("supr_cond1_attr_")) {
        const match = extraStep.match(/^supr_cond1_attr_(\d+)$/);

        if (match) {
          const count = parseInt(match[1], 10) - 1;

          const currentOps = getValues("operation_selected") || [];

          const updatedOps = currentOps.map((op: OperationType) => {
            if (op.as_nom !== currentOperation) return op;

            const updatedConditions = [...(op.conditions ?? [])];
            const targetIndex = suprcond1Save;
            const targetChampIndex = suprcond1SaveChamp - 1;

            // Si la condition cible n'existe pas, on la laisse telle quelle
            if (!updatedConditions[targetIndex]) return op;

            const targetCond = updatedConditions[targetIndex];
            const updatedChampsCible = [...(targetCond.champs_cible ?? [])];

            if (updatedChampsCible[targetChampIndex]) {
              updatedChampsCible[targetChampIndex] = {
                ...updatedChampsCible[targetChampIndex],
                operateur_arithmetique: ",[",
              };
              updatedChampsCible.push({
                valeur: varianceSimple,
                operateur_arithmetique: "]",
                clause_regroupement: [],
              });
              updatedChampsCible.push({
                valeur: null,
                operateur_arithmetique: ")",
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
          setExtraStep(`supr_cond1_attr_${count}`);
          setSuprcond1SaveChamp(suprcond1SaveChamp + 2);
        }
      }

      setStep("op_arthm");
    }

    if (currentOperationName === "qp") {
      if (extraStep.startsWith("supr_attr_")) {
        const match = extraStep.match(/^supr_attr_(\d+)$/);
        if (match) {
          const count = parseInt(match[1], 10) - 1;
          const currentOps = getValues("operation_selected") || [];

          const updatedOps = currentOps.map((op: OperationType) => {
            if (op.as_nom !== currentOperation) return op;

            const updatedExpressions = [...(op.expressions ?? [])];
            const targetIndex = suprattrSaveChamp - 1;

            // on met à jour la valeur de l'index
            if (updatedExpressions[targetIndex]) {
              updatedExpressions[targetIndex] = {
                ...updatedExpressions[targetIndex],
                operateur_arithmetique: ",[",
              };
              // Et, on ajoute une nouvelle expression
              updatedExpressions.push({
                valeur: percentile,
                operateur_arithmetique: "]",
                clause_regroupement: [],
              });
              updatedExpressions.push({
                valeur: null,
                operateur_arithmetique: ")",
                clause_regroupement: [],
              });
            }

            return {
              ...op,
              expressions: updatedExpressions,
            };
          });

          setValue("operation_selected", updatedOps);
          setExtraStep(`supr_attr_${count}`);
          setSuprattrSaveChamp(suprattrSaveChamp + 2);
        }
      }

      if (extraStep.startsWith("supr_cond1_attr_")) {
        const match = extraStep.match(/^supr_cond1_attr_(\d+)$/);

        if (match) {
          const count = parseInt(match[1], 10) - 1;

          const currentOps = getValues("operation_selected") || [];

          const updatedOps = currentOps.map((op: OperationType) => {
            if (op.as_nom !== currentOperation) return op;

            const updatedConditions = [...(op.conditions ?? [])];
            const targetIndex = suprcond1Save;
            const targetChampIndex = suprcond1SaveChamp - 1;

            // Si la condition cible n'existe pas, on la laisse telle quelle
            if (!updatedConditions[targetIndex]) return op;

            const targetCond = updatedConditions[targetIndex];
            const updatedChampsCible = [...(targetCond.champs_cible ?? [])];

            if (updatedChampsCible[targetChampIndex]) {
              updatedChampsCible[targetChampIndex] = {
                ...updatedChampsCible[targetChampIndex],
                operateur_arithmetique: ",[",
              };
              updatedChampsCible.push({
                valeur: percentile,
                operateur_arithmetique: "]",
                clause_regroupement: [],
              });
              updatedChampsCible.push({
                valeur: null,
                operateur_arithmetique: ")",
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
          setExtraStep(`supr_cond1_attr_${count}`);
          setSuprcond1SaveChamp(suprcond1SaveChamp + 2);
        }
      }

      setStep("op_arthm");
    }

    if (currentOperationName === "tc") {
      if (extraStep.startsWith("supr_attr_")) {
        const match = extraStep.match(/^supr_attr_(\d+)$/);
        if (match) {
          const count = parseInt(match[1], 10) - 1;
          const currentOps = getValues("operation_selected") || [];

          const updatedOps = currentOps.map((op: OperationType) => {
            if (op.as_nom !== currentOperation) return op;

            const updatedExpressions = [...(op.expressions ?? [])];
            const targetIndex = suprattrSaveChamp - 1;

            // on met à jour la valeur de l'index
            if (updatedExpressions[targetIndex]) {
              updatedExpressions[targetIndex] = {
                ...updatedExpressions[targetIndex],
                operateur_arithmetique: ",[",
              };
              // Et, on ajoute des nouveaux expressions
              updatedExpressions.push({
                valeur: dateTCKey,
                operateur_arithmetique: ",[",
                clause_regroupement: [],
              });
              updatedExpressions.push({
                valeur: tcGlobal,
                operateur_arithmetique: "]]",
                clause_regroupement: [],
              });
              updatedExpressions.push({
                valeur: null,
                operateur_arithmetique: ")",
                clause_regroupement: [],
              });
            }

            return {
              ...op,
              expressions: updatedExpressions,
            };
          });

          setValue("operation_selected", updatedOps);
          setExtraStep(`supr_attr_${count}`);
          setSuprattrSaveChamp(suprattrSaveChamp + 3);
        }
      }

      if (extraStep.startsWith("supr_cond1_attr_")) {
        const match = extraStep.match(/^supr_cond1_attr_(\d+)$/);

        if (match) {
          const count = parseInt(match[1], 10) - 1;

          const currentOps = getValues("operation_selected") || [];

          const updatedOps = currentOps.map((op: OperationType) => {
            if (op.as_nom !== currentOperation) return op;

            const updatedConditions = [...(op.conditions ?? [])];
            const targetIndex = suprcond1Save;
            const targetChampIndex = suprcond1SaveChamp - 1;

            // Si la condition cible n'existe pas, on la laisse telle quelle
            if (!updatedConditions[targetIndex]) return op;

            const targetCond = updatedConditions[targetIndex];
            const updatedChampsCible = [...(targetCond.champs_cible ?? [])];

            if (updatedChampsCible[targetChampIndex]) {
              updatedChampsCible[targetChampIndex] = {
                ...updatedChampsCible[targetChampIndex],
                operateur_arithmetique: ",[",
              };
              updatedChampsCible.push({
                valeur: dateTCKey,
                operateur_arithmetique: ",[",
                clause_regroupement: [],
              });
              updatedChampsCible.push({
                valeur: tcGlobal,
                operateur_arithmetique: "]]",
                clause_regroupement: [],
              });
              updatedChampsCible.push({
                valeur: null,
                operateur_arithmetique: ")",
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
          setExtraStep(`supr_cond1_attr_${count}`);
          setSuprcond1SaveChamp(suprcond1SaveChamp + 2);
        }
      }

      setStep("op_arthm");
    }
  };

  const handleCancel = () => {
    setSelectedCat(null);
    setVarianceSimple(false);
    setPercentile(0);
    setDateTCKey("");
    setTCGlobal(false);
    setStep("op_arthm");
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl shadow-md border border-gray-100">
      {currentOperationName === "var" && (
        <div
          className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 shadow-sm space-x-6 cursor-pointer"
          onClick={() => setVarianceSimple(!varianceSimple)}
        >
          <span className="text-sm font-medium text-gray-700">
            Activer la variance globale
          </span>

          <div className="relative">
            <input
              id="variance-switch"
              type="checkbox"
              checked={varianceSimple}
              onChange={() => setVarianceSimple(!varianceSimple)}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-gray-300 rounded-full peer-checked:bg-teal-600 transition duration-300"></div>
            <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform duration-300"></div>
          </div>
        </div>
      )}

      {currentOperationName === "qp" && (
        <div className="space-y-2 w-full max-w-sm">
          <label
            htmlFor="percentile"
            className="block text-sm font-medium text-gray-700"
          >
            Valeur Percentile{" "}
            <span className="text-xs text-gray-500">(0–100)</span>
          </label>
          <input
            id="percentile"
            type="number"
            min={0}
            max={100}
            step={1}
            value={percentile}
            onChange={(e) =>
              setPercentile(Math.max(0, Math.min(100, Number(e.target.value))))
            }
            autoComplete="off"
            className={`
        w-full px-2 py-1 rounded border text-sm text-gray-900 placeholder-gray-400 outline-none
        ${percentile !== null && percentile !== undefined ? "bg-gray-100" : ""}
        ${
          percentile < 0 || percentile > 100
            ? "border-red-500 focus:ring-red-300"
            : "border-gray-300 focus:ring-teal-500"
        }
      `}
            placeholder="Ex: 90"
          />
          {percentile < 0 || percentile > 100 ? (
            <p className="text-xs text-red-500">
              La valeur doit être entre 0 et 100.
            </p>
          ) : (
            <p className="text-xs text-gray-500">
              Indiquez un percentile compris entre 0 et 100.
            </p>
          )}
        </div>
      )}

      {currentOperationName === "tc" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Sélectionner un champ de date de référence
            </h3>
            {(formats ?? []).map((item) =>
              item
                ? Object.entries(item).map(([key, formatMap]) =>
                    Object.entries(formatMap).map(([formatName, attributs]) => {
                      const dateAttrs = attributs.filter((attr) =>
                        ["date", "datetime"].includes(attr.type.toLowerCase())
                      );
                      if (dateAttrs.length === 0) return null;

                      return (
                        <div key={`${key}-${formatName}`}>
                          <div
                            className="flex items-center justify-between cursor-pointer py-2 px-2 hover:bg-gray-100 rounded-md transition"
                            onClick={() =>
                              setSelectedCat(
                                selectedCat === formatName ? null : formatName
                              )
                            }
                          >
                            <span className="font-medium text-gray-800 truncate">
                              {formatName}
                            </span>
                            <ChevronRight
                              className={`h-4 w-4 text-gray-500 transition-transform ${
                                selectedCat === formatName ? "rotate-90" : ""
                              }`}
                            />
                          </div>

                          {selectedCat === formatName && (
                            <div className="ml-4 mt-2 space-y-2 border-l pl-4 border-gray-200">
                              {dateAttrs.map((attr) => {
                                const fullKey = `${formatName}.${attr.name}`;
                                return (
                                  <label
                                    key={attr.id}
                                    className="flex items-center space-x-3 text-sm text-gray-700 hover:bg-gray-50 p-2 rounded cursor-pointer transition"
                                    onClick={() => setDateTCKey(fullKey)}
                                  >
                                    <input
                                      type="checkbox"
                                      readOnly
                                      checked={dateTCKey === fullKey}
                                      className="h-4 w-4 text-teal-600 border-gray-300 rounded"
                                    />
                                    <span className="flex-1 truncate">
                                      {attr.name}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      ({attr.type})
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )
                : null
            )}
          </div>

          <div
            className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 shadow-sm space-x-6 cursor-pointer"
            onClick={() => setTCGlobal(!tcGlobal)}
          >
            <span className="text-sm font-medium text-gray-700">
              Activer le taux de croissance global
            </span>

            <div className="relative">
              <input
                id="tauxCroissance-switch"
                type="checkbox"
                checked={tcGlobal}
                onChange={() => setTCGlobal(!tcGlobal)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-gray-300 rounded-full peer-checked:bg-teal-600 transition duration-300"></div>
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform duration-300"></div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-end justify-end pt-4 space-x-2 gap-2">
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-red-600 text-white text-sm rounded-md shadow hover:bg-red-700 transition"
        >
          Annuler
        </button>
        <button
          onClick={handleChange}
          disabled={currentOperationName === "tc" && !dateTCKey}
          className={`px-4 py-2 text-sm rounded-md shadow transition ${
            currentOperationName === "tc" && !dateTCKey
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-teal-600 text-white hover:bg-teal-700"
          }`}
        >
          Continuer
        </button>
      </div>
    </div>
  );
};
