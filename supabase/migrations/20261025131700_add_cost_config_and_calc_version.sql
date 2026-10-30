-- ============================================================================
-- Migration: 20261025131700_add_cost_config_and_calc_version.sql
-- Mục đích: 
-- 1. Thêm cột profiles.cost_config (JSONB), projects.cost_config_snapshot (JSONB),
--    projects.calc_version (INT DEFAULT 1), projects.client_address (TEXT).
-- 2. Backfill bản ghi profiles cho tài khoản auth.users đã có.
-- 3. Tạo Trigger handle_new_user tự động khởi tạo profile cho user mới (Security Definer).
-- 4. Ràng buộc CHECK qua hàm IMMUTABLE is_valid_cost_config và _cc_num_ok:
--    - Cho phép NULL; bắt buộc là JSON Object; giới hạn kích thước <= 4096 bytes.
--    - Kiểm tra đúng kiểu JSON number, ép kiểu an toàn và kiểm tra trần giá trị.
-- 5. Cấp quyền GRANT UPDATE cột profiles cho authenticated (không bọc DO EXCEPTION).
-- ============================================================================

-- 1. UP MIGRATION

-- 1.1. Thêm cột mới
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cost_config JSONB DEFAULT '{
  "suppliesRatePerSheet": 15000,
  "laborRatePerSheet": 120000,
  "hingesPerSheet": 2.0,
  "slidesPerSheet": 0.35
}'::jsonb;

COMMENT ON COLUMN public.profiles.cost_config IS 'Đơn giá & định mức xưởng: suppliesRatePerSheet, laborRatePerSheet, hingesPerSheet, slidesPerSheet';

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS cost_config_snapshot JSONB;

COMMENT ON COLUMN public.projects.cost_config_snapshot IS 'Snapshot cấu hình xưởng tại thời điểm tính giá của dự án';

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS calc_version INT NOT NULL DEFAULT 1;

COMMENT ON COLUMN public.projects.calc_version IS '1 = công thức hiện tại';

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS client_address TEXT;

COMMENT ON COLUMN public.projects.client_address IS 'Địa chỉ công trình / giao hàng của khách hàng';


-- 1.2. Backfill tài khoản đã có từ auth.users vào public.profiles
-- Ghi chú: profiles.email cho phép NULL nếu tài khoản đăng ký qua SĐT
INSERT INTO public.profiles (id, email)
SELECT id, email
FROM auth.users
ON CONFLICT (id) DO NOTHING;


-- 1.3. Trigger handle_new_user tự động tạo profile khi đăng ký
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;


-- 1.4. Hàm IMMUTABLE kiểm tra tính hợp lệ của cấu hình JSONB
CREATE OR REPLACE FUNCTION public._cc_num_ok(cfg jsonb, k text, maxv numeric)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN NOT (cfg ? k) THEN true
    WHEN jsonb_typeof(cfg->k) <> 'number' THEN false
    ELSE (cfg->>k)::numeric BETWEEN 0 AND maxv END;
$$;

CREATE OR REPLACE FUNCTION public.is_valid_cost_config(cfg jsonb)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN cfg IS NULL THEN true
    WHEN jsonb_typeof(cfg) <> 'object' THEN false
    WHEN octet_length(cfg::text) > 4096 THEN false
    WHEN NOT public._cc_num_ok(cfg, 'suppliesRatePerSheet', 500000) THEN false
    WHEN NOT public._cc_num_ok(cfg, 'laborRatePerSheet', 1000000) THEN false
    WHEN NOT public._cc_num_ok(cfg, 'hingesPerSheet', 20) THEN false
    WHEN NOT public._cc_num_ok(cfg, 'slidesPerSheet', 10) THEN false
    ELSE true END;
$$;

-- Ràng buộc CHECK trên bảng profiles và projects
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS chk_profiles_cost_config_range;

ALTER TABLE public.profiles
ADD CONSTRAINT chk_profiles_cost_config_range
CHECK (public.is_valid_cost_config(cost_config));

ALTER TABLE public.projects
DROP CONSTRAINT IF EXISTS chk_projects_cost_config_snapshot_range;

ALTER TABLE public.projects
ADD CONSTRAINT chk_projects_cost_config_snapshot_range
CHECK (public.is_valid_cost_config(cost_config_snapshot));


-- 1.5. Phân quyền cập nhật theo cột (Column-level privileges)
-- Viết thẳng, không bọc khối DO EXCEPTION để migration thất bại rõ ràng nếu lỗi.
-- TUYỆT ĐỐI KHÔNG cấp quyền cập nhật cho subscription_tier, email, id.
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


-- ============================================================================
-- 2. DOWN MIGRATION (ROLLBACK)
-- ============================================================================
/*
REVOKE UPDATE (cost_config) ON public.profiles FROM authenticated;

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS chk_projects_cost_config_snapshot_range;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS chk_profiles_cost_config_range;

DROP FUNCTION IF EXISTS public.is_valid_cost_config(jsonb);
DROP FUNCTION IF EXISTS public._cc_num_ok(jsonb, text, numeric);

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

ALTER TABLE public.projects DROP COLUMN IF EXISTS client_address;
ALTER TABLE public.projects DROP COLUMN IF EXISTS calc_version;
ALTER TABLE public.projects DROP COLUMN IF EXISTS cost_config_snapshot;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS cost_config;
*/
