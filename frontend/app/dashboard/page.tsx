'use client'

import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '@/lib/reports'
import { format, subDays } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { formatRupiah } from '@/lib/currency'

export default function DashboardPage() {
  const to = format(new Date(), 'yyyy-MM-dd')
  const from = format(subDays(new Date(), 30), 'yyyy-MM-dd')

  const { data: stats } = useQuery({
    queryKey: ['stats', from, to],
    queryFn: () => reportsApi.getStats(from, to),
  })

  const { data: salesByDate = [] } = useQuery({
    queryKey: ['salesByDate', from, to],
    queryFn: () => reportsApi.getSales(from, to),
  })

  const { data: topProducts = [] } = useQuery({
    queryKey: ['topProducts', from, to],
    queryFn: () => reportsApi.getTopProducts(from, to, 5),
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Sales</h3>
          <p className="text-3xl font-bold">{stats?.total_sales || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold">{formatRupiah(parseFloat(stats?.total_revenue || '0'))}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Average Sale</h3>
          <p className="text-3xl font-bold">{formatRupiah(parseFloat(stats?.avg_sale_amount || '0'))}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Sales Trend (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesByDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sale_date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total_revenue" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Top Products</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="product_name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total_qty_sold" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Top Selling Products</h2>
        <div className="overflow-x-auto">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{product.total_qty_sold}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{formatRupiah(parseFloat(product.total_revenue))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

