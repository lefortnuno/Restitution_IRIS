import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import JointureModal from "@/context/jointures/components/JointureModal";
import { Jointure } from "@/context/jointures/jointureType";
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

export const JointuresSelector = ({
  label,
  name,
  attributsMapName,
}: GlobalProps) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const { field: jointuresField } = useController({ name });
  const attributsMap = useWatch({ name: attributsMapName }) || {};

  const toggleFormat = (jointure: Jointure) => {
    const isSameJointure = (a: Jointure, b: Jointure) => {
      return (
        (a.reference1.format === b.reference1.format &&
          a.reference1.attribut === b.reference1.attribut &&
          a.reference2.format === b.reference2.format &&
          a.reference2.attribut === b.reference2.attribut) ||
        (a.reference1.format === b.reference2.format &&
          a.reference1.attribut === b.reference2.attribut &&
          a.reference2.format === b.reference1.format &&
          a.reference2.attribut === b.reference1.attribut)
      );
    };

    const isSelected = jointuresField.value?.some((j: Jointure) =>
      isSameJointure(j, jointure)
    );

    const updated = isSelected
      ? jointuresField.value.filter(
          (j: Jointure) => !isSameJointure(j, jointure)
        )
      : [...(jointuresField.value || []), jointure];

    jointuresField.onChange(updated);
  };

  return (
    <>
      <div className={divForm}>
        <Label className={labelForm}>{label}</Label>
        <span
          ref={triggerRef}
          role="button"
          tabIndex={0}
          className={spanForm}
          onClick={() => setOpen(true)}
        >
          {jointuresField.value?.length > 0 ? (
            jointuresField.value.map((jointure: Jointure) => (
              <div
                key={`${jointure.reference1.format}.${jointure.reference1.attribut}-${jointure.reference2.format}.${jointure.reference2.attribut}`}
                className={divResultForm}
              >
                <span className={spanResultForm}>
                  <b className="text-gray-600">{jointure.type}&#40;</b>
                  {jointure.reference1.format}.{jointure.reference1.attribut},
                  {jointure.reference2.format}.{jointure.reference2.attribut}
                  <b className="text-gray-600">&#41;</b>
                </span>
                <X
                  className={xForm}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFormat(jointure);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") toggleFormat(jointure);
                  }}
                />
              </div>
            ))
          ) : (
            <span className={placeholderForm3}>Faire des jointures</span>
          )}

          <ChevronRight
            className={`${chevronForm} ${open ? "rotate-90" : ""}`}
          />
        </span>

        <JointureModal
          isOpen={open}
          onClose={() => setOpen(false)}
          formats={attributsMap}
          existingJoins={jointuresField.value || []}
          onAdd={(joinType, selectedAttributs) => {
            const newJoin: Jointure = {
              type: joinType,
              reference1: {
                format: selectedAttributs[0].split(".")[0],
                attribut: selectedAttributs[0].split(".")[1],
              },
              reference2: {
                format: selectedAttributs[1].split(".")[0],
                attribut: selectedAttributs[1].split(".")[1],
              },
            };

            const isSameJointure = (a: Jointure, b: Jointure) => {
              return (
                (a.reference1.format === b.reference1.format &&
                  a.reference1.attribut === b.reference1.attribut &&
                  a.reference2.format === b.reference2.format &&
                  a.reference2.attribut === b.reference2.attribut) ||
                (a.reference1.format === b.reference2.format &&
                  a.reference1.attribut === b.reference2.attribut &&
                  a.reference2.format === b.reference1.format &&
                  a.reference2.attribut === b.reference1.attribut)
              );
            };

            const alreadyExists = jointuresField.value?.some((j: Jointure) =>
              isSameJointure(j, newJoin)
            );

            if (!alreadyExists) {
              jointuresField.onChange([
                ...(jointuresField.value || []),
                newJoin,
              ]);
            }
          }}
        />
      </div>
    </>
  );
};
