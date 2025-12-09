import api from './api'

export interface Inventory {
  id: number
  product_id: number
  product_name: string
  sku?: string
  qty: number
  unit: string
  updated_at: string
}

export interface AdjustInventoryRequest {
  product_id: number
  delta: number
  reason?: string
}

export const inventoryApi = {
  list: async (): Promise<Inventory[]> => {
    const response = await api.get('/inventory')
    return response.data
  },
  get: async (productId: number): Promise<Inventory> => {
    const response = await api.get(`/inventory/${productId}`)
    return response.data
  },
  adjust: async (data: AdjustInventoryRequest): Promise<Inventory> => {
    const response = await api.post('/inventory/adjust', data)
    return response.data
  },
}

