-- ============================================================================
-- MIGRATION NỀN SẠCH (BASELINE SCHEMA) ĐA THÀNH VIÊN VÀ BẢO MẬT RLS
-- File: 20261031084500_baseline_schema.sql
-- Áp dụng: Toàn bộ bảng, hàm trigger, kiểm tra IMMUTABLE và RLS policies
-- LƯU Ý BẢO MẬT: Mọi hàm SECURITY DEFINER đều có SET search_path = ''
--               Mọi policy dùng TO authenticated (không dùng TO public)
-- ============================================================================

-- 1. HÀM TIỆN ÍCH IMMUTABLE & SECURITY DEFINER

-- 1.1. Trigger tự động cập nhật timestamp updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

-- 1.2. Hàm kiểm tra trường số của JSONB
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

-- 1.3. Hàm kiểm tra tính hợp lệ của cấu hình chi phí xưởng cost_config
CREATE OR REPLACE FUNCTION public.is_valid_cost_config(cfg jsonb)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN cfg IS NULL THEN true
    WHEN jsonb_typeof(cfg) NOT IN ('object', 'array') THEN false
    WHEN octet_length(cfg::text) > 32768 THEN false
    WHEN NOT public._cc_num_ok(cfg, 'suppliesRatePerSheet', 500000) THEN false
    WHEN NOT public._cc_num_ok(cfg, 'laborRatePerSheet', 1000000) THEN false
    WHEN NOT public._cc_num_ok(cfg, 'hingesPerSheet', 50) THEN false
    WHEN NOT public._cc_num_ok(cfg, 'slidesPerSheet', 20) THEN false
    WHEN cfg ? 'costLines' AND (jsonb_typeof(cfg->'costLines') <> 'array' OR jsonb_array_length(cfg->'costLines') > 100) THEN false
    ELSE true END;
$$;


-- ============================================================================
-- 2. TẠO BẢNG DỮ LIỆU CỐT LÕI (CORE TABLES)
-- ============================================================================

-- 2.1. Tổ chức / Xưởng mộc (organizations)
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) <= 255),
  slug text UNIQUE CHECK (slug IS NULL OR char_length(slug) <= 100),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2.2. Thành viên tổ chức & Vai trò (org_members)
CREATE TABLE IF NOT EXISTS public.org_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'sales', 'viewer')),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- 2.3. Hồ sơ người dùng & Thiết lập cá nhân (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text CHECK (company_name IS NULL OR char_length(company_name) <= 255),
  logo_url text CHECK (logo_url IS NULL OR char_length(logo_url) <= 1024),
  phone text CHECK (phone IS NULL OR char_length(phone) <= 30),
  address text CHECK (address IS NULL OR char_length(address) <= 500),
  quote_terms text,
  bank_info text,
  cost_config jsonb,
  email text,
  active_org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_profiles_cost_config_range CHECK (public.is_valid_cost_config(cost_config))
);

-- 2.4. Bản quyền & Gói cước SaaS (subscriptions)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled')),
  current_period_end timestamptz,
  payment_provider text DEFAULT 'vietqr_sepay',
  last_payment_ref text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2.5. Danh mục vật tư đa loại của xưởng (catalog_items)
CREATE TABLE IF NOT EXISTS public.catalog_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  code text NOT NULL CHECK (char_length(code) <= 100),
  name text NOT NULL CHECK (char_length(name) <= 255),
  category text NOT NULL CHECK (category IN (
    'board', 'edge', 'hardware', 'supplies', 'surface',
    'face_material', 'equipment', 'labor', 'service', 'subcontract', 'other'
  )),
  unit text NOT NULL CHECK (char_length(unit) <= 50),
  unit_price numeric(14, 2) NOT NULL CHECK (unit_price >= 0),
  price_includes_vat boolean NOT NULL DEFAULT false,
  pack_size numeric(10, 2),
  pack_unit text,
  supplier_name text CHECK (supplier_name IS NULL OR char_length(supplier_name) <= 255),
  source text NOT NULL DEFAULT 'workshop_entered' CHECK (source IN ('default_reference', 'workshop_entered', 'project_override')),
  waste_factor numeric(6, 4) DEFAULT 1.0 CHECK (waste_factor >= 1.0 AND waste_factor <= 3.0),
  standard_length_mm numeric(8, 2),
  standard_width_mm numeric(8, 2),
  thickness_mm numeric(6, 2),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, code)
);

