import { OperationType, Props } from "@/context/operations/operationType";
import { useController, useFormContext, useWatch } from "react-hook-form";
import OperationsField from "@/context/operations/components/OperationsField";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function Operations({
  name,
  attributsMapName,
  operationValues,
  error,
  setCompletOP,
}: Props) {
  const { control, getValues, setValue } = useFormContext();
  const [continuity, setContinuity] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<string>("");
  const [currOpComplet, setCurrOpComplet] = useState<boolean>(false);
  const [nbrOP, setNbrOP] = useState<number>(1);
  const attributsMap = useWatch({ name: attributsMapName }) || {};
  const { field: operation_selectionner } = useController({ name });

  const handleDeleteComponent = (indexToRemove: number) => {
    setNbrOP((prev) => prev - 1);
  };

  useEffect(() => {
    if (operation_selectionner.value?.length === nbrOP && currOpComplet) {
      setContinuity(false);
      setCompletOP(false);
    } else {
      setContinuity(true);
      setCompletOP(true);
    }
  }, [currOpComplet]);

  useEffect(() => {
    const existingOperations: OperationType[] = getValues(name) || [];
    if (existingOperations.length > 0) {
      setCurrOpComplet(true);
      setNbrOP(operation_selectionner.value.length);
    }
  }, []);

  return (
    <div className="flex flex-col lg:flex-row flex-wrap gap-4 w-full">
      {[...Array(nbrOP)].map((_, i) => {
        const isLast = i === nbrOP - 1; // dernier élément

        return (
          <div key={i} className="w-full">
            <OperationsField
              numIndex={i}
              continuity={isLast ? continuity : false}
              setContinuity={setContinuity}
              onClose={() => {
                if (isLast) {
                  setContinuity(false);
                }
              }}
              formats={attributsMap}
              name={name}
              error={error}
              currentOperation={currentOperation}
              setCurrentOperation={setCurrentOperation}
              setCurrOpComplet={setCurrOpComplet}
              onDeleteComponent={() => {
                handleDeleteComponent(i);
              }}
            />
          </div>
        );
      })}

      {operation_selectionner.value?.length === nbrOP && currOpComplet && (
        <div className="mt-2">
          <Button
            type="button"
            onClick={() => {
              const n = nbrOP + 1;
              setNbrOP(n);
              setCurrOpComplet(false);
            }}
            className="text-white bg-teal-600 hover:bg-teal-700"
          >
            + Ajouter une opération
          </Button>
        </div>
      )}
    </div>
  );
}
