-- 0002_seed.sql
-- Sample data for development

-- Default admin user (password: admin123)
-- Note: These hashes are for development only. Generate new ones for production using:
-- go run scripts/seed_password.go
-- Hash yang benar untuk password 'admin123' (generated and verified)
INSERT INTO users (username, password_hash, role) VALUES
('admin', '$2a$10$CNOzCWi/hETyLApsaLPOOOCWRtUETAApBF8Mp0zkCdpNWEs26A0di', 'admin'),
('cashier', '$2a$10$CNOzCWi/hETyLApsaLPOOOCWRtUETAApBF8Mp0zkCdpNWEs26A0di', 'cashier')
ON CONFLICT (username) DO UPDATE 
SET password_hash = EXCLUDED.password_hash;

-- Categories
INSERT INTO categories (name) VALUES
('Electronics'),
('Food & Beverages'),
('Clothing'),
('Books'),
('Home & Garden');

-- Products
INSERT INTO products (sku, name, category_id, price, cost_price, unit) VALUES
('ELEC-001', 'Laptop', 1, 1200.00, 900.00, 'unit'),
('ELEC-002', 'Mouse', 1, 25.00, 15.00, 'unit'),
('ELEC-003', 'Keyboard', 1, 75.00, 45.00, 'unit'),
('FOOD-001', 'Coffee', 2, 5.50, 3.00, 'cup'),
('FOOD-002', 'Sandwich', 2, 8.00, 4.50, 'unit'),
('CLOTH-001', 'T-Shirt', 3, 29.99, 15.00, 'unit'),
('CLOTH-002', 'Jeans', 3, 79.99, 40.00, 'unit'),
('BOOK-001', 'Programming Book', 4, 49.99, 25.00, 'unit'),
('HOME-001', 'Plant Pot', 5, 15.00, 8.00, 'unit');

-- Inventory
INSERT INTO inventory (product_id, qty) VALUES
(1, 10),
(2, 50),
(3, 30),
(4, 100),
(5, 50),
(6, 25),
(7, 15),
(8, 20),
(9, 40);

