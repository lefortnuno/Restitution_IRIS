import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Filter = {
  column: string;
  operator: string;
  value: string;
  value2?: string; // pour Between
};

// === Listes affichées en français (FRONT) ===
const DATE_OPERATORS = ["Égal à", "Entre", "Supérieur à", "Inférieur à"];
const VARCHAR_OPERATORS = [
  "Égal à",
  "Contient",
  "Commence par",
  "Finit par",
  "Différent de",
];
const NUMBER_OPERATORS = [
  "Égal à",
  "Entre",
  "Supérieur à",
  "Inférieur à",
  "Différent de",
];
type Props = {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Filter[]) => void;
  columns: { id: string; typeAttribut?: string | null }[];
  initialFilters?: Filter[];
};

export default function AdvancedSearchModal({
  isOpen,
  onClose,
  onApply,
  columns,
  initialFilters,
}: Props) {
  const [filters, setFilters] = useState<Filter[]>([]);

  useEffect(() => {
    if (isOpen) {
      const filtersMap = new Map<string, Filter>();

      initialFilters?.forEach((f) => {
        filtersMap.set(f.column, f);
      });

      columns.forEach((col) => {
        const colId = col.id;
        if (!filtersMap.has(colId)) {
          filtersMap.set(colId, {
            column: colId,
            operator: "==",
            value: "",
            value2: "",
          });
        }
      });

      setFilters(Array.from(filtersMap.values()));
    }
  }, [isOpen, columns, initialFilters]);

  const handleFilterChange = (
    index: number,
    field: keyof Filter,
    newValue: string
  ) => {
    setFilters((prev) => {
      const updated = [...prev];
      const current = { ...updated[index], [field]: newValue };

      // si l’opérateur change et que ce n’est pas "Entre", on reset value2
      if (field === "operator" && newValue !== "Entre") {
        current.value2 = "";
      }

      updated[index] = current;
      return updated;
    });
  };

  const handleApply = () => {
    const activeFilters = filters
      .filter((f) => f.value.trim() !== "")
      .map((f) => {
        const colType = columns.find((c) => c.id === f.column)?.typeAttribut;
        return {
          ...f,
          typeAttribut:
            colType || (isNaN(Number(f.value)) ? "VARCHAR" : "Integer"),
        };
      });

    console.log("Filtres envoyés au backend :", activeFilters);
    onApply(activeFilters);
    onClose();
  };

  const getOperatorsForType = (type?: string | null) => {
    switch (type) {
      case "date":
        return DATE_OPERATORS;
      case "VARCHAR":
        return VARCHAR_OPERATORS;
      case "Integer":
        return NUMBER_OPERATORS;
      default:
        return NUMBER_OPERATORS;
    }
  };

  const getInputTypeForAttr = (type?: string | null) => {
    switch (type) {
      case "date":
        return "date";
      case "integer":
        return "number";
      case "VARCHAR":
        return "text";
      default:
        return "number";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-[calc(60%-20px)] max-w-6xl bg-white rounded shadow-lg overflow-hidden flex flex-col max-h-[calc(100%-100px)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-100 border-b border-gray-300">
          <h2 className="text-lg font-bold text-gray-900">Recherche avancée</h2>
          <X
            onClick={onClose}
            className="cursor-pointer text-red-500 transition-transform duration-300 hover:scale-110"
            aria-label="Fermer"
          />
        </div>

        {/* Scrollable Content */}
        <div className="min-h-40 overflow-y-auto p-6 flex-1 scrollbar-hide">
          <div className="space-y-4">
            {filters.map((filter, index) => {
              const colType = columns.find(
                (c) => c.id === filter.column
              )?.typeAttribut;
              const operators = getOperatorsForType(colType);
              const inputType = getInputTypeForAttr(colType);

              return (
                <div key={filter.column} className="flex items-center gap-4">
                  <span className="min-w-[180px] font-medium text-gray-800">
                    {filter.column}
                  </span>

                  <select
                    value={filter.operator}
                    onChange={(e) =>
                      handleFilterChange(index, "operator", e.target.value)
                    }
                    className="w-40 p-2 border outline-0 focus:ring-teal-500 focus:border-teal-500 sm:text-sm border-gray-300 rounded min-w-[140px]"
                  >
                    {operators.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>

                  {filter.operator === "Entre" ? (
                    <div className="flex flex-wrap gap-2 w-full">
                      <input
                        type={inputType}
                        value={filter.value}
                        onChange={(e) =>
                          handleFilterChange(index, "value", e.target.value)
                        }
                        className="flex-1 min-w-[120px] p-2 border outline-0 focus:ring-teal-500 focus:border-teal-500 sm:text-sm border-gray-300 rounded"
                      />
                      <input
                        type={inputType}
                        value={filter.value2 || ""}
                        onChange={(e) =>
                          handleFilterChange(index, "value2", e.target.value)
                        }
                        className="flex-1 min-w-[120px] p-2 border outline-0 focus:ring-teal-500 focus:border-teal-500 sm:text-sm border-gray-300 rounded"
                      />
                    </div>
                  ) : (
                    <input
                      type={inputType}
                      value={filter.value}
                      onChange={(e) =>
                        handleFilterChange(index, "value", e.target.value)
                      }
                      className="flex-1 min-w-[120px] p-2 border outline-0 focus:ring-teal-500 focus:border-teal-500 sm:text-sm border-gray-300 rounded"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-300 bg-gray-100 flex justify-end gap-2">
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={onClose}
          >
            Annuler
          </Button>
          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white"
            onClick={handleApply}
            disabled={filters.every(
              (f) =>
                f.value.trim() === "" && (!f.value2 || f.value2.trim() === "")
            )}
          >
            Chercher
          </Button>
        </div>
      </div>
    </div>
  );
}
