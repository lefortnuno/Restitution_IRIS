import { Dispatch, SetStateAction, useEffect } from "react";
import { FormProvider, UseFormReturn, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import {
  RestitutionFormDataType,
} from "@/components/form/schema";
import { validateRestitutionForm } from "@/components/form/validateRestitution";
import { FormatResponseType } from "@/components/queries/useFormats";
import {
  buttonForm,
  divForm,
  divPackForm,
  errorTextForm,
  labelForm,
  placeholderForm,
} from "@/components/ui/styles";

import TextField from "@/context/texts/TextField";
import TextAreaField from "@/context/texts/TextAreaField";
import BooleanField from "@/context/texts/BooleanField";
import FormatSelectField from "@/context/formats/Formats";
import { JointuresSelector } from "@/context/jointures/Jointures";
import { PopulationFilterSelector } from "@/context/filtrePop/FiltrePop";
import AffichageSelector from "@/context/affichages/Affichage";
import ChampsSelector from "@/context/champs/Champ";
import Operations from "@/context/operations/Operations";
import LlmmodeleSelector from "@/context/llmmodeles/Llmmodele";

interface RestitutionFormBodyProps {
  methods: UseFormReturn<RestitutionFormDataType>;
  submitLabel: string;
  completOP: boolean;
  setCompletOP: Dispatch<SetStateAction<boolean>>;
  onValidSubmit: (rawData: RestitutionFormDataType) => void;
  checkLlmmodeles?: boolean;
  isFormatsError: boolean;
  isFormatsSuccess: boolean;
  formatsData: FormatResponseType | undefined;
  isFormatsPending: boolean;
}

export default function RestitutionFormBody({
  methods,
  submitLabel,
  completOP,
  setCompletOP,
  onValidSubmit,
  checkLlmmodeles = false,
  isFormatsError,
  isFormatsSuccess,
  formatsData,
  isFormatsPending,
}: RestitutionFormBodyProps) {
  const navigate = useNavigate();
  const {
    formState: { errors },
    reset,
    control,
  } = methods;

  const formatsSelected = useWatch({ control, name: "formats_selected" }) || [];
  const affichages = useWatch({ control, name: "affichages" }) || "";
  const operationValues =
    useWatch({ control, name: "operation_selected" }) || [];

  useEffect(() => {
    if (completOP) {
      methods.clearErrors("operation_selected");
    }
  }, [completOP, methods]);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const rawData = methods.getValues();
          const hasError = validateRestitutionForm(
            rawData,
            methods,
            checkLlmmodeles
          );
          if (hasError) return;
          onValidSubmit(rawData);
        }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <TextField
            name="nom"
            label="Nom de la restitution"
            placeholder="Ex: Statistiques par région"
            error={errors.nom?.message}
          />

          <div className="mt-0">
            {isFormatsError && (
              <div className={`${divPackForm} min-w-[250px]`}>
                <div
                  className={`${divForm} border-red-500 focus:ring-red-300`}
                >
                  <label
                    htmlFor="inputId-Format-error"
                    className={labelForm}
                  >
                    Formats
                  </label>
                  <input
                    id="inputId-Format-error"
                    className={`${placeholderForm} truncate}`}
                    autoComplete="off"
                    disabled={true}
                  />
                </div>
                <p className={errorTextForm}>
                  Erreur lors du chargement des formats
                </p>
              </div>
            )}

            {isFormatsSuccess && formatsData && (
              <FormatSelectField
                name="formats_selected"
                options={formatsData.result ?? []}
                label="Formats disponibles"
                isLoading={isFormatsPending}
                error={errors.formats_selected?.message}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {formatsSelected.length >= 1 && (
            <div className="w-full">
              <div className="my-4 border-t-4 border-teal-700 rounded-t-md px-2 py-1 bg-teal-700 text-white font-semibold">
                Filtre population
              </div>
              <PopulationFilterSelector
                label="Filtrer la population :"
                name="filtres_pop"
                attributsMapName="attributs_map"
              />
            </div>
          )}

          {formatsSelected.length >= 2 && (
            <div className="w-full">
              <div className="my-4 border-t-4 border-teal-700 rounded-t-md px-2 py-1 bg-teal-700 text-white font-semibold">
                Jointures
              </div>
              <JointuresSelector
                label="Jointure(s) :"
                name="jointures"
                attributsMapName="attributs_map"
              />
            </div>
          )}
        </div>

        <div className="my-4 border-t-4 border-teal-700 rounded-t-md px-2 py-1 bg-teal-700 text-white font-semibold">
          Affichage & champs
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <AffichageSelector
            name="affichages"
            placeholder="Ex: tableau"
            error={errors.affichages?.message}
          />

          <ChampsSelector
            name="champs"
            label="Champs"
            placeholder="Ex: nom, population"
            attributsMapName="attributs_map"
            error={errors.champs?.message}
          />
        </div>

        {formatsSelected.length >= 1 && affichages.length >= 1 && (
          <>
            <div className="my-4 border-t-4 border-teal-700 rounded-t-md px-2 py-1 bg-teal-700 text-white font-semibold">
              Opérations
            </div>
            <Operations
              label="Opération(s) :"
              name="operation_selected"
              placeholder="Ex: Somme(..."
              attributsMapName="attributs_map"
              operationValues={operationValues}
              error={errors.operation_selected?.message}
              setCompletOP={setCompletOP}
            />
          </>
        )}

        <hr className="my-6 border-dashed border-gray-400" />

        <div className="my-4 border-t-4 border-teal-700 rounded-t-md px-2 py-1 bg-teal-700 text-white font-semibold">
          Intelligence Artificielle
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <LlmmodeleSelector
            name="llmmodeles"
            placeholder="Ex: qwen"
            error={errors.llmmodeles?.message}
          />

          <BooleanField
            name="status_llm"
            label="Activé/Désactivé"
            placeholder="..."
          />
        </div>

        <TextAreaField
          name="description"
          label="Description"
          placeholder="Décrivez la restitution..."
        />

        <div className="col-span-full flex justify-end gap-2 pt-4 px-4">
          <button
            type="button"
            onClick={() => {
              reset();
              navigate("/");
            }}
            className={`${buttonForm} bg-red-600 hover:bg-red-700 focus:ring-red-500`}
          >
            Annuler
          </button>
          <button
            type="submit"
            className={`${buttonForm} bg-teal-600 hover:bg-teal-700 focus:ring-teal-500 ${
              completOP ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={completOP}
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}
