import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  restitutionFormSchema,
  RestitutionFormDataType,
  defaultRestitution,
} from "@/components/form/schema";
import { useTaskFormats, useFormats } from "@/components/queries/useFormats";
import { getRestitutionID, updateRestitutionID } from "@/components/queries/useCRURestitution";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { LoadingBar } from "@/components/ui/LoadingBar";
import FormPageLayout from "@/components/form/FormPageLayout";
import RestitutionFormBody from "@/components/form/RestitutionFormBody";

export default function UpdateForm() {
  const [completOP, setCompletOP] = useState<boolean>(false);
  const { restitutionId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["restitution", restitutionId],
    queryFn: () => getRestitutionID(Number(restitutionId)),
    enabled: !!restitutionId,
  });

  const methods = useForm<RestitutionFormDataType>({
    resolver: zodResolver(restitutionFormSchema),
    defaultValues: defaultRestitution,
    mode: "all",
  });

  const applyData = (d: typeof data) => {
    if (!d) return;
    methods.reset({
      nom: d.nom ?? "",
      status_llm: d.status_llm ?? true,
      formats_selected: d.formats_selected ?? [],
      jointures: d.jointures ?? [],
      filtres_pop: d.filtres_pop ?? [],
      affichages: d.affichages ?? [],
      llmmodeles: d.llmmodeles ?? [],
      operation_selected: d.operation_selected ?? [],
      champs: d.champs ?? [],
      description: d.description ?? "",
    });
  };

  useEffect(() => {
    applyData(data);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleRetry = async () => {
    const result = await refetch();
    if (result.data) applyData(result.data);
  };

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
    mutationFn: (formData: RestitutionFormDataType) =>
      updateRestitutionID(Number(restitutionId), formData),
    onSuccess: (data) => {
      toast.success(`Restitution mise à jour avec succès : ${data.as_nom}`);
      navigate("/");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });

  if (isLoading) return <LoadingBar />;

  return (
    <FormPageLayout titre="Modifier une restitution">
      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="text-sm font-medium">
            Impossible de charger les données de la restitution dans le formulaire.
          </p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shrink-0"
          >
            <RotateCcw size={13} />
            Réessayer
          </button>
        </div>
      )}
      <RestitutionFormBody
        methods={methods}
        submitLabel="Enregistrer"
        completOP={completOP}
        setCompletOP={setCompletOP}
        onValidSubmit={(rawData) => mutation.mutate(rawData)}
        isFormatsError={isFormatsError}
        isFormatsSuccess={isFormatsSuccess}
        formatsData={formatsData}
        isFormatsPending={isFormatsPending}
      />
    </FormPageLayout>
  );
}
