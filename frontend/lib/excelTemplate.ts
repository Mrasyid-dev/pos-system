// Excel Template Export dengan Template File yang Bisa Diedit
// @ts-ignore - exceljs types
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ExcelJS from 'exceljs'

export interface TemplateData {
  // Header Information
  companyName: string
  customHeader?: string
  reportTitle: string
  periodFrom: string
  periodTo: string
  generatedAt: string
  
  // Sales Data
  sales: Array<{
    date: string
    transactions: number
    revenue: number
  }>
  
  // Top Products Data
  topProducts: Array<{
    productName: string
    sku: string
    quantitySold: number
    revenue: number
  }>
  
  // Summary
  totalTransactions: number
  totalRevenue: number
  totalQuantitySold: number
  totalProductsRevenue: number
}

// Placeholder markers yang akan dicari di template
const PLACEHOLDERS = {
  COMPANY_NAME: '{{COMPANY_NAME}}',
  CUSTOM_HEADER: '{{CUSTOM_HEADER}}',
  REPORT_TITLE: '{{REPORT_TITLE}}',
  PERIOD_FROM: '{{PERIOD_FROM}}',
  PERIOD_TO: '{{PERIOD_TO}}',
  GENERATED_AT: '{{GENERATED_AT}}',
  
  // Sales data markers
  SALES_START_ROW: '{{SALES_START_ROW}}',
  SALES_END_ROW: '{{SALES_END_ROW}}',
  
  // Top products markers
  PRODUCTS_START_ROW: '{{PRODUCTS_START_ROW}}',
  PRODUCTS_END_ROW: '{{PRODUCTS_END_ROW}}',
  
  // Summary markers
  TOTAL_TRANSACTIONS: '{{TOTAL_TRANSACTIONS}}',
  TOTAL_REVENUE: '{{TOTAL_REVENUE}}',
  TOTAL_QUANTITY_SOLD: '{{TOTAL_QUANTITY_SOLD}}',
  TOTAL_PRODUCTS_REVENUE: '{{TOTAL_PRODUCTS_REVENUE}}',
}

/**
 * Fill template Excel dengan data
 * @param templateFile File Excel template
 * @param data Data yang akan diisi
 * @returns Blob Excel file yang sudah terisi
 */
export async function fillExcelTemplate(
  templateFile: File,
  data: TemplateData
): Promise<Blob> {
  const workbook = new ExcelJS.Workbook()
  const arrayBuffer = await templateFile.arrayBuffer()
  await workbook.xlsx.load(arrayBuffer)
  
  const worksheet = workbook.getWorksheet(1) // Ambil worksheet pertama
  
  if (!worksheet) {
    throw new Error('Template Excel tidak memiliki worksheet')
  }
  
  // Replace placeholder di semua cell
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      if (cell.value && typeof cell.value === 'string') {
        let cellValue = cell.value
        
        // Replace header placeholders
        cellValue = cellValue.replace(PLACEHOLDERS.COMPANY_NAME, data.companyName)
        cellValue = cellValue.replace(PLACEHOLDERS.REPORT_TITLE, data.reportTitle)
        cellValue = cellValue.replace(PLACEHOLDERS.PERIOD_FROM, data.periodFrom)
        cellValue = cellValue.replace(PLACEHOLDERS.PERIOD_TO, data.periodTo)
        cellValue = cellValue.replace(PLACEHOLDERS.GENERATED_AT, data.generatedAt)
        
        if (data.customHeader) {
          cellValue = cellValue.replace(PLACEHOLDERS.CUSTOM_HEADER, data.customHeader)
        } else {
          cellValue = cellValue.replace(PLACEHOLDERS.CUSTOM_HEADER, '')
        }
        
        // Replace summary placeholders
        cellValue = cellValue.replace(PLACEHOLDERS.TOTAL_TRANSACTIONS, data.totalTransactions.toString())
        cellValue = cellValue.replace(PLACEHOLDERS.TOTAL_REVENUE, `$${data.totalRevenue.toFixed(2)}`)
        cellValue = cellValue.replace(PLACEHOLDERS.TOTAL_QUANTITY_SOLD, data.totalQuantitySold.toString())
        cellValue = cellValue.replace(PLACEHOLDERS.TOTAL_PRODUCTS_REVENUE, `$${data.totalProductsRevenue.toFixed(2)}`)
        
        // Handle sales data insertion
        if (cellValue.includes(PLACEHOLDERS.SALES_START_ROW)) {
          // Find the row with SALES_START_ROW marker
          const startRowIndex = rowNumber
          
          // Insert sales data rows
          data.sales.forEach((sale, index) => {
            const newRow = worksheet.getRow(startRowIndex + index)
            newRow.getCell(1).value = sale.date
            newRow.getCell(2).value = sale.transactions
            newRow.getCell(3).value = sale.revenue
            newRow.getCell(3).numFmt = '$#,##0.00'
          })
          
          // Remove the marker row
          worksheet.spliceRows(startRowIndex, 1)
          
          cellValue = '' // Clear marker
        }
        
        // Handle top products data insertion
        if (cellValue.includes(PLACEHOLDERS.PRODUCTS_START_ROW)) {
          const startRowIndex = rowNumber
          
          data.topProducts.forEach((product, index) => {
            const newRow = worksheet.getRow(startRowIndex + index)
            newRow.getCell(1).value = product.productName
            newRow.getCell(2).value = product.sku
            newRow.getCell(3).value = product.quantitySold
            newRow.getCell(4).value = product.revenue
            newRow.getCell(4).numFmt = '$#,##0.00'
          })
          
          worksheet.spliceRows(startRowIndex, 1)
          cellValue = ''
        }
        
        if (cellValue !== cell.value) {
          cell.value = cellValue
        }
      }
    })
  })
  
  // Insert sales data (alternative method - insert rows)
  let salesStartRow = -1
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      if (cell.value && typeof cell.value === 'string' && cell.value.includes(PLACEHOLDERS.SALES_START_ROW)) {
        salesStartRow = rowNumber
      }
    })
  })
  
  if (salesStartRow > 0) {
    // Remove marker row
    worksheet.spliceRows(salesStartRow, 1)
    
    // Insert sales data
    data.sales.forEach((sale, index) => {
      const row = worksheet.insertRow(salesStartRow + index, [
        sale.date,
        sale.transactions,
        sale.revenue
      ])
      row.getCell(3).numFmt = '$#,##0.00'
    })
  }
  
  // Insert top products data
  let productsStartRow = -1
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      if (cell.value && typeof cell.value === 'string' && cell.value.includes(PLACEHOLDERS.PRODUCTS_START_ROW)) {
        productsStartRow = rowNumber
      }
    })
  })
  
  if (productsStartRow > 0) {
    worksheet.spliceRows(productsStartRow, 1)
    
    data.topProducts.forEach((product, index) => {
      const row = worksheet.insertRow(productsStartRow + index, [
        product.productName,
        product.sku,
        product.quantitySold,
        product.revenue
      ])
      row.getCell(4).numFmt = '$#,##0.00'
    })
  }
  
  // Generate blob
  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

/**
 * Generate Excel tanpa template (create new dengan formatting)
 */
export async function generateExcelWithFormatting(
  data: TemplateData,
  reportType: 'sales' | 'top-products' | 'combined'
): Promise<Blob> {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Sales Report')
  
  let currentRow = 1
  
  // Header Section
  worksheet.getCell(currentRow, 1).value = data.companyName
  worksheet.getCell(currentRow, 1).font = { size: 16, bold: true }
  worksheet.mergeCells(currentRow, 1, currentRow, 4)
  currentRow++
  
  if (data.customHeader) {
    worksheet.getCell(currentRow, 1).value = data.customHeader
    worksheet.getCell(currentRow, 1).font = { italic: true }
    worksheet.mergeCells(currentRow, 1, currentRow, 4)
    currentRow++
  }
  
  worksheet.getCell(currentRow, 1).value = data.reportTitle
  worksheet.getCell(currentRow, 1).font = { size: 14, bold: true }
  worksheet.mergeCells(currentRow, 1, currentRow, 4)
  currentRow++
  
  worksheet.getCell(currentRow, 1).value = `Period: ${data.periodFrom} to ${data.periodTo}`
  worksheet.mergeCells(currentRow, 1, currentRow, 4)
  currentRow++
  
  worksheet.getCell(currentRow, 1).value = `Generated: ${data.generatedAt}`
  worksheet.mergeCells(currentRow, 1, currentRow, 4)
  currentRow += 2
  
  // Sales Table
  if (reportType === 'sales' || reportType === 'combined') {
    // Header
    const salesHeaderRow = worksheet.getRow(currentRow)
    salesHeaderRow.values = ['Date', 'Transactions', 'Revenue']
    salesHeaderRow.font = { bold: true }
    salesHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }
    
    // Add borders to header
    salesHeaderRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
    })
    currentRow++
    
    // Data rows
    data.sales.forEach((sale) => {
      const row = worksheet.getRow(currentRow)
      row.values = [sale.date, sale.transactions, sale.revenue]
      row.getCell(3).numFmt = '$#,##0.00'
      
      // Add borders
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })
      currentRow++
    })
    
    // Summary row
    const summaryRow = worksheet.getRow(currentRow)
    summaryRow.values = ['TOTAL', data.totalTransactions, data.totalRevenue]
    summaryRow.font = { bold: true }
    summaryRow.getCell(3).numFmt = '$#,##0.00'
    summaryRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })
    currentRow += 2
  }
  
  // Top Products Table
  if (reportType === 'top-products' || reportType === 'combined') {
    const productsHeaderRow = worksheet.getRow(currentRow)
    productsHeaderRow.values = ['Product Name', 'SKU', 'Quantity Sold', 'Revenue']
    productsHeaderRow.font = { bold: true }
    productsHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }
    
    productsHeaderRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
    })
    currentRow++
    
    data.topProducts.forEach((product) => {
      const row = worksheet.getRow(currentRow)
      row.values = [product.productName, product.sku, product.quantitySold, product.revenue]
      row.getCell(4).numFmt = '$#,##0.00'
      
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })
      currentRow++
    })
    
    const productsSummaryRow = worksheet.getRow(currentRow)
    productsSummaryRow.values = ['TOTAL', '', data.totalQuantitySold, data.totalProductsRevenue]
    productsSummaryRow.font = { bold: true }
    productsSummaryRow.getCell(4).numFmt = '$#,##0.00'
    productsSummaryRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })
  }
  
  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    if (!column || !column.eachCell) return
    let maxLength = 0
    column.eachCell({ includeEmpty: false }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 10
      if (columnLength > maxLength) {
        maxLength = columnLength
      }
    })
    column.width = maxLength < 10 ? 10 : maxLength + 2
  })
  
  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

