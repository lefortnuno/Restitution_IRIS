import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { AttributsMap } from "@/components/types/typage-global";
import { useFormContext } from "react-hook-form";

interface AttributProcessProps {
  formats: AttributsMap;
  operationIndex: number | null;
}

export const AttributAggregations: React.FC<AttributProcessProps> = ({
  formats,
  operationIndex,
}) => {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const { getValues, setValue } = useFormContext();

  const handleClick = (attribut: string) => {
    if (operationIndex === null) return;

    const operations = getValues("operation_selected") || [];
    const currentOp = operations[operationIndex];

    const clause = currentOp.clause_regroupement || [];

    const alreadyExists = clause.some(
      (g: { champs_cible: string }) => g.champs_cible === attribut
    );

    if (alreadyExists) return;

    const updatedClauseRegroupement = [...clause, { champs_cible: attribut }];

    const updatedOperations = [...operations];
    updatedOperations[operationIndex] = {
      ...currentOp,
      clause_regroupement: updatedClauseRegroupement,
    };

    setValue("operation_selected", updatedOperations);
  };

  const isAlreadySelected = (attribut: string): boolean => {
    if (operationIndex === null) return false;
    const operations = getValues("operation_selected") || [];
    const currentOp = operations[operationIndex];
    const clause = currentOp.clause_regroupement || [];
    return clause.some(
      (g: { champs_cible: string }) => g.champs_cible === attribut
    );
  };

  return (
    <>
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
                              if (!alreadySelected)
                                handleClick(concat_attribut);
                            }}
                            title={attr.name}
                          >
                            <input
                              id={`${formatName}-${attr.name}`}
                              type="checkbox"
                              checked={alreadySelected}
                              readOnly
                              className="shrink-0 h-4 w-4 text-teal-600 border-gray-300 rounded accent-blue-600"
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
