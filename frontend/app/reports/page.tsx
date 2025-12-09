'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportsApi, SalesByDate } from '@/lib/reports'
import { format, subDays } from 'date-fns'

export default function ReportsPage() {
  const [from, setFrom] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [to, setTo] = useState(format(new Date(), 'yyyy-MM-dd'))

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['salesByDate', from, to],
    queryFn: () => reportsApi.getSales(from, to),
  })

  const { data: topProducts = [] } = useQuery({
    queryKey: ['topProducts', from, to],
    queryFn: () => reportsApi.getTopProducts(from, to, 20),
  })

  const exportToCSV = () => {
    const headers = ['Date', 'Transactions', 'Revenue']
    const rows = sales.map((s: SalesByDate) => [
      s.sale_date,
      s.total_transactions,
      s.total_revenue,
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-report-${from}-${to}.csv`
    a.click()
  }

  if (isLoading) return <div className="container mx-auto px-4 py-8">Loading...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sales Reports</h1>
        <button
          onClick={exportToCSV}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <h2 className="text-xl font-bold p-4 border-b">Sales by Date</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transactions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sales.map((sale: SalesByDate) => (
              <tr key={sale.sale_date}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{sale.sale_date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{sale.total_transactions}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">${parseFloat(sale.total_revenue).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-xl font-bold p-4 border-b">Top Products</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty Sold</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {topProducts.map((product) => (
              <tr key={product.product_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{product.product_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{product.sku || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{product.total_qty_sold}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">${parseFloat(product.total_revenue).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

