-- name: SalesByDate :many
SELECT 
  DATE(s.created_at) as sale_date,
  COUNT(*) as total_transactions,
  COALESCE(SUM(s.total_amount), 0) as total_revenue
FROM sales s
WHERE s.created_at >= $1 AND s.created_at <= $2
GROUP BY DATE(s.created_at)
ORDER BY sale_date DESC;

-- name: TopProducts :many
SELECT 
  p.id,
  p.name,
  p.sku,
  SUM(si.qty) as total_qty_sold,
  COALESCE(SUM(si.subtotal), 0) as total_revenue
FROM sale_items si
JOIN products p ON si.product_id = p.id
JOIN sales s ON si.sale_id = s.id
WHERE s.created_at >= $1 AND s.created_at <= $2
GROUP BY p.id, p.name, p.sku
ORDER BY total_qty_sold DESC
LIMIT $3;

-- name: SalesByPaymentMethod :many
SELECT 
  payment_method,
  COUNT(*) as transaction_count,
  COALESCE(SUM(total_amount), 0) as total_amount
FROM sales
WHERE created_at >= $1 AND created_at <= $2
GROUP BY payment_method
ORDER BY total_amount DESC;

