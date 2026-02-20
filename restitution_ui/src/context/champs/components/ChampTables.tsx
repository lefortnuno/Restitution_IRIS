import React from "react";
import { AttributChamps } from "@/context/champs/components/AttributChamps";
import { ChampsAVC } from "@/context/champs/champType";
import { AttributsMap } from "@/components/types/typage-global";

interface ChampTablesProps {
  step: string;
  setStep: React.Dispatch<React.SetStateAction<string>>;
  formats: AttributsMap;
  currentAttribut: ChampsAVC | null;
  champ_selectionner: {
    value: ChampsAVC[];
    onChange: (val: ChampsAVC[]) => void;
  };
  setCurrentAttribut: (currentAttribut: ChampsAVC | null) => void;
  saveTransformation: () => void;
}

export const ChampTables: React.FC<ChampTablesProps> = ({
  step,
  setStep,
  formats,
  currentAttribut,
  champ_selectionner,
  setCurrentAttribut,
  saveTransformation,
}) => {
  const inputBaseClasses =
    "w-full rounded border border-gray-300 px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-all duration-300";

  if (step === "select") {
    return (
      <AttributChamps
        formats={formats}
        step={step}
        setCurrentAttribut={setCurrentAttribut}
        setStep={setStep}
      />
    );
  }

  if (step === "type" && currentAttribut) {
    return (
      <div className="space-y-2 px-2 py-1">
        <div
          className="cursor-pointer px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200"
          onClick={() => {
            const updated = [
              ...(champ_selectionner.value || []),
              {
                nom: currentAttribut.nom,
                as_nom: currentAttribut.as_nom,
                type: "none",
                typeAttribut: currentAttribut.typeAttribut,
                taille: null,
                position: null,
                parametre: null,
                separateur: null,
                transformation: {
                  type: "none",
                  typeAttribut: currentAttribut.typeAttribut,
                  taille: null,
                  position: null,
                  parametre: null,
                  separateur: null,
                },
              },
            ];
            champ_selectionner.onChange(updated);
            saveTransformation();
          }}
        >
          Aucune transformation
        </div>

        <div
          className="cursor-pointer px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200"
          onClick={() => {
            const updated = [
              ...(champ_selectionner.value || []),
              {
                nom: currentAttribut.nom,
                as_nom: currentAttribut.as_nom,
                type: "extract",
                typeAttribut: currentAttribut.typeAttribut,
                taille: null,
                position: null,
                parametre: null,
                separateur: null,
                transformation: {
                  type: "extract",
                  typeAttribut: currentAttribut.typeAttribut,
                  taille: null,
                  position: null,
                  parametre: null,
                  separateur: null,
                },
              },
            ];
            champ_selectionner.onChange(updated);
            setStep("params");
          }}
        >
          Extraire une partie
        </div>

        <div
          className="cursor-pointer px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200"
          onClick={() => {
            const updated = [
              ...(champ_selectionner.value || []),
              {
                nom: currentAttribut.nom,
                as_nom: currentAttribut.as_nom,
                type: "concat",
                typeAttribut: currentAttribut.typeAttribut,
                taille: null,
                position: null,
                parametre: null,
                separateur: null,
                transformation: {
                  type: "concat",
                  typeAttribut: currentAttribut.typeAttribut,
                  taille: null,
                  position: null,
                  parametre: null,
                  separateur: null,
                },
              },
            ];
            champ_selectionner.onChange(updated);
            setStep("params");
          }}
        >
          Concaténer avec une valeur
        </div>
      </div>
    );
  }

  if (step === "params" && currentAttribut) {
    const current = (champ_selectionner.value || []).find(
      (i: ChampsAVC) => i.as_nom === currentAttribut.as_nom
    );
    if (!current) return null;
    const index = (champ_selectionner.value || []).indexOf(current);

    const handleChange = (key: string, value: any) => {
      const updated = (champ_selectionner.value || []).map(
        (item: ChampsAVC, i: number) =>
          i === index
            ? {
                ...item,
                [key]: value, // synchronisation directe Transformation et les variables
                transformation: {
                  ...(item.transformation || {}),
                  [key]: value,
                },
              }
            : item
      );
      champ_selectionner.onChange(updated);
    };

    if (current.transformation?.type === "extract" || current.type === "extract") {
      return (
        <div className="space-y-3 px-2 py-1">
          <div>
            <label className="text-sm font-medium">Taille à extraire</label>
            <input
              type="number"
              placeholder="Ex: 5"
              className={inputBaseClasses}
              onChange={(e) => handleChange("taille", Number(e.target.value))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Position de départ</label>
            <input
              type="number"
              placeholder="Ex: 0"
              className={inputBaseClasses}
              onChange={(e) => handleChange("position", Number(e.target.value))}
            />
          </div>
          <div className="pt-2">
            <div
              className="bg-teal-600 hover:bg-teal-700 text-white text-center py-2 rounded cursor-pointer transition-all"
              onClick={saveTransformation}
            >
              Valider
            </div>
          </div>
        </div>
      );
    }

    if (current.transformation?.type === "concat" || current.type === "concat") {
      return (
        <div className="space-y-3 px-2 py-1">
          <div>
            <label className="text-sm font-medium">Séparateur</label>
            <select
              className={inputBaseClasses}
              onChange={(e) => handleChange("separateur", e.target.value)}
            >
              <option value="">Aucun</option>
              <option value=" ">Espace</option>
              <option value="_">Underscore (_)</option>
              <option value="-">Tiret (-)</option>
              <option value=",">Virgule (,)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Valeur à concaténer</label>
            <input
              type="text"
              placeholder="Ex: valeur"
              className={inputBaseClasses}
              onChange={(e) => handleChange("parametre", e.target.value)}
            />
          </div>
          <div className="pt-2">
            <div
              className="bg-teal-600 hover:bg-teal-700 text-white text-center py-2 rounded cursor-pointer transition-all"
              onClick={saveTransformation}
            >
              Valider
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  return null;
};
