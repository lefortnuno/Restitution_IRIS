import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/components/queries/axiosInstance";

export interface RestitutionType {
  id: number;
  nom: string;
  created_at: string;
  updated_at: string;
  created_by: {
    id: number;
    username: string;
    first_name: string;
  } | null;
  affichages: {
    id: number;
    nom_affichage: string;
    type: string;
  }[];
}

export interface MoviesType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  affichage: string;
  created_by: string;
}

export interface RestitutionResponseType {
  count: number;
  next: string | null;
  previous: string | null;
  results: RestitutionType[]; 
}

const fetchRestitutions = async (
  page = 1,
  search = "",
  ordering = "",
): Promise<RestitutionResponseType> => {
  const response = await axiosInstance.get<RestitutionResponseType>(
    `/restitutions/?page=${page}&search=${search}&ordering=${ordering}`,
  );
  return response.data;
};

const useRestitutions = (page: number, search: string, ordering: string) =>
  useQuery<RestitutionResponseType, Error>({
    queryKey: ["restitutions", page, search, ordering],
    queryFn: () => fetchRestitutions(page, search, ordering),
  });

export default useRestitutions;
