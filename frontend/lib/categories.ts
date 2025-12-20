import api from './api'

export interface Category {
  id: number
  name: string
  created_at: string
}

export interface CreateCategoryRequest {
  name: string
}

export interface UpdateCategoryRequest {
  name: string
}

export const categoriesApi = {
  list: async (): Promise<Category[]> => {
    const response = await api.get('/categories')
    return response.data
  },
  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await api.post('/categories', data)
    return response.data
  },
  update: async (id: number, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, data)
    return response.data
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`)
  },
}

