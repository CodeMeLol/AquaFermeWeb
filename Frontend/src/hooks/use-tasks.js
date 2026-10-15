import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

export function useTasks() {
  return useQuery({
    queryKey: ["/tasks"],
    queryFn: async () => {
      const data = await apiRequest("GET", "/tasks");
      return data.tasks || [];
    },
  });
}

export function useCreateTask() {
  return useMutation({
    mutationFn: (body) => apiRequest("POST", "/tasks", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/tasks"] }),
  });
}

export function useUpdateTask() {
  return useMutation({
    mutationFn: ({ id, status, body }) => {
      if (status) {
        return apiRequest("PATCH", `/tasks/${id}/status`, { status });
      }

      return apiRequest("PATCH", `/tasks/${id}`, body);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/tasks"] }),
  });
}

export function useDeleteTask() {
  return useMutation({
    mutationFn: (id) => apiRequest("DELETE", `/tasks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/tasks"] }),
  });
}