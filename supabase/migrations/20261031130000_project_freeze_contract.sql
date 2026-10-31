-- ============================================================================
-- MIGRATION: ĐÓNG BĂNG DỰ ÁN KHI CHỐT HỢP ĐỒNG (P1 - GIAI ĐOẠN H1)
-- Timestamp: 20261031130000_project_freeze_contract.sql
-- Tuân thủ Rule 3 (có rollback DOWN, IF NOT EXISTS, RLS an toàn)
-- ============================================================================

-- 1. UP MIGRATION
-- Thêm các cột đóng băng hợp đồng vào bảng projects
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS frozen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS snapshot_totals JSONB;

-- Index hỗ trợ truy vấn lọc trạng thái khóa
CREATE INDEX IF NOT EXISTS idx_projects_is_locked ON public.projects(is_locked);
CREATE INDEX IF NOT EXISTS idx_projects_parent_id ON public.projects(parent_project_id);

-- 2. TRIGGER FUNCTION: CHẶN SỬA / XÓA / THÊM CHI TIẾT TẤM KHI DỰ ÁN ĐÃ KHÓA
CREATE OR REPLACE FUNCTION public.check_project_items_lock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_locked BOOLEAN;
  v_proj_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_proj_id := OLD.project_id;
  ELSE
    v_proj_id := NEW.project_id;
  END IF;

  SELECT is_locked INTO v_is_locked
  FROM public.projects
  WHERE id = v_proj_id;

  IF v_is_locked IS TRUE THEN
    RAISE EXCEPTION 'DỰ ÁN ĐÃ ĐƯỢC ĐÓNG BĂNG HỢP ĐỒNG (is_locked = true). Không thể thêm, sửa hoặc xóa chi tiết tấm phôi. Vui lòng tạo bản sửa đổi v2.';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_locked_project_items ON public.project_items;
CREATE TRIGGER trg_protect_locked_project_items
  BEFORE INSERT OR UPDATE OR DELETE ON public.project_items
  FOR EACH ROW
  EXECUTE FUNCTION public.check_project_items_lock();

-- 3. TRIGGER FUNCTION: TỰ ĐỘNG KHÓA KHI CHUYỂN SANG TRẠNG THÁI ĐÃ DUYỆT / ĐẶT HÀNG
CREATE OR REPLACE FUNCTION public.auto_freeze_project_on_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Các trạng thái chốt hợp đồng: approved, ordered, in_production, finalized
  IF NEW.status IN ('approved', 'ordered', 'in_production', 'finalized') AND (OLD.status IS NULL OR OLD.status NOT IN ('approved', 'ordered', 'in_production', 'finalized')) THEN
    NEW.is_locked := true;
    IF NEW.frozen_at IS NULL THEN
      NEW.frozen_at := now();
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_freeze_project ON public.projects;
CREATE TRIGGER trg_auto_freeze_project
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_freeze_project_on_approval();

-- ============================================================================
-- DOWN MIGRATION (ROLLBACK)
-- ============================================================================
/*
DROP TRIGGER IF EXISTS trg_protect_locked_project_items ON public.project_items;
DROP FUNCTION IF EXISTS public.check_project_items_lock();
DROP TRIGGER IF EXISTS trg_auto_freeze_project ON public.projects;
DROP FUNCTION IF EXISTS public.auto_freeze_project_on_approval();
DROP INDEX IF EXISTS public.idx_projects_is_locked;
DROP INDEX IF EXISTS public.idx_projects_parent_id;
ALTER TABLE public.projects
  DROP COLUMN IF EXISTS snapshot_totals,
  DROP COLUMN IF EXISTS frozen_at,
  DROP COLUMN IF EXISTS is_locked;
*/
