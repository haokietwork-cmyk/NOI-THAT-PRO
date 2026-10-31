# HƯỚNG DẪN TỰ RESET VÀ NẠP MIGRATION NỀN SUPABASE
## Document Ref: `docs/DB_RESET.md` — Giai đoạn C (C2 / G3)

> ⚠️ **CẢNH BÁO AN TOÀN BẤT BIẾN:**  
> - Hướng dẫn này chỉ dành cho **Môi trường Thử nghiệm (Local Supabase CLI hoặc Preview Project)**.  
> - **TUYỆT ĐỐI KHÔNG** chạy lệnh reset trên Cơ sở dữ liệu Production có khách hàng thật.  
> - Agent không bao giờ tự động chạy lệnh này lên Database thật; việc thực thi do Developer trực tiếp tiến hành.

---

## 1. CÁC BƯỚC THỰC HIỆN TRÊN SUPABASE DASHBOARD (THỬ NGHIỆM)

### Bước 1: Mở SQL Editor trên Supabase
1. Đăng nhập vào [Supabase Dashboard](https://supabase.com/dashboard).
2. Chọn dự án thử nghiệm (Preview / Staging).
3. Nhấp vào biểu tượng **SQL Editor** ở thanh menu bên trái.
4. Bấm **New query** để tạo một trang soạn thảo lệnh mới.

### Bước 2: Nạp Migration Nền Sạch (Baseline Schema)
1. Mở file mã nguồn trên máy:  
   [`supabase/migrations/20261031084500_baseline_schema.sql`](file:///c:/Users/KIET_PC/Desktop/Web%20n%E1%BB%99i%20th%E1%BA%A5t/supabase/migrations/20261031084500_baseline_schema.sql)
2. Sao chép (Copy) toàn bộ nội dung file.
3. Dán vào khung SQL Editor trên Supabase.
4. Nhấn nút **Run** (hoặc tổ hợp phím `Ctrl + Enter`).
5. Kiểm tra thông báo: `Success. No rows returned` (Toàn bộ 9 bảng, 8 trigger/hàm và các chính sách RLS đã được khởi tạo).

### Bước 3: Chạy Kiểm Thử An Toàn Phân Quyền RLS
1. Mở file kiểm thử:  
   [`supabase/tests/test_rls_baseline.sql`](file:///c:/Users/KIET_PC/Desktop/Web%20n%E1%BB%99i%20th%E1%BA%A5t/supabase/tests/test_rls_baseline.sql)
2. Lần lượt chạy từng khối test cho 6 tình huống:
   - **Tình huống 1:** Khách xưởng khác không nhìn thấy dự án và đơn giá xưởng mình.
   - **Tình huống 2:** Khách lạ ghi vào xưởng khác bị chặn RLS.
   - **Tình huống 3:** Thợ xưởng (Viewer) xem được phôi cắt nhưng không sửa được giá.
   - **Tình huống 4:** Client không thể tự nâng gói cước `subscriptions`.
   - **Tình huống 5:** Form nhận tư vấn (`feature_leads`) ghi được nhưng không đọc được thông tin khách khác.
   - **Tình huống 6:** Không thể chèn phôi tấm lậu vào dự án người khác.
3. Xác nhận toàn bộ kết quả khớp 100% với kỳ vọng trong file test.

---

## 2. HƯỚNG DẪN THỰC HIỆN QUA SUPABASE CLI (LOCAL DEV)

Nếu bạn đang chạy Supabase cục bộ trên máy phát triển qua Docker:

```bash
# 1. Reset toàn bộ database cục bộ về trạng thái ban đầu
supabase db reset

# 2. Hoặc nạp migration cụ thể
supabase migration up

# 3. Kiểm tra trạng thái RLS và bảng
supabase db diff
```

---

## 3. CÁCH HOÀN TÁC (ROLLBACK) KHI CẦN THIẾT

Nếu phát sinh lỗi trong quá trình chạy thử nghiệm, bạn có thể hoàn tác toàn bộ schema bằng cách bỏ dấu comment `/* ... */` ở mục **9. DOWN MIGRATION** trong file `20261031084500_baseline_schema.sql` và nhấn **Run**:

```sql
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
```
