-- 0002_seed.sql
-- Sample data untuk development dengan mata uang Rupiah (IDR)

-- Set search path to use the custom schema
SET search_path TO "pos-system-db", public;

-- Default admin user (password: admin123)
-- Note: Hash ini untuk development only. Generate yang baru untuk production
INSERT INTO users (username, password_hash, role) VALUES
('admin', '$2a$10$CNOzCWi/hETyLApsaLPOOOCWRtUETAApBF8Mp0zkCdpNWEs26A0di', 'admin'),
('cashier', '$2a$10$CNOzCWi/hETyLApsaLPOOOCWRtUETAApBF8Mp0zkCdpNWEs26A0di', 'cashier'),
('kasir_1', '$2a$10$CNOzCWi/hETyLApsaLPOOOCWRtUETAApBF8Mp0zkCdpNWEs26A0di', 'cashier'),
('kasir_2', '$2a$10$CNOzCWi/hETyLApsaLPOOOCWRtUETAApBF8Mp0zkCdpNWEs26A0di', 'cashier')
ON CONFLICT (username) DO UPDATE 
SET password_hash = EXCLUDED.password_hash;

-- Categories (Kategori produk umum untuk toko retail Indonesia)
INSERT INTO categories (name) VALUES
('Elektronik'),
('Makanan & Minuman'),
('Pakaian & Fashion'),
('Buku & Alat Tulis'),
('Kesehatan & Kecantikan'),
('Peralatan Rumah Tangga'),
('Mainan & Hobi'),
('Olahraga & Outdoor'),
('Otomotif'),
('Aksesoris & Gadget');

-- Products dengan harga dalam Rupiah
INSERT INTO products (sku, name, category_id, price, cost_price, unit) VALUES
-- Elektronik (Category 1)
('ELEC-001', 'Laptop ASUS VivoBook', 1, 7500000.00, 6500000.00, 'unit'),
('ELEC-002', 'Mouse Wireless Logitech', 1, 150000.00, 100000.00, 'unit'),
('ELEC-003', 'Keyboard Mechanical', 1, 850000.00, 600000.00, 'unit'),
('ELEC-004', 'Headset Gaming', 1, 350000.00, 250000.00, 'unit'),
('ELEC-005', 'Webcam HD 1080p', 1, 450000.00, 300000.00, 'unit'),
('ELEC-006', 'SSD External 1TB', 1, 1200000.00, 950000.00, 'unit'),
('ELEC-007', 'Power Bank 20000mAh', 1, 250000.00, 180000.00, 'unit'),
('ELEC-008', 'Speaker Bluetooth', 1, 400000.00, 280000.00, 'unit'),
('ELEC-009', 'Smart Watch', 1, 1800000.00, 1400000.00, 'unit'),
('ELEC-010', 'Earbuds TWS', 1, 300000.00, 200000.00, 'unit'),

-- Makanan & Minuman (Category 2)
('FOOD-001', 'Kopi Susu', 2, 15000.00, 8000.00, 'cup'),
('FOOD-002', 'Kopi Americano', 2, 12000.00, 6000.00, 'cup'),
('FOOD-003', 'Teh Manis', 2, 8000.00, 4000.00, 'cup'),
('FOOD-004', 'Jus Jeruk', 2, 15000.00, 8000.00, 'cup'),
('FOOD-005', 'Nasi Goreng', 2, 25000.00, 15000.00, 'porsi'),
('FOOD-006', 'Mie Goreng', 2, 22000.00, 13000.00, 'porsi'),
('FOOD-007', 'Sandwich Tuna', 2, 20000.00, 12000.00, 'unit'),
('FOOD-008', 'Donat', 2, 10000.00, 5000.00, 'unit'),
('FOOD-009', 'Roti Bakar', 2, 18000.00, 10000.00, 'porsi'),
('FOOD-010', 'Es Teh Manis', 2, 5000.00, 2500.00, 'cup'),
('FOOD-011', 'Kentang Goreng', 2, 15000.00, 8000.00, 'porsi'),
('FOOD-012', 'Pisang Goreng', 2, 12000.00, 6000.00, 'porsi'),
('FOOD-013', 'Air Mineral', 2, 5000.00, 3000.00, 'botol'),
('FOOD-014', 'Cappuccino', 2, 18000.00, 10000.00, 'cup'),
('FOOD-015', 'Milkshake', 2, 20000.00, 12000.00, 'cup'),

