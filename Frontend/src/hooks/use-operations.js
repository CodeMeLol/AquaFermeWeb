import { useQuery, useMutation } from '@tanstack/react-query'
import { queryClient, apiRequest } from '@/lib/queryClient'

export function useOperations() {
  return useQuery({ queryKey: ['/api/operations'] })
}

export function useCreateOperation() {
  return useMutation({
    mutationFn: (body) => apiRequest('POST', '/operations', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/operations'] })
      queryClient.invalidateQueries({ queryKey: ['/ponds'] })
    },
  })
}
