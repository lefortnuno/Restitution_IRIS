import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "@/context/texts/TextField";
import {
  restitutionFormSchema,
  RestitutionFormDataType,
  defaultRestitution,
} from "@/components/form/schema";
import {
  buttonForm,
  divForm,
  divPackForm,
  errorTextForm,
  labelForm,
  placeholderForm,
} from "@/components/ui/styles";
import {
  createRestitution,
  getRestitutionID,
  updateRestitutionID,
} from "@/components/queries/useCRURestitution";

import { UrlAjout } from "@/layout/content/url";
import Header from "@/layout/headers/Header";
import Asides from "@/layout/asides/Asides";

import { useParams } from "react-router-dom";
import { useTaskFormats, useFormats } from "@/components/queries/useFormats";
import { JointuresSelector } from "@/context/jointures/Jointures";
import { PopulationFilterSelector } from "@/context/filtrePop/FiltrePop";

import TextAreaField from "@/context/texts/TextAreaField";
import FormatSelectField from "@/context/formats/Formats";
import AffichageSelector from "@/context/affichages/Affichage";
import Operations from "@/context/operations/Operations";
import ChampsSelector from "@/context/champs/Champ";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { removeIdsFromFormData } from "@/components/types/cleanRestitutionData";
import BooleanField from "@/context/texts/BooleanField";
import LlmmodeleSelector from "@/context/llmmodeles/Llmmodele";

export default function DuplicateForm() {
  const [completOP, setCompletOP] = useState<boolean>(false);
  const { restitutionId } = useParams();
  // Charger la restitution

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["restitution", restitutionId],
    queryFn: () => getRestitutionID(Number(restitutionId)),
    enabled: !!restitutionId,
  });

  // Initialiser le formulaire avec un defaultValues vide d'abord
  const methods = useForm<RestitutionFormDataType>({
    resolver: zodResolver(restitutionFormSchema),
    defaultValues: defaultRestitution,
    mode: "all",
  });

  // Dès que la data est chargée, on reset le formulaire avec les valeurs reçues
  useEffect(() => {
    if (data) {
      const formattedData: RestitutionFormDataType = {
        nom: data.nom ?? "",
        status_llm: data.status_llm ?? true,
        formats_selected: data.formats_selected ?? [],
        jointures: data.jointures ?? [],
        filtres_pop: data.filtres_pop ?? [],
        affichages: data.affichages ?? [],
        llmmodeles: data.llmmodeles ?? [],
        operation_selected: data.operation_selected ?? [],
        champs: data.champs ?? [],
        description: data.description ?? "",
      };
      methods.reset(formattedData);
    }
  }, [data, methods]);

  const {
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    control,
  } = methods;

  const {
    data: dataTask,
    isError: isTaskError,
    isPending: isTaskPending,
    isSuccess: isTaskSuccess,
  } = useTaskFormats();

  const {
    data: formatsData,
    isError: isFormatsError,
    isPending: isFormatsPending,
    isSuccess: isFormatsSuccess,
  } = useFormats(dataTask?.format_check_task_id ?? "", {
    enabled: isTaskSuccess && !!dataTask?.format_check_task_id,
  });

  const navigate = useNavigate();
  const formatsSelected = useWatch({ control, name: "formats_selected" }) || [];
  const affichages = useWatch({ control, name: "affichages" }) || "";
  const operationValues =
    useWatch({ control, name: "operation_selected" }) || [];

  const mutation = useMutation({
    mutationFn: createRestitution,
    onSuccess: (data) => {
      toast.success("Restitution créée avec succès :", data.as_nom);
      navigate("/");
      methods.reset();
    },
    onError: (error) => {
      toast.error("Erreur lors de la création :");
    },
  });

  useEffect(() => {
    if (completOP) {
      methods.clearErrors("operation_selected");
    }
  }, [completOP, methods]);

  if (isLoading) return <p>Chargement...</p>;
  if (error) return <p>Erreur de chargement</p>;

  return (
    <>
      <Asides />

      <div className="md:pl-64 flex flex-col flex-1">
        <Header />

        <main className="flex-1">
          <UrlAjout />

          <div className="py-2">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900 my-3">
                Dupliquer une restitution
              </h1>
            </div>

            <div className="p-4 px-4 sm:px-6 md:px-8">
              <FormProvider {...methods}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const rawData = methods.getValues();
                    const cleanedData = removeIdsFromFormData(rawData);

                    // Vérification manuelle des prérequis
                    let hasError = false;

                    if (!rawData.nom || rawData.nom.length < 3) {
                      methods.setError("nom", {
                        type: "manual",
                        message: "Le nom doit contenir au moins 3 caractères",
                      });
                      hasError = true;
                    }

                    if (
                      !rawData.formats_selected ||
                      rawData.formats_selected.length < 1
                    ) {
                      methods.setError("formats_selected", {
                        type: "manual",
                        message: "Sélectionner au moins un format",
                      });
                      hasError = true;
                    }

                    if (!rawData.affichages || rawData.affichages.length < 1) {
                      methods.setError("affichages", {
                        type: "manual",
                        message: "L'affichage doit être choisi obligatoirement",
                      });
                      hasError = true;
                    }

                    if (
                      !rawData.operation_selected ||
                      rawData.operation_selected.length < 1
                    ) {
                      methods.setError("operation_selected", {
                        type: "manual",
                        message: "Effectuer au moins une opération",
                      });
                      hasError = true;
                    }

                    // Stop si au moins une erreur
                    if (hasError) return;

                    // Sinon on peut lancer la mutation
                    mutation.mutate(cleanedData);
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
                            className={`${divForm} ${
                              isFormatsError
                                ? "border-red-500 focus:ring-red-300"
                                : "border-gray-300 focus:ring-blue-300"
                            }`}
                          >
                            <label
                              htmlFor={`inputId-Format-error`}
                              className={labelForm}
                            >
                              Formats
                            </label>
                            <input
                              id={`inputId-Format-error`}
                              className={`${placeholderForm} truncate}`}
                              autoComplete="off"
                              disabled={true}
                            />
                          </div>
                          {isFormatsError && (
                            <p className={errorTextForm}>
                              Erreur lors du chargement des formats
                            </p>
                          )}
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

                  {/* Boutons */}
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
                      Générer
                    </button>
                  </div>
                </form>
              </FormProvider>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
