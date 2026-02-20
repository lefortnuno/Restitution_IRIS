import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/components/queries/axiosInstance";
import { RestitutionResponseType } from "./useRestitutions";
import { toast } from "react-toastify";

export const useDeleteRestitution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.delete(`/restitutions/${id}/`);
      return response.data;
    },
    onSuccess: () => {
      toast.success(`Restitution supprimée avec succès !`);
      queryClient.invalidateQueries({ queryKey: ["restitutions"] });
    },
  });
};

export function useDeleteBulkRestitutions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await axiosInstance.delete(
        "/restitutions/bulk_delete/",
        {
          data: { ids },
        }
      );
      return { ...response.data, deletedIds: ids };
    },

    // ✅ Suppression immédiate dans le cache
    onMutate: async (ids: number[]) => {
      toast.info(`Suppression de ${ids.length} restitution(s)...`);
      await queryClient.cancelQueries({ queryKey: ["restitutions"] });

      const previousData = queryClient.getQueryData<RestitutionResponseType>([
        "restitutions",
      ]);

      // Suppression des restitutions avec les IDs donnés
      queryClient.setQueryData(
        ["restitutions"],
        (old: RestitutionResponseType | undefined) => {
          if (!old) return old;

          return {
            ...old,
            restitutions: old.results.filter((r) => !ids.includes(r.id)),
          };
        }
      );

      return { previousData };
    },

    onError: (_err, _ids, context) => {
      // ✅ Restaurer les données si erreur
      toast.error("Erreur pendant la suppression.");
      if (context?.previousData) {
        queryClient.setQueryData(["restitutions"], context.previousData);
      }
    },

    onSuccess: async (data) => {
      const taskId = data.task_id;

      // ✅ Polling pour vérifier la vraie suppression
      pollTaskUntilSuccess(taskId, () => {
        toast.success("Suppression finalisée avec succès !");
        queryClient.invalidateQueries({ queryKey: ["restitutions"] });
      });
    },
  });
}

function pollTaskUntilSuccess(taskId: string, onSuccess: () => void) {
  const interval = 2000; // 2s
  const maxTries = 30;
  let tries = 0;

  const poll = async () => {
    if (tries >= maxTries) {
      toast.warning("Polling max atteint, opération non confirmée.");
      return;
    }

    try {
      const res = await axiosInstance.get(
        `/restitutions/check-task-status/${taskId}/`
      );
      const { status } = res.data; 

      if (status === "SUCCESS") {
        onSuccess();
      } else if (["FAILURE", "REVOKED"].includes(status)) {
        toast.error("La tâche a échoué ou a été annulée.");
      } else {
        tries++;
        setTimeout(poll, interval);
      }
    } catch (err) {
      console.error("Erreur lors du polling :", err);
      tries++;
      setTimeout(poll, interval); // On continue quand même à poller
    }
  };

  poll();
}
