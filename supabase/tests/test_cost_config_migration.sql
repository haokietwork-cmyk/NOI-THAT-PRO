-- ============================================================================
-- Supabase SQL Test Suite: test_cost_config_migration.sql
-- Mục đích: Mô tả các ca kiểm thử cho migration 20261025131700
-- LƯU Ý: FILE MÔ TẢ ĐẶC TẢ KIỂM THỬ - KHÔNG CHẠY TRÊN DATABASE THẬT
-- ============================================================================

-- CA 1: HỢP LỆ ĐẦY ĐỦ 4 KHÓA SỐ TRONG NGƯỠNG CHO PHÉP
-- Kỳ vọng: is_valid_cost_config trả về TRUE
SELECT public.is_valid_cost_config('{
  "suppliesRatePerSheet": 15000,
  "laborRatePerSheet": 120000,
  "hingesPerSheet": 2.0,
  "slidesPerSheet": 0.35
}'::jsonb) AS ca1_hop_le_day_du; -- Expected: TRUE

-- CA 2: HỢP LỆ KHI CẢ CỘT LÀ NULL (DÙNG MẶC ĐỊNH HỆ THỐNG)
-- Kỳ vọng: is_valid_cost_config trả về TRUE
SELECT public.is_valid_cost_config(NULL) AS ca2_null_ca_cot; -- Expected: TRUE

-- CA 3: HỢP LỆ KHI THIẾU MỘT SỐ KHÓA (CHỈ CẬP NHẬT 1 TRƯỜNG)
-- Kỳ vọng: is_valid_cost_config trả về TRUE
SELECT public.is_valid_cost_config('{
  "laborRatePerSheet": 150000
}'::jsonb) AS ca3_thieu_khoa; -- Expected: TRUE

-- CA 4: TỪ CHỐI KHI GIÁ TRỊ LÀ JSON NULL
-- Kỳ vọng: is_valid_cost_config trả về FALSE
SELECT public.is_valid_cost_config('{
  "suppliesRatePerSheet": null
}'::jsonb) AS ca4_json_null; -- Expected: FALSE

-- CA 5: TỪ CHỐI KHI GIÁ TRỊ LÀ CHUỖI KÝ TỰ (STRING)
-- Kỳ vọng: is_valid_cost_config trả về FALSE
SELECT public.is_valid_cost_config('{
  "suppliesRatePerSheet": "15000"
}'::jsonb) AS ca5_chuoi_string; -- Expected: FALSE

-- CA 6: TỪ CHỐI KHI GIÁ TRỊ ÂM (< 0)
-- Kỳ vọng: is_valid_cost_config trả về FALSE
SELECT public.is_valid_cost_config('{
  "suppliesRatePerSheet": -5000
}'::jsonb) AS ca6_so_am; -- Expected: FALSE

-- CA 7: TỪ CHỐI KHI GIÁ TRỊ VƯỢT TRẦN THỊ TRƯỜNG (LABOR > 1.000.000)
-- Kỳ vọng: is_valid_cost_config trả về FALSE
SELECT public.is_valid_cost_config('{
  "laborRatePerSheet": 2000000
}'::jsonb) AS ca7_vuot_tran; -- Expected: FALSE

-- CA 8: TỪ CHỐI KHI KHÔNG PHẢI OBJECT (VÍ DỤ ARRAY)
-- Kỳ vọng: is_valid_cost_config trả về FALSE
SELECT public.is_valid_cost_config('[1, 2, 3]'::jsonb) AS ca8_khong_phai_object; -- Expected: FALSE

-- CA 9: TỪ CHỐI KHI KÍCH THƯỚC JSON QUÁ LỚN (> 4096 BYTES)
-- Kỳ vọng: is_valid_cost_config trả về FALSE
SELECT public.is_valid_cost_config(('{"notes": "' || repeat('a', 4100) || '"}')::jsonb) AS ca9_qua_kich_thuoc; -- Expected: FALSE

-- CA 10: KIỂM THỬ TRIGGER HANDLE_NEW_USER KHI ĐĂNG KÝ
-- Mô tả: Khi một user mới insert vào auth.users, trigger tự động tạo row trong public.profiles
-- Kỳ vọng: Row tồn tại trong profiles với id = user.id, email = user.email.
-- Code kiểm thử (mô tả):
-- INSERT INTO auth.users (id, email) VALUES ('00000000-0000-0000-0000-000000000001', 'test_signup@example.com');
-- SELECT count(*) FROM public.profiles WHERE id = '00000000-0000-0000-0000-000000000001'; -- Expected: 1

-- CA 11: KIỂM THỬ BACKFILL TÀI KHOẢN ĐÃ CÓ
-- Mô tả: Lệnh INSERT INTO public.profiles ... ON CONFLICT DO NOTHING
-- Kỳ vọng: Không sinh lỗi khi chạy lặp lại nhiều lần, không ghi đè dữ liệu hồ sơ đã có.

-- CA 12: HỢP LỆ VỚI MÔ HÌNH DÒNG CHI PHÍ TỔNG QUÁT (COSTLINES JSONB)
-- Kỳ vọng: is_valid_cost_config trả về TRUE với danh sách costLines hợp lệ
SELECT public.is_valid_cost_config('{
  "costLines": [
    {"id": "line-1", "name": "Bản lề", "category": "hardware", "unitPrice": 28000, "enabled": true},
    {"id": "line-2", "name": "Mặt đá", "category": "face_material", "unitPrice": 1200000, "enabled": true}
  ]
}'::jsonb) AS ca12_cost_lines_hop_le; -- Expected: TRUE
