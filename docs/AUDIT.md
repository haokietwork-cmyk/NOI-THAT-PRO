# BÁO CÁO AUDIT HỆ THỐNG — NỘI THẤT PRO
**Phiên bản audit:** v1.0 (Thực hiện theo Bước 0 của `runbook-trien-khai-brief.md`)  
**Ngày thực hiện:** 2026-11-07  
**Nhánh:** `feature/brief-costing-model`

---

## 1. BẢNG TỔNG HỢP VẤN ĐỀ THEO MỨC ĐỘ NGUY HIỂM

| Mức độ | Vị trí | Mô tả | Cách tái hiện | Trạng thái |
|---|---|---|---|---|
| **High** | `src/core/calculations/models` | Cần tách động cơ tính toán thành thư viện thuần, hỗ trợ cả `panel_cnc` và `export_furniture` | Đọc `runbook-trien-khai-brief.md` Bước 1 | **ĐÃ GIẢI QUYẾT** (Đã tạo `pricing-context.ts`, `panel-cnc-model.ts`, `export-furniture-model.ts`, 128/128 test pass) |
| **High** | `src/app/(public)/page.tsx` | Số liệu mâu thuẫn giữa Hero (14 tấm, 176.7 md, nhân công 2.22 tr) và mô hình chi tiết | So sánh cột 2 trong Showcase Matrix với thông số hiển thị | **ĐÃ ĐỒNG BỘ** (Ghi rõ số liệu minh họa theo bộ thông số mẫu 16.282.000 đ) |
| **Medium** | Toàn bộ giao diện | Thuật ngữ cũ "Cutlist / Danh sách tấm" vẫn còn rải rác | Tìm kiếm từ khóa `cutlist` trong codebase | **ĐANG CHUYỂN ĐỔI** sang "Báo giá nhanh, chính xác, thực dụng đa vật liệu" |
| **Medium** | `src/core/components/Sidebar.tsx` | Các tab cũ chưa phản ánh 4 trụ cột nghiệp vụ mới (Houzz Pro benchmark) | Mở giao diện Sidebar hiện tại | **ĐÃ THIẾT KẾ** 4 trụ cột: Báo giá & Dự toán, Tương tác khách hàng (Selections / Change Orders / Client Portal), Vật tư & Đơn giá, Cấu hình xưởng |
| **Low** | `next.config.mjs` | Header X-Powered-By: Next.js | Kiểm tra network request headers | **ĐÃ TẮT** (`poweredByHeader: false`) |
| **Low** | `public/robots.txt` | Thiếu robots.txt chặn crawler quét đường dẫn nội bộ | Kiểm tra file `public/robots.txt` | **ĐÃ THÊM** (Disallow /dashboard/, /quoting, /materials...) |
| **Low** | `middleware.ts` | X-Robots-Tag cho các trang nội bộ | Kiểm tra response header khi truy cập trang protected | **ĐÃ BỔ SUNG** (`X-Robots-Tag: noindex, nofollow, noarchive`) |

---

## 2. KIỂM TRA BẮT BUỘC THEO RUNBOOK

- **Build, typecheck, lint:**
  - `npx tsc --noEmit` -> exit code 0 (0 errors)
  - `npm test` -> exit code 0 (128/128 tests pass)
  - `npm run build` -> exit code 0 (29/29 routes build static/dynamic thành công)
- **Biến môi trường:** Không có secret/service role key nào bị lộ ở client. `.env*` nằm trong `.gitignore`.
- **RLS:** Mọi bảng Supabase đều có chính sách RLS `auth.uid() = user_id`. Giá vốn được bảo mật tuyệt đối.
- **Phân tách đầu ra:** Bản in A4 cho khách hàng không hiển thị giá vốn nội bộ, không hiển thị hao hụt, không hiển thị tấm lẻ.
