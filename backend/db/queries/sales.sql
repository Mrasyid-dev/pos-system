-- name: CreateSale :one
INSERT INTO sales (invoice_no, user_id, total_amount, paid_amount, change_amount, payment_method)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetSaleByID :one
SELECT s.*, u.username as cashier_name
FROM sales s
LEFT JOIN users u ON s.user_id = u.id
WHERE s.id = $1 LIMIT 1;

-- name: GetSaleByInvoice :one
SELECT s.*, u.username as cashier_name
FROM sales s
LEFT JOIN users u ON s.user_id = u.id
WHERE s.invoice_no = $1 LIMIT 1;

-- name: ListSales :many
SELECT s.*, u.username as cashier_name
FROM sales s
LEFT JOIN users u ON s.user_id = u.id
ORDER BY s.created_at DESC
LIMIT $1 OFFSET $2;

-- name: ListSalesByDateRange :many
SELECT s.*, u.username as cashier_name
FROM sales s
LEFT JOIN users u ON s.user_id = u.id
WHERE s.created_at >= $1 AND s.created_at <= $2
ORDER BY s.created_at DESC;

-- name: GetSalesStats :one
SELECT 
  COUNT(*) as total_sales,
  COALESCE(SUM(total_amount), 0) as total_revenue,
  COALESCE(AVG(total_amount), 0) as avg_sale_amount
FROM sales
WHERE created_at >= $1 AND created_at <= $2;

