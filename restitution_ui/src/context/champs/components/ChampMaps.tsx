import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { AttributsMap } from "@/components/types/typage-global";
import { ChevronRight } from "lucide-react";
import { ChampsAVC } from "@/context/champs/champType";

interface ChampMapssProps {
  formats: AttributsMap;
  champsField: any;
  onClose?: () => void;
}

const AXES = {
  latitude: { label: "Latitude", value: "lat" },
  longitude: { label: "Longitude", value: "lon" },
};

export const ChampsMaps = ({
  formats,
  champsField,
  onClose,
}: ChampMapssProps) => {
  const options = ["Pays", "Ville"];
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [selectedCatManual, setSelectedCatManual] = useState<string | null>(
    null,
  );
  const [selectedAxe, setSelectedAxe] = useState<keyof typeof AXES | null>(
    null,
  );

  const { getValues, setValue } = useFormContext();
  useFieldArray({ name: "champs" }); // update non utilisé ici, gardé si besoin ailleurs

  const champs: ChampsAVC[] = champsField.value || [];

  // État dérivé depuis les champs (source de vérité)
  const hasLatitude = champs.some(
    (val) => val.transformation?.type === "lat" || val.type === "lat",
  );
  const hasLongitude = champs.some(
    (val) => val.transformation?.type === "lon" || val.type === "lon",
  );
  const hasBoth = hasLatitude && hasLongitude;
  const hasMaps = champs.some(
    (val) => val.transformation?.type === "maps" || val.type === "maps",
  );
  const hasManual = champs.some(
    (val) => val.transformation?.type === "manual" || val.type === "manual",
  );

  // Règle d'exclusivité : si coords (lat/lon/maps) présents -> manuel désactivé; si manuel présent -> coords désactivé
  const disableManual = hasLatitude || hasLongitude;
  const disableCoords = hasManual;

  const selectedAttributsLatitude = champs
    .filter(
      (item) => item.transformation?.type === "lat" || item.type === "lat",
    )
    .map((item) => item.transformation?.parametre || item.parametre);

  const selectedAttributsLongitude = champs
    .filter(
      (item) => item.transformation?.type === "lon" || item.type === "lon",
    )
    .map((item) => item.transformation?.parametre || item.parametre);

  // --- Ajout champ manuel (type: "manual")
  const handleAddManual = (concat_attribut: string, type: string) => {
    const currentChamps: ChampsAVC[] = getValues("champs") || [];

    // Filtrer les champs : garder tous sauf ceux de type "manual" (hors op_)
    const filteredChamps = currentChamps.filter(
      (champ) =>
        !(
          (champ.transformation?.type === "manual" ||
            champ.type === "manual") &&
          !(champ.typeAttribut && champ.typeAttribut.startsWith("op_"))
        ),
    );

    // Nouveau champ manuel
    const newChamp: ChampsAVC = {
      nom: concat_attribut,
      as_nom: `manual-${concat_attribut}`,
      type: "manual",
      typeAttribut: type || null,
      taille: null,
      position: null,
      parametre: concat_attribut,
      separateur: null,
      transformation: {
        type: "manual",
        typeAttribut: type || null,
        taille: null,
        position: null,
        parametre: concat_attribut,
        separateur: null,
      },
    };

    // Ajoute le champ en plus des autres (op_ inclus)
    setValue("champs", [...filteredChamps, newChamp]);
  };

  return (
    <div className="space-y-2">
      {/* Sélecteur pour Pays / Ville */}
      <div onClick={(e) => e.stopPropagation()} className="relative w-full">
        <select
          defaultValue=""
          // disabled={disableCoords}
          className="w-full h-10 px-3 text-sm text-gray-800 font-medium border border-gray-300 rounded-md bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition disabled:opacity-60"
          onChange={(e) => {
            const op = e.target.value;

            // Vérifier si un champ "maps" existe déjà
            const existingIndex = champs.findIndex(
              (c: ChampsAVC) => c.type === "maps" && c.as_nom === "maps-niv",
            );

            let updatedChamps: ChampsAVC[];

            if (existingIndex !== -1) {
              // Mise à jour de l'entrée existante
              updatedChamps = champs.map((c, idx) =>
                idx === existingIndex
                  ? {
                      ...c,
                      nom: `maps.${op}`,
                      as_nom: `maps-niv`,
                      parametre: `maps.${op}`,
                      transformation: {
                        ...c.transformation,
                        parametre: `maps.${op}`,
                      },
                    }
                  : c,
              );
            } else {
              // Ajout si aucune entrée "maps" n'existe
              updatedChamps = [
                ...champs,
                {
                  nom: `maps.${op}`,
                  as_nom: `maps-niv`,
                  type: "maps",
                  typeAttribut: null,
                  taille: null,
                  position: null,
                  parametre: `maps.${op}`,
                  separateur: null,
                  transformation: {
                    type: "maps",
                    typeAttribut: null,
                    taille: null,
                    position: null,
                    parametre: `maps.${op}`,
                    separateur: null,
                  },
                },
              ];
            }

            champsField.onChange(updatedChamps);
          }}
        >
          <option value="" disabled>
            Niveau cartographique
          </option>
          {options.map((op) => (
            <option key={op} value={op} className="cursor-pointer">
              {op.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
      {/* ===================== PAR COORDONNÉES ===================== */}
      <div
        className={`pl-4 bg-gray-50 rounded-xl border space-y-3 transition-all duration-300 ${
          disableCoords
            ? "opacity-50 pointer-events-none hidden"
            : "opacity-100"
        }`}
      >
        {/* <h2 className="text-base font-semibold text-gray-700">
          Traitement par coordonnees:
        </h2> */}

        {/* Boutons pour Latitude / Longitude */}
        <div className="w-full min-h-10 px-3 text-sm text-gray-800 font-medium">
          <span className="block mb-1 text-sm text-gray-600">
            Coordonnees:{" "}
          </span>

          <div className="flex justify-center gap-4 mb-2">
            {Object.entries(AXES).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => setSelectedAxe(key as keyof typeof AXES)}
                disabled={
                  disableCoords ||
                  (key === "latitude" && hasLatitude) ||
                  (key === "longitude" && hasLongitude)
                }
                className={`px-4 py-2 rounded-md border font-medium transition ${
                  selectedAxe === key ? "bg-blue-500 text-white" : "bg-gray-100"
                } ${
                  disableCoords ||
                  (key === "latitude" && hasLatitude) ||
                  (key === "longitude" && hasLongitude)
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Sélection des colonnes pour lat/long */}
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
                            className="cursor-pointer pr-2 pl-4 py-1 rounded flex justify-between items-center border-b"
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
                              {attributs
                                .filter(
                                  (attr) =>
                                    !["date", "boolean"].includes(
                                      attr.type.toLowerCase(),
                                    ),
                                )
                                .map((attr) => {
                                  const fullAttr = `${formatName}.${attr.name}`;
                                  const type = AXES[selectedAxe];
                                  const nom = fullAttr;
                                  const as_nom =
                                    type.label === "Latitude"
                                      ? `Latitude-${attr.id}`
                                      : `Longitude-${attr.id}`;

                                  const isChecked = champs.some(
                                    (ch) =>
                                      ch.nom === nom &&
                                      ch.as_nom === as_nom &&
                                      (ch.transformation?.type === type.value ||
                                        ch.type === type.value) &&
                                      (ch.transformation?.parametre ===
                                        fullAttr ||
                                        ch.parametre === fullAttr),
                                  );

                                  const isUsedInOtherAxe =
                                    (selectedAxe === "latitude" &&
                                      selectedAttributsLongitude.includes(
                                        fullAttr,
                                      )) ||
                                    (selectedAxe === "longitude" &&
                                      selectedAttributsLatitude.includes(
                                        fullAttr,
                                      ));

                                  const isDisabled =
                                    isUsedInOtherAxe ||
                                    (!isChecked &&
                                      ((selectedAxe === "latitude" &&
                                        hasLatitude) ||
                                        (selectedAxe === "longitude" &&
                                          hasLongitude))) ||
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
                                          const newChamp: ChampsAVC = {
                                            nom,
                                            as_nom,
                                            type: type.value,
                                            typeAttribut: attr.type || null,
                                            taille: null,
                                            position: null,
                                            parametre: fullAttr,
                                            separateur: null,
                                            transformation: {
                                              type: type.value,
                                              typeAttribut: attr.type || null,
                                              taille: null,
                                              position: null,
                                              parametre: fullAttr,
                                              separateur: null,
                                            },
                                          };

                                          const updatedChamps = champs
                                            .filter(
                                              (i: ChampsAVC) =>
                                                i.as_nom !== as_nom,
                                            )
                                            .concat(newChamp);

                                          champsField.onChange(updatedChamps);

                                          if (onClose && !hasBoth) onClose();
                                        }}
                                        className="cursor-pointer accent-blue-600"
                                      />
                                      <span className="truncate">
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
                    }),
                  )
                : null,
            )}
          </div>
        )}
      </div>

      {/* ===================== MANUEL ===================== */}
      <div
        className={`pl-4 bg-gray-50 rounded-xl border space-y-3 transition-all duration-300 ${
          disableManual
            ? "opacity-50 pointer-events-none hidden"
            : "opacity-100"
        }`}
      >
        {/* <h2 className="text-base font-semibold text-gray-700">
          Traitement manuelle:
        </h2> */}
        {(formats ?? []).map((item) =>
          item
            ? Object.entries(item).map(([key, formatMap]) =>
                Object.entries(formatMap).map(([formatName, attributs]) => (
                  <div key={`${key}-${formatName}`}>
                    <div
                      className="cursor-pointer pl-4 py-1 flex items-center justify-between font-medium text-gray-700 hover:text-teal-600 transition"
                      onClick={() =>
                        setSelectedCatManual(
                          selectedCatManual === formatName ? null : formatName,
                        )
                      }
                    >
                      {formatName}
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${
                          selectedCatManual === formatName ? "rotate-90" : ""
                        }`}
                      />
                    </div>

                    {selectedCatManual === formatName && (
                      <div className="pl-4 py-1 space-y-1">
                        {attributs
                          .filter(
                            (attr) =>
                              !["date", "boolean"].includes(
                                attr.type.toLowerCase(),
                              ),
                          )
                          .map((attr) => {
                            const concat_attribut = `${formatName}.${attr.name}`;

                            const isChecked = champs.some(
                              (ch) =>
                                ch.as_nom == `manual-${concat_attribut}` &&
                                (ch.transformation?.type == "manual" ||
                                  ch.type == "manual") &&
                                (ch.transformation?.parametre ||
                                  ch.parametre) == concat_attribut,
                            );

                            return (
                              <label
                                key={attr.id}
                                className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-100 ${
                                  isChecked ? "opacity-50" : ""
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      // Ajout
                                      handleAddManual(
                                        concat_attribut,
                                        attr.type,
                                      );
                                    } else {
                                      // Suppression
                                      champsField.onChange(
                                        champs.filter(
                                          (c) =>
                                            c.as_nom !==
                                            `manual-${concat_attribut}`,
                                        ),
                                      );
                                    }
                                  }}
                                  className="cursor-pointer accent-blue-600"
                                />
                                <span>{attr.name}</span>
                                <span className="text-xs text-gray-400">
                                  ({attr.type})
                                </span>
                              </label>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )),
              )
            : null,
        )}
      </div>
    </div>
  );
};
