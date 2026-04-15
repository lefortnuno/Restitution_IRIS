import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/components/queries/axiosInstance";

// ---------------------- TACHE APPEL LIST FORMATS EN ARRIERE PLAN
//
export interface FormatTaskResponseType {
  format_check_task_id: string;
}

const startTaskGetFormats = async (): Promise<FormatTaskResponseType> => {
  const response = await axiosInstance.get<FormatTaskResponseType>(
    "restitutions/get_formats/"
  );
  return response.data;
};

export const useTaskFormats = () =>
  useQuery<FormatTaskResponseType, Error>({
    queryKey: ["task_formats"],
    queryFn: startTaskGetFormats,
  });

// ---------------------- APPEL LIST FORMATS PRETES
//
export interface FormatType {
  id: number;
  name: string;
}

export interface FormatResponseType {
  status: string;
  task_id: string;
  result: FormatType[];
}

const fetchFormats = async (
  task_id: FormatResponseType["task_id"]
): Promise<FormatResponseType> => {
  const response = await axiosInstance.get<FormatResponseType>(
    `restitutions/check-task-status/${task_id}/`
  );

  return response.data;
};

export const useFormats = (
  task_id: FormatResponseType["task_id"],
  options: { enabled: boolean }
) =>
  useQuery<FormatResponseType, Error>({
    queryKey: ["formats", task_id],
    queryFn: () => fetchFormats(task_id),
    enabled: options.enabled,
    // Réessaye toutes les 1,5s tant que la tâche Celery n'est pas SUCCESS
    refetchInterval: (query) => {
      if (query.state.data?.status === "SUCCESS") return false;
      return 1500;
    },
  });
