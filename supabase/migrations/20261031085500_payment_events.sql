-- ============================================================================
-- MIGRATION: BẢNG GHI NHẬN SỰ KIỆN THANH TOÁN CHỐNG XỬ LÝ TRÙNG (IDEMPOTENCY)
-- Tên: 20261031085500_payment_events.sql
-- Mục đích: Đảm bảo mỗi giao dịch thanh toán từ Ngân hàng / SePay / PayOS
-- chỉ được cộng gói hoặc cấp bản quyền đúng 1 lần duy nhất (Idempotent).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.payment_events (
  event_id text PRIMARY KEY,
  provider text NOT NULL CHECK (char_length(provider) <= 50),
  order_code text NOT NULL CHECK (char_length(order_code) <= 100),
  amount numeric(14, 2) NOT NULL CHECK (amount >= 0),
  payload jsonb NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

-- Kích hoạt Row Level Security bảo vệ tuyệt đối
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

-- Nghiêm cấm mọi quyền SELECT, INSERT, UPDATE, DELETE từ client
REVOKE ALL ON public.payment_events FROM anon, authenticated;

-- Index hỗ trợ tra cứu nhanh theo mã đơn hàng
CREATE INDEX IF NOT EXISTS idx_payment_events_order_code ON public.payment_events(order_code);

-- ============================================================================
-- DOWN MIGRATION (ROLLBACK)
-- ============================================================================
/*
DROP INDEX IF EXISTS public.idx_payment_events_order_code;
DROP TABLE IF EXISTS public.payment_events CASCADE;
*/
