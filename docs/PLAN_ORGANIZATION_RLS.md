# KẾ HOẠCH THIẾT KẾ SCHEMA NỀN, TỔ CHỨC ĐA THÀNH VIÊN VÀ BẢO MẬT RLS (PHASE C1)
## Document Ref: `docs/PLAN_ORGANIZATION_RLS.md` — Giai đoạn C (Mã việc: C1)
> 🛑 **CỔNG KIỂM SOÁT G2: DỪNG CHỜ PHÊ DUYỆT CỦA LEAD DEVELOPER TRƯỚC KHI VIẾT FILE MIGRATION C2**

---

## 1. SƠ ĐỒ BẢNG DỮ LIỆU ĐA THÀNH VIÊN (MULTI-TENANT ORGANIZATIONS SCHEMA)

Toàn bộ hệ thống chuyển dịch từ mô hình "1 User = 1 Xưởng cô lập" sang mô hình "Tổ chức (Organization) đa thành viên phân quyền" chuẩn B2B SaaS.

```
                    ┌───────────────────────────┐
                    │        auth.users         │
                    └─────────────┬─────────────┘
                                  │ 1:1
                                  ▼
                    ┌───────────────────────────┐
                    │      public.profiles      │
                    │ (Hồ sơ cá nhân & xưởng)   │
                    └───────────────────────────┘
                                  │
                                  │ N:M (via org_members)
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         public.organizations                           │
│  (Tổ chức / Xưởng mộc: id, name, slug, owner_id, created_at, ...)      │
└────────┬───────────────────────┬───────────────────────────────┬───────┘
         │ 1:N                   │ 1:N                           │ 1:1
         ▼                       ▼                               ▼
┌──────────────────┐    ┌──────────────────┐           ┌──────────────────┐
│   org_members    │    │  catalog_items   │           │  subscriptions   │
│ (owner/sales/    │    │ (Danh mục 11 loại│           │ (Gói cước, cọc,  │
│  viewer)         │    │  vật tư xưởng)   │           │  chỉ webhook ghi)│
└──────────────────┘    └──────────────────┘           └──────────────────┘
                                 │ 1:N
                                 ▼
                        ┌──────────────────┐
                        │     projects     │
                        │ (+org_id,        │
                        │  calc_version,   │
                        │  cost_config,    │
                        │  sections JSONB) │
                        └────────┬─────────┘
                                 │ 1:N
                                 ▼
                        ┌──────────────────┐
                        │  project_items   │
                        │ (Phôi Cutlist)   │
                        └──────────────────┘
```

### 1.1. Bảng `organizations` (Tổ chức / Xưởng nội thất)
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `name`: `TEXT NOT NULL` (Tên xưởng, giới hạn `<= 255` ký tự)
- `slug`: `TEXT UNIQUE` (Định danh URL xưởng)
- `owner_id`: `UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT`
- `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`

### 1.2. Bảng `org_members` (Thành viên tổ chức & Vai trò)
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `org_id`: `UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE`
- `user_id`: `UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
- `role`: `TEXT NOT NULL CHECK (role IN ('owner', 'sales', 'viewer'))`
- `invited_by`: `UUID REFERENCES auth.users(id)`
- `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
- `UNIQUE(org_id, user_id)`

