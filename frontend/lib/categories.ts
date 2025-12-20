import api from './api'

export interface Category {
  id: number
  name: string
  created_at: string
}

export const categoriesApi = {
  list: async (): Promise<Category[]> => {
    const response = await api.get('/categories')
    return response.data
  },
}

