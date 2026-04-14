import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ChampsAVC, Props } from "@/context/champs/champType";
import { ChevronRight, X } from "lucide-react";
import { useController, useWatch } from "react-hook-form";

import {
  divForm,
  labelForm,
  spanForm,
  divResultForm,
  spanResultForm,
  divResult2Form,
  xForm,
  placeholder2Form,
  chevronForm,
  divPackForm,
  span2Form,
} from "@/components/ui/styles";
import { ChampTables } from "@/context/champs/components/ChampTables";
import { ChampsCircles } from "@/context/champs/components/ChampCircles";
import { ChampsAxesContent } from "@/context/champs/components/ChampAxes";
import { ChampsMaps } from "@/context/champs/components/ChampMaps";

const ChampsSelector = ({
  label,
  name,
  placeholder,
  attributsMapName,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [step, setStep] = useState<string>("select");
  const [currentAttribut, setCurrentAttribut] = useState<ChampsAVC | null>(
    null
  );

  const triggerRef = useRef<HTMLDivElement>(null);
  const [triggerWidth, setTriggerWidth] = useState<number>(0);
  const [selectOpen, setSelectOpen] = useState(false);

  const operation_selected = useWatch({ name: "operation_selected" }) || [];
  const attributsMap = useWatch({ name: attributsMapName }) || [];
  const formats = attributsMap;
  const { field: champ_selectionner } = useController({ name });
  const affichages_selectionnes = useWatch({ name: "affichages" }) || [];
  const nomAffichage = affichages_selectionnes[0]?.nom_affichage ?? "";

  useEffect(() => {
    if (step === "type") {
      setSelectOpen(true); // force l’ouverture
    }
  }, [step]);

  useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  const saveTransformation = () => {
    setStep("select");
    setSelectedCat(null);
    setCurrentAttribut(null);
    setOpen(false);
  };

  const renderTransformationSummary = (item: any) => {
    if (item.type === "none") return item.nom;

    if (item.type === "extract") {
      return `Extraction(${item.nom} position ${item.position ?? ""} sur ${item.taille ?? ""} caractère${(item.taille ?? 0) > 1 ? "s" : ""})`;
    }

    if (item.type === "concat") {
      const sepLabel = item.separateur === " " ? `"espace"` : item.separateur ? `"${item.separateur}"` : null;
      const sep = sepLabel ? `séparé par ${sepLabel}` : "sans séparateur";
      return `Concaténation(${item.nom} avec "${item.parametre ?? ""}" ${sep})`;
    }

    if (item.type === "AxesX" || item.type === "AxesY") {
      return `${item.type}(${item.parametre || ""})`;
    }

    if (item.type === "maps" || item.type === "lat" || item.type === "lon") {
      if (item.as_nom === "maps-niv") {
        return `Niveau(${item.parametre || ""})`;
      } else {
        return `${item.type}(${item.parametre || ""})`;
      }
    }

    return item.nom;
  };

  return (
    <div className={`${divPackForm} min-w-[250px]`}>
      <div className={`${divForm}`}>
        <Label className={labelForm}>{label}</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div
              ref={triggerRef}
              role="button"
              tabIndex={0}
              className={span2Form}
            >
              {champ_selectionner.value?.length > 0 ? (
                champ_selectionner.value.map((item: ChampsAVC, idx: number) => (
                  <div
                    key={`${item.nom}-${idx}`}
                    className={`flex items-center p-2 mt-0 text-sm bg-gray-100 border border-gray-300 rounded shadow-sm min-w-0`}
                  >
                    <span className={spanResultForm}>
                      {renderTransformationSummary(item)}
                    </span>

                    <X
                      className={`${xForm} ${
                        operation_selected.some(
                          (op: any) => op.as_nom === item.as_nom
                        )
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();

                        if (
                          operation_selected.some(
                            (op: any) => op.as_nom === item.as_nom
                          )
                        ) {
                          return;
                        }

                        const updated = champ_selectionner.value.filter(
                          (_: ChampsAVC, i: number) => i !== idx
                        );
                        champ_selectionner.onChange(updated);
                        saveTransformation();
                      }}
                    />
                  </div>
                ))
              ) : (
                <span className={placeholder2Form}>
                  Sélectionnez un attribut
                </span>
              )}

              <ChevronRight
                className={`${chevronForm} ${open ? "rotate-90" : ""}`}
              />
            </div>
          </PopoverTrigger>

          <PopoverContent
            style={{ width: triggerWidth }}
            className="px-4 space-y-1 transition-all duration-300 bg-white"
          >
            {["Tableau simple", "Tableau croisée dynamique"].includes(
              nomAffichage
            ) && (
              <ChampTables
                step={step}
                setStep={setStep}
                formats={formats}
                currentAttribut={currentAttribut}
                setCurrentAttribut={setCurrentAttribut}
                champ_selectionner={champ_selectionner}
                saveTransformation={saveTransformation}
              />
            )}

            {[
              "Histogramme",
              "Graphique en barres",
              "Graphique linéaire",
            ].includes(nomAffichage) && (
              <ChampsAxesContent
                label="Axes"
                formats={formats}
                champsField={champ_selectionner}
                onClose={() => setOpen(false)}
              />
            )}

            {["Diagramme circulaire", "Diagramme en secteurs"].includes(
              nomAffichage
            ) && <ChampsCircles />}

            {["Cartographie"].includes(
              nomAffichage
            ) && (
              <ChampsMaps
                formats={formats}
                champsField={champ_selectionner}
                onClose={() => setOpen(false)}
              />
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default ChampsSelector;
