import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/components/queries/axiosInstance";

// ---------------------- TACHE APPEL EN ARRIERE PLAN
//
export interface StructTableTaskResponseType {
  struct_table_check_task_id: string;
}
export const startTaskGetStructTable = async (
  id: number
): Promise<StructTableTaskResponseType> => {
  const response = await axiosInstance.get<StructTableTaskResponseType>(
    `restitutions/structure-table/${id}`
  );
  return response.data;
};

export const useTaskStructTable = (id: number) =>
  useQuery<StructTableTaskResponseType, Error>({
    queryKey: ["task_structTable"],
    queryFn: () => startTaskGetStructTable(id),
  });

// ---------------------- APPEL QUAND  PRETE
//
export interface StructTableType {
  id: number;
  name: string;
  type: string;
}

export interface StructTableResponseType {
  status: string;
  task_id: string;
  result: StructTableType[];
}

export const fetchStructTable = async (
  task_id: StructTableResponseType["task_id"]
): Promise<StructTableResponseType> => {
  const response = await axiosInstance.get<StructTableResponseType>(
    `restitutions/check-task-status/${task_id}/`
  );
  // console.log("appelle StrctTABLE=", response.data);

  return response.data;
};

export const getStructuresID = async (id: number) => {
  const response = await axiosInstance.get(`restitutions/parametrage/${id}/`);
  return response.data;
};

export const useStructTable = (
  task_id: StructTableResponseType["task_id"],
  options: { enabled: boolean }
) =>
  useQuery<StructTableResponseType, Error>({
    queryKey: ["structTable", task_id],
    queryFn: () => fetchStructTable(task_id),
    enabled: options.enabled,
  });
