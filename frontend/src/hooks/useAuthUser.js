import { useQuery } from "@tanstack/react-query";

export const useAuthUser = () => {
  return useQuery({
    queryKey: ["authUser"],

    queryFn: async () => {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      const data = await res.json();

      // User is not logged in
      if (res.status === 401) {
        return null;
      }

      // Other errors
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      return data;
    },

    retry: false,
  });
};
