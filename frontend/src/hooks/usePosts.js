import { useQuery } from "@tanstack/react-query";

export const usePosts = () => {
  return useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await fetch("/api/posts");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error fetching posts");

      return data;
    },
  });
};
