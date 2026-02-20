import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogicTypeSelector } from "@/context/filtrePop/components/LogicTypeSelector";
import { X } from "lucide-react";
import { StructTableType } from "@/components/queries/useStructTable";
import { FiltrePop } from "@/context/filtrePop/filtrePopType";
import { CascadeFormatSelector } from "@/context/filtrePop/components/CascadeFormatSelector";
import { ConditionSelector } from "@/context/filtrePop/components/ConditionSelector";
import { ValueSelector } from "@/context/filtrePop/components/ValueSelector";
import { useFormContext, useWatch } from "react-hook-form";
import { AttributsMap } from "@/components/types/typage-global";

type JointureModalProps = {
  isOpen: boolean;
  onClose: () => void;
  formats: AttributsMap;
  onAdd: (
    joinType: FiltrePop["operateur_logique"],
    selectedAttribut: FiltrePop["champs_cible"],
    selectedCondition: FiltrePop["operateur_comparaison"],
    selectedValeur: FiltrePop["parametre"]
  ) => void;
  existingJoins?: FiltrePop[];
};

export default function FiltrePopModal({
  isOpen,
  onClose,
  formats,
  onAdd,
  existingJoins = [],
}: JointureModalProps) {
  const [joinType, setJoinType] =
    useState<FiltrePop["operateur_logique"]>(null);

  const [selectedAttributs, setSelectedAttributs] = useState<
    Record<string, StructTableType | null>
  >({});

  const [selectedAttribut, setSelectedAttribut] =
    useState<FiltrePop["champs_cible"]>(null);
  const [selectedCondition, setSelectedCondition] =
    useState<FiltrePop["operateur_comparaison"]>(null);
  const [selectedValeur, setSelectedValeur] =
    useState<FiltrePop["parametre"]>(null);

  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});
  const [expandedFormat, setExpandedFormat] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  const { control } = useFormContext(); // depuis RHF parent
  const filtresPop = useWatch({ control, name: "filtres_pop" }) || [];

  const handleAdd = () => {
    if (
      !selectedAttribut ||
      !selectedCondition ||
      !selectedValeur ||
      (filtresPop.length > 0 && !joinType)
    ) {
      return;
    }

    const alreadyExists = isAlreadyInList(
      selectedAttribut,
      selectedCondition,
      selectedValeur
    );

    if (alreadyExists) {
      // message d'erreur/toast ici
      return;
    }

    onAdd(joinType, selectedAttribut, selectedCondition, selectedValeur);
    resetState();
    onClose();
  };

  const resetState = () => {
    setSelectedAttribut(null);
    setSelectedCondition(null);
    setSelectedValeur(null);
    setSearchTerms({});
    setExpandedFormat(null);
    setJoinType(null);
    setSelectedFormat(null);
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Transforme formats en un dictionnaire { [formatName]: attributs[] }
  const mappedFormats = useMemo(() => {
    const result: Record<string, StructTableType[]> = {};

    const formatsArray = Array.isArray(formats) ? formats : [];

    formatsArray
      .filter((f): f is NonNullable<typeof f> => f !== null)
      .forEach((f) => {
        const formatId = Number(Object.keys(f)[0]);
        const formatName = Object.keys(f[formatId])[0];
        const attributs = f[formatId][formatName];
        result[formatName] = attributs;
      });

    return result;
  }, [formats]);

  const isAlreadyInList = (
    champs_cible: FiltrePop["champs_cible"],
    operateur_comparaison: FiltrePop["operateur_comparaison"],
    parametre: FiltrePop["parametre"]
  ) => {
    return existingJoins.some(
      (j) =>
        j.champs_cible === champs_cible &&
        j.operateur_comparaison === operateur_comparaison &&
        j.parametre === parametre
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-[calc(60%-20px)] max-w-6xl bg-white rounded shadow-lg overflow-hidden flex flex-col max-h-[calc(100%-100px)] min-h-80">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-100 border-b border-gray-300">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="flex justify-between items-center w-full text-lg font-bold text-gray-900">
              <span className="truncate font-medium text-gray-700">Filtre</span>
              <span className="ml-2 text-sm text-gray-400 whitespace-nowrap">
                (population)
              </span>
            </h2>
            {filtresPop.length > 0 && (
              <LogicTypeSelector joinType={joinType} onChange={setJoinType} />
            )}
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
        <div className="p-4">
          <div className="flex flex-wrap justify-center gap-4 w-full">
            <CascadeFormatSelector
              formats={mappedFormats}
              selectedFormat={selectedFormat}
              onFormatChange={(format) => {
                setSelectedFormat(format);
                setSelectedAttributs({ [format]: null });
                setSelectedAttribut(null);
              }}
              selectedAttribute={
                selectedAttributs[selectedFormat || ""] || null
              }
              onAttributeChange={(attr) => {
                if (!selectedFormat) return;
                setSelectedAttributs({ [selectedFormat]: attr });
                setSelectedAttribut(`${selectedFormat}.${attr.name}`);
              }}
            />

            <ConditionSelector
              joinType={selectedCondition}
              onChange={setSelectedCondition}
            />

            <ValueSelector
              joinType={selectedValeur}
              onChange={setSelectedValeur}
            />
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
            disabled={
              !selectedAttribut ||
              !selectedCondition ||
              !selectedValeur ||
              (filtresPop.length > 0 && !joinType)
            }
          >
            Ajouter
          </Button>
        </div>
      </div>
    </div>
  );
}