### 1.3. Bảng `profiles` (Hồ sơ người dùng & Thiết lập cá nhân)
- `id`: `UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
- `company_name`: `TEXT` (Giới hạn `<= 255` ký tự)
- `logo_url`: `TEXT` (Giới hạn `<= 1024` ký tự)
- `phone`: `TEXT` (Giới hạn `<= 30` ký tự)
- `address`: `TEXT` (Giới hạn `<= 500` ký tự)
- `quote_terms`: `TEXT` (Điều khoản in chân trang PDF)
- `bank_info`: `TEXT` (Thông tin số tài khoản / QR ngân hàng)
- `cost_config`: `JSONB` (Định mức xưởng & dòng chi phí, tuân thủ `is_valid_cost_config`)
- `email`: `TEXT`
- `active_org_id`: `UUID REFERENCES public.organizations(id)`
- `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`

### 1.4. Bảng `subscriptions` (Quản lý bản quyền & Gói cước SaaS)
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `org_id`: `UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE`
- `tier`: `TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise'))`
- `status`: `TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled'))`
- `current_period_end`: `TIMESTAMPTZ`
- `payment_provider`: `TEXT DEFAULT 'vietqr_sepay'`
- `last_payment_ref`: `TEXT`
- `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
- **Quy tắc bảo mật:** Client `authenticated` chỉ có quyền `SELECT`. Chỉ có Service Role (qua Webhook thanh toán SePay/PayOS) mới có quyền `INSERT/UPDATE`.

### 1.5. Bảng `catalog_items` (Danh mục vật tư đa loại - Tiến hóa từ `materials_library`)
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `org_id`: `UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE`
- `code`: `TEXT NOT NULL`
- `name`: `TEXT NOT NULL`
- `category`: `TEXT NOT NULL CHECK (category IN ('board', 'edge', 'hardware', 'supplies', 'surface', 'face_material', 'equipment', 'labor', 'service', 'subcontract', 'other'))`
- `unit`: `TEXT NOT NULL`
- `unit_price`: `NUMERIC(14, 2) NOT NULL CHECK (unit_price >= 0)`
- `price_includes_vat`: `BOOLEAN NOT NULL DEFAULT false`
- `pack_size`: `NUMERIC(10, 2)`
- `pack_unit`: `TEXT`
- `supplier_name`: `TEXT`
- `source`: `TEXT NOT NULL DEFAULT 'workshop_entered' CHECK (source IN ('default_reference', 'workshop_entered', 'project_override'))`
- `waste_factor`: `NUMERIC(6, 4) DEFAULT 1.0 CHECK (waste_factor >= 1.0)`
- `standard_length_mm`: `NUMERIC(8, 2)`
- `standard_width_mm`: `NUMERIC(8, 2)`
- `thickness_mm`: `NUMERIC(6, 2)`
- `notes`: `TEXT`
- `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
- `UNIQUE(org_id, code)`

### 1.6. Bảng `projects` (Dự án & Báo giá)
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `org_id`: `UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE`
- `user_id`: `UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT` (Người tạo)
- `parent_project_id`: `UUID REFERENCES public.projects(id) ON DELETE SET NULL` (Hỗ trợ phân bản revision)
- `version_no`: `INT NOT NULL DEFAULT 1`
- `project_name`: `TEXT NOT NULL`
- `client_name`: `TEXT NOT NULL`
- `client_phone`: `TEXT`
- `client_address`: `TEXT`
- `status`: `TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'quoted', 'ordered', 'approved', 'in_production', 'finalized'))`
- `profit_margin`: `NUMERIC(6, 4) NOT NULL DEFAULT 1.65 CHECK (profit_margin > 0 AND profit_margin <= 10.0)`
- `total_cost`: `NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (total_cost >= 0)`
- `total_quote`: `NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (total_quote >= 0)`
- `rounding_step`: `INT DEFAULT 50000`
- `discount_amount`: `NUMERIC(14, 2) DEFAULT 0`
- `notes`: `TEXT`
- `calc_version`: `INT NOT NULL DEFAULT 1`
- `materials_snapshot`: `JSONB`
- `cost_config_snapshot`: `JSONB`
- `sections_snapshot`: `JSONB` (Lưu các hạng mục đa chế độ Cutlist / Báo nhanh m2 / Dòng nhập tay)
- `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`

### 1.7. Bảng `project_items` (Chi tiết phôi tấm Cutlist)
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `project_id`: `UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE`
- `module_name`: `TEXT NOT NULL`
- `part_name`: `TEXT NOT NULL`
- `length_mm`: `NUMERIC(8, 2) NOT NULL CHECK (length_mm > 0)`
- `width_mm`: `NUMERIC(8, 2) NOT NULL CHECK (width_mm > 0)`
- `thickness_mm`: `NUMERIC(6, 2) NOT NULL DEFAULT 17 CHECK (thickness_mm > 0)`
- `qty`: `INT NOT NULL DEFAULT 1 CHECK (qty > 0)`
- `material_code`: `TEXT NOT NULL`
- `edge_l1`: `BOOLEAN NOT NULL DEFAULT false`
- `edge_l2`: `BOOLEAN NOT NULL DEFAULT false`
- `edge_w1`: `BOOLEAN NOT NULL DEFAULT false`
- `edge_w2`: `BOOLEAN NOT NULL DEFAULT false`
- `grain_direction`: `TEXT DEFAULT 'along_length'`
- `notes`: `TEXT`
- `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`

### 1.8. Bảng `feature_leads` & `project_audit_log`
- `feature_leads`: Thu thập khách đăng ký tính năng mới.
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `user_id`: `UUID REFERENCES auth.users(id)` (Cho phép NULL cho khách vãng lai)
  - `feature_key`: `TEXT NOT NULL`
  - `contact_email`: `TEXT`
  - `contact_phone`: `TEXT`
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
- `project_audit_log`: Nhật ký thay đổi giá & trạng thái dự án
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `project_id`: `UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE`
  - `user_id`: `UUID NOT NULL REFERENCES auth.users(id)`
  - `action`: `TEXT NOT NULL`
  - `old_values`: `JSONB`
  - `new_values`: `JSONB`
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`

---

## 2. BẢO MẬT CẤP HÀNG (ROW LEVEL SECURITY - RLS)

Mọi chính sách đều dùng `auth.uid()` bọc trong subquery `(SELECT auth.uid())` để PostgreSQL cache kết quả thực thi theo transaction, tối ưu hiệu năng.

### 2.1. Hàm trợ giúp bảo mật (Security Helper Functions)
```sql
-- Hàm kiểm tra xem user hiện tại có thuộc org_id hay không
CREATE OR REPLACE FUNCTION public.is_org_member(check_org_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members
    WHERE org_id = check_org_id AND user_id = (SELECT auth.uid())
  );
$$;

-- Hàm lấy vai trò của user trong org
CREATE OR REPLACE FUNCTION public.get_org_role(check_org_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT role FROM public.org_members
  WHERE org_id = check_org_id AND user_id = (SELECT auth.uid())
  LIMIT 1;
$$;
```

### 2.2. Ma trận phân quyền 4 vai trò
| Bảng | Owner (Chủ xưởng) | Sales (Kỹ thuật/Kinh doanh) | Viewer (Thợ xưởng) | Người ngoài Org / Anon |
| :--- | :---: | :---: | :---: | :---: |
| `organizations` | SELECT, UPDATE | SELECT | SELECT | Chặn 100% |
| `org_members` | SELECT, INSERT, UPDATE, DELETE | SELECT | SELECT | Chặn 100% |
| `subscriptions` | SELECT | SELECT | SELECT | Chặn 100% (Ghi: Webhook) |
| `catalog_items` | SELECT, INSERT, UPDATE, DELETE | SELECT, INSERT, UPDATE, DELETE | SELECT | Chặn 100% |
| `projects` | SELECT, INSERT, UPDATE, DELETE | SELECT, INSERT, UPDATE, DELETE | SELECT (Chỉ xem) | Chặn 100% |
| `project_items` | SELECT, INSERT, UPDATE, DELETE | SELECT, INSERT, UPDATE, DELETE | SELECT (Xem cắt ván) | Chặn 100% |
| `feature_leads` | INSERT | INSERT | INSERT | INSERT (Chặn SELECT) |

### 2.3. RLS Cốt lõi cho `project_items` (Khắc phục lỗi hổng C1 từ Audit)
```sql
-- Kiểm tra quyền thông qua dự án cha cùng thuộc org của user
CREATE POLICY "project_items_org_select" ON public.project_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_items.project_id
        AND public.is_org_member(p.org_id)
    )
  );

