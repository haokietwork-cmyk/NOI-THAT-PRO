-- ============================================================================
-- BỘ KIỂM THỬ BẢO MẬT RLS CHO SCHEMA NỀN ĐA THÀNH VIÊN (PHASE C2)
-- File: supabase/tests/test_rls_baseline.sql
-- Mục đích: Mô tả chi tiết 6 tình huống kiểm thử phân quyền và cách kiểm chứng
-- LƯU Ý: ĐÂY LÀ FILE MÔ TẢ ĐẶC TẢ KIỂM THỬ CHO PREVIEW/STAGING - KHÔNG CHẠY TRÊN PROD
-- ============================================================================

-- DỮ LIỆU GIẢ LẬP TEST (FIXTURES):
-- User A (Owner Org 1): id = '11111111-1111-1111-1111-111111111111'
-- User B (Sales Org 1): id = '22222222-2222-2222-2222-222222222222'
-- User C (Viewer Org 1): id = '33333333-3333-3333-3333-333333333333'
-- User D (Người ngoài Org 1, thuộc Org 2): id = '44444444-4444-4444-4444-444444444444'
-- Org 1: id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
-- Org 2: id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
-- Project 1 (thuộc Org 1): id = '99999999-9999-9999-9999-999999999999'


-- ============================================================================
-- TÌNH HUỐNG 1: NGƯỜI DÙNG D (ORG 2) KHÔNG ĐỌC / GHI ĐƯỢC DỮ LIỆU CỦA ORG 1
-- ============================================================================
-- Đóng vai: User D (authenticated)
-- SET request.jwt.claim.sub = '44444444-4444-4444-4444-444444444444';

-- 1.1. Thử SELECT dự án của Org 1
SELECT count(*) AS ca1_select_project_org1
FROM public.projects
WHERE org_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
-- KỲ VỌNG: 0 rows (Không nhìn thấy bất kỳ dự án nào của xưởng khác)

-- 1.2. Thử SELECT danh mục vật tư của Org 1
SELECT count(*) AS ca1_select_catalog_org1
FROM public.catalog_items
WHERE org_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
-- KỲ VỌNG: 0 rows (Bí mật đơn giá vật tư được bảo toàn tuyệt đối)


-- ============================================================================
-- TÌNH HUỐNG 2: NGƯỜI NGOÀI ORG THỰC HIỆN GHI VÀO ORG KHÁC BỊ CHẶN NGAY LẬP TỨC
-- ============================================================================
-- Đóng vai: User D (authenticated)
-- SET request.jwt.claim.sub = '44444444-4444-4444-4444-444444444444';

-- 2.1. Thử chèn một dự án mới vào Org 1
INSERT INTO public.projects (
  org_id, user_id, project_name, client_name
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '44444444-4444-4444-4444-444444444444',
  'Dự án chui',
  'Khách lạ'
);
-- KỲ VỌNG: ERROR: new row violates row-level security policy for table "projects"


-- ============================================================================
-- TÌNH HUỐNG 3: THÀNH VIÊN VIEWER (THỢ XƯỞNG) XEM ĐƯỢC NHƯNG BỊ CHẶN SỬA/XÓA
-- ============================================================================
-- Đóng vai: User C (Viewer Org 1)
-- SET request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';

-- 3.1. Viewer SELECT chi tiết tấm Cutlist của Org 1 để thợ cưa cắt
SELECT count(*) AS ca3_viewer_can_view_parts
FROM public.project_items pi
JOIN public.projects p ON p.id = pi.project_id
WHERE p.org_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
-- KỲ VỌNG: Trả về đầy đủ số lượng chi tiết phôi để xưởng làm việc (PASSED)

-- 3.2. Viewer thử xóa dự án hoặc cập nhật đơn giá
DELETE FROM public.projects WHERE id = '99999999-9999-9999-9999-999999999999';
-- KỲ VỌNG: 0 rows affected (Chính sách projects_write chỉ cấp cho 'owner' và 'sales')


-- ============================================================================
-- TÌNH HUỐNG 4: CLIENT TỰ NÂNG GÓI CƯỚC SUBSCRIPTIONS BỊ CHẶN 100%
-- ============================================================================
-- Đóng vai: User A (Owner Org 1)
-- SET request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

-- 4.1. Chủ xưởng cố tình gửi lệnh UPDATE để lên gói enterprise
UPDATE public.subscriptions
SET tier = 'enterprise'
WHERE org_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
-- KỲ VỌNG: 0 rows affected (Không có policy UPDATE nào cho role authenticated, chỉ service_role qua webhook mới có quyền)

-- 4.2. Thử sửa cột subscription_tier trên bảng profiles
UPDATE public.profiles
SET subscription_tier = 'enterprise'
WHERE id = '11111111-1111-1111-1111-111111111111';
-- KỲ VỌNG: ERROR: permission denied for column "subscription_tier" of relation "profiles"


-- ============================================================================
-- TÌNH HUỐNG 5: KHÁCH VÃNG LAI (ANON) GỬI FORM LEAD ĐƯỢC NHƯNG KHÔNG ĐỌC ĐƯỢC
-- ============================================================================
-- Đóng vai: Anon (role: anon)

-- 5.1. Khách điền form đăng ký nhận plugin hoặc báo giá
INSERT INTO public.feature_leads (feature_key, contact_email, contact_phone)
VALUES ('cad_plugin_autodim', 'khachhang@example.com', '0901234567');
-- KỲ VỌNG: 1 row inserted (Ghi nhận lead thành công)

-- 5.2. Kẻ gian đóng vai anon thử quét toàn bộ thông tin SĐT/email của khách
SELECT count(*) AS ca5_anon_read_leads FROM public.feature_leads;
-- KỲ VỌNG: 0 rows (Không có policy SELECT cho client, bảo vệ tuyệt đối dữ liệu cá nhân theo Nghị định 13)


-- ============================================================================
-- TÌNH HUỐNG 6: CHỐNG CHÈN PHÔI TẤM (PROJECT_ITEMS) VÀO DỰ ÁN CỦA XƯỞNG KHÁC
-- ============================================================================
-- Đóng vai: User D (Org 2)
-- SET request.jwt.claim.sub = '44444444-4444-4444-4444-444444444444';

-- 6.1. User D cố tình chèn phôi tấm vào Project 1 (thuộc Org 1)
INSERT INTO public.project_items (
  project_id, module_name, part_name, length_mm, width_mm, thickness_mm, qty, material_code
) VALUES (
  '99999999-9999-9999-9999-999999999999', -- Dự án của Org 1
  'Tủ bếp', 'Tấm chèn trái phép', 800, 400, 17, 1, 'MDF_17'
);
-- KỲ VỌNG: ERROR: new row violates row-level security policy for table "project_items"
-- GIẢI THÍCH: Policy project_items_write kiểm tra EXISTS (SELECT 1 FROM projects WHERE is_org_member), 
-- do User D không phải thành viên của Org 1 chứa Project 1 nên bị từ chối ngay lập tức.
