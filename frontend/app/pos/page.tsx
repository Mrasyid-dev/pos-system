'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi, Product } from '@/lib/products'
import { salesApi, CreateSaleRequest } from '@/lib/sales'
import { formatRupiah, formatRupiahWithDecimals } from '@/lib/currency'

interface CartItem {
  product: Product
  qty: number
  discount: number
}

export default function POSPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [showPayment, setShowPayment] = useState(false)
  const [paidAmount, setPaidAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')

  const { data: products = [] } = useQuery({
    queryKey: ['products', 'pos', 'search', searchQuery],
    queryFn: () => searchQuery ? productsApi.search(searchQuery) : productsApi.list(true), // only_available=true for POS
    enabled: searchQuery.length > 0 || true,
  })

  const createSaleMutation = useMutation({
    mutationFn: (data: CreateSaleRequest) => salesApi.create(data),
    onSuccess: () => {
      setCart([])
      setShowPayment(false)
      setPaidAmount('')
      alert('Sale completed successfully!')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to complete sale'
      alert(`Error: ${errorMessage}`)
    },
  })

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id)
    if (existing) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, qty: item.qty + 1 }
          : item
      ))
    } else {
      setCart([...cart, { product, qty: 1, discount: 0 }])
    }
  }

  const updateCartItem = (productId: number, qty: number, discount: number) => {
    if (qty <= 0) {
      setCart(cart.filter(item => item.product.id !== productId))
    } else {
      setCart(cart.map(item =>
        item.product.id === productId
          ? { ...item, qty, discount }
          : item
      ))
    }
  }

  const total = cart.reduce((sum, item) => {
    const price = parseFloat(item.product.price)
    return sum + (price * item.qty) - item.discount
  }, 0)

  const handleCheckout = () => {
    if (cart.length === 0) return
    setShowPayment(true)
  }

  const handlePayment = () => {
    const paid = parseFloat(paidAmount)
    if (paid < total) {
      alert('Paid amount is less than total')
      return
    }

    const saleData: CreateSaleRequest = {
      items: cart.map(item => ({
        product_id: item.product.id,
        qty: item.qty,
        price: parseFloat(item.product.price),
        discount: item.discount,
      })),
      paid_amount: paid,
      payment_method: paymentMethod,
    }

    createSaleMutation.mutate(saleData)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Search & List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Products</h2>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
            />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-sm text-gray-600">{product.sku}</div>
                  <div className="text-lg font-bold text-blue-600 mt-2">
                    {formatRupiah(parseFloat(product.price))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cart */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-2xl font-bold mb-4">Cart</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
              {cart.length === 0 ? (
                <p className="text-gray-500">Cart is empty</p>
              ) : (
                cart.map((item) => {
                  const price = parseFloat(item.product.price)
                  const subtotal = (price * item.qty) - item.discount
                  return (
                    <div key={item.product.id} className="border-b pb-2">
                      <div className="flex justify-between">
                        <span className="font-semibold">{item.product.name}</span>
                        <button
                          onClick={() => updateCartItem(item.product.id, 0, 0)}
                          className="text-red-500"
                        >
                          ×
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => updateCartItem(item.product.id, item.qty - 1, item.discount)}
                          className="px-2 py-1 bg-gray-200 rounded"
                        >
                          -
                        </button>
                        <span className="w-12 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateCartItem(item.product.id, item.qty + 1, item.discount)}
                          className="px-2 py-1 bg-gray-200 rounded"
                        >
                          +
                        </button>
                        <span className="ml-auto">{formatRupiah(subtotal)}</span>
                      </div>
                      <input
                        type="number"
                        placeholder="Discount"
                        value={item.discount || ''}
                        onChange={(e) => updateCartItem(item.product.id, item.qty, parseFloat(e.target.value) || 0)}
                        className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  )
                })
              )}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-bold mb-4">
                <span>Total:</span>
                <span>{formatRupiah(total)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Payment</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Total Amount</label>
              <div className="text-2xl font-bold">{formatRupiah(total)}</div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Paid Amount</label>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                step="0.01"
                min={total}
              />
            </div>
            {paidAmount && parseFloat(paidAmount) >= total && (
              <div className="mb-4 text-green-600 font-semibold">
                Change: {formatRupiah(parseFloat(paidAmount) - total)}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setShowPayment(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={!paidAmount || parseFloat(paidAmount) < total || createSaleMutation.isPending}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {createSaleMutation.isPending ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

