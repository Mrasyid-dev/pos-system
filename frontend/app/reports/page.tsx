'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportsApi, SalesByDate, TopProduct } from '@/lib/reports'
import { format, subDays } from 'date-fns'
import { exportReport, ExportFormat, ReportType, ExportOptions } from '@/lib/reportExport'
import { fillExcelTemplate, generateExcelWithFormatting, TemplateData } from '@/lib/excelTemplate'
import { generateTemplateExcel } from '@/lib/generateTemplate'
import { formatRupiah } from '@/lib/currency'

export default function ReportsPage() {
  const [from, setFrom] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [to, setTo] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv')
  const [reportType, setReportType] = useState<ReportType>('combined')
  const [companyName, setCompanyName] = useState('POS System')
  const [customHeader, setCustomHeader] = useState('')
  const [customFooter, setCustomFooter] = useState('')
  const [includeHeader, setIncludeHeader] = useState(true)
  const [includeFooter, setIncludeFooter] = useState(true)
  const [excelTemplate, setExcelTemplate] = useState<File | null>(null)
  const [useTemplate, setUseTemplate] = useState(false)
  const [exporting, setExporting] = useState(false)

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['salesByDate', from, to],
    queryFn: () => reportsApi.getSales(from, to),
  })

  const { data: topProducts = [] } = useQuery({
    queryKey: ['topProducts', from, to],
    queryFn: () => reportsApi.getTopProducts(from, to, 20),
  })

  const handleExport = () => {
    const options: ExportOptions = {
      format: exportFormat,
      reportType,
      includeHeader,
      includeFooter,
      companyName: companyName || undefined,
      customHeader: customHeader || undefined,
      customFooter: customFooter || undefined,
    }

    exportReport(sales, topProducts, options, from, to)
    setShowExportModal(false)
  }

  const quickExportCSV = () => {
    const options: ExportOptions = {
      format: 'csv',
      reportType: 'combined',
      includeHeader: true,
      includeFooter: true,
    }
    exportReport(sales, topProducts, options, from, to)
  }

  const handleExcelExport = async () => {
    if (exporting) return
    
    setExporting(true)
    try {
      // Prepare template data
      const templateData: TemplateData = {
        companyName: companyName || 'POS System',
        customHeader: customHeader || undefined,
        reportTitle: reportType === 'sales' 
          ? 'Sales Report' 
          : reportType === 'top-products'
          ? 'Top Products Report'
          : 'Combined Sales Report',
        periodFrom: from,
        periodTo: to,
        generatedAt: new Date().toLocaleString(),
        sales: sales.map(s => ({
          date: s.sale_date,
          transactions: s.total_transactions,
          revenue: parseFloat(s.total_revenue),
        })),
        topProducts: topProducts.map(p => ({
          productName: p.product_name,
          sku: p.sku || '-',
          quantitySold: p.total_qty_sold,
          revenue: parseFloat(p.total_revenue),
        })),
        totalTransactions: sales.reduce((sum, s) => sum + s.total_transactions, 0),
        totalRevenue: sales.reduce((sum, s) => sum + parseFloat(s.total_revenue), 0),
        totalQuantitySold: topProducts.reduce((sum, p) => sum + p.total_qty_sold, 0),
        totalProductsRevenue: topProducts.reduce((sum, p) => sum + parseFloat(p.total_revenue), 0),
      }

      let blob: Blob

      if (useTemplate && excelTemplate) {
        // Use uploaded template
        blob = await fillExcelTemplate(excelTemplate, templateData)
      } else {
        // Generate new Excel with formatting
        blob = await generateExcelWithFormatting(templateData, reportType)
      }

      // Download file
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      const filename = useTemplate && excelTemplate
        ? `report-${from}-${to}.xlsx`
        : `sales-report-${from}-${to}.xlsx`
      
      link.download = filename
      link.click()
      window.URL.revokeObjectURL(url)
      
      setShowExportModal(false)
    } catch (error) {
      console.error('Export error:', error)
      alert('Error exporting Excel. Please check console for details.')
    } finally {
      setExporting(false)
    }
  }

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setExcelTemplate(file)
        setUseTemplate(true)
      } else {
        alert('Please upload an Excel file (.xlsx or .xls)')
      }
    }
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sales Reports</h1>
        <div className="flex gap-2">
          <button
            onClick={quickExportCSV}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Quick Export CSV
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Export Excel
          </button>
        </div>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatRupiah(parseFloat(sale.total_revenue))}</td>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatRupiah(parseFloat(product.total_revenue))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Export Excel Report</h2>
            
            <div className="space-y-4">
              {/* Excel Template Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Excel Template (Optional)</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleTemplateUpload}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <button
                      onClick={async () => {
                        try {
                          const blob = await generateTemplateExcel()
                          const url = window.URL.createObjectURL(blob)
                          const link = document.createElement('a')
                          link.href = url
                          link.download = 'report-template.xlsx'
                          link.click()
                          window.URL.revokeObjectURL(url)
                        } catch (error) {
                          console.error('Error generating template:', error)
                          alert('Error generating template. Please check console.')
                        }
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm whitespace-nowrap"
                    >
                      Download Template
                    </button>
                  </div>
                  {excelTemplate && (
                    <div className="text-sm text-green-600">
                      ✓ Template loaded: {excelTemplate.name}
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Klik "Download Template" untuk mendapatkan template Excel dengan placeholder yang sudah disiapkan.
                    Atau upload template Excel custom Anda dengan placeholder seperti COMPANY_NAME, SALES_START_ROW, dll.
                  </p>
                  {excelTemplate && (
                    <button
                      onClick={() => {
                        setExcelTemplate(null)
                        setUseTemplate(false)
                      }}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove Template
                    </button>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Report Options</h3>

                {/* Report Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">Report Type</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as ReportType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled={useTemplate && excelTemplate !== null}
                  >
                    <option value="sales">Sales Report Only</option>
                    <option value="top-products">Top Products Only</option>
                    <option value="combined">Combined Report</option>
                  </select>
                  {useTemplate && excelTemplate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Report type ditentukan oleh template
                    </p>
                  )}
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="POS System"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* Custom Header */}
                <div>
                  <label className="block text-sm font-medium mb-2">Custom Header (Optional)</label>
                  <textarea
                    value={customHeader}
                    onChange={(e) => setCustomHeader(e.target.value)}
                    placeholder="e.g., Internal Use Only"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* Custom Footer */}
                <div>
                  <label className="block text-sm font-medium mb-2">Custom Footer (Optional)</label>
                  <textarea
                    value={customFooter}
                    onChange={(e) => setCustomFooter(e.target.value)}
                    placeholder="e.g., Confidential - For Management Only"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* Options - hanya untuk non-template */}
                {!useTemplate && (
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeHeader}
                        onChange={(e) => setIncludeHeader(e.target.checked)}
                        className="mr-2"
                      />
                      Include Header
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeFooter}
                        onChange={(e) => setIncludeFooter(e.target.checked)}
                        className="mr-2"
                      />
                      Include Footer
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <a
                href="/lib/EXCEL_TEMPLATE_GUIDE.md"
                target="_blank"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                📖 Lihat Panduan Template
              </a>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowExportModal(false)
                    setExcelTemplate(null)
                    setUseTemplate(false)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={exporting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleExcelExport}
                  disabled={exporting}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exporting ? 'Exporting...' : 'Export Excel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

