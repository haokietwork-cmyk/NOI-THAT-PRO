-- ============================================================================
-- Migration: 20261025_add_calc_version.sql
-- Mục đích: Thêm cột calc_version vào bảng projects để phân tách phiên bản tính toán:
--   - calc_version = 1: Phiên bản thuật toán cũ (Legacy V1 - trước Bước 2)
--   - calc_version = 2: Phiên bản thuật toán chuẩn xưởng mới (V2)
-- 
-- THỨ TỰ THỰC THI (Tuân thủ nghiêm ngặt chuẩn Database Migration):
--   Bước 1: ADD COLUMN calc_version INT (không default)
--   Bước 2: UPDATE toàn bộ dự án hiện có thành calc_version = 1
--   Bước 3: SET DEFAULT 2 cho các dự án mới tạo trong tương lai
--   Bước 4: SET NOT NULL để khóa chặt tính toàn vẹn dữ liệu
-- ============================================================================

-- ============================================================================
-- 1. UP MIGRATION
-- ============================================================================

-- Bước 1: Thêm cột calc_version chưa có giá trị mặc định
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS calc_version INT;

-- Bước 2: Backfill toàn bộ các dự án cũ đã lưu về phiên bản 1 (Legacy V1)
UPDATE projects 
SET calc_version = 1 
WHERE calc_version IS NULL;

-- Bước 3: Đặt giá trị mặc định là 2 cho mọi bản ghi INSERT mới từ nay về sau
ALTER TABLE projects 
ALTER COLUMN calc_version SET DEFAULT 2;

-- Bước 4: Khóa chặt ràng buộc NOT NULL
ALTER TABLE projects 
ALTER COLUMN calc_version SET NOT NULL;

-- Bổ sung comment tài liệu hóa cho schema
COMMENT ON COLUMN projects.calc_version IS 'Phiên bản engine tính toán (1: Legacy V1, 2: Modern V2 - Default cho dự án mới)';

-- ============================================================================
-- 2. DOWN MIGRATION (ROLLBACK)
-- Để hoàn tác toàn bộ migration này, chạy câu lệnh bên dưới:
-- ============================================================================
/*
ALTER TABLE projects DROP COLUMN IF EXISTS calc_version;
*/
