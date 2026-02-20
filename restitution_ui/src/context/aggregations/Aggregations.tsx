import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { AttributAggregations } from "./components/AttributAggregations";

import {
  divForm,
  labelForm,
  spanForm,
  divResultForm,
  divResult2Form,
  spanResultForm,
  xForm,
  placeholder2Form,
  chevronForm,
  divPackForm,
  span2Form,
  placeholderForm3,
} from "@/components/ui/styles";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, X } from "lucide-react";
import { OperationType } from "@/context/operations/operationType";

type Props = {
  label: string;
  currentOperation: string;
};

export default function Aggregations({ label, currentOperation }: Props) {
  const [open, setOpen] = useState(false);
  const operationSelected = useWatch({ name: "operation_selected" }) || [];
  const [indexCurrent, setIndexCurrent] = useState<number | null>(null);

  useEffect(() => {
    if (operationSelected?.length > 0) {
      const foundIndex = operationSelected.findIndex(
        (op: OperationType) => op.as_nom === currentOperation
      );
      if (foundIndex !== -1) {
        setIndexCurrent(foundIndex);
      } else {
        setIndexCurrent(null);
      }
    } else {
      setIndexCurrent(null);
    }
  }, [operationSelected, currentOperation]);

  const champ_selectionner = useWatch({ name: "operation_selected" }) || [];
  const attributsMap = useWatch({ name: "attributs_map" }) || {};

  const triggerRef = useRef<HTMLDivElement>(null);
  const [triggerWidth, setTriggerWidth] = useState<number>(0);

  useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  const { setValue, getValues } = useFormContext(); 

  const renderTransformationSummary = (item: OperationType, idxOp: number) => {
    if (item.clause_regroupement && item.clause_regroupement.length > 0) {
      return (
        <div className="flex flex-wrap gap-2">
          {item.clause_regroupement.map((c, idx) => (
            <div
              key={idx}
              className={`flex items-center px-2 mt-1 text-sm bg-gray-100 border border-gray-300 rounded shadow-sm min-w-0`}
            >
              <span className={`${spanResultForm}`} title={c.champs_cible}>
                {c.champs_cible}
              </span>
              <X
                className={xForm}
                onClick={(e) => {
                  e.stopPropagation();

                  const operations = [...getValues("operation_selected")];
                  const clause = operations[idxOp].clause_regroupement || [];

                  clause.splice(idx, 1);
                  operations[idxOp] = {
                    ...operations[idxOp],
                    clause_regroupement: clause,
                  };

                  setValue("operation_selected", operations);
                }}
              />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="w-full flex items-center justify-center">
        <span className="text-sm text-gray-400 font-sans">
          Paramétrez votre GROUP BY
        </span>
      </div>
    );
  };

  return (
    <div className={divPackForm}>
      <div className={divForm}>
        <Label className={labelForm}>
          {label} <span className="text-gray-400"> (grouper par) :</span>{" "}
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <span
              ref={triggerRef}
              role="button"
              tabIndex={0}
              className={`block min-h-[30px] w-full min-w-[240px] pl-3 pr-10 py-1 text-base sm:text-sm flex flex-wrap items-start gap-2 p-2 placeholder:text-gray-400 transition-all duration-300`}
            >
              {champ_selectionner.map((item: OperationType, idx: number) => (
                <div key={`${item.as_nom}-${idx}`}>
                  {renderTransformationSummary(item, idx)}
                </div>
              ))}

              <ChevronRight
                className={`${chevronForm} ${open ? "rotate-90" : ""}`}
              />
            </span>
          </PopoverTrigger>

          <PopoverContent
            style={{ width: triggerWidth }}
            className="px-4 space-y-1 transition-all duration-300 bg-white"
          >
            <AttributAggregations
              formats={attributsMap}
              operationIndex={indexCurrent}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