-- Pakaian & Fashion (Category 3)
('CLOTH-001', 'Kaos Polos Cotton', 3, 75000.00, 45000.00, 'unit'),
('CLOTH-002', 'Kemeja Batik', 3, 180000.00, 120000.00, 'unit'),
('CLOTH-003', 'Celana Jeans', 3, 250000.00, 180000.00, 'unit'),
('CLOTH-004', 'Jaket Hoodie', 3, 150000.00, 100000.00, 'unit'),
('CLOTH-005', 'Dress Wanita', 3, 200000.00, 140000.00, 'unit'),
('CLOTH-006', 'Rok Plisket', 3, 120000.00, 80000.00, 'unit'),
('CLOTH-007', 'Kaos Kaki (3 pasang)', 3, 35000.00, 20000.00, 'paket'),
('CLOTH-008', 'Topi Baseball', 3, 65000.00, 40000.00, 'unit'),
('CLOTH-009', 'Sepatu Sneakers', 3, 350000.00, 250000.00, 'pasang'),
('CLOTH-010', 'Sandal Jepit', 3, 45000.00, 25000.00, 'pasang'),

-- Buku & Alat Tulis (Category 4)
('BOOK-001', 'Buku Pemrograman Python', 4, 125000.00, 90000.00, 'unit'),
('BOOK-002', 'Novel Laskar Pelangi', 4, 85000.00, 60000.00, 'unit'),
('BOOK-003', 'Pensil 2B (1 lusin)', 4, 18000.00, 12000.00, 'lusin'),
('BOOK-004', 'Pulpen Gel (1 pak)', 4, 25000.00, 15000.00, 'pak'),
('BOOK-005', 'Buku Tulis 50 lembar', 4, 8000.00, 5000.00, 'unit'),
('BOOK-006', 'Penghapus Putih', 4, 3000.00, 1500.00, 'unit'),
('BOOK-007', 'Penggaris 30cm', 4, 5000.00, 3000.00, 'unit'),
('BOOK-008', 'Spidol Whiteboard (1 set)', 4, 35000.00, 22000.00, 'set'),
('BOOK-009', 'Map Plastik', 4, 4000.00, 2500.00, 'unit'),
('BOOK-010', 'Stabilo Highlighter', 4, 12000.00, 8000.00, 'unit'),

-- Kesehatan & Kecantikan (Category 5)
('HEALTH-001', 'Masker KN95 (1 box)', 5, 75000.00, 50000.00, 'box'),
('HEALTH-002', 'Hand Sanitizer 100ml', 5, 25000.00, 15000.00, 'botol'),
('HEALTH-003', 'Vitamin C 1000mg', 5, 85000.00, 60000.00, 'box'),
('HEALTH-004', 'Paracetamol (1 strip)', 5, 8000.00, 5000.00, 'strip'),
('HEALTH-005', 'Sabun Cuci Tangan', 5, 18000.00, 12000.00, 'botol'),
('HEALTH-006', 'Shampoo Anti Ketombe', 5, 35000.00, 24000.00, 'botol'),
('HEALTH-007', 'Body Lotion', 5, 45000.00, 30000.00, 'botol'),
('HEALTH-008', 'Lipstik Matte', 5, 55000.00, 35000.00, 'unit'),
('HEALTH-009', 'Sunscreen SPF 50', 5, 75000.00, 50000.00, 'tube'),
('HEALTH-010', 'Face Wash', 5, 40000.00, 28000.00, 'tube'),

