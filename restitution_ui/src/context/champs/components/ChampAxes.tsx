import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { ChampsAVC } from "@/context/champs/champType";

type Attribut = {
  label: string;
  name: string;
  attributsMapName: string;
  type: string;
  id: number;
};

type Props = {
  label: string;
  formats: {
    [id: number]: {
      [formatName: string]: Attribut[];
    };
  }[];
  champsField: any;
  onClose?: () => void;
};

const AXES = {
  abscisse: "AxesX",
  ordonnee: "AxesY",
};

export const ChampsAxesContent = ({
  label,
  formats,
  champsField,
  onClose,
}: Props) => {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [selectedAxe, setSelectedAxe] = useState<keyof typeof AXES | null>(
    null
  );

  const champs = champsField.value || [];

  const hasAbscisse = champs.some(
    (val: ChampsAVC) =>
      val.transformation?.type === "AxesX" || val.type === "AxesX"
  );
  const hasOrdonnee = champs.some(
    (val: ChampsAVC) =>
      val.transformation?.type === "AxesY" || val.type === "AxesY"
  );
  const hasBoth = hasAbscisse && hasOrdonnee;

  const selectedAttributsAbscisse = champs
    .filter(
      (item: ChampsAVC) =>
        item.transformation?.type === "AxesX" || item.type === "AxesX"
    )
    .map((item: ChampsAVC) => item.transformation?.parametre || item.parametre);

  const selectedAttributsOrdonnee = champs
    .filter(
      (item: ChampsAVC) =>
        item.transformation?.type === "AxesY" || item.type === "AxesY"
    )
    .map((item: ChampsAVC) => item.transformation?.parametre || item.parametre);

  useEffect(() => {
    const hasOrdonnee = champs.some(
      (val: ChampsAVC) =>
        val.transformation?.type === "AxesY" || val.type === "AxesY"
    );

    if (!hasOrdonnee) {
      const axesY = {
        nom: null,
        as_nom: null,
        type: "AxesY",
        typeAttribut: "Integer",
        taille: null,
        position: null,
        parametre: null,
        separateur: null,
        transformation: {
          type: "AxesY",
          typeAttribut: "Integer",
          taille: null,
          position: null,
          parametre: null,
          separateur: null,
        },
      };
      champsField.onChange([...champs, axesY]);
    }
    setSelectedCat(null);
    setSelectedAxe("abscisse");
  }, []);

  return (
    <div className="flex flex-col bg-white">
      <div className="flex justify-center gap-4 mb-2">
        {Object.entries(AXES).map(([key, axeLabel]) => (
          <button
            key={key}
            onClick={() => setSelectedAxe(key as keyof typeof AXES)}
            disabled={
              (key === "abscisse" && hasAbscisse) ||
              (key === "ordonnee" && hasOrdonnee)
            }
            className={`px-3 py-1 rounded-md border ${
              selectedAxe === key ? "bg-blue-500 text-white" : "bg-gray-100"
            } ${
              (key === "abscisse" && hasAbscisse) ||
              (key === "ordonnee" && hasOrdonnee)
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-200"
            }`}
          >
            {axeLabel}
          </button>
        ))}
      </div>

      {selectedAxe && (
        <div className="space-y-2">
          {(formats ?? []).map((item) =>
            item
              ? Object.entries(item).map(([formatId, formatMap]) =>
                  Object.entries(formatMap).map(([formatName, attributs]) => {
                    const isOpen = selectedCat === formatName;

                    return (
                      <div key={`${formatId}-${formatName}`}>
                        <div
                          className="cursor-pointer px-2 py-1 rounded flex justify-between items-center border-b"
                          onClick={() =>
                            setSelectedCat(isOpen ? null : formatName)
                          }
                        >
                          <span className="truncate">{formatName}</span>
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${
                              isOpen ? "rotate-90" : ""
                            }`}
                          />
                        </div>

                        {isOpen && (
                          <div className="max-h-60 px-4 space-y-1 overflow-y-auto">
                            {attributs.map((attr) => {
                              const fullAttr = `${formatName}.${attr.name}`;
                              const type = AXES[selectedAxe];
                              const nom = fullAttr;
                              const as_nom =
                                type === "AxesX"
                                  ? `AxesX-${attr.id}`
                                  : type === "AxesY"
                                  ? `AxesY-${attr.id}`
                                  : `Axes-${attr.id}`; // fallback si jamais

                              const isChecked = champs.some(
                                (ch: ChampsAVC) =>
                                  ch.nom === nom &&
                                  ch.as_nom === as_nom &&
                                  (ch.transformation?.type === type ||
                                    ch.type === type) &&
                                  (ch.transformation?.parametre ||
                                    ch.parametre) === fullAttr
                              );

                              const isUsedInOtherAxe =
                                (selectedAxe === "abscisse" &&
                                  selectedAttributsOrdonnee.includes(
                                    fullAttr
                                  )) ||
                                (selectedAxe === "ordonnee" &&
                                  selectedAttributsAbscisse.includes(fullAttr));

                              const isDisabled =
                                isUsedInOtherAxe ||
                                (!isChecked &&
                                  ((selectedAxe === "abscisse" &&
                                    hasAbscisse) ||
                                    (selectedAxe === "ordonnee" &&
                                      hasOrdonnee))) ||
                                (hasBoth && !isChecked);

                              return (
                                <label
                                  key={attr.id}
                                  className={`flex items-center gap-2 px-2 py-1 rounded ${
                                    isDisabled
                                      ? "opacity-50 cursor-not-allowed"
                                      : "cursor-pointer hover:bg-gray-100"
                                  }`}
                                  title={attr.name}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    disabled={isDisabled}
                                    onChange={() => {
                                      if (isChecked) {
                                        champsField.onChange(
                                          champs.filter(
                                            (i: ChampsAVC) =>
                                              i.as_nom !== as_nom
                                          )
                                        );
                                      } else {
                                        champsField.onChange([
                                          ...champs,
                                          {
                                            nom,
                                            as_nom,
                                            type,
                                            typeAttribut: attr.type || null,
                                            taille: null,
                                            position: null,
                                            parametre: fullAttr,
                                            separateur: null,
                                            transformation: {
                                              type,
                                              typeAttribut: attr.type || null,
                                              taille: null,
                                              position: null,
                                              parametre: fullAttr,
                                              separateur: null,
                                            },
                                          },
                                        ]);
                                        if (onClose && !hasBoth) {
                                          onClose();
                                        }
                                      }
                                    }}
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
                    );
                  })
                )
              : null
          )}
        </div>
      )}
    </div>
  );
};
