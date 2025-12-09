import api from './api'

export interface SaleItem {
  product_id: number
  qty: number
  price: number
  discount?: number
}

export interface CreateSaleRequest {
  items: SaleItem[]
  paid_amount: number
  payment_method: string
}

export interface SaleItemResponse {
  id: number
  product_id: number
  product_name: string
  sku?: string
  qty: number
  price: string
  discount: string
  subtotal: string
}

export interface Sale {
  id: number
  invoice_no: string
  user_id?: number
  cashier_name?: string
  total_amount: string
  paid_amount: string
  change_amount: string
  payment_method?: string
  items: SaleItemResponse[]
  created_at: string
}

export const salesApi = {
  create: async (data: CreateSaleRequest): Promise<Sale> => {
    const response = await api.post('/sales', data)
    return response.data
  },
  get: async (id: number): Promise<Sale> => {
    const response = await api.get(`/sales/${id}`)
    return response.data
  },
  list: async (limit = 50, offset = 0): Promise<Sale[]> => {
    const response = await api.get(`/sales?limit=${limit}&offset=${offset}`)
    return response.data
  },
}