-- Peralatan Rumah Tangga (Category 6)
('HOME-001', 'Piring Keramik (1 set)', 6, 120000.00, 80000.00, 'set'),
('HOME-002', 'Gelas Kaca (6 pcs)', 6, 45000.00, 30000.00, 'set'),
('HOME-003', 'Sendok Makan Stainless (6 pcs)', 6, 35000.00, 22000.00, 'set'),
('HOME-004', 'Wajan Anti Lengket', 6, 150000.00, 100000.00, 'unit'),
('HOME-005', 'Panci Presto', 6, 250000.00, 180000.00, 'unit'),
('HOME-006', 'Teko Listrik', 6, 180000.00, 130000.00, 'unit'),
('HOME-007', 'Blender', 6, 300000.00, 220000.00, 'unit'),
('HOME-008', 'Rice Cooker 1.8L', 6, 350000.00, 260000.00, 'unit'),
('HOME-009', 'Setrika Listrik', 6, 175000.00, 130000.00, 'unit'),
('HOME-010', 'Vacuum Cleaner Mini', 6, 450000.00, 340000.00, 'unit'),

-- Mainan & Hobi (Category 7)
('TOY-001', 'Lego City Set', 7, 450000.00, 320000.00, 'set'),
('TOY-002', 'Boneka Teddy Bear', 7, 85000.00, 55000.00, 'unit'),
('TOY-003', 'Puzzle 1000 pieces', 7, 120000.00, 85000.00, 'unit'),
('TOY-004', 'Mobil Remote Control', 7, 280000.00, 200000.00, 'unit'),
('TOY-005', 'Board Game Monopoly', 7, 175000.00, 125000.00, 'unit'),
('TOY-006', 'Action Figure Superhero', 7, 150000.00, 105000.00, 'unit'),
('TOY-007', 'Rubik Cube 3x3', 7, 45000.00, 30000.00, 'unit'),
('TOY-008', 'Drone Mini', 7, 550000.00, 420000.00, 'unit'),
('TOY-009', 'Sepeda Anak BMX', 7, 1200000.00, 950000.00, 'unit'),
('TOY-010', 'Bola Sepak', 7, 95000.00, 65000.00, 'unit'),

-- Olahraga & Outdoor (Category 8)
('SPORT-001', 'Raket Badminton', 8, 250000.00, 180000.00, 'unit'),
('SPORT-002', 'Matras Yoga', 8, 150000.00, 105000.00, 'unit'),
('SPORT-003', 'Dumbbell 5kg (sepasang)', 8, 180000.00, 130000.00, 'pasang'),
('SPORT-004', 'Sepatu Lari', 8, 450000.00, 330000.00, 'pasang'),
('SPORT-005', 'Tas Ransel 40L', 8, 350000.00, 250000.00, 'unit'),
('SPORT-006', 'Botol Minum Olahraga', 8, 55000.00, 35000.00, 'unit'),
('SPORT-007', 'Handuk Olahraga', 8, 45000.00, 30000.00, 'unit'),
('SPORT-008', 'Raket Tenis Meja (1 set)', 8, 120000.00, 85000.00, 'set'),
('SPORT-009', 'Bola Basket', 8, 180000.00, 130000.00, 'unit'),
('SPORT-010', 'Jump Rope', 8, 35000.00, 22000.00, 'unit'),

-- Otomotif (Category 9)
('AUTO-001', 'Oli Motor 1 Liter', 9, 55000.00, 38000.00, 'liter'),
('AUTO-002', 'Busi Motor (1 set)', 9, 45000.00, 30000.00, 'set'),
('AUTO-003', 'Aki Motor', 9, 350000.00, 260000.00, 'unit'),
('AUTO-004', 'Helm Full Face', 9, 450000.00, 330000.00, 'unit'),
('AUTO-005', 'Sarung Jok Motor', 9, 85000.00, 60000.00, 'set'),
('AUTO-006', 'Kaca Spion Motor', 9, 75000.00, 52000.00, 'pasang'),
('AUTO-007', 'Lampu LED Motor', 9, 120000.00, 85000.00, 'set'),
('AUTO-008', 'Cover Motor', 9, 95000.00, 65000.00, 'unit'),
('AUTO-009', 'Rantai Motor', 9, 180000.00, 130000.00, 'unit'),
('AUTO-010', 'Ban Motor (1 buah)', 9, 250000.00, 180000.00, 'unit'),

