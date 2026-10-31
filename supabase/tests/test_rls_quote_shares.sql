-- ==============================================================================
-- TEST SPEC: KIỂM THỬ BẢO MẬT RLS & HÀM BẢO MẬT CHO QUOTE_SHARES
-- File: supabase/tests/test_rls_quote_shares.sql
-- Mô tả ca kiểm thử cho Giai đoạn F (Chưa chạy DB thật)
-- ==============================================================================

BEGIN;

-- 1. GIẢ LẬP DỮ LIỆU THỬ NGHIỆM
-- Tạo 2 user xưởng A và B
-- User A: '00000000-0000-0000-0000-00000000000a'
-- User B: '00000000-0000-0000-0000-00000000000b'

-- 2. CA KIỂM THỬ 1: CHỦ XƯỞNG A TẠO VÀ QUẢN LÝ LINK CHIA SẺ CỦA MÌNH
-- Set session thành User A
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "00000000-0000-0000-0000-00000000000a"}';

-- Kỳ vọng: User A có thể INSERT và SELECT quote_shares của chính mình
-- SELECT COUNT(*) FROM quote_shares WHERE user_id = '00000000-0000-0000-0000-00000000000a'; -> 1

-- 3. CA KIỂM THỬ 2: CHỦ XƯỞNG B KHÔNG THỂ XEM HAY SỬA LINK CỦA XƯỞNG A
-- Set session thành User B
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "00000000-0000-0000-0000-00000000000b"}';

-- Kỳ vọng: User B truy vấn trực tiếp bảng quote_shares -> 0 hàng (RLS chặn hoàn toàn)
-- SELECT COUNT(*) FROM quote_shares; -> 0

-- 4. CA KIỂM THỬ 3: KHÁCH CÔNG KHAI TRUY CẬP QUA HÀM GET_SHARED_QUOTE
-- Set session thành anon (chưa đăng nhập)
SET LOCAL ROLE anon;

-- Kỳ vọng:
-- a) Gọi get_shared_quote(token_hash_hop_le) -> trả về customer_payload
-- b) Gọi get_shared_quote('hash_khong_ton_tai') -> trả về NULL
-- c) Sau khi link bị thu hồi (revoked_at != NULL) -> trả về NULL
-- d) Sau khi link hết hạn (expires_at < now()) -> trả về NULL
-- e) Truy vấn trực tiếp SELECT * FROM quote_shares -> Bị chặn (0 hàng)

ROLLBACK;
