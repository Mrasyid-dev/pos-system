-- name: GetInventoryByProduct :one
SELECT * FROM inventory
WHERE product_id = $1 LIMIT 1;

-- name: CreateInventory :one
INSERT INTO inventory (product_id, qty)
VALUES ($1, $2)
RETURNING *;

-- name: UpdateInventoryQty :one
UPDATE inventory
SET qty = $2, updated_at = now()
WHERE product_id = $1
RETURNING *;

-- name: AdjustInventoryQty :one
UPDATE inventory
SET qty = qty + $2, updated_at = now()
WHERE product_id = $1
RETURNING *;

-- name: ListInventory :many
SELECT i.*, p.name as product_name, p.sku, p.unit
FROM inventory i
JOIN products p ON i.product_id = p.id
ORDER BY p.name;

-- name: GetLowStockItems :many
SELECT i.*, p.name as product_name, p.sku, p.unit
FROM inventory i
JOIN products p ON i.product_id = p.id
WHERE i.qty <= $1
ORDER BY i.qty ASC;

