import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

export function useWaterQuality() {
  return useQuery({
    queryKey: ["/water-quality"],
    queryFn: async () => {
      const data = await apiRequest("GET", "/water-quality");
      return data.measurements || [];
    },
  });
}

export function useCreateWaterQuality() {
  return useMutation({
    mutationFn: (body) => {
      const payload = {
        pond_id: Number(body.pondId),
        measurement_date: new Date().toISOString().slice(0, 10),
        oxygen_level_mg_l: body.oxygenRate ? Number(body.oxygenRate) : null,
        temperature_c: body.temperature ? Number(body.temperature) : null,
        water_color: body.waterColor || null,
      };

      return apiRequest("POST", "/water-quality", payload);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["/water-quality"] }),
  });
}

export function useUpdateWaterQuality() {
  return useMutation({
    mutationFn: ({ id, body }) => {
      const payload = {
        pond_id: Number(body.pondId),
        measurement_date: new Date().toISOString().slice(0, 10),
        oxygen_level_mg_l: body.oxygenRate ? Number(body.oxygenRate) : null,
        temperature_c: body.temperature ? Number(body.temperature) : null,
        water_color: body.waterColor || null,
      };

      return apiRequest("PATCH", `/water-quality/${id}`, payload);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["/water-quality"] }),
  });
}

export function useDeleteWaterQuality() {
  return useMutation({
    mutationFn: (id) => apiRequest("DELETE", `/water-quality/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["/water-quality"] }),
  });
}