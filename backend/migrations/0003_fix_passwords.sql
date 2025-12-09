-- Migration untuk memperbaiki password hash jika sudah ada data
-- Hash yang benar untuk password 'admin123'
-- Migration ini aman dijalankan berulang kali (idempotent)

UPDATE users 
SET password_hash = '$2a$10$CNOzCWi/hETyLApsaLPOOOCWRtUETAApBF8Mp0zkCdpNWEs26A0di' 
WHERE username = 'admin' 
  AND password_hash != '$2a$10$CNOzCWi/hETyLApsaLPOOOCWRtUETAApBF8Mp0zkCdpNWEs26A0di';

UPDATE users 
SET password_hash = '$2a$10$CNOzCWi/hETyLApsaLPOOOCWRtUETAApBF8Mp0zkCdpNWEs26A0di' 
WHERE username = 'cashier' 
  AND password_hash != '$2a$10$CNOzCWi/hETyLApsaLPOOOCWRtUETAApBF8Mp0zkCdpNWEs26A0di';

