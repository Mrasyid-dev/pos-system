-- name: CreateProduct :one
INSERT INTO products (sku, name, category_id, price, cost_price, unit)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetProductByID :one
SELECT p.*, c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.id = $1 LIMIT 1;

-- name: GetProductBySKU :one
SELECT p.*, c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.sku = $1 LIMIT 1;

-- name: ListProducts :many
SELECT p.*, c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
ORDER BY p.created_at DESC;

-- name: SearchProducts :many
SELECT p.*, c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.name ILIKE '%' || $1 || '%' OR p.sku ILIKE '%' || $1 || '%'
ORDER BY p.name;

-- name: UpdateProduct :one
UPDATE products
SET sku = $2, name = $3, category_id = $4, price = $5, cost_price = $6, unit = $7
WHERE id = $1
RETURNING *;

-- name: DeleteProduct :exec
DELETE FROM products WHERE id = $1;

