-- seed-products.sql: shorthand redirect đến file đầy đủ
-- Chạy file insert-full-products.sql để seed toàn bộ dữ liệu
-- SOURCE insert-full-products.sql;

USE techshop_productdb;

-- Nếu chỉ muốn seed nhanh không tạo DB, dùng file này sau khi đã chạy insert-full-products.sql
-- File này giữ lại để tương thích ngược với các script CI/CD cũ

SELECT 'Vui lòng chạy insert-full-products.sql để seed đầy đủ dữ liệu' AS NOTE;
