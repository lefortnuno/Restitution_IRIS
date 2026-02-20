import axiosInstance from "./axiosInstance";

export const fetcher = async <T>(url: string): Promise<T> => {
  const response = await axiosInstance.get<T>(url);
  return response.data;
};

export const createRestitution = async (data: any) => {
  const response = await axiosInstance.post("restitutions/", data);
  return response.data;
};

export const getRestitutionID = async (id: number) => {
  const response = await axiosInstance.get(`restitutions/parametrage/${id}/get_full_data/`);
  return response.data;
};

export const updateRestitutionID = async (id: number, data: any) => {
  const response = await axiosInstance.put(`restitutions/${id}/`, data);
  return response.data;
};
