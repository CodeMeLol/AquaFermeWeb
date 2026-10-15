import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

export function useFeedStock() {
  return useQuery({
    queryKey: ["/feed-stock"],
    queryFn: async () => {
      const data = await apiRequest("GET", "/feed-stock");
      return data || [];
    },
  });
}

export function useCreateFeedStock() {
  return useMutation({
    mutationFn: (body) => apiRequest("POST", "/feed-stock", body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["/feed-stock"] }),
  });
}

export function useUpdateFeedStock() {
  return useMutation({
    mutationFn: ({ id, body }) =>
      apiRequest("PATCH", `/feed-stock/${id}`, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["/feed-stock"] }),
  });
}

export function useDeleteFeedStock() {
  return useMutation({
    mutationFn: (id) => apiRequest("DELETE", `/feed-stock/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["/feed-stock"] }),
  });
}