// Function untuk generate template Excel di browser (client-side)
// @ts-ignore - exceljs types
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ExcelJS from 'exceljs'

export async function generateTemplateExcel(): Promise<Blob> {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Sales Report')

  let currentRow = 1

  // Header Section
  // Row 1: Company Name
  const companyCell = worksheet.getCell(currentRow, 1)
  companyCell.value = '{{COMPANY_NAME}}'
  companyCell.font = { size: 16, bold: true }
  companyCell.alignment = { horizontal: 'center', vertical: 'middle' }
  worksheet.mergeCells(currentRow, 1, currentRow, 4)
  currentRow++

  // Row 2: Custom Header (Optional)
  const customHeaderCell = worksheet.getCell(currentRow, 1)
  customHeaderCell.value = '{{CUSTOM_HEADER}}'
  customHeaderCell.font = { italic: true }
  customHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' }
  worksheet.mergeCells(currentRow, 1, currentRow, 4)
  currentRow++

  // Row 3: Report Title
  const titleCell = worksheet.getCell(currentRow, 1)
  titleCell.value = '{{REPORT_TITLE}}'
  titleCell.font = { size: 14, bold: true }
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
  worksheet.mergeCells(currentRow, 1, currentRow, 4)
  currentRow++

  // Row 4: Period
  const periodCell = worksheet.getCell(currentRow, 1)
  periodCell.value = 'Period: {{PERIOD_FROM}} to {{PERIOD_TO}}'
  periodCell.alignment = { horizontal: 'center', vertical: 'middle' }
  worksheet.mergeCells(currentRow, 1, currentRow, 4)
  currentRow++

  // Row 5: Generated Date
  const generatedCell = worksheet.getCell(currentRow, 1)
  generatedCell.value = 'Generated: {{GENERATED_AT}}'
  generatedCell.alignment = { horizontal: 'center', vertical: 'middle' }
  worksheet.mergeCells(currentRow, 1, currentRow, 4)
  currentRow += 2 // Spacing

  // Sales Table Section
  // Row 7: Section Title
  const salesTitleCell = worksheet.getCell(currentRow, 1)
  salesTitleCell.value = 'SALES BY DATE'
  salesTitleCell.font = { bold: true, size: 12 }
  salesTitleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  }
  salesTitleCell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  }
  salesTitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
  worksheet.mergeCells(currentRow, 1, currentRow, 3)
  currentRow++

  // Row 8: Table Header
  const salesHeaderRow = worksheet.getRow(currentRow)
  salesHeaderRow.values = ['Date', 'Transactions', 'Revenue']
  salesHeaderRow.font = { bold: true }
  salesHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF0F0F0' }
  }
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

  // Row 9: Data Marker (akan diganti dengan data)
  const salesMarkerCell = worksheet.getCell(currentRow, 1)
  salesMarkerCell.value = '{{SALES_START_ROW}}'
  salesMarkerCell.font = { italic: true, color: { argb: 'FF999999' } }
  salesMarkerCell.note = 'This row will be replaced with sales data'
  currentRow++

  // Row 10: Summary Row
  const salesSummaryRow = worksheet.getRow(currentRow)
  salesSummaryRow.values = ['TOTAL', '{{TOTAL_TRANSACTIONS}}', '{{TOTAL_REVENUE}}']
  salesSummaryRow.font = { bold: true }
  salesSummaryRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'medium' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
    if (Number(cell.col) === 3) {
      cell.numFmt = '$#,##0.00'
    }
  })
  currentRow += 2 // Spacing

  // Top Products Table Section
  // Row 12: Section Title
  const productsTitleCell = worksheet.getCell(currentRow, 1)
  productsTitleCell.value = 'TOP PRODUCTS'
  productsTitleCell.font = { bold: true, size: 12 }
  productsTitleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  }
  productsTitleCell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  }
  productsTitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
  worksheet.mergeCells(currentRow, 1, currentRow, 4)
  currentRow++

  // Row 13: Table Header
  const productsHeaderRow = worksheet.getRow(currentRow)
  productsHeaderRow.values = ['Product Name', 'SKU', 'Quantity Sold', 'Revenue']
  productsHeaderRow.font = { bold: true }
  productsHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF0F0F0' }
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

  // Row 14: Data Marker
  const productsMarkerCell = worksheet.getCell(currentRow, 1)
  productsMarkerCell.value = '{{PRODUCTS_START_ROW}}'
  productsMarkerCell.font = { italic: true, color: { argb: 'FF999999' } }
  productsMarkerCell.note = 'This row will be replaced with products data'
  currentRow++

  // Row 15: Summary Row
  const productsSummaryRow = worksheet.getRow(currentRow)
  productsSummaryRow.values = ['TOTAL', '', '{{TOTAL_QUANTITY_SOLD}}', '{{TOTAL_PRODUCTS_REVENUE}}']
  productsSummaryRow.font = { bold: true }
  productsSummaryRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'medium' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
    if (Number(cell.col) === 4) {
      cell.numFmt = '$#,##0.00'
    }
  })

  // Set column widths
  worksheet.getColumn(1).width = 20 // Date / Product Name
  worksheet.getColumn(2).width = 15 // Transactions / SKU
  worksheet.getColumn(3).width = 15 // Revenue / Quantity
  worksheet.getColumn(4).width = 15 // Revenue (products)

  // Generate blob
  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  })
}

