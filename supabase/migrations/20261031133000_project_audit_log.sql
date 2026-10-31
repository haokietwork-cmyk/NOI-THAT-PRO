-- ============================================================================
-- MIGRATION: NHẬT KÝ THAY ĐỔI DỰ ÁN (PROJECT AUDIT LOG) - P1 / H2
-- Timestamp: 20261031133000_project_audit_log.sql
-- Tuân thủ Rule 3, Rule 4: Client KHÔNG THỂ can thiệp ghi log;
-- Chỉ Trigger / Security Definer ghi; RLS thành viên đọc; Không lưu PII.
-- ============================================================================

-- 1. BẢNG PROJECT_AUDIT_LOG
CREATE TABLE IF NOT EXISTS public.project_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'PRICE_CHANGED', 'BOM_FROZEN', 'STATUS_CHANGED', 'REVISION_CREATED', 'DRAFT_UNLOCKED'
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index tra cứu nhật ký dự án và sắp xếp thời gian
CREATE INDEX IF NOT EXISTS idx_audit_log_project_id ON public.project_audit_log(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_org_id ON public.project_audit_log(org_id);

-- 2. BẢO MẬT CẤP HÀNG (RLS) & PHÂN QUYỀN CHẶT CHẼ
ALTER TABLE public.project_audit_log ENABLE ROW LEVEL SECURITY;

-- Thu hồi toàn bộ quyền ghi từ client (authenticated và anon)
REVOKE INSERT, UPDATE, DELETE ON public.project_audit_log FROM anon, authenticated;
GRANT SELECT ON public.project_audit_log TO authenticated;

-- Chính sách: Thành viên tổ chức hoặc chủ dự án mới được đọc nhật ký
DROP POLICY IF EXISTS "Thành viên tổ chức xem nhật ký dự án" ON public.project_audit_log;
CREATE POLICY "Thành viên tổ chức xem nhật ký dự án"
  ON public.project_audit_log
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR (
      org_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_members.org_id = project_audit_log.org_id
          AND organization_members.user_id = (SELECT auth.uid())
      )
    )
  );

-- 3. TRIGGER FUNCTION: TỰ ĐỘNG GHI NHẬT KÝ THAY ĐỔI TỪ PHÍA SERVER
CREATE OR REPLACE FUNCTION public.log_project_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_details JSONB := '{}'::jsonb;
  v_user_id UUID;
BEGIN
  -- Lấy user_id từ session hiện tại nếu có
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    v_user_id := NEW.user_id;
  END IF;

  -- 1. Khi trạng thái dự án thay đổi (VD: draft -> quoted -> approved)
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.project_audit_log (project_id, org_id, user_id, action, details)
    VALUES (
      NEW.id,
      NEW.org_id,
      v_user_id,
      'STATUS_CHANGED',
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;

  -- 2. Khi dự án được đóng băng hợp đồng (is_locked chuyển từ false -> true)
  IF (OLD.is_locked IS NULL OR OLD.is_locked = false) AND NEW.is_locked = true THEN
    INSERT INTO public.project_audit_log (project_id, org_id, user_id, action, details)
    VALUES (
      NEW.id,
      NEW.org_id,
      v_user_id,
      'BOM_FROZEN',
      jsonb_build_object(
        'frozen_at', COALESCE(NEW.frozen_at, now()),
        'total_cost', NEW.total_cost,
        'total_quote', NEW.total_quote,
        'version_no', NEW.version_no
      )
    );
  END IF;

  -- 3. Khi giá dự toán thay đổi (sau khi đã có giá)
  IF OLD.total_quote IS NOT NULL 
     AND NEW.total_quote IS NOT NULL 
     AND (OLD.total_quote <> NEW.total_quote OR OLD.profit_margin <> NEW.profit_margin) THEN
    INSERT INTO public.project_audit_log (project_id, org_id, user_id, action, details)
    VALUES (
      NEW.id,
      NEW.org_id,
      v_user_id,
      'PRICE_CHANGED',
      jsonb_build_object(
        'old_total_quote', OLD.total_quote,
        'new_total_quote', NEW.total_quote,
        'old_margin', OLD.profit_margin,
        'new_margin', NEW.profit_margin
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_project_changes ON public.projects;
CREATE TRIGGER trg_audit_project_changes
  AFTER UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.log_project_changes();

-- ============================================================================
-- DOWN MIGRATION (ROLLBACK)
-- ============================================================================
/*
DROP TRIGGER IF EXISTS trg_audit_project_changes ON public.projects;
DROP FUNCTION IF EXISTS public.log_project_changes();
DROP POLICY IF EXISTS "Thành viên tổ chức xem nhật ký dự án" ON public.project_audit_log;
DROP TABLE IF EXISTS public.project_audit_log;
*/
