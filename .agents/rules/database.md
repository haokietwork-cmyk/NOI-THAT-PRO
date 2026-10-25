# QUY TẮC CƠ SỞ DỮ LIỆU & BẢO MẬT (DATABASE RULES)

Hệ thống cơ sở dữ liệu sử dụng **Supabase (PostgreSQL)**, phân quyền nghiêm ngặt bằng **Row Level Security (RLS)** để bảo vệ bí mật kinh doanh và bảng giá vốn của từng xưởng.

---

## 1. MÃ NGUỒN SQL KHỞI TẠO CƠ SỞ DỮ LIỆU CHUẨN

Chạy đoạn mã này trong Supabase SQL Editor:

```sql
-- ==============================================================================
-- 0. DỌN SẠCH CŨ NẾU CẦN TẠO LẠI ĐỒNG BỘ
-- ==============================================================================
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.project_items cascade;
drop table if exists public.projects cascade;
drop table if exists public.materials_library cascade;
drop table if exists public.profiles cascade;

-- ==============================================================================
-- 1. BẢNG HỒ SƠ XƯỞNG / DESIGNER (PROFILES)
-- ==============================================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  company_name text default 'Xưởng Nội Thất Của Tôi',
  logo_url text,
  phone text,
  address text,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'pro', 'enterprise')),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==============================================================================
-- 2. BẢNG THƯ VIỆN VẬT TƯ & ĐƠN GIÁ (MATERIALS_LIBRARY)
-- ==============================================================================
create table public.materials_library (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category text not null check (category in ('board', 'edge', 'hardware', 'labor')),
  code text not null,
  name text not null,
  unit text not null, -- 'tấm', 'md', 'cái', 'bộ'
  standard_length_mm numeric default 2440,
  standard_width_mm numeric default 1220,
  thickness_mm numeric default 17,
  unit_price numeric not null default 0,
  waste_factor numeric not null default 1.15, -- Mặc định hao hụt 15%
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. BẢNG DỰ ÁN / HỒ SƠ BÁO GIÁ (PROJECTS)
-- ==============================================================================
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  project_name text not null,
  client_name text,
  client_phone text,
  client_address text,
  status text default 'draft' check (status in ('draft', 'finalized')),
  profit_margin numeric default 1.25, -- Mặc định markup lợi nhuận 25%
  total_cost numeric default 0,       -- Tổng giá vốn vật tư & nhân công
  total_quote numeric default 0,      -- Tổng giá báo khách
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==============================================================================
-- 4. BẢNG CHI TIẾT TẤM (CUTLIST) TRONG DỰ ÁN (PROJECT_ITEMS)
-- ==============================================================================
create table public.project_items (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  module_name text not null,          -- VD: 'Tủ áo Master', 'Tủ bếp dưới'
  part_name text not null,            -- VD: 'Hông trái', 'Cánh cửa', 'Hậu tủ'
  length_mm numeric not null,
  width_mm numeric not null,
  thickness_mm numeric not null default 17,
  qty integer not null default 1,
  material_code text,
  unit_price_snapshot numeric default 0, -- Giá chụp lại tại thời điểm tạo
  edge_l1 boolean default false,      -- Dán chỉ Cạnh dài 1
  edge_l2 boolean default false,      -- Dán chỉ Cạnh dài 2
  edge_w1 boolean default false,      -- Dán chỉ Cạnh rộng 1
  edge_w2 boolean default false       -- Dán chỉ Cạnh rộng 2
);

-- ==============================================================================
-- 5. BẬT BẢO MẬT CẤP HÀNG (ROW LEVEL SECURITY - RLS)
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.materials_library enable row level security;
alter table public.projects enable row level security;
alter table public.project_items enable row level security;

create policy "Users manage own profile" on public.profiles
  for all using (auth.uid() = id);

create policy "Users manage own materials" on public.materials_library
  for all using (auth.uid() = user_id);

create policy "Users manage own projects" on public.projects
  for all using (auth.uid() = user_id);

create policy "Users manage own project items" on public.project_items
  for all using (auth.uid() = user_id);

-- ==============================================================================
-- 6. TRIGGER TỰ ĐỘNG TẠO PROFILE VÀ NẠP VẬT TƯ MẪU KHI ĐĂNG KÝ MỚI
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- 1. Tạo hồ sơ xưởng
  insert into public.profiles (id, company_name)
  values (new.id, 'Xưởng Nội Thất Của Tôi');

  -- 2. Nạp sẵn 6 vật tư mẫu thông dụng để người dùng dùng thử được ngay
  insert into public.materials_library (user_id, category, code, name, unit, thickness_mm, unit_price, waste_factor)
  values
    (new.id, 'board', 'MDF-MMR-17', 'Ván MDF Chống ẩm phủ Melamine 17mm', 'tấm', 17, 680000, 1.15),
    (new.id, 'board', 'MDF-MMR-06', 'Ván hậu MDF Chống ẩm phủ Melamine 6mm', 'tấm', 6, 360000, 1.15),
    (new.id, 'edge', 'PVC-21x1', 'Chỉ dán cạnh nhựa PVC 21x1mm đồng màu', 'md', 1, 3500, 1.08),
    (new.id, 'hardware', 'BL-GC', 'Bản lề bật giảm chấn Inox 304', 'cái', 0, 18000, 1.0),
    (new.id, 'hardware', 'RAY-GC-400', 'Ray âm giảm chấn 400mm', 'bộ', 0, 125000, 1.0),
    (new.id, 'labor', 'NC-SX', 'Nhân công gia công & lắp đặt (tính theo tấm ván)', 'tấm', 0, 220000, 1.0);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## 2. QUY TẮC BẢO MẬT & TRUY VẤN
1. **Không bỏ qua RLS:** Mọi client query qua Supabase SDK đều phải đi qua Session Auth của user hiện tại.
2. **Snapshot Pricing:** Khi tạo `project_items`, bắt buộc lưu `unit_price_snapshot` để đóng băng giá trị dự án.
3. **Phân quyền Module Plugin CAD (Giai đoạn sau):**
   - Bảng `plugins` lưu danh sách plugin, giá bán, link demo.
   - Bảng `plugin_orders` lưu lịch sử thanh toán VietQR và Volume Serial Number của máy khách.
   - File nhị phân `.vlx` / `.lsp` lưu trong Private Supabase Storage bucket, chỉ sinh URL có thời hạn (Signed URL 60s) sau khi đơn hàng có trạng thái `paid`.