-- Aksesoris & Gadget (Category 10)
('ACC-001', 'Kabel USB Type-C 1m', 10, 35000.00, 22000.00, 'unit'),
('ACC-002', 'Charger Fast Charging', 10, 85000.00, 60000.00, 'unit'),
('ACC-003', 'Case HP Anti Crack', 10, 45000.00, 28000.00, 'unit'),
('ACC-004', 'Tempered Glass HP', 10, 35000.00, 22000.00, 'unit'),
('ACC-005', 'Ring Light Mini', 10, 120000.00, 85000.00, 'unit'),
('ACC-006', 'Tripod HP', 10, 75000.00, 50000.00, 'unit'),
('ACC-007', 'USB Hub 4 Port', 10, 95000.00, 65000.00, 'unit'),
('ACC-008', 'Card Reader', 10, 45000.00, 30000.00, 'unit'),
('ACC-009', 'Phone Stand', 10, 25000.00, 15000.00, 'unit'),
('ACC-010', 'Smartwatch Strap', 10, 55000.00, 35000.00, 'unit');

-- Inventory (Stock untuk setiap produk)
INSERT INTO inventory (product_id, qty) VALUES
-- Elektronik
(1, 8), (2, 45), (3, 25), (4, 30), (5, 20),
(6, 15), (7, 50), (8, 35), (9, 12), (10, 40),
-- Makanan & Minuman
(11, 150), (12, 120), (13, 200), (14, 180), (15, 100),
(16, 95), (17, 85), (18, 140), (19, 90), (20, 250),
(21, 110), (22, 130), (23, 300), (24, 160), (25, 145),
-- Pakaian & Fashion
(26, 50), (27, 35), (28, 40), (29, 45), (30, 38),
(31, 42), (32, 60), (33, 55), (34, 28), (35, 70),
-- Buku & Alat Tulis
(36, 30), (37, 25), (38, 80), (39, 90), (40, 150),
(41, 200), (42, 100), (43, 75), (44, 180), (45, 120),
-- Kesehatan & Kecantikan
(46, 65), (47, 85), (48, 55), (49, 120), (50, 95),
(51, 70), (52, 60), (53, 45), (54, 50), (55, 65),
-- Peralatan Rumah Tangga
(56, 35), (57, 48), (58, 52), (59, 28), (60, 22),
(61, 30), (62, 25), (63, 20), (64, 32), (65, 18),
-- Mainan & Hobi
(66, 20), (67, 35), (68, 28), (69, 15), (70, 25),
(71, 30), (72, 45), (73, 12), (74, 8), (75, 40),
-- Olahraga & Outdoor
(76, 22), (77, 30), (78, 25), (79, 18), (80, 20),
(81, 55), (82, 48), (83, 32), (84, 28), (85, 60),
-- Otomotif
(86, 50), (87, 40), (88, 15), (89, 25), (90, 30),
(91, 35), (92, 28), (93, 38), (94, 22), (95, 18),
-- Aksesoris & Gadget
(96, 80), (97, 55), (98, 90), (99, 85), (100, 35),
(101, 45), (102, 40), (103, 50), (104, 70), (105, 48);

-- Sample Sales Transactions (Transaksi penjualan contoh)
-- Transaction 1: Penjualan elektronik dan makanan
INSERT INTO sales (invoice_no, user_id, total_amount, paid_amount, change_amount, payment_method, created_at) VALUES
('INV-2026-0001', 2, 7665000.00, 8000000.00, 335000.00, 'cash', '2026-01-15 10:30:00'),
('INV-2026-0002', 2, 45000.00, 50000.00, 5000.00, 'cash', '2026-01-15 11:15:00'),
('INV-2026-0003', 3, 675000.00, 675000.00, 0.00, 'qris', '2026-01-15 13:45:00'),
('INV-2026-0004', 2, 125000.00, 150000.00, 25000.00, 'cash', '2026-01-16 09:20:00'),
('INV-2026-0005', 3, 850000.00, 850000.00, 0.00, 'debit', '2026-01-16 14:30:00'),
('INV-2026-0006', 2, 315000.00, 350000.00, 35000.00, 'cash', '2026-01-17 10:00:00'),
('INV-2026-0007', 3, 1550000.00, 1550000.00, 0.00, 'credit', '2026-01-17 15:20:00'),
('INV-2026-0008', 2, 75000.00, 100000.00, 25000.00, 'cash', '2026-01-18 11:30:00'),
('INV-2026-0009', 3, 280000.00, 300000.00, 20000.00, 'cash', '2026-01-18 16:45:00'),
('INV-2026-0010', 2, 1450000.00, 1450000.00, 0.00, 'qris', '2026-01-19 10:15:00');

