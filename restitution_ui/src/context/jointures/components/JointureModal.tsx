import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { JoinTypeSelector } from "@/context/jointures/components/JoinTypeSelector";
import { FormatSelector } from "@/context/jointures/components/FormatSelector";
import { Jointure } from "@/context/jointures/jointureType";
import { X } from "lucide-react";
import { StructTableType } from "@/components/queries/useStructTable";
import { AttributsMap } from "@/components/types/typage-global";

type JointureModalProps = {
  isOpen: boolean;
  onClose: () => void;
  formats: AttributsMap;
  onAdd: (joinType: string, selectedFields: string[]) => void;
  existingJoins?: Jointure[];
};

export default function JointureModal({
  isOpen,
  onClose,
  formats,
  onAdd,
  existingJoins = [],
}: JointureModalProps) {
  const [joinType, setJoinType] = useState("FJ");
  const [selectedAttributs, setSelectedAttributs] = useState<
    Record<string, StructTableType | null>
  >({});
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});
  const [expandedFormat, setExpandedFormat] = useState<string | null>(null);

  const selectedFields = Object.entries(selectedAttributs)
    .filter(([, attr]) => attr !== null)
    .map(([format, attr]) => `${format}.${attr?.name}`);

  const usedPairs = existingJoins.map((join) => {
    const pair = [
      `${join.reference1.format}.${join.reference1.attribut}`,
      `${join.reference2.format}.${join.reference2.attribut}`,
    ].sort();
    return pair.join(",");
  });

  const handleAdd = () => {
    onAdd(joinType, selectedFields);
    resetState();
    onClose();
  };

  const resetState = () => {
    setSelectedAttributs({});
    setSearchTerms({});
    setExpandedFormat(null);
    setJoinType("FJ");
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-[calc(60%-20px)] max-w-6xl bg-white rounded shadow-lg flex flex-col max-h-[calc(100%-100px)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-100 border-b border-gray-300">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">Jointure</h2>
            <JoinTypeSelector joinType={joinType} onChange={setJoinType} />
          </div>
          <X
            onClick={() => {
              resetState();
              onClose();
            }}
            className="cursor-pointer text-red-500 transition-transform duration-300 hover:scale-110 hover:text-red-500 text-xl"
            aria-label="Fermer"
          />
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-visible flex-1 scrollbar-hide">
          <div className="flex flex-wrap gap-4">
            {formats?.map((format) => {
              if (!format) return null;

              const formatId = Number(Object.keys(format)[0]); // clé numérique
              const formatName = Object.keys(format[formatId])[0]; // le nom (string)
              const attributs = format[formatId][formatName];

              return (
                <FormatSelector
                  key={formatId}
                  format={formatName}
                  attributes={attributs}
                  selected={selectedAttributs[formatName] || null}
                  onSelect={(attr) => {
                    setSelectedAttributs((prev) => {
                      const isSame = prev[formatName]?.id === attr.id;
                      return {
                        ...prev,
                        [formatName]: isSame ? null : attr,
                      };
                    });
                    setExpandedFormat(null);
                    setSearchTerms((prev) => ({
                      ...prev,
                      [formatName]: "",
                    }));
                  }}
                  searchTerm={searchTerms[formatName] || ""}
                  onSearchChange={(val) =>
                    setSearchTerms((prev) => ({ ...prev, [formatName]: val }))
                  }
                  isExpanded={expandedFormat === formatName}
                  onToggleExpand={() => {
                    setExpandedFormat((prev) =>
                      prev === formatName ? null : formatName,
                    );
                  }}
                  isDisabled={(attrId) => {
                    const attr = attributs.find((a) => a.id === attrId);
                    if (!attr) return true;

                    const fullAttr = `${formatName}.${attr.name}`;

                    if (selectedFields.includes(fullAttr)) return false;

                    const tmpSelected = [...selectedFields, fullAttr];
                    if (tmpSelected.length > 2) return true;
                    if (tmpSelected.length < 2) return false;

                    const tempPair = tmpSelected.sort().join(",");
                    return usedPairs.includes(tempPair);
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-300 bg-gray-100 flex justify-end gap-2">
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => {
              resetState();
              onClose();
            }}
          >
            Annuler
          </Button>
          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white"
            onClick={handleAdd}
            disabled={selectedFields.length !== 2}
          >
            Ajouter
          </Button>
        </div>
      </div>
    </div>
  );
}
