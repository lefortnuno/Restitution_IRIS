import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/components/queries/axiosInstance";

export interface RestitutionNavItem {
  id: number;
  nom: string;
  affichage: string | undefined;
}

const fetchAllRestitutionIds = async (): Promise<RestitutionNavItem[]> => {
  const page1 = await axiosInstance.get(`/restitutions/?page=1`);
  const count: number = page1.data.count;
  const totalPages = Math.ceil(count / 6);

  const allResults: any[] = [...page1.data.results];

  if (totalPages > 1) {
    const pagePromises = [];
    for (let p = 2; p <= totalPages; p++) {
      pagePromises.push(axiosInstance.get(`/restitutions/?page=${p}`));
    }
    const pages = await Promise.all(pagePromises);
    for (const page of pages) {
      allResults.push(...page.data.results);
    }
  }

  return allResults.map((r) => ({
    id: r.id,
    nom: r.nom,
    affichage: r.affichages?.[0]?.nom_affichage,
  }));
};

export const useAllRestitutionIds = () =>
  useQuery<RestitutionNavItem[], Error>({
    queryKey: ["all-restitution-ids"],
    queryFn: fetchAllRestitutionIds,
    staleTime: 60_000,
  });
