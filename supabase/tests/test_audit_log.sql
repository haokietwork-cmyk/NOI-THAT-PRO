-- ============================================================================
-- KIỂM THỬ RLS & BẢO MẬT: NHẬT KÝ THAY ĐỔI DỰ ÁN (P1 - H2)
-- File: supabase/tests/test_audit_log.sql
-- Mô tả các ca kiểm thử bảo mật nhật ký thay đổi dự án
-- ============================================================================

-- Ca 1: Client trực tiếp gọi INSERT vào project_audit_log
-- Lệnh: INSERT INTO public.project_audit_log (project_id, action) VALUES ('...', 'HACK');
-- Kỳ vọng: Permission Denied (bị từ chối do REVOKE ALL và chỉ GRANT SELECT).

-- Ca 2: Client trực tiếp gọi UPDATE hoặc DELETE để xóa dấu vết sửa đổi
-- Lệnh: DELETE FROM public.project_audit_log WHERE id = '...';
-- Kỳ vọng: Permission Denied (không có quyền xóa hoặc sửa log).

-- Ca 3: Người dùng thuộc Tổ chức A cố gắng đọc nhật ký dự án của Tổ chức B
-- Kỳ vọng: RLS Policy trả về 0 dòng (empty set), bảo vệ tuyệt đối bí mật kinh doanh giữa các xưởng.

-- Ca 4: Thành viên hợp lệ của Tổ chức A đọc nhật ký dự án thuộc tổ chức mình
-- Kỳ vọng: Đọc được lịch sử thay đổi (đổi giá, đóng băng hợp đồng, chuyển trạng thái).

-- Ca 5: Kiểm tra nội dung cột details
-- Kỳ vọng: Không chứa bất kỳ dữ liệu cá nhân nào (tên khách hàng, số điện thoại, địa chỉ).
-- Chỉ chứa các thuộc tính kỹ thuật: old_status, new_status, old_total_quote, new_total_quote, version_no.
