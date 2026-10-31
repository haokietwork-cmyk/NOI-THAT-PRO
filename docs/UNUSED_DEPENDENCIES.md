# BÁO CÁO DỌN DẸP DEPENDENCY (HOÀN TẤT TẠI BƯỚC E9)

> **Căn cứ:** Quy tắc dọn dẹp dependency theo Runbook v3 mục E9 sau khi hoàn tất Bước 4.
> **Kết quả:** Đã gỡ bỏ an toàn 13 gói thư viện không sử dụng qua 2 nhóm nhỏ, toàn bộ 78 tests pass và bản dựng Next.js production biên dịch thành công 24/24 routes.

---

## 1. THỐNG KÊ TỔNG QUAN

- **Ban đầu:** 34 dependencies
- **Đã gỡ bỏ tại E9 (13 gói):**
  - **Nhóm E9.1 (4 gói Drag & Drop):** `@dnd-kit/core`, `@dnd-kit/modifiers`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
  - **Nhóm E9.2 (9 gói UI/Date/Query):** `cmdk`, `react-day-picker`, `vaul`, `@radix-ui/react-separator`, `@radix-ui/react-accordion`, `radix-ui`, `date-fns`, `@date-fns/utc`, `@tanstack/react-query`
- **Hiện tại còn lại:** 21 dependencies tinh gọn (giữ lại các component UI cho Radix/Shadcn, Supabase, TanStack Table, Lucide, XLSX, Zod).

---

## 2. BẢNG TRẠNG THÁI 27 DEPENDENCY TẠI E9

| STT | Tên Gói Thư Viện | Quyết Định Tại E9 | Lý Do & Bằng Chứng |
|---|---|---|---|
| 1 | `@dnd-kit/core` | **ĐÃ GỠ (E9.1)** | Không dùng kéo thả trong app |
| 2 | `@dnd-kit/modifiers` | **ĐÃ GỠ (E9.1)** | Không dùng kéo thả |
| 3 | `@dnd-kit/sortable` | **ĐÃ GỠ (E9.1)** | Không dùng kéo thả |
| 4 | `@dnd-kit/utilities` | **ĐÃ GỠ (E9.1)** | Không dùng kéo thả |
| 5 | `cmdk` | **ĐÃ GỠ (E9.2)** | Không dùng Command Palette |
| 6 | `react-day-picker` | **ĐÃ GỠ (E9.2)** | Không dùng bộ chọn ngày |
| 7 | `vaul` | **ĐÃ GỠ (E9.2)** | Không dùng drawer vuốt mobile |
| 8 | `@radix-ui/react-separator` | **ĐÃ GỠ (E9.2)** | Dùng border thuần của Tailwind |
| 9 | `@radix-ui/react-accordion` | **ĐÃ GỠ (E9.2)** | Không dùng accordion phức tạp |
| 10 | `radix-ui` | **ĐÃ GỠ (E9.2)** | Gói gom trùng lặp với gói lẻ |
| 11 | `date-fns` | **ĐÃ GỠ (E9.2)** | Dùng Intl và native Date của JS |
| 12 | `@date-fns/utc` | **ĐÃ GỠ (E9.2)** | Dùng native Date của JS |
| 13 | `@tanstack/react-query` | **ĐÃ GỠ (E9.2)** | App dùng Server Actions & Supabase client trực tiếp |
| 14 | `@radix-ui/react-slider` | **GIỮ LẠI** | Dùng cho thanh trượt biên lợi nhuận % và định mức hao hụt |
| 15 | `@radix-ui/react-tooltip` | **GIỮ LẠI** | Dùng cho HelpTooltip giải thích thuật ngữ |
| 16 | `@radix-ui/react-dialog` | **GIỮ LẠI** | Dùng cho Modal ánh xạ, kho mẫu, sổ tay kỹ thuật |
| 17 | `@radix-ui/react-popover` | **GIỮ LẠI** | Dùng cho popover bộ lọc |
| 18 | `@radix-ui/react-dropdown-menu`| **GIỮ LẠI** | Dùng cho menu ngữ cảnh |
| 19 | `@radix-ui/react-checkbox` | **GIỮ LẠI** | Dùng cho chọn phôi hàng loạt |
| 20 | `@radix-ui/react-slot` | **GIỮ LẠI** | Cốt lõi của Shadcn / Radix polymorphism |
| 21 | `class-variance-authority` | **GIỮ LẠI** | Biến thể button và component |
| 22 | `clsx` | **GIỮ LẠI** | Nối class Tailwind điều kiện |
| 23 | `tailwind-merge` | **GIỮ LẠI** | Ghép class Tailwind không xung đột |
| 24 | `sonner` | **GIỮ LẠI** | Toast thông báo |
| 25 | `@tanstack/react-virtual` | **GIỮ LẠI** | Tối ưu hóa render bảng Cutlist lớn |
| 26 | `@supabase/supabase-js` | **GIỮ LẠI** | Thư viện lõi nền tảng cho `@supabase/ssr` |
| 27 | `react-dom` | **GIỮ LẠI** | Thư viện nền tảng bắt buộc của React |
