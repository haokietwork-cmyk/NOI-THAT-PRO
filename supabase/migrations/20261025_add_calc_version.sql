-- ============================================================================
-- Migration: 20261025_add_calc_version.sql
-- Mục đích: Thêm cột calc_version vào bảng projects để phân tách phiên bản tính toán:
--   - calc_version = 1: Phiên bản thuật toán cũ (Legacy V1 - trước Bước 2)
--   - calc_version = 2: Phiên bản thuật toán chuẩn xưởng mới (V2)
-- Bảo vệ nguyên tắc Snapshot Pricing: Dự án cũ không bao giờ bị nhảy số khi mở lại.
-- ============================================================================

-- 1. UP MIGRATION
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS calc_version INT DEFAULT 1;

-- Cập nhật toàn bộ dự án hiện có (nếu chưa có giá trị) về phiên bản 1 để bảo toàn giá trị lịch sử
UPDATE projects 
SET calc_version = 1 
WHERE calc_version IS NULL;

-- Bổ sung comment tài liệu hóa cho schema
COMMENT ON COLUMN projects.calc_version IS 'Phiên bản engine tính toán (1: Legacy V1, 2: Modern V2)';

-- ============================================================================
-- 2. DOWN MIGRATION (ROLLBACK)
-- Trong trường hợp cần rollback schema về trạng thái trước đó, chạy lệnh bên dưới:
-- ============================================================================
/*
ALTER TABLE projects DROP COLUMN IF EXISTS calc_version;
*/
