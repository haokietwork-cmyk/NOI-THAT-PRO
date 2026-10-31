# DANH SÁCH 27 DEPENDENCY CHƯA SỬ DỤNG TRỰC TIẾP (UNUSED DEPENDENCIES AUDIT)

> **Căn cứ:** Rà soát tự động toàn bộ codebase tại Bước D8.
> **Kế hoạch xử lý:** Không gỡ ngay ở giai đoạn D để tránh làm gãy các component chuẩn bị dùng cho Bước 4 (Chế độ nâng cao, Stepper, Slider). Việc dọn dẹp sẽ thực hiện từng nhóm nhỏ kèm kiểm thử tại **E9**.

---

## 1. THỐNG KÊ TỔNG QUAN

- **Tổng số dependencies trong package.json:** 34
- **Đang được import sử dụng trực tiếp (7):**
  1. `@supabase/ssr` (Quản lý session Supabase App Router)
  2. `@tanstack/react-table` (Bảng chi tiết phôi ván Cutlist)
  3. `lucide-react` (Bộ icon kỹ thuật xưởng mộc)
  4. `next` (Framework Next.js 16)
  5. `react` (React 19)
  6. `xlsx` (Thư viện phân tích file Excel client-side)
  7. `zod` (Kiểm duyệt dữ liệu schema đầu vào)
- **Chưa import trực tiếp (27):** Xem bảng phân loại bên dưới.

---

## 2. BẢNG PHÂN LOẠI CHI TIẾT 27 DEPENDENCY

| STT | Tên Gói Thư Viện | Lý Do Hiện Diện & Dự Kiến Sử Dụng Tại Bước 4 / Phase E | Trạng Thái Tại E9 |
|---|---|---|---|
| 1 | `@radix-ui/react-slider` | Cần cho thanh trượt điều chỉnh biên lợi nhuận % và hệ số hao hụt trong Chế độ nâng cao | **GIỮ LẠI CHO BƯỚC 4** |
| 2 | `@radix-ui/react-tooltip` | Cần cho `HelpTooltip` giải thích công thức hao hụt và nhãn ước tính | **GIỮ LẠI CHO BƯỚC 4** |
| 3 | `clsx` | Hỗ trợ nối class Tailwind có điều kiện cho Stepper 3 bước và Badge | **GIỮ LẠI CHO BƯỚC 4** |
| 4 | `tailwind-merge` | Tránh xung đột class Tailwind khi override style UI | **GIỮ LẠI CHO BƯỚC 4** |
| 5 | `sonner` | Toast thông báo lưu thành công và cảnh báo khi tải Cutlist | **GIỮ LẠI CHO BƯỚC 4** |
| 6 | `@radix-ui/react-dialog` | Modal xác nhận lưu/xóa/chọn preset | **GIỮ LẠI CHO BƯỚC 4** |
| 7 | `@radix-ui/react-popover` | Popover bộ lọc 6 tiêu chí | **GIỮ LẠI CHO BƯỚC 4** |
| 8 | `@radix-ui/react-dropdown-menu` | Menu thao tác nhanh từng dòng chi tiết phôi | **GIỮ LẠI CHO BƯỚC 4** |
| 9 | `@radix-ui/react-checkbox` | Checkbox chọn hàng loạt tấm trong bảng | **GIỮ LẠI CHO BƯỚC 4** |
| 10 | `@radix-ui/react-separator` | Đường kẻ phân cách UI | Đánh giá gỡ tại E9 |
| 11 | `@radix-ui/react-accordion` | Thu gọn/mở rộng từng module thành phẩm | Đánh giá gỡ tại E9 |
| 12 | `@radix-ui/react-slot` | Dependency phụ của Shadcn Button | Giữ lại cùng Button |
| 13 | `class-variance-authority` | Cấu hình biến thể nút bấm | Giữ lại cùng Button |
| 14 | `radix-ui` | Gói gom chung Radix | Gỡ tại E9 (đã có package lẻ) |
| 15 | `@tanstack/react-query` | Caching API | Đánh giá gỡ tại E9 |
| 16 | `@tanstack/react-virtual` | Virtual scroll danh sách 5.000 tấm | Cân nhắc giữ nếu cần tối ưu bảng |
| 17 | `@supabase/supabase-js` | Dependency lõi của @supabase/ssr | Giữ lại (peer dependency) |
| 18 | `react-dom` | Thư viện nền tảng React | Bắt buộc giữ lại cho React |
| 19 | `@dnd-kit/core` | Kéo thả sắp xếp thứ tự module | Gỡ tại E9 nếu không dùng kéo thả |
| 20 | `@dnd-kit/sortable` | Kéo thả chi tiết | Gỡ tại E9 |
| 21 | `@dnd-kit/modifiers` | Kéo thả bổ trợ | Gỡ tại E9 |
| 22 | `@dnd-kit/utilities` | Tiện ích kéo thả | Gỡ tại E9 |
| 23 | `cmdk` | Hộp lệnh Cmd+K | Gỡ tại E9 |
| 24 | `date-fns` | Xử lý ngày tháng | Đánh giá gỡ tại E9 |
| 25 | `@date-fns/utc` | UTC helper | Đánh giá gỡ tại E9 |
| 26 | `react-day-picker` | Bộ chọn lịch ngày | Gỡ tại E9 |
| 27 | `vaul` | Drawer mobile vuốt từ dưới lên | Gỡ tại E9 |