-- 2.6. Dự án bóc tách & báo giá (projects)
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  parent_project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  version_no int NOT NULL DEFAULT 1 CHECK (version_no >= 1),
  project_name text NOT NULL CHECK (char_length(project_name) <= 255),
  client_name text NOT NULL CHECK (char_length(client_name) <= 255),
  client_phone text CHECK (client_phone IS NULL OR char_length(client_phone) <= 30),
  client_address text CHECK (client_address IS NULL OR char_length(client_address) <= 500),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'quoted', 'ordered', 'approved', 'in_production', 'finalized')),
  profit_margin numeric(6, 4) NOT NULL DEFAULT 1.65 CHECK (profit_margin > 0 AND profit_margin <= 10.0),
  total_cost numeric(14, 2) NOT NULL DEFAULT 0 CHECK (total_cost >= 0),
  total_quote numeric(14, 2) NOT NULL DEFAULT 0 CHECK (total_quote >= 0),
  rounding_step int DEFAULT 50000,
  discount_amount numeric(14, 2) DEFAULT 0 CHECK (discount_amount >= 0),
  notes text,
  calc_version int NOT NULL DEFAULT 1 CHECK (calc_version >= 1),
  materials_snapshot jsonb,
  cost_config_snapshot jsonb,
  sections_snapshot jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_projects_cost_config_snapshot_range CHECK (public.is_valid_cost_config(cost_config_snapshot))
);

-- 2.7. Chi tiết phôi tấm Cutlist (project_items)
CREATE TABLE IF NOT EXISTS public.project_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  module_name text NOT NULL CHECK (char_length(module_name) <= 255),
  part_name text NOT NULL CHECK (char_length(part_name) <= 255),
  length_mm numeric(8, 2) NOT NULL CHECK (length_mm > 0),
  width_mm numeric(8, 2) NOT NULL CHECK (width_mm > 0),
  thickness_mm numeric(6, 2) NOT NULL DEFAULT 17 CHECK (thickness_mm > 0),
  qty int NOT NULL DEFAULT 1 CHECK (qty > 0 AND qty <= 10000),
  material_code text NOT NULL CHECK (char_length(material_code) <= 100),
  edge_l1 boolean NOT NULL DEFAULT false,
  edge_l2 boolean NOT NULL DEFAULT false,
  edge_w1 boolean NOT NULL DEFAULT false,
  edge_w2 boolean NOT NULL DEFAULT false,
  grain_direction text DEFAULT 'along_length',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2.8. Khách đăng ký tính năng mới (feature_leads)
CREATE TABLE IF NOT EXISTS public.feature_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  feature_key text NOT NULL CHECK (char_length(feature_key) <= 100),
  contact_email text CHECK (contact_email IS NULL OR char_length(contact_email) <= 255),
  contact_phone text CHECK (contact_phone IS NULL OR char_length(contact_phone) <= 30),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2.9. Nhật ký thay đổi dự án (project_audit_log)
CREATE TABLE IF NOT EXISTS public.project_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (char_length(action) <= 100),
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ============================================================================
-- 3. CHỈ MỤC TỐI ƯU HIỆU NĂNG (INDEXES)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON public.org_members(org_id);
CREATE INDEX IF NOT EXISTS idx_catalog_items_org_id ON public.catalog_items(org_id);
CREATE INDEX IF NOT EXISTS idx_projects_org_id ON public.projects(org_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_project_items_project_id ON public.project_items(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_project_id ON public.project_audit_log(project_id);


-- ============================================================================
-- 4. TRIGGER CẬP NHẬT UPDATED_AT
-- ============================================================================
CREATE OR REPLACE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_catalog_items_updated_at
  BEFORE UPDATE ON public.catalog_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================================
-- 5. TRIGGER ĐĂNG KÝ TỰ ĐỘNG (HANDLE_NEW_USER)
-- Khởi tạo đồng thời: Profile + Organization cá nhân + Org Member Owner + Gói Free
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  new_org_id uuid;
  user_email text;
  display_name text;
BEGIN
  user_email := new.email;
  display_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(user_email, '@', 1), 'Xưởng của tôi');

  -- 1. Tạo tổ chức mặc định
  INSERT INTO public.organizations (name, owner_id)
  VALUES (display_name || ' (Mặc định)', new.id)
  RETURNING id INTO new_org_id;

  -- 2. Gán quyền Owner trong org_members
  INSERT INTO public.org_members (org_id, user_id, role)
  VALUES (new_org_id, new.id, 'owner');

  -- 3. Khởi tạo gói cước free
  INSERT INTO public.subscriptions (org_id, tier, status)
  VALUES (new_org_id, 'free', 'active');

  -- 4. Tạo profile người dùng và liên kết active_org_id
  INSERT INTO public.profiles (id, email, company_name, active_org_id)
  VALUES (new.id, user_email, display_name, new_org_id)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    active_org_id = COALESCE(public.profiles.active_org_id, new_org_id);

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;


-- ============================================================================
-- 6. HÀM TRỢ GIÚP PHÂN QUYỀN RLS (SECURITY DEFINER)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_org_member(check_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members
    WHERE org_id = check_org_id AND user_id = (SELECT auth.uid())
  );
$$;

CREATE OR REPLACE FUNCTION public.get_org_role(check_org_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = ''
AS $$
  SELECT role FROM public.org_members
  WHERE org_id = check_org_id AND user_id = (SELECT auth.uid())
  LIMIT 1;
$$;


-- ============================================================================
-- 7. THIẾT LẬP BẢO MẬT CẤP HÀNG (ROW LEVEL SECURITY - RLS)
-- ============================================================================

-- Bật RLS trên toàn bộ 9 bảng
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_audit_log ENABLE ROW LEVEL SECURITY;

-- 7.1. Organizations Policies
CREATE POLICY "org_select_members" ON public.organizations
  FOR SELECT TO authenticated
  USING (public.is_org_member(id));

CREATE POLICY "org_update_owner" ON public.organizations
  FOR UPDATE TO authenticated
  USING (public.get_org_role(id) = 'owner')
  WITH CHECK (public.get_org_role(id) = 'owner');

-- 7.2. Org Members Policies
CREATE POLICY "org_members_select" ON public.org_members
  FOR SELECT TO authenticated
  USING (public.is_org_member(org_id));

CREATE POLICY "org_members_manage_owner" ON public.org_members
  FOR ALL TO authenticated
  USING (public.get_org_role(org_id) = 'owner')
  WITH CHECK (public.get_org_role(org_id) = 'owner');

-- 7.3. Profiles Policies
CREATE POLICY "profiles_select_own_or_member" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR (active_org_id IS NOT NULL AND public.is_org_member(active_org_id))
  );

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- 7.4. Subscriptions Policies (Client chỉ SELECT, không có policy ghi)
CREATE POLICY "subscriptions_select_member" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (public.is_org_member(org_id));

-- 7.5. Catalog Items Policies
CREATE POLICY "catalog_items_select" ON public.catalog_items
  FOR SELECT TO authenticated
  USING (public.is_org_member(org_id));

CREATE POLICY "catalog_items_write" ON public.catalog_items
  FOR ALL TO authenticated
  USING (
    public.is_org_member(org_id) 
    AND public.get_org_role(org_id) IN ('owner', 'sales')
  )
  WITH CHECK (
    public.is_org_member(org_id) 
    AND public.get_org_role(org_id) IN ('owner', 'sales')
  );

-- 7.6. Projects Policies
CREATE POLICY "projects_select" ON public.projects
  FOR SELECT TO authenticated
  USING (public.is_org_member(org_id));

CREATE POLICY "projects_write" ON public.projects
  FOR ALL TO authenticated
  USING (
    public.is_org_member(org_id) 
    AND public.get_org_role(org_id) IN ('owner', 'sales')
  )
  WITH CHECK (
    public.is_org_member(org_id) 
    AND public.get_org_role(org_id) IN ('owner', 'sales')
  );

-- 7.7. Project Items Policies (Khắc phục triệt để lỗ hổng cha - con)
CREATE POLICY "project_items_select" ON public.project_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_items.project_id
        AND public.is_org_member(p.org_id)
    )
  );

