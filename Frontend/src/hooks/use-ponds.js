import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";


export function usePonds() {
  return useQuery({
    queryKey: ["/ponds"],
    queryFn: () => apiRequest("GET", "/ponds"),
  });
}

export function useCreatePond() {
  return useMutation({
    mutationFn: (body) => apiRequest("POST", "/ponds", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/ponds"] }),
  });
}

export function useUpdatePond() {
  return useMutation({
    mutationFn: ({ id, body }) => apiRequest("PATCH", `/ponds/${id}`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/ponds"] }),
  });
}

export function useDeletePond() {
  return useMutation({
    mutationFn: (id) => apiRequest("DELETE", `/ponds/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/ponds"] }),
  });
}