import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { useController, useFormContext } from "react-hook-form";
import {
  ExpressionType,
  OperationType,
  OpFieldProps,
} from "@/context/operations/operationType";
import {
  divForm,
  divPackForm,
  divResult2Form,
  xForm,
  errorTextForm,
} from "@/components/ui/styles";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { ConditionProcess } from "@/context/operations/components/ConditionProcess";
import { OperationProcess } from "@/context/operations/components/OperationProcess";
import { OperationArithmetiqueProcess } from "@/context/operations/components/OperationArthmProcess";
import { SubConditionProcess } from "@/context/operations/components/SubConditionProcess";
import { ComparaisonProcess } from "@/context/operations/components/ComparaisonProcess";
import { ValeurProcess } from "@/context/operations/components/ValeurProcess";
import { AttributProcess } from "@/context/operations/components/AttributProcess";
import { GroupByProcess } from "./GroupByProcess";
import { ParametrageProcess } from "./ParametrageProcess";
import As_Nom from "@/context/operations/components/As_Nom";

export default function OperationsField({
  numIndex,
  continuity,
  onClose,
  formats,
  name,
  currentOperation,
  setCurrentOperation,
  setCurrOpComplet,
  onDeleteComponent,
  error,
}: OpFieldProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<string>("operation");
  const [extraStep, setExtraStep] = useState<string>("");
  const [ultimeStep, setUltimeStep] = useState<string>("");
  const { getValues, setValue } = useFormContext();

  const [suprattr, setSuprattr] = useState<number>(0);
  const [suprcond1, setSuprcond1] = useState<number>(0);
  const [suprcond2, setSuprcond2] = useState<number>(0);
  const [suprattrSave, setSuprattrSave] = useState<number>(0);
  const [suprcond1Save, setSuprcond1Save] = useState<number>(0);
  const [suprcond2Save, setSuprcond2Save] = useState<number>(0);
  const [suprattrSaveChamp, setSuprattrSaveChamp] = useState<number>(0);
  const [suprcond1SaveChamp, setSuprcond1SaveChamp] = useState<number>(0);
  const [suprcond2SaveChamp, setSuprcond2SaveChamp] = useState<number>(0);

  const { field: operation_selectionner } = useController({ name });

  const triggerRef = useRef<HTMLDivElement>(null);
  const [triggerWidth, setTriggerWidth] = useState<number>(0);

  useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  const resetOperation = () => {
    setStep("operation");
    setExtraStep("");
    setSuprattr(0);
    setSuprcond1(0);
    setSuprcond2(0);
    setSuprattrSave(0);
    setSuprcond1Save(0);
    setSuprcond2Save(0);
    setSuprattrSaveChamp(0);
    setSuprcond1SaveChamp(0);
    setSuprcond2SaveChamp(0);
    setUltimeStep("");
    setOpen(false);
    setCurrOpComplet(true);
  };

  const renderTransformationSummary = (item: OperationType): string => {
    const formatExpression = (expressions?: ExpressionType) => {
      if (!expressions || expressions.length === 0) return "";
      return expressions
        .map((expr) => {
          const valeurStr = expr.valeur?.toString() ?? "";
          const operateurStr = expr.operateur_arithmetique?.toString() ?? "";

          const groupByStr =
            expr.clause_regroupement
              ?.map((g) => g.champs_cible)
              .filter(Boolean)
              .join(", ") ?? "";

          return `${valeurStr} ${operateurStr} ${groupByStr}`.trim();
        })
        .join(" ");
    };

    if (item.conditions && item.conditions.length > 0) {
      const conditionsStr = item.conditions
        .map((cond) => {
          const champsCibleStr = formatExpression(cond.champs_cible);
          const valeurRefStr = formatExpression(cond.valeur_reference);
          return `${cond.operateur_logique ?? ""} ${
            cond.cle_logique ?? ""
          } ${champsCibleStr} ${
            cond.operateur_comparaison ?? ""
          } ${valeurRefStr}`;
        })
        .join(" ");

      const expressionStr = formatExpression(item.expressions);

      return `${conditionsStr} alors ${expressionStr}`;
    } else {
      const expressionStr = formatExpression(item.expressions);
      return `${expressionStr}`;
    }
  };

  const handleDeleteOperation = (
    e: React.MouseEvent,
    index: number,
    operation_selectionner: any,
    getValues: any,
    setValue: any,
    resetOperation: () => void
  ) => {
    e.stopPropagation();

    const operationSupprimee = operation_selectionner.value?.[index];
    const nomSupprime = operationSupprimee?.as_nom;

    const updated = operation_selectionner.value.filter(
      (_: OperationType, i: number) => i !== index
    );
    operation_selectionner.onChange(updated);

    const mes_champs = getValues("champs") || [];

    const updateChamps = mes_champs.filter(
      (champ: {
        as_nom: string;
        type: string | null;
        transformation: { type: string | null } | null;
      }) =>
        !(
          champ.as_nom === nomSupprime &&
          (champ.transformation?.type === "op_" || champ.type === "op_")
        )
    );

    setValue("champs", updateChamps);
    resetOperation();
    onDeleteComponent();
  };

  const handleDeleteomponentOperation = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleDeleteOperation(
      e,
      numIndex,
      operation_selectionner,
      getValues,
      setValue,
      resetOperation
    );
  };

  return (
    <div className={`${divPackForm}`}>
      <div className={divForm}>
        <div className="absolute -top-2 left-2 -mt-px px-1 bg-white text-xs font-medium text-gray-900 first-letter:capitalize flex items-center gap-2">
          <Label className="text-sm font-medium text-gray-700 ">
            Nom opération:
          </Label>
          <div className="flex-1">
            <As_Nom
              label="Nom opération"
              placeholder="Ex: Moyenne population"
              name="nomOP"
              numIndex={numIndex}
              currentOperation={currentOperation}
              setCurrentOperation={setCurrentOperation}
            />
          </div>
        </div>

        <Popover
          open={open}
          onOpenChange={(isOpen) => {
            if (!continuity) {
              onClose?.();
              setOpen(false);
            } else {
              setOpen(isOpen);
            }
          }}
        >
          <PopoverTrigger asChild>
            <span
              ref={triggerRef}
              role="button"
              tabIndex={0}
              className={`block min-h-[30px] w-full min-w-[240px] pl-3 pr-10 text-base sm:text-sm flex flex-wrap items-start gap-2 p-2 placeholder:text-gray-400 transition-all duration-300 border-0 ${
                operation_selectionner.value?.length > 0 ? "pt-4" : "pt-0"
              }`}
            >
              {operation_selectionner.value?.[numIndex] ? (
                <div className={divResult2Form}>
                  <span
                    className={`mr-1 text-gray-800 w-full truncate cursor-pointer overflow-hidden`}
                  >
                    {renderTransformationSummary(
                      operation_selectionner.value[numIndex]
                    )}
                  </span>
                  <X
                    className={xForm}
                    onClick={(e) =>
                      handleDeleteOperation(
                        e,
                        numIndex,
                        operation_selectionner,
                        getValues,
                        setValue,
                        resetOperation
                      )
                    }
                  />
                </div>
              ) : (
                <span className="w-full border-0 px-3 pt-4 text-sm font-sans text-gray-400 placeholder-gray-400 outline-none">
                  Configurer une opération
                </span>
              )}

              <X
                onClick={(e) => handleDeleteomponentOperation(e)}
                className={`absolute w-4 h-4 top-6 right-2 text-red-600 ml-auto transition-transform duration-300 bg-red-200`}
              />
            </span>
          </PopoverTrigger>

          <PopoverContent
            style={{ width: triggerWidth }}
            className="z-50 flex flex-col gap-4 p-4 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-xl w-full focus-within:ring-1 transition-all duration-300 focus-within:outline-none focus-within:border-t-transparent focus-within:border-x-teal-600 focus-within:border-b-teal-600"
          >
            <div className=" space-y-2">
              {step === "operation" && (
                <>
                  <ConditionProcess
                    currentOperation={currentOperation}
                    hasExistingCondition={
                      Array.isArray(operation_selectionner.value) &&
                      operation_selectionner.value.some(
                        (op: OperationType) => (op.conditions?.length ?? 0) > 0
                      )
                    }
                    step={step}
                    extraStep={extraStep}
                    suprattr={suprattr}
                    suprcond1={suprcond1}
                    operationSelectedField={operation_selectionner.value}
                    setStep={setStep}
                    setCurrentOperation={setCurrentOperation}
                    setExtraStep={setExtraStep}
                    setSuprattr={setSuprattr}
                    setSuprcond1={setSuprcond1}
                    setUltimeStep={setUltimeStep}
                  />
                  <OperationProcess
                    currentOperation={currentOperation}
                    step={step}
                    extraStep={extraStep}
                    suprattr={suprattr}
                    suprcond1={suprcond1}
                    suprcond2={suprcond2}
                    suprcond1Save={suprcond1Save}
                    suprattrSaveChamp={suprattrSaveChamp}
                    suprcond1SaveChamp={suprcond1SaveChamp}
                    suprcond2SaveChamp={suprcond2SaveChamp}
                    operationSelectedField={operation_selectionner.value}
                    setOpen={setOpen}
                    setStep={setStep}
                    setCurrentOperation={setCurrentOperation}
                    setExtraStep={setExtraStep}
                    setSuprattr={setSuprattr}
                    setSuprcond1={setSuprcond1}
                    setSuprcond2={setSuprcond2}
                    setSuprattrSaveChamp={setSuprattrSaveChamp}
                    setSuprcond1SaveChamp={setSuprcond1SaveChamp}
                    setSuprcond2SaveChamp={setSuprcond2SaveChamp}
                    setUltimeStep={setUltimeStep}
                  />
                </>
              )}

              {step === "op_arthm" && (
                <>
                  <OperationArithmetiqueProcess
                    currentOperation={currentOperation}
                    extraStep={extraStep}
                    suprattr={suprattr}
                    suprcond1={suprcond1}
                    suprcond2={suprcond2}
                    suprattrSaveChamp={suprattrSaveChamp}
                    suprcond1Save={suprcond1Save}
                    suprcond1SaveChamp={suprcond1SaveChamp}
                    suprcond2SaveChamp={suprcond2SaveChamp}
                    setStep={setStep}
                    setExtraStep={setExtraStep}
                    setSuprattr={setSuprattr}
                    setSuprcond1={setSuprcond1}
                    setSuprcond2={setSuprcond2}
                    saveTransformation={resetOperation}
                    setSuprattrSaveChamp={setSuprattrSaveChamp}
                    setSuprcond1SaveChamp={setSuprcond1SaveChamp}
                    setSuprcond2SaveChamp={setSuprcond2SaveChamp}
                  />
                </>
              )}

              {step === "attr" && (
                <>
                  {((suprattrSaveChamp >= 3 &&
                    extraStep.startsWith("supr_attr_")) ||
                    (suprcond1SaveChamp >= 3 &&
                      extraStep.startsWith("supr_cond1_attr_")) ||
                    (suprcond2SaveChamp >= 0 &&
                      extraStep.startsWith("supr_cond2_attr_"))) && (
                    <ValeurProcess
                      currentOperation={currentOperation}
                      step={step}
                      extraStep={extraStep}
                      suprattr={suprattr}
                      suprcond1={suprcond1}
                      suprcond2={suprcond2}
                      suprattrSaveChamp={suprattrSaveChamp}
                      suprcond1Save={suprcond1Save}
                      suprcond1SaveChamp={suprcond1SaveChamp}
                      suprcond2Save={suprcond2Save}
                      suprcond2SaveChamp={suprcond2SaveChamp}
                      setStep={setStep}
                      setExtraStep={setExtraStep}
                      setSuprcond2SaveChamp={setSuprcond2SaveChamp}
                    />
                  )}

                  {!extraStep.startsWith("supr_cond2_attr_") && (
                    <>
                      {((ultimeStep == "" &&
                        suprattrSaveChamp < 3 &&
                        extraStep.startsWith("supr_attr_")) ||
                        (suprcond1SaveChamp < 3 &&
                          extraStep.startsWith("supr_cond1_attr_"))) && (
                        <AttributProcess
                          currentOperation={currentOperation}
                          formats={formats}
                          extraStep={extraStep}
                          suprattr={suprattr}
                          suprcond1={suprcond1}
                          suprcond2={suprcond2}
                          suprattrSaveChamp={suprattrSaveChamp}
                          suprcond1Save={suprcond1Save}
                          suprcond1SaveChamp={suprcond1SaveChamp}
                          suprcond2SaveChamp={suprcond2SaveChamp}
                          setStep={setStep}
                          setExtraStep={setExtraStep}
                          setSuprattrSaveChamp={setSuprattrSaveChamp}
                          setSuprcond1SaveChamp={setSuprcond1SaveChamp}
                          setSuprcond2SaveChamp={setSuprcond2SaveChamp}
                        />
                      )}
                      {((suprattrSaveChamp <= 1 &&
                        extraStep.startsWith("supr_attr_")) ||
                        (suprcond1SaveChamp <= 1 &&
                          extraStep.startsWith("supr_cond1_attr_"))) && (
                        <OperationProcess
                          currentOperation={currentOperation}
                          step={step}
                          extraStep={extraStep}
                          suprattr={suprattr}
                          suprcond1={suprcond1}
                          suprcond2={suprcond2}
                          suprcond1Save={suprcond1Save}
                          suprattrSaveChamp={suprattrSaveChamp}
                          suprcond1SaveChamp={suprcond1SaveChamp}
                          suprcond2SaveChamp={suprcond2SaveChamp}
                          operationSelectedField={operation_selectionner.value}
                          setOpen={setOpen}
                          setStep={setStep}
                          setCurrentOperation={setCurrentOperation}
                          setExtraStep={setExtraStep}
                          setSuprattr={setSuprattr}
                          setSuprcond1={setSuprcond1}
                          setSuprcond2={setSuprcond2}
                          setSuprattrSaveChamp={setSuprattrSaveChamp}
                          setSuprcond1SaveChamp={setSuprcond1SaveChamp}
                          setSuprcond2SaveChamp={setSuprcond2SaveChamp}
                          setUltimeStep={setUltimeStep}
                        />
                      )}
                    </>
                  )}
                </>
              )}

              {step === "comp_cond" && (
                <>
                  <ComparaisonProcess
                    currentOperation={currentOperation}
                    suprcond1Save={suprcond1Save}
                    suprcond2={suprcond2}
                    setStep={setStep}
                    setExtraStep={setExtraStep}
                    setSuprcond2={setSuprcond2}
                  />
                </>
              )}

              {step === "sub_cond" && (
                <>
                  <SubConditionProcess
                    currentOperation={currentOperation}
                    suprattr={suprattr}
                    suprcond1={suprcond1}
                    setStep={setStep}
                    setExtraStep={setExtraStep}
                    setSuprattr={setSuprattr}
                    setSuprcond1={setSuprcond1}
                    suprcond1Save={suprcond1Save}
                    setSuprcond1Save={setSuprcond1Save}
                    setUltimeStep={setUltimeStep}
                    setSuprcond1SaveChamp={setSuprcond1SaveChamp}
                    setSuprcond2SaveChamp={setSuprcond2SaveChamp}
                  />
                </>
              )}

              {step === "group_by" && (
                <>
                  <GroupByProcess
                    formats={formats}
                    currentOperation={currentOperation}
                    extraStep={extraStep}
                    suprattr={suprattr}
                    suprcond1={suprcond1}
                    suprcond2={suprcond2}
                    suprattrSaveChamp={suprattrSaveChamp}
                    suprcond1Save={suprcond1Save}
                    suprcond1SaveChamp={suprcond1SaveChamp}
                    suprcond2SaveChamp={suprcond2SaveChamp}
                    setStep={setStep}
                    setExtraStep={setExtraStep}
                    setSuprattr={setSuprattr}
                    setSuprcond1={setSuprcond1}
                    setSuprcond2={setSuprcond2}
                    saveTransformation={resetOperation}
                    setSuprattrSaveChamp={setSuprattrSaveChamp}
                    setSuprcond1SaveChamp={setSuprcond1SaveChamp}
                    setSuprcond2SaveChamp={setSuprcond2SaveChamp}
                  />
                </>
              )}

              {step === "paramétrage" && (
                <>
                  <ParametrageProcess
                    formats={formats}
                    currentOperation={currentOperation}
                    extraStep={extraStep}
                    suprattr={suprattr}
                    suprcond1={suprcond1}
                    suprcond2={suprcond2}
                    suprattrSaveChamp={suprattrSaveChamp}
                    suprcond1Save={suprcond1Save}
                    suprcond1SaveChamp={suprcond1SaveChamp}
                    suprcond2SaveChamp={suprcond2SaveChamp}
                    setStep={setStep}
                    setExtraStep={setExtraStep}
                    setSuprattr={setSuprattr}
                    setSuprcond1={setSuprcond1}
                    setSuprcond2={setSuprcond2}
                    saveTransformation={resetOperation}
                    setSuprattrSaveChamp={setSuprattrSaveChamp}
                    setSuprcond1SaveChamp={setSuprcond1SaveChamp}
                    setSuprcond2SaveChamp={setSuprcond2SaveChamp}
                  />
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {error && <p className={errorTextForm}>{error}</p>}
    </div>
  );
}