CREATE POLICY "project_items_write" ON public.project_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_items.project_id
        AND public.is_org_member(p.org_id)
        AND public.get_org_role(p.org_id) IN ('owner', 'sales')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_items.project_id
        AND public.is_org_member(p.org_id)
        AND public.get_org_role(p.org_id) IN ('owner', 'sales')
    )
  );

-- 7.8. Feature Leads Policies (Chỉ cho INSERT, chặn SELECT)
CREATE POLICY "feature_leads_insert" ON public.feature_leads
  FOR INSERT TO authenticated, anon
  WITH CHECK (
    user_id IS NULL OR user_id = (SELECT auth.uid())
  );

-- 7.9. Project Audit Log Policies
CREATE POLICY "audit_log_select" ON public.project_audit_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_audit_log.project_id
        AND public.is_org_member(p.org_id)
    )
  );

CREATE POLICY "audit_log_insert" ON public.project_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_audit_log.project_id
        AND public.is_org_member(p.org_id)
    )
  );


-- ============================================================================
-- 8. PHÂN QUYỀN CỘT BẢNG PROFILES (COLUMN-LEVEL PRIVILEGES)
-- Cấm tuyệt đối quyền sửa id, email, subscription_tier từ client
-- ============================================================================
REVOKE ALL ON public.profiles FROM authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (
  company_name,
  logo_url,
  phone,
  address,
  quote_terms,
  bank_info,
  cost_config,
  active_org_id,
  updated_at
) ON public.profiles TO authenticated;


-- ============================================================================
-- 9. DOWN MIGRATION (ROLLBACK TOÀN BỘ THEO THỨ TỰ NGƯỢC)
-- ============================================================================
/*
REVOKE ALL ON public.profiles FROM authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP FUNCTION IF EXISTS public.get_org_role(uuid);
DROP FUNCTION IF EXISTS public.is_org_member(uuid);

DROP TABLE IF EXISTS public.project_audit_log CASCADE;
DROP TABLE IF EXISTS public.feature_leads CASCADE;
DROP TABLE IF EXISTS public.project_items CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.catalog_items CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.org_members CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;

DROP FUNCTION IF EXISTS public.is_valid_cost_config(jsonb);
DROP FUNCTION IF EXISTS public._cc_num_ok(jsonb, text, numeric);
DROP FUNCTION IF EXISTS public.set_updated_at();
*/