CREATE POLICY "project_items_org_write" ON public.project_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_items.project_id
        AND public.is_org_member(p.org_id)
        AND public.get_org_role(p.org_id) IN ('owner', 'sales')
    )
  );
```

---

## 3. PHÂN QUYỀN CỘT `profiles` (COLUMN PRIVILEGES)

```sql
REVOKE ALL ON public.profiles FROM authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (
  company_name,
  logo_url,
  phone,
  address,
  quote_terms,
  bank_info,
  cost_config,
  active_org_id,
  updated_at
) ON public.profiles TO authenticated;
```
> **Bảo mật tuyệt đối:** KHÔNG cấp quyền UPDATE cho `id`, `email`, `subscription_tier`.

---

## 4. TỰ ĐỘNG KHỞI TẠO TỔ CHỨC KHI ĐĂNG KÝ (SIGNUP TRIGGER)

Khi một user đăng ký tài khoản mới qua Supabase Auth:
1. Tạo 1 dòng `profiles` cho user.
2. Tự động tạo 1 tổ chức mặc định `"Xưởng mộc của tôi"` trong `organizations`.
3. Gán user làm `owner` trong `org_members`.
4. Khởi tạo gói cước `free` trong `subscriptions`.
5. Cập nhật `active_org_id` trong `profiles`.

Toàn bộ chạy trong 1 transaction an toàn qua hàm `handle_new_user()` với `SECURITY DEFINER`.

---

## 5. HƯỚNG DẪN TỰ RESET VÀ CHẠY MIGRATION NỀN CHO DEVELOPER

> ⚠️ **Quy tắc bất biến:** Không chạy lệnh tự động lên Database thật. Developer tự thực hiện trên giao diện Supabase Dashboard hoặc Supabase CLI cục bộ.

### Các bước thực hiện:
1. Mở Supabase Studio / SQL Editor của môi trường thử nghiệm (Preview/Staging).
2. Tải toàn bộ file migration: `supabase/migrations/20261025140000_baseline_schema.sql`.
3. Chạy script kiểm tra cú pháp và thực thi.
4. Chạy bộ script kiểm thử: `supabase/tests/test_rls_policies.sql`.
5. Đảm bảo toàn bộ 6 ca test RLS trả về `PASSED`.

---

## 6. KẾ HOẠCH KIỂM THỬ RLS (MÔ TẢ SQL TEST CHO 6 TÌNH HUỐNG)

- **Ca 1:** Người dùng A (Org 1) thực hiện `SELECT` dự án của Org 2 $\rightarrow$ Kết quả: 0 rows.
- **Ca 2:** Người ngoài Org thực hiện `INSERT` vào `projects` của Org khác $\rightarrow$ Bị chặn `new row violates row-level security policy`.
- **Ca 3:** Thành viên có vai trò `viewer` thực hiện `UPDATE` hoặc `DELETE` dự án $\rightarrow$ Bị chặn `permission denied / RLS policy violation`.
- **Ca 4:** Client `authenticated` cố tình chạy `UPDATE subscriptions SET tier = 'pro'` $\rightarrow$ Bị chặn quyền cập nhật (không có policy UPDATE).
- **Ca 5:** Khách vãng lai (`anon`) gửi form `feature_leads` $\rightarrow$ Ghi thành công (`INSERT` cho phép); nhưng chạy `SELECT` $\rightarrow$ Trả về 0 rows (chống lộ thông tin khách hàng).
- **Ca 6:** Kẻ gian cố tình chèn `project_items` với `project_id` thuộc xưởng người khác $\rightarrow$ Bị chặn ngay lập tức nhờ điều kiện `EXISTS (SELECT 1 FROM projects WHERE is_org_member)`.

---
> 🛑 **KẾT THÚC PLAN C1 — DỪNG LẠI TẠI CỔNG G2 ĐỂ CHỜ LEAD DEVELOPER PHÊ DUYỆT TRƯỚC KHI TẠO FILE SQL.**
