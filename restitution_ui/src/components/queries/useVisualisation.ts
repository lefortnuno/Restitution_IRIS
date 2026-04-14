import axiosInstance from "./axiosInstance";

export const getRestitution = async (id: number) => {
  const res = await axiosInstance.get(`restitutions/${id}/`); 
  return res.data;
};

export const checkTableTaskStatus = async (
  taskId: string,
  page: number,
  page_size: number,
  ordering: string,
  search: any,
  advanced_filters: any[]
) => {
  const encodedFilters = encodeURIComponent(JSON.stringify(advanced_filters));

  const res = await axiosInstance.get(
    `restitutions/check-traitement-restitution-status/${taskId}/?page=${page}&page_size=${page_size}&ordering=${ordering}&search=${search}&advanced_filters=${encodedFilters}`
  ); 

  return res.data;
};

export const checkTaskStatus = async (taskId: string) => {
  const res = await axiosInstance.get(
    `restitutions/check-traitement-restitution-status/${taskId}/`
  );
  return res.data;
};

export const checkTaskLLMStatus = async (taskId: string) => {
  const res = await axiosInstance.get(
    `restitutions/check-llm-restitution-status/${taskId}/`
  );
  return res.data;
};

export const relancerLLM = async (restitutionId: number, taskId: string) => {
  const res = await axiosInstance.post(
    `restitutions/${restitutionId}/relancer_llm/`,
    { task_id: taskId }
  );
  return res.data;
};