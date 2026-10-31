# HƯỚNG DẪN THIẾT LẬP BẢO MẬT SUPABASE AUTH (HARDENED AUTH SETUP)

> **Dự án:** Nền tảng SaaS AutoCutlist (`webnoithatpro.vn`)  
> **Cập nhật:** Tháng 10/2026 | **Tài liệu dành cho:** Quản trị viên dự án (Admin / Product Owner)

---

## 1. TỔNG QUAN

Tài liệu này hướng dẫn các bước thiết lập trực tiếp trên **Supabase Console** (giao diện web quản trị Supabase) nhằm bảo vệ hệ thống tài khoản xưởng nội thất, chống tấn công brute-force, phòng ngừa bot spam và kiểm soát chi phí SMS OTP.

---

## 2. BẬT XÁC NHẬN EMAIL (EMAIL CONFIRMATION)

1. Truy cập: `Supabase Dashboard` → Chọn Project của bạn.
2. Điều hướng tới: `Authentication` → `Providers` → `Email`.
3. Bật tùy chọn: **Confirm email** (`Enable Email Confirmations` = ON).
4. Thiết lập thời gian hiệu lực của mã xác thực (OTP Expiry): Khuyến nghị **300 giây (5 phút)**.
5. Tùy chỉnh Email Template:
   - `Confirm signup`: Đổi tiêu đề sang tiếng Việt: *"[AutoCutlist] Xác nhận kích hoạt tài khoản xưởng nội thất"*.
   - `Reset password`: *"[AutoCutlist] Yêu cầu đặt lại mật khẩu đăng nhập"*.

---

## 3. DANH SÁCH URL CHUYỂN HƯỚNG CHO PHÉP (REDIRECT URLS WHITELIST)

Để chống tấn công **Open Redirect** (kẻ gian lợi dụng link đăng nhập để chuyển hướng người dùng sang trang web giả mạo lừa đảo), BẮT BUỘC chỉ cho phép các URL hợp lệ sau trong phần `Authentication` → `URL Configuration`:

### Site URL:
- Production: `https://webnoithatpro.vn`
- Local (khi chạy dev): `http://localhost:3000`

### Redirect URLs (Allowed Callback URLs):
- `http://localhost:3000/**` (cho môi trường lập trình)
- `https://webnoithatpro.vn/**` (cho môi trường Production)
- `https://*.vercel.app/**` (cho các bản Preview PR trên Vercel)

---

## 4. CHỐNG TẤN CÔNG BRUTE-FORCE & GIỚI HẠN TẦN SUẤT (RATE LIMITING)

Tại `Authentication` → `Rate Limits`:
- **Email rate limit:** Tối đa 5 email / 1 giờ cho mỗi địa chỉ email (chống flood hòm thư).
- **Password attempts:** Khóa tạm thời 15 phút nếu nhập sai mật khẩu quá 5 lần liên tiếp.
- **Anonymous signups:** Giới hạn 10 lần / 1 IP / 1 giờ.

---

## 5. BẢO VỆ MẬT KHẨU (PASSWORD STRENGTH & LEAK PROTECTION)

Tại `Authentication` → `Password Policy`:
- Độ dài tối thiểu: **8 ký tự**.
- Yêu cầu kết hợp: Có chữ hoa, chữ thường và chữ số.
- **Pwned Passwords Check (nếu gói Supabase hỗ trợ):** Bật tùy chọn kiểm tra mật khẩu đã từng bị rò rỉ trên internet qua cơ sở dữ liệu HaveIBeenPwned để cảnh báo người dùng đổi mật khẩu an toàn hơn.

---

## 6. PHÒNG CHỐNG SPAM BOT QUA CAPTCHA (CLOUDFLARE TURNSTILE)

Nếu phát hiện hiện tượng đăng ký tài khoản ảo hàng loạt (bot spam):
1. Đăng ký tài khoản miễn phí tại **Cloudflare Turnstile** (thân thiện hơn Google reCAPTCHA, người dùng không phải bấm chọn đèn giao thông/biển báo).
2. Lấy `Site Key` và `Secret Key`.
3. Nhập vào: Supabase Dashboard → `Authentication` → `Bot Protection` (Enable CAPTCHA).

---

## 7. ĐĂNG NHẬP BẰNG SỐ ĐIỆN THOẠI (PHONE SMS AUTH) & CẢNH BÁO CHI PHÍ

> [!WARNING]
> **Cảnh Báo Về Chi Phí SMS Và Tấn Công SMS Pumping:**
> 1. Mỗi tin nhắn SMS OTP gửi qua nhà mạng Việt Nam (Viettel, VNPT, FPT Telecom) có chi phí từ 350đ – 800đ/tin.
> 2. Các mạng bot quốc tế thường xuyên dò quét form đăng ký có SMS để thực hiện tấn công **SMS Pumping (Toll Fraud)**, gửi hàng ngàn tin nhắn đến đầu số quốc tế hoặc đầu số chia sẻ doanh thu, có thể gây thiệt hại hàng triệu đến hàng chục triệu đồng chỉ trong vài giờ.

### Đề xuất lựa chọn dành cho Chủ sở hữu:
- **Phương án A (Khuyến nghị cao nhất):** Sử dụng **Email + Mật khẩu** làm phương thức đăng nhập chính thức. Số điện thoại chỉ là trường thông tin liên hệ được lưu trong hồ sơ xưởng để in lên báo giá A4.
- **Phương án B (Nếu vẫn muốn dùng SMS OTP):**
  - Chỉ cho phép gửi SMS tới các đầu số di động Việt Nam (`+843`, `+845`, `+847`, `+848`, `+849`), chặn 100% đầu số quốc tế.
  - Bắt buộc kích hoạt Cloudflare Turnstile CAPTCHA trước khi nút "Gửi mã OTP" được kích hoạt.
  - Giới hạn cứng ngân sách SMS hàng tháng trên cổng Brandname (ví dụ tối đa 500.000 đ/tháng).
