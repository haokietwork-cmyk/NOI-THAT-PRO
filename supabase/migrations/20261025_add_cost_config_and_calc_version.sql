-- ============================================================================
-- Migration: 20261025_add_cost_config_and_calc_version.sql
-- Mục đích: 
-- 1. Thêm cột profiles.cost_config (JSONB) lưu đơn giá & định mức xưởng.
-- 2. Thêm cột projects.cost_config_snapshot (JSONB) lưu snapshot cấu hình khi tạo dự án.
-- 3. Thêm cột projects.calc_version (INT) bảo vệ phiên bản công thức tính giá.
-- 4. Ràng buộc CHECK kiểm soát giá trị không âm và có trần vật lý/thị trường.
-- 5. Cấp quyền GRANT UPDATE cho authenticated users đối với cột cost_config;
--    TUYỆT ĐỐI KHÔNG cấp quyền update cho subscription_tier, email, id.
-- ============================================================================

-- 1. UP MIGRATION

-- 1.1. Cột cost_config trên bảng profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cost_config JSONB DEFAULT '{
  "suppliesRatePerSheet": 15000,
  "laborRatePerSheet": 120000,
  "hingesPerSheet": 2.0,
  "slidesPerSheet": 0.35
}'::jsonb;

COMMENT ON COLUMN public.profiles.cost_config IS 'Đơn giá & định mức xưởng: suppliesRatePerSheet, laborRatePerSheet, hingesPerSheet, slidesPerSheet';

-- CHECK constraint cho profiles.cost_config
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS chk_profiles_cost_config_range;

ALTER TABLE public.profiles
ADD CONSTRAINT chk_profiles_cost_config_range
CHECK (
  cost_config IS NULL OR (
    jsonb_typeof(cost_config) = 'object'
    AND ((cost_config->>'suppliesRatePerSheet')::numeric >= 0 AND (cost_config->>'suppliesRatePerSheet')::numeric <= 500000)
    AND ((cost_config->>'laborRatePerSheet')::numeric >= 0 AND (cost_config->>'laborRatePerSheet')::numeric <= 1000000)
    AND ((cost_config->>'hingesPerSheet')::numeric >= 0 AND (cost_config->>'hingesPerSheet')::numeric <= 20)
    AND ((cost_config->>'slidesPerSheet')::numeric >= 0 AND (cost_config->>'slidesPerSheet')::numeric <= 10)
  )
);

-- 1.2. Cột cost_config_snapshot và calc_version trên bảng projects
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS cost_config_snapshot JSONB;

COMMENT ON COLUMN public.projects.cost_config_snapshot IS 'Snapshot cấu hình xưởng tại thời điểm tính giá của dự án';

-- CHECK constraint cho projects.cost_config_snapshot
ALTER TABLE public.projects
DROP CONSTRAINT IF EXISTS chk_projects_cost_config_snapshot_range;

ALTER TABLE public.projects
ADD CONSTRAINT chk_projects_cost_config_snapshot_range
CHECK (
  cost_config_snapshot IS NULL OR (
    jsonb_typeof(cost_config_snapshot) = 'object'
    AND ((cost_config_snapshot->>'suppliesRatePerSheet')::numeric >= 0 AND (cost_config_snapshot->>'suppliesRatePerSheet')::numeric <= 500000)
    AND ((cost_config_snapshot->>'laborRatePerSheet')::numeric >= 0 AND (cost_config_snapshot->>'laborRatePerSheet')::numeric <= 1000000)
    AND ((cost_config_snapshot->>'hingesPerSheet')::numeric >= 0 AND (cost_config_snapshot->>'hingesPerSheet')::numeric <= 20)
    AND ((cost_config_snapshot->>'slidesPerSheet')::numeric >= 0 AND (cost_config_snapshot->>'slidesPerSheet')::numeric <= 10)
  )
);

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS calc_version INT NOT NULL DEFAULT 1;

COMMENT ON COLUMN public.projects.calc_version IS 'Phiên bản công thức tính giá: 1 = công thức hiện tại';

-- 1.3. Phân quyền cập nhật theo cột (Column-level privileges)
-- Cho phép authenticated update các trường thông tin xưởng + cost_config.
-- TUYỆT ĐỐI KHÔNG thêm subscription_tier, email, id để ngăn chặn leo thang đặc quyền.
DO $$
BEGIN
  -- Chỉ áp dụng GRANT nếu bảng profiles đã được cấp quyền theo cột
  GRANT UPDATE (
    company_name,
    logo_url,
    phone,
    address,
    quote_terms,
    bank_info,
    cost_config,
    updated_at
  ) ON public.profiles TO authenticated;
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback nếu môi trường chưa kích hoạt column-level grants
    NULL;
END $$;


-- ============================================================================
-- 2. DOWN MIGRATION (ROLLBACK)
-- ============================================================================
/*
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS chk_profiles_cost_config_range;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS cost_config;

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS chk_projects_cost_config_snapshot_range;
ALTER TABLE public.projects DROP COLUMN IF EXISTS cost_config_snapshot;
ALTER TABLE public.projects DROP COLUMN IF EXISTS calc_version;
*/
