import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  restitutionFormSchema,
  RestitutionFormDataType,
  defaultRestitution,
} from "@/components/form/schema";
import { useTaskFormats, useFormats } from "@/components/queries/useFormats";
import { createRestitution, getRestitutionID } from "@/components/queries/useCRURestitution";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { removeIdsFromFormData } from "@/components/types/cleanRestitutionData";
import { LoadingBar } from "@/components/ui/LoadingBar";
import FormPageLayout from "@/components/form/FormPageLayout";
import RestitutionFormBody from "@/components/form/RestitutionFormBody";

export default function DuplicateForm() {
  const [completOP, setCompletOP] = useState<boolean>(false);
  const { restitutionId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["restitution", restitutionId],
    queryFn: () => getRestitutionID(Number(restitutionId)),
    enabled: !!restitutionId,
  });

  const methods = useForm<RestitutionFormDataType>({
    resolver: zodResolver(restitutionFormSchema),
    defaultValues: defaultRestitution,
    mode: "all",
  });

  useEffect(() => {
    if (data) {
      methods.reset({
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
      });
    }
  }, [data, methods]);

  const { data: dataTask, isSuccess: isTaskSuccess } = useTaskFormats();
  const {
    data: formatsData,
    isError: isFormatsError,
    isPending: isFormatsPending,
    isSuccess: isFormatsSuccess,
  } = useFormats(dataTask?.format_check_task_id ?? "", {
    enabled: isTaskSuccess && !!dataTask?.format_check_task_id,
  });

  const mutation = useMutation({
    mutationFn: createRestitution,
    onSuccess: (data) => {
      toast.success("Restitution créée avec succès :", data.as_nom);
      navigate("/");
      methods.reset();
    },
    onError: () => {
      toast.error("Erreur lors de la création");
    },
  });

  if (isLoading) return <LoadingBar />;
  if (error) return <p>Erreur de chargement</p>;

  return (
    <FormPageLayout titre="Dupliquer une restitution">
      <RestitutionFormBody
        methods={methods}
        submitLabel="Générer"
        completOP={completOP}
        setCompletOP={setCompletOP}
        onValidSubmit={(rawData) => mutation.mutate(removeIdsFromFormData(rawData))}
        isFormatsError={isFormatsError}
        isFormatsSuccess={isFormatsSuccess}
        formatsData={formatsData}
        isFormatsPending={isFormatsPending}
      />
    </FormPageLayout>
  );
}
