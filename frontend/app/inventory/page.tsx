'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi, Inventory, AdjustInventoryRequest } from '@/lib/inventory'
import { productsApi } from '@/lib/products'

export default function InventoryPage() {
  const queryClient = useQueryClient()
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const [adjustData, setAdjustData] = useState({ delta: 0, reason: '' })

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryApi.list(),
  })

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.list(),
  })

  const adjustMutation = useMutation({
    mutationFn: (data: AdjustInventoryRequest) => inventoryApi.adjust(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      setShowAdjustModal(false)
      setAdjustData({ delta: 0, reason: '' })
    },
  })

  const handleAdjust = (productId: number) => {
    setSelectedProduct(productId)
    setShowAdjustModal(true)
  }

  const handleSubmitAdjust = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedProduct) {
      adjustMutation.mutate({
        product_id: selectedProduct,
        delta: adjustData.delta,
        reason: adjustData.reason,
      })
    }
  }

  if (isLoading) return <div className="container mx-auto px-4 py-8">Loading...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventory</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventory.map((item) => {
              const isLowStock = item.qty < 10
              return (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.product_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{item.sku || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{item.qty}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{item.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {isLowStock ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleAdjust(item.product_id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Adjust Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Adjust Inventory</h2>
            <form onSubmit={handleSubmitAdjust}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Product</label>
                <select
                  value={selectedProduct || ''}
                  onChange={(e) => setSelectedProduct(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Adjustment (positive to add, negative to subtract)
                </label>
                <input
                  type="number"
                  value={adjustData.delta}
                  onChange={(e) => setAdjustData({ ...adjustData, delta: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Reason</label>
                <textarea
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdjustModal(false)
                    setSelectedProduct(null)
                    setAdjustData({ delta: 0, reason: '' })
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                >
                  Adjust
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

