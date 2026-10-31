-- ==============================================================================
-- MIGRATION: BẢNG CHIA SẺ BÁO GIÁ AN TOÀN (SECURE QUOTE SHARES)
-- File: supabase/migrations/20261031120000_quote_shares.sql
-- Mục tiêu: Lưu trữ token chia sẻ báo giá an toàn (bằng SHA-256 hash),
--           bảo toàn dữ liệu đã che ở server, hỗ trợ đặt hạn và thu hồi link.
-- ==============================================================================

-- 1. TẠO BẢNG QUOTE_SHARES
CREATE TABLE IF NOT EXISTS public.quote_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    customer_payload JSONB NOT NULL,
    version_no INT NOT NULL DEFAULT 1,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    access_count INT NOT NULL DEFAULT 0,

    -- Kiểm tra tính hợp lệ của JSON payload: Bắt buộc là object và kích thước <= 500KB
    CONSTRAINT check_quote_shares_payload_valid CHECK (
        jsonb_typeof(customer_payload) = 'object'
        AND pg_column_size(customer_payload) <= 512000
    ),
    -- Kiểm tra số thứ tự phiên bản
    CONSTRAINT check_quote_shares_version_positive CHECK (
        version_no >= 1
    )
);

COMMENT ON TABLE public.quote_shares IS 'Bảng lưu trữ liên kết chia sẻ báo giá A4 cho khách hàng với token hash bảo mật';
COMMENT ON COLUMN public.quote_shares.token_hash IS 'SHA-256 hash của token ngẫu nhiên 32-byte; DB không lưu token gốc';
COMMENT ON COLUMN public.quote_shares.customer_payload IS 'Báo giá đã được che sạch ở server (không giá vốn, không hao hụt, không chi tiết phôi)';
COMMENT ON COLUMN public.quote_shares.revoked_at IS 'Thời điểm chủ xưởng chủ động thu hồi link (NULL = đang hoạt động)';

-- 2. CHỈ MỤC TỐI ƯU TRUY VẤN
CREATE INDEX IF NOT EXISTS idx_quote_shares_token_hash ON public.quote_shares(token_hash);
CREATE INDEX IF NOT EXISTS idx_quote_shares_project_id ON public.quote_shares(project_id);
CREATE INDEX IF NOT EXISTS idx_quote_shares_user_id ON public.quote_shares(user_id);

-- 3. BẢO MẬT CẤP HÀNG (ROW LEVEL SECURITY)
ALTER TABLE public.quote_shares ENABLE ROW LEVEL SECURITY;

-- Chủ xưởng sở hữu toàn quyền quản lý liên kết của chính mình
CREATE POLICY "quote_shares_owner_manage" ON public.quote_shares
    FOR ALL
    TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- 4. HÀM RPC ĐỌC BÁO GIÁ ĐÃ CHE DÀNH CHO KHÁCH CÔNG KHAI (SECURITY DEFINER)
-- Khách vãng lai KHÔNG CẦN đăng nhập, gọi hàm này truyền token_hash.
-- Hàm chỉ trả về đúng customer_payload nếu link còn hạn và chưa bị thu hồi.
CREATE OR REPLACE FUNCTION public.get_shared_quote(p_token_hash TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_share_id UUID;
    v_payload JSONB;
BEGIN
    -- Tìm bản ghi hợp lệ: khớp hash, chưa bị thu hồi, chưa hết hạn
    SELECT id, customer_payload
    INTO v_share_id, v_payload
    FROM public.quote_shares
    WHERE token_hash = p_token_hash
      AND revoked_at IS NULL
      AND (expires_at IS NULL OR expires_at > now());

    -- Nếu không tìm thấy, trả về NULL (API route sẽ trả 404)
    IF v_share_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Tăng biến đếm số lượt xem
    UPDATE public.quote_shares
    SET access_count = access_count + 1
    WHERE id = v_share_id;

    RETURN v_payload;
END;
$$;

-- Cấp quyền gọi hàm cho cả khách ẩn danh và người dùng đã xác thực
GRANT EXECUTE ON FUNCTION public.get_shared_quote(TEXT) TO anon, authenticated;

-- ==============================================================================
-- KHỐI HƯỚNG DẪN QUAY LẠI (ROLLBACK / DOWN MIGRATION)
-- ==============================================================================
-- Khi cần hoàn tác:
-- DROP FUNCTION IF EXISTS public.get_shared_quote(TEXT);
-- DROP TABLE IF EXISTS public.quote_shares CASCADE;
