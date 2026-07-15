import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } =
    useMutation({
      mutationFn: async (formData) => {
        try {
          const res = await fetch(`/api/users/update`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });

          const data = await res.json();
          if (!res.ok)
            throw new Error(data.error || "Failed to update profile");

          return data;
        } catch (error) {
          throw new Error(error.message);
        }
      },
      onSuccess: (_data, variables) => {
        toast.success("Profile updated successfully");

        queryClient.invalidateQueries({
          queryKey: ["userProfile", variables.username],
        });
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  return { updateProfile, isUpdatingProfile };
};
