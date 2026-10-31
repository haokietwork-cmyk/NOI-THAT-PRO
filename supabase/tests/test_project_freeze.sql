-- ============================================================================
-- KIỂM THỬ RLS & TRIGGER: ĐÓNG BĂNG HỢP ĐỒNG DỰ ÁN (P1 - H1)
-- File: supabase/tests/test_project_freeze.sql
-- Mô tả các ca kiểm thử bảo vệ tính toàn vẹn khi chốt hợp đồng
-- ============================================================================

-- Ca 1: Dự án ở trạng thái 'draft' hoặc 'quoted', is_locked = false -> Cho phép sửa items bình thường
-- Kỳ vọng: INSERT / UPDATE / DELETE trên project_items thành công 100%.

-- Ca 2: Chuyển trạng thái dự án sang 'approved' hoặc 'ordered'
-- Kỳ vọng: Trigger trg_auto_freeze_project tự động gán is_locked = true và frozen_at = now().

-- Ca 3: Dự án đã is_locked = true -> Thử chèn thêm chi tiết tấm mới (INSERT project_items)
-- Kỳ vọng: Trigger trg_protect_locked_project_items chặn đứng và ném lỗi:
-- 'DỰ ÁN ĐÃ ĐƯỢC ĐÓNG BĂNG HỢP ĐỒNG (is_locked = true)...'

-- Ca 4: Dự án đã is_locked = true -> Thử sửa kích thước tấm (UPDATE project_items SET length_mm = 2500)
-- Kỳ vọng: Trigger chặn đứng và rollback transaction.

-- Ca 5: Dự án đã is_locked = true -> Thử xóa tấm (DELETE FROM project_items WHERE id = '...')
-- Kỳ vọng: Trigger chặn đứng và rollback transaction.

-- Ca 6: Tạo bản sao sửa đổi v2 (parent_project_id = proj1.id, version_no = 2, status = 'draft', is_locked = false)
-- Kỳ vọng: Bản v2 cho phép sửa đổi thoải mái, trong khi bản v1 gốc vẫn bị khóa bất biến.
