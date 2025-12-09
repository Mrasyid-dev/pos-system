import api from './api'

export interface Product {
  id: number
  sku?: string
  name: string
  category_id?: number
  category_name?: string
  price: string
  cost_price?: string
  unit: string
  created_at: string
}

export interface CreateProductRequest {
  sku?: string
  name: string
  category_id?: number
  price: number
  cost_price?: number
  unit?: string
}

export const productsApi = {
  list: async (): Promise<Product[]> => {
    const response = await api.get('/products')
    return response.data
  },
  get: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },
  search: async (query: string): Promise<Product[]> => {
    const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`)
    return response.data
  },
  create: async (data: CreateProductRequest): Promise<Product> => {
    const response = await api.post('/products', data)
    return response.data
  },
  update: async (id: number, data: CreateProductRequest): Promise<Product> => {
    const response = await api.put(`/products/${id}`, data)
    return response.data
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`)
  },
}

