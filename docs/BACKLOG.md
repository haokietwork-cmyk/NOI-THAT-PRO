# BACKLOG KỸ THUẬT & AN NINH HỆ THỐNG
## Nền Tảng Web Bóc Tách Vật Tư Nội Thất & Báo Giá Tự Động

> **Tài liệu ghi nhận các hạng mục kỹ thuật, an ninh và kiến trúc cần triển khai tiếp theo.**  
> *Lưu ý: Tài liệu backlog phục vụ việc quy hoạch kỹ thuật trước khi bước vào giai đoạn cài đặt mã nguồn.*

---

## 1. ĐÓNG BĂNG DỰ ÁN KHI ĐÃ DUYỆT (PROJECT FREEZE ON STATUS `approved`)

### 1.1. Bối Cảnh Nghiệp Vụ
- Khi báo giá đã được khách hàng chốt duyệt hoặc xưởng chuyển sang trạng thái sản xuất (`status = 'approved'` hoặc `'in_production'`), giá trị hợp đồng và danh mục tấm cắt đã trở thành căn cứ pháp lý và căn cứ sản xuất.
- Nếu thợ kỹ thuật hoặc người dùng vô tình kéo trượt hệ số lãi, thay đổi quy cách ván hoặc sửa danh sách tấm thì toàn bộ số liệu giá vốn, giá bán và bản đặt ván BOM sẽ bị sai lệch so với thỏa thuận ban đầu.

### 1.2. Giải Pháp Kỹ Thuật Dự Kiến
1. **Ràng buộc Database (Server-side Postgres Trigger):**
   - Viết hàm trigger `fn_prevent_frozen_project_modifications()` gắn vào hai bảng `projects` và `project_items`:
     - Kiểm tra nếu `OLD.status IN ('approved', 'in_production', 'finalized')`:
       - Chặn toàn bộ thao tác `DELETE` trên cả hai bảng.
       - Chặn thao tác `UPDATE` trên `project_items`.
       - Chặn thao tác `UPDATE` trên `projects`, ngoại trừ duy nhất trường hợp trường `status` được chuyển về `'draft'` (mở khóa) bởi người dùng sở hữu quyền quản trị.
     - Ghi nhận `unfreeze_audit_log` (lý do mở khóa, thời gian, người thực hiện) khi dự án được mở khóa để kiểm toán.
2. **Khóa Giao Diện (Client-side Lockdown):**
   - Khi `project.status === 'approved'`:
     - Ẩn hoặc vô hiệu hóa các nút "Sửa Cutlist", nút "Lưu thay đổi", thanh trượt điều chỉnh biên lợi nhuận.
     - Hiển thị badge biểu tượng ổ khóa an toàn: *"Dự án đã chốt duyệt - Dữ liệu đang được đóng băng"*.
     - Bổ sung nút *"Mở khóa để sửa lại"* kèm hộp thoại xác nhận cảnh báo rủi ro nhảy giá hợp đồng.

---

## 2. QUẢN LÝ LINK CHIA SẺ BÁO GIÁ (QUOTE SHARE LINKS - EXPIRATION & REVOCATION)

### 2.1. Bối Cảnh Nghiệp Vụ
- Xưởng cần gửi đường dẫn trực tuyến (`/share/quote/[token]`) để khách hàng xem bản báo giá A4 tương tác trên điện thoại hoặc máy tính mà không bắt buộc khách phải đăng nhập tài khoản.
- Tuy nhiên:
  - Báo giá nội thất luôn có thời hạn (thường từ 7 đến 15 ngày) do biến động giá ván và phụ kiện thị trường.
  - Khi có tranh chấp, đàm phán lại hoặc hủy hợp đồng, xưởng cần có quyền thu hồi link chia sẻ ngay lập tức.

### 2.2. Giải Pháp Kỹ Thuật Dự Kiến
1. **Mô Hình Dữ Liệu Bảng `project_share_tokens`:**
   - `id`: UUID khóa chính.
   - `project_id`: Khóa ngoại tham chiếu `projects(id)` ON DELETE CASCADE.
   - `token_hash`: Chuỗi SHA-256 mã hóa token bí mật (không lưu token dạng plain text).
   - `expires_at`: Mốc thời gian hết hạn (mặc định +14 ngày kể từ ngày tạo).
   - `revoked_at`: Mốc thời gian bị thu hồi thủ công (NULL nếu đang hoạt động).
   - `max_views`: Số lượt xem tối đa được phép (tùy chọn).
   - `view_count`: Đếm số lần khách hàng đã mở link.
   - `created_at`: Thời gian phát hành link.
