import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useFollow = () => {
  const queryClient = useQueryClient();

  const { mutate: follow, isPending } = useMutation({
    mutationFn: async (userId) => {
      try {
        const res = await fetch(`/api/users/follow/${userId}`, {
          method: "POST",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to follow user");
        }

        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    onSuccess: async () => {
      // toast.success("Success");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["suggestedUsers"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["authUser"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["userProfile"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["posts"],
        }),
      ]);
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { follow, isPending };
};
