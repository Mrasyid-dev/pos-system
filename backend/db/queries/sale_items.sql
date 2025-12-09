-- name: CreateSaleItem :one
INSERT INTO sale_items (sale_id, product_id, qty, price, discount, subtotal)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetSaleItemsBySaleID :many
SELECT si.*, p.name as product_name, p.sku
FROM sale_items si
JOIN products p ON si.product_id = p.id
WHERE si.sale_id = $1
ORDER BY si.id;

-- name: GetSaleItemsByProductID :many
SELECT si.*, s.invoice_no, s.created_at as sale_date
FROM sale_items si
JOIN sales s ON si.sale_id = s.id
WHERE si.product_id = $1
ORDER BY s.created_at DESC;

