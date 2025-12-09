import api from './api'

export interface SalesByDate {
  sale_date: string
  total_transactions: number
  total_revenue: string
}

export interface TopProduct {
  product_id: number
  product_name: string
  sku?: string
  total_qty_sold: number
  total_revenue: string
}

export interface SalesStats {
  total_sales: number
  total_revenue: string
  avg_sale_amount: string
}

export const reportsApi = {
  getSales: async (from: string, to: string): Promise<SalesByDate[]> => {
    const response = await api.get(`/reports/sales?from=${from}&to=${to}`)
    return response.data
  },
  getTopProducts: async (from: string, to: string, limit = 10): Promise<TopProduct[]> => {
    const response = await api.get(`/reports/top-products?from=${from}&to=${to}&limit=${limit}`)
    return response.data
  },
  getStats: async (from: string, to: string): Promise<SalesStats> => {
    const response = await api.get(`/reports/stats?from=${from}&to=${to}`)
    return response.data
  },
}