-- Sale Items untuk setiap transaksi
-- Transaction 1: Laptop + Mouse
INSERT INTO sale_items (sale_id, product_id, qty, price, discount, subtotal) VALUES
(1, 1, 1, 7500000.00, 0.00, 7500000.00),
(1, 2, 1, 150000.00, 0.00, 150000.00),
(1, 11, 1, 15000.00, 0.00, 15000.00);

-- Transaction 2: Makanan & minuman
INSERT INTO sale_items (sale_id, product_id, qty, price, discount, subtotal) VALUES
(2, 11, 2, 15000.00, 0.00, 30000.00),
(2, 17, 1, 20000.00, 5000.00, 15000.00);

-- Transaction 3: Pakaian
INSERT INTO sale_items (sale_id, product_id, qty, price, discount, subtotal) VALUES
(3, 26, 3, 75000.00, 0.00, 225000.00),
(3, 28, 1, 250000.00, 0.00, 250000.00),
(3, 35, 2, 45000.00, 10000.00, 80000.00),
(3, 33, 2, 65000.00, 10000.00, 120000.00);

-- Transaction 4: Alat tulis
INSERT INTO sale_items (sale_id, product_id, qty, price, discount, subtotal) VALUES
(4, 36, 1, 125000.00, 0.00, 125000.00);

-- Transaction 5: Keyboard + Headset
INSERT INTO sale_items (sale_id, product_id, qty, price, discount, subtotal) VALUES
(5, 3, 1, 850000.00, 0.00, 850000.00);

-- Transaction 6: Kesehatan
INSERT INTO sale_items (sale_id, product_id, qty, price, discount, subtotal) VALUES
(6, 46, 3, 75000.00, 0.00, 225000.00),
(6, 47, 2, 25000.00, 0.00, 50000.00),
(6, 48, 1, 85000.00, 45000.00, 40000.00);

-- Transaction 7: Smart Watch + Accessories
INSERT INTO sale_items (sale_id, product_id, qty, price, discount, subtotal) VALUES
(7, 9, 1, 1800000.00, 250000.00, 1550000.00);

-- Transaction 8: Fashion accessories
INSERT INTO sale_items (sale_id, product_id, qty, price, discount, subtotal) VALUES
(8, 26, 1, 75000.00, 0.00, 75000.00);

-- Transaction 9: Mainan
INSERT INTO sale_items (sale_id, product_id, qty, price, discount, subtotal) VALUES
(9, 69, 1, 280000.00, 0.00, 280000.00);

-- Transaction 10: Rumah tangga
INSERT INTO sale_items (sale_id, product_id, qty, price, discount, subtotal) VALUES
(10, 62, 1, 300000.00, 0.00, 300000.00),
(10, 63, 1, 350000.00, 0.00, 350000.00),
(10, 64, 1, 175000.00, 0.00, 175000.00),
(10, 59, 1, 150000.00, 0.00, 150000.00),
(10, 46, 1, 75000.00, 0.00, 75000.00),
(10, 58, 2, 35000.00, 0.00, 70000.00),
(10, 61, 2, 180000.00, 0.00, 360000.00),
(10, 11, 10, 15000.00, 20000.00, 130000.00),
(10, 20, 10, 5000.00, 0.00, 50000.00),
(10, 23, 20, 5000.00, 10000.00, 90000.00);
