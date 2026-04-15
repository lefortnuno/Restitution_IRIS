import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  restitutionFormSchema,
  RestitutionFormDataType,
  defaultRestitution,
} from "@/components/form/schema";
import { useTaskFormats, useFormats } from "@/components/queries/useFormats";
import { useMutation } from "@tanstack/react-query";
import { createRestitution } from "@/components/queries/useCRURestitution";
import { toast } from "react-toastify";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormPageLayout from "@/components/form/FormPageLayout";
import RestitutionFormBody from "@/components/form/RestitutionFormBody";

export default function AddForm() {
  const [completOP, setCompletOP] = useState<boolean>(false);
  const navigate = useNavigate();

  const methods = useForm<RestitutionFormDataType>({
    resolver: zodResolver(restitutionFormSchema),
    defaultValues: defaultRestitution,
    mode: "all",
  });

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

  return (
    <FormPageLayout titre="Paramétrer une restitution">
      <RestitutionFormBody
        methods={methods}
        submitLabel="Générer"
        completOP={completOP}
        setCompletOP={setCompletOP}
        onValidSubmit={(rawData) => mutation.mutate(rawData)}
        checkLlmmodeles
        isFormatsError={isFormatsError}
        isFormatsSuccess={isFormatsSuccess}
        formatsData={formatsData}
        isFormatsPending={isFormatsPending}
      />
    </FormPageLayout>
  );
}
