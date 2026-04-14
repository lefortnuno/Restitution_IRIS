import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { ChevronRight, X } from "lucide-react";
import {
  divForm,
  labelForm,
  spanForm,
  divResultForm,
  spanResultForm,
  xForm,
  placeholderForm3,
  chevronForm,
} from "@/components/ui/styles";
import { useController, useWatch } from "react-hook-form";
import { GlobalProps } from "@/components/types/typage-global";
import { FiltrePop } from "@/context/filtrePop/filtrePopType";
import FiltrePopModal from "@/context/filtrePop/components/FiltrePopModal";
import { joinTypeLabels } from "@/context/filtrePop/components/ConditionSelector";

export const PopulationFilterSelector = ({
  label,
  name,
  attributsMapName,
}: GlobalProps) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const { field: filtrePopFiled } = useController({ name });
  const attributsMap = useWatch({ name: attributsMapName }) || {}; 

  const removeFilter = (filterToRemove: FiltrePop) => {
    const filters = filtrePopFiled.value || [];

    const isSame = (a: FiltrePop, b: FiltrePop) =>
      a.champs_cible === b.champs_cible &&
      a.operateur_comparaison === b.operateur_comparaison &&
      a.parametre === b.parametre;

    const index = filters.findIndex((f: FiltrePop) =>
      isSame(f, filterToRemove)
    );

    // Bloque si c'est le premier filtre et qu'il y en a plusieurs
    if (index === 0 && filters.length > 1) {
      // Tu peux afficher un toast ou une alerte ici
      return;
    }

    const updated = filters.filter(
      (f: FiltrePop) => !isSame(f, filterToRemove)
    );
    filtrePopFiled.onChange(updated);
  };

  return (
    <>
      <div className={divForm}>
        <Label htmlFor="filtres_pop" className={labelForm}>
          {label}
        </Label>
        <span
          ref={triggerRef}
          role="button"
          tabIndex={0}
          className={spanForm}
          onClick={() => setOpen(true)}
        >
          {filtrePopFiled.value?.length > 0 ? (
            filtrePopFiled.value.map((jointure: FiltrePop) => (
              <div
                key={`${jointure.champs_cible}.${jointure.operateur_comparaison}.${jointure.parametre}`}
                className={divResultForm}
              >
                <span className={spanResultForm}>
                  <b>{jointure.operateur_logique}</b> ({jointure.champs_cible}{" "}
                  {joinTypeLabels[jointure.operateur_comparaison ?? ""] ?? jointure.operateur_comparaison} {jointure.parametre})
                </span>
                <X
                  className={xForm}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFilter(jointure);
                  }}
                />
              </div>
            ))
          ) : (
            <span className={placeholderForm3}>Filtre population</span>
          )}

          <ChevronRight
            className={`${chevronForm} ${open ? "rotate-90" : ""}`}
          />
        </span>

        <FiltrePopModal
          isOpen={open}
          onClose={() => setOpen(false)}
          formats={attributsMap}
          existingJoins={filtrePopFiled.value || []}
          onAdd={(
            joinType,
            selectedAttribut,
            selectedCondition,
            selectedValeur
          ) => {
            const newJoin: FiltrePop = {
              operateur_logique: joinType,
              champs_cible: selectedAttribut,
              operateur_comparaison: selectedCondition,
              parametre: selectedValeur,
            };

            filtrePopFiled.onChange([...(filtrePopFiled.value || []), newJoin]);
          }}
        />
      </div>
    </>
  );
};
