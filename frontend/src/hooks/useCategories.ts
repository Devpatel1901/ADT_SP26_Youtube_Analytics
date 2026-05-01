import { useQuery } from '@tanstack/react-query'
import { Categories } from '@/api/endpoints'

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: Categories.list, staleTime: 5 * 60 * 1000 })
}
