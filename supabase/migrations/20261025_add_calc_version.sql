-- ============================================================================
-- Migration: 20261025_add_calc_version.sql
-- Mục đích: Thêm cột calc_version cho bảng projects.
-- Giá trị: 1 = công thức hiện tại (AutoCutlist Engine).
-- Ghi chú: Không backfill phức tạp vì chưa có dự án thật của khách hàng.
-- ============================================================================

-- 1. UP MIGRATION
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS calc_version INT NOT NULL DEFAULT 1;

COMMENT ON COLUMN projects.calc_version IS '1 = công thức hiện tại';

-- 2. DOWN MIGRATION (ROLLBACK)
/*
ALTER TABLE projects DROP COLUMN IF EXISTS calc_version;
*/