2. **Cơ Chế Bảo Vệ & Thu Hồi:**
   - **Xác thực Token:** Endpoint công khai `/api/share/[token]` kiểm tra: `revoked_at IS NULL AND expires_at > NOW()`. Nếu không thỏa mãn, trả về màn hình thông báo *"Báo giá đã hết hạn hiệu lực hoặc đã được xưởng thu hồi. Quý khách vui lòng liên hệ trực tiếp xưởng để nhận báo giá mới nhất"*.
   - **Nút Thu Hồi Tức Thì (Instant Revoke):** Tại trang chi tiết dự án, cung cấp nút *"Hủy link chia sẻ"* để cập nhật `revoked_at = NOW()`, vô hiệu hóa link ngay lập tức.
   - **Ghi Nhận Lượt Mở:** Cập nhật `view_count` và thời điểm khách xem gần nhất để xưởng nắm bắt mức độ quan tâm của khách hàng.

---

## 3. RÀ SOÁT VÀ GIA CỐ AN NINH 3 TUYẾN API ROUTES

### 3.1. Tuyến `/api/webhooks/payment` (Webhook Cổng Thanh Toán VietQR / SePay / PayOS)
- **Rủi ro hiện tại:** Nếu không xác thực nguồn gốc hoặc thiếu cơ chế chống phát lại, kẻ xấu có thể gửi request POST giả lập tín hiệu thanh toán thành công để kích hoạt tài khoản hoặc đơn hàng lisp trái phép.
- **Biện pháp gia cố:**
  1. **HMAC-SHA256 Signature Verification:**
     - Sử dụng `PAYMENT_WEBHOOK_SECRET` trong biến môi trường.
     - Tính mã băm HMAC của raw payload và so sánh timing-safe (`crypto.timingSafeEqual`) với chữ ký trên Header (`x-signature` / `x-sepay-signature`).
  2. **Chống Tấn Công Phát Lại (Replay Attack Prevention):**
     - Lưu trữ `transaction_id` hoặc `reference_code` vào bảng `payment_transactions` có ràng buộc `UNIQUE`.
     - Nếu nhận trùng mã giao dịch, trả về HTTP 200 ngay lập tức mà không cộng tiền/kích hoạt lại.
  3. **Kiểm Tra Số Tiền Tuyệt Đối:**
     - So khớp chính xác số tiền chuyển khoản thực tế với giá trị gói cước trong cơ sở dữ liệu trước khi nâng cấp tài khoản.

### 3.2. Tuyến `/api/license/verify` (Xác Thực Bản Quyền Plugin AutoCAD AutoLISP)
- **Rủi ro hiện tại:** Nguy cơ bị tấn công vét cạn (brute-force) dò tìm license key, hoặc sửa đổi phản hồi HTTP qua proxy cục bộ để kích hoạt plugin lậu.
- **Biện pháp gia cố:**
  1. **Giới Hạn Tần Suất Truy Cập (Rate Limiting):**
     - Áp dụng rate limiting theo IP và Machine ID: Tối đa 10 requests / phút trên mỗi địa chỉ IP. Trả về mã lỗi `429 Too Many Requests` khi vượt ngưỡng.
  2. **Chữ Ký Phản Hồi (Signed Response):**
     - Thay vì chỉ trả về `{ valid: true }`, server ký số payload phản hồi bằng khóa bí mật (Ed25519 hoặc HMAC): `{ valid: true, machine_id, exp, signature }`. AutoLISP plugin kiểm tra chữ ký này trước khi cấp quyền vẽ.
  3. **Ràng Buộc Phần Cứng (Hardware Fingerprinting):**
     - Thuật toán băm kết hợp Volume Serial Number và CPU ID cùng Salt bảo mật để chống việc sao chép file cấu hình sang máy tính khác.

### 3.3. Tuyến `/api/projects/direct-ingest` (Nạp Dữ Liệu Bóc Tách Trực Tiếp Từ CAD/SketchUp)
- **Rủi ro hiện tại:** Tuyến nhận mảng chi tiết tấm lớn từ các plugin máy tính; có nguy cơ bị spam payload rác, tấn công từ chối dịch vụ (DoS) hoặc chèn dữ liệu không đúng cấu trúc schema.
- **Biện pháp gia cố:**
  1. **Xác Thực Định Danh Bắt Buộc (API Key / Personal Access Token):**
     - Mọi request gửi lên từ plugin ngoài máy xưởng phải kèm Header `Authorization: Bearer <user_pat>`. Xác thực user id hợp lệ trước khi chạm vào logic tính toán.
  2. **Kiểm Soát Kích Thước & Tải Trọng Payload (Payload Validation):**
     - Giới hạn kích thước body request tối đa 5MB.
     - Sử dụng thư viện kiểm chứng định dạng (Zod Schema) để kiểm soát nghiêm ngặt từng phần tử tấm trong mảng:
       - `lengthMm`, `widthMm`, `thicknessMm`, `qty`: Bắt buộc là số dương hợp lệ, nằm trong khoảng kích thước vật lý khả thi (ví dụ: $0 < \text{dài} \le 5000\text{ mm}$).
       - Chặn các chuỗi ký tự độc hại, SQL injection hoặc mảng dữ liệu rỗng.
  3. **Cấu Hình CORS Chặt Chẽ:**
     - Chỉ cho phép các domain được xác định hoặc desktop client có header định danh hợp lệ.
