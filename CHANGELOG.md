# Nhật Ký Thay Đổi (CHANGELOG.md)

Tất cả các thay đổi đáng chú ý của dự án **AutoCutlist** sẽ được ghi chép tại file này.  
Định dạng dựa trên [Keep a Changelog](https://keepachangelog.com/vi/1.0.0/), và dự án tuân thủ [Semantic Versioning](https://semver.org/lang/vi/).

---

## [1.0.0-rc.1] - 2026-10-31

### Đã thêm (Added)
- **Lõi tính giá tổng quát (General CostLines Engine):** Hỗ trợ 6 loại quy tắc số lượng (`fixed`, `perDriver`, `tiers`, `perTaggedPart`, `percentOfGroup`, `manual`), hỗ trợ 11 danh mục vật tư.
- **Hệ thống mẫu cấu hình xưởng (Presets):** Mẫu ván công nghiệp chuẩn xưởng và mẫu thầu thi công trọn gói nội thất.
- **Quy trình 3 bước trực quan (`/quoting`):** Nhập Cutlist Excel -> Xem Báo Giá & BOM xưởng -> Xuất Báo Cáo & In Ấn A4.
- **Chế độ làm việc nâng cao (Advanced Mode):** Ghi nhớ cài đặt trên máy người dùng, tích hợp bộ lọc 6 tiêu chí độc lập hiển thị (được bảo chứng bằng unit test toán học).
- **Chia sẻ báo giá an toàn bằng Secure Link:**
  - Token ngẫu nhiên 64 ký tự hex bảo mật, băm SHA-256 lưu trữ trong cơ sở dữ liệu.
  - RPC PostgreSQL `get_shared_quote` chạy chế độ `SECURITY DEFINER` che giấu hoàn toàn giá vốn, định mức hao hụt và chi tiết tấm phôi.
  - Trang xem và in trực tuyến `/share/[token]` chuẩn in ấn A4, tích hợp `X-Robots-Tag: noindex, nofollow`.
- **Hệ thống bảo vệ dữ liệu cá nhân & An ninh thông tin (D1 - D10):**
  - Chống tự nâng cấp gói cước (`subscription_tier`) qua Column-level Grants và RLS đa thành viên.
  - Bộ chắn API (`api-guard.ts`): Rate limiting sliding window, giới hạn dung lượng body request, khử sạch số điện thoại và email khách hàng.
  - Webhook thanh toán an toàn với kiểm tra trùng lặp (`payment_events`) và xác thực chữ ký HMAC-SHA256.
  - Các trang pháp lý `/terms` và `/privacy` đạt chuẩn Nghị định 13/2023/NĐ-CP.
  - Tính năng trích xuất toàn bộ dữ liệu xưởng (Data Portability JSON) và xóa tài khoản vĩnh viễn 2 bước (`/api/user/delete-account`).
  - Toàn bộ 82 unit tests tự động đảm bảo độ ổn định và tính bất biến của bộ số vàng xưởng mộc.

### Đã thay đổi (Changed)
- Chuyển đổi định danh phiên bản dự án v2 bằng trường dữ liệu tường minh `versionNo` thay vì kiểm tra chuỗi `projectName.includes("(v")`.
- Gỡ bỏ 13 gói thư viện không sử dụng, rút gọn bộ phụ thuộc còn đúng 21 dependencies tối giản.

### Đã sửa (Fixed)
- Sửa lỗi hydration khi đọc cấu hình nâng cao trong Next.js App Router bằng cách chuyển sang `useEffect`.
- Bảo toàn tuyệt đối số vàng dự toán kinh điển: Giá vốn 16.281.950 đ, Giá bán 26.865.218 đ tại hệ số $k = 1.65$.
