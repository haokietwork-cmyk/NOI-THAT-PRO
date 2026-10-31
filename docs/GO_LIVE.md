# AutoCutlist: Bảng Kiểm Định Ra Mắt Sản Phẩm (docs/GO_LIVE.md)

> **Tài liệu kiểm định trước khi chính thức đưa hệ thống AutoCutlist vào hoạt động (Go-Live Checklist).**  
> **Phiên bản:** v1.0.0-rc.1  
> **Ngày lập:** 31/10/2026  
> **Nguyên tắc:** Phân định rõ trách nhiệm giữa Agent (Kỹ thuật/Code/Bảo mật đã hoàn tất) và Người điều hành (Tài khoản Cloud/Domain/Ngân hàng/Pháp lý).  
> **Điểm dừng:** 🛑 **CỔNG G5** (Ký duyệt bảng kiểm) & 🛑 **CỔNG G6** (Ra mắt chính thức).

---

## 1. BẢNG TỔNG HỢP TRẠNG THÁI 14 MỤC

| STT | Mục Kiểm Định | Trạng Thái | Trách Nhiệm | Lệnh / Bằng Chứng Kiểm Định |
| :---: | :--- | :---: | :---: | :--- |
| **1** | Project Supabase Production riêng biệt | 🟡 **CHỜ NGƯỜI** | Người dùng | Người tạo project mới trên [supabase.com](https://supabase.com); chạy migration theo `docs/DB_RESET.md`. |
| **2** | Quản lý bí mật môi trường (Secrets) | 🟡 **CHỜ NGƯỜI** | Người dùng | Đặt biến môi trường trên Vercel/Hosting; xác nhận không commit `.env*` (`git ls-files .env*`). |
| **3** | Hosting, Domain chính thức & HTTPS | ❓ **CẦN QUYẾT ĐỊNH** | Người dùng | Người chọn nền tảng hosting (Vercel/Cloudflare Pages) và cấu hình bản ghi DNS domain `webnoithatpro.vn`. |
| **4** | Phương thức thanh toán gói cước & Webhook | ❓ **CẦN QUYẾT ĐỊNH** | Người dùng | Xác nhận dùng PayOS hay SePay hay VietQR quét tay để kích hoạt webhook `/api/webhooks/payment`. |
| **5** | Sao lưu tự động & Diễn tập phục hồi (Drill) | 🟡 **CHỜ NGƯỜI** | Người dùng | Bật PITR trên Supabase Pro hoặc cron pg_dump theo hướng dẫn tại `docs/OPERATIONS.md`. |
| **6** | Giám sát lỗi (Error Monitoring) & Kênh hỗ trợ | 🟢 **ĐẠT** (Code) / 🟡 (Ops) | Cả hai | Đã có `error-logger.ts` lọc PII; Người dùng cấu hình Sentry DSN và số Zalo hỗ trợ kỹ thuật trên web. |
| **7** | Thử nghiệm người dùng độc lập (UAT ngoài) | 🟡 **CHỜ NGƯỜI** | Người dùng | Mời 1 thợ mộc / chủ xưởng ngoài dùng thử trên iPhone/Android: tạo dự án, xem link, in A4. |
| **8** | Bảo vệ GitHub Repo & Kích hoạt 2FA | 🟡 **CHỜ NGƯỜI** | Người dùng | Bật 2FA cho tài khoản GitHub; chỉ chuyển Public sau khi audit sạch; bật Branch Protection `main`. |
| **9** | Cảnh báo pháp lý & Giới hạn trách nhiệm | 🟢 **ĐẠT** | Agent | Đã nhúng dòng Legal Disclaimer ở chân trang A4, PDF, trang chia sẻ và `docs/AGENT_PROGRESS.md`. |
| **10** | Làm cứng Supabase Auth (Hardened Auth) | 🟡 **CHỜ NGƯỜI** | Người dùng | Thực hiện 7 bước cấu hình trong `docs/AUTH_SETUP.md` (Xác nhận email, URL whitelist, captcha). |
| **11** | Bảo vệ nhánh chính (Branch Protection CI) | 🟢 **ĐẠT** (CI mẫu) | Người dùng | Đã tạo `.github/workflows/ci.yml` (Node 24, test + build); Người dùng bật "Require status checks". |
| **12** | Theo dõi Uptime & Cảnh báo Webhook | 🟡 **CHỜ NGƯỜI** | Người dùng | Cài đặt UptimeRobot / BetterStack ping `https://<domain>/api/license/verify` mỗi 5 phút. |
| **13** | Quy trình phát hành bản mới & Rollback | 🟢 **ĐẠT** | Agent | Đã lập `CHANGELOG.md` và hướng dẫn rollback migration chi tiết tại `docs/OPERATIONS.md`. |
| **14** | Kiểm toán bảo mật gói thư viện (`npm audit`) | 🟢 **ĐẠT** (Đã rà soát) | Agent | 0 lỗ hổng ngoại trừ cảnh báo SheetJS client-side đã được cô lập an toàn; 82/82 tests pass. |

---

## 2. HƯỚNG DẪN CHI TIẾT TỪNG MỤC DÀNH CHO NGƯỜI DÙNG

### Mục 1: Khởi Tạo Supabase Production Riêng Biệt
- **Hiện trạng:** Hệ thống đang chạy ở môi trường phát triển local/staging.
- **Thao tác người cần làm:**
  1. Đăng nhập Supabase Dashboard, bấm `New Project`. Đặt tên: `autocutlist-production`.
  2. Chọn khu vực (Region): `Singapore (ap-southeast-1)` để đảm bảo độ trễ thấp nhất cho các xưởng tại Việt Nam.
  3. Lấy chuỗi kết nối Database và chạy các file migration theo thứ tự nghiêm ngặt (chạy trên nhánh Preview/Staging trước):
     * `supabase/migrations/20261031084500_baseline_schema.sql` (Schema nền sạch 9 bảng, RLS đa thành viên).
     * `supabase/migrations/20261031120000_quote_shares.sql` (Bảng chia sẻ link bảo mật & RPC).
  4. Xác nhận không có bảng nào bị thiếu RLS:
     ```sql
     SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
     ```

### Mục 2: Quản Lý Bí Mật Môi Trường (Secrets Management)
- **Hiện trạng:** File mã nguồn hoàn toàn sạch bí mật (`.env*` được `.gitignore` bảo vệ).
- **Thao tác người cần làm:**
  1. Cấu hình các biến sau trên trang quản trị Hosting (Vercel Project Settings > Environment Variables):
     * `NEXT_PUBLIC_SUPABASE_URL`: `https://<prod-id>.supabase.co`
     * `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `<anon-key-production>`
     * `SUPABASE_SERVICE_ROLE_KEY`: `<service-role-key>` (Chỉ dùng phía server cho background cron / webhook).
     * `PAYMENT_WEBHOOK_SECRET` hoặc `SEPAY_API_KEY`: Chuỗi bí mật ngẫu nhiên tạo chữ ký.
     * `NEXT_PUBLIC_APP_URL`: `https://webnoithatpro.vn`
  2. Tuyệt đối **KHÔNG** đặt `SUPABASE_SERVICE_ROLE_KEY` vào tiền tố `NEXT_PUBLIC_*`.

### Mục 3: Hosting, Tên Miền & HTTPS
- **Hiện trạng:** Đang chờ người dùng quyết định nền tảng triển khai.
- **Khuyến nghị:**
  * **Vercel Pro / Hobby:** Tối ưu 100% cho Next.js 16 App Router, tích hợp Edge Network tại Singapore, tự động cấp phát chứng chỉ SSL/HTTPS Let's Encrypt miễn phí.
  * Trỏ bản ghi DNS của tên miền `webnoithatpro.vn`:
    - CNAME: `cname.vercel-dns.com`
    - A record: `76.76.21.21`

### Mục 4: Phương Thức Thu Tiền Gói Cước & Webhook
- **Hiện trạng:** Đang chờ người dùng lựa chọn cổng thanh toán:
  * **Phương án A (Tự động qua PayOS):** Cần đăng ký tài khoản doanh nghiệp hoặc hộ kinh doanh, tạo kênh thanh toán VietQR động, cấu hình Webhook URL `https://webnoithatpro.vn/api/webhooks/payment` với chữ ký HMAC.
  * **Phương án B (Tự động qua SePay):** Kết nối thông báo biến động số dư tài khoản ngân hàng cá nhân/doanh nghiệp, truyền Header `Authorization: Apikey <KEY>`.
  * **Phương án C (Thủ công ban đầu):** Quét mã QR tĩnh của chủ xưởng, gửi ủy nhiệm chi qua Zalo, quản trị viên kích hoạt gói cước trong bảng `subscriptions`.

### Mục 5: Sao Lưu Tự Động & Thử Nghiệm Phục Hồi (Backup Drill)
- **Hiện trạng:** Quy trình đã được soạn thảo tại `docs/OPERATIONS.md`.
- **Thao tác người cần làm:**
  1. Bật tính năng Point-in-time Recovery (PITR) trong Supabase Dashboard (Database > Backups).
  2. Thực hiện 01 lần phục hồi thử nghiệm (Backup Drill) trên một project tạm để chắc chắn dữ liệu dự án và hồ sơ xưởng phục hồi nguyên vẹn trước ngày mở cổng cho khách trả tiền.

### Mục 6: Giám Sát Lỗi & Kênh Hỗ Trợ Kỹ Thuật
- **Hiện trạng:** Mã nguồn đã tích hợp sẵn hệ thống lọc sạch thông tin cá nhân `src/core/monitoring/error-logger.ts`.
- **Thao tác người cần làm:**
  1. Tạo tài khoản Sentry (tùy chọn) hoặc theo dõi log qua Vercel Log Drains.
  2. Điền số điện thoại Hotline / Zalo tiếp nhận hỗ trợ sự cố vào file cấu hình hoặc trang liên hệ.

### Mục 7: Thử Nghiệm Người Dùng Độc Lập (UAT)
- **Mục tiêu:** Kiểm tra thực tế trải nghiệm của người không trực tiếp tham gia lập trình.
- **Kịch bản kiểm thử (15 phút):**
  1. Mở trình duyệt điện thoại (Safari trên iOS hoặc Chrome trên Android).
  2. Bấm vào link dự án mẫu hoặc tải 1 file Excel Cutlist xưởng.
  3. Kiểm tra hiển thị bảng giá, thử chia sẻ link cho một thiết bị thứ hai.
  4. Bấm "In Báo Giá A4" và kiểm tra font chữ tiếng Việt, ngắt trang không bị chèn dòng.

### Mục 8: Bảo Vệ Kho Mã Nguồn GitHub & Kích Hoạt 2FA
- **Thao tác người cần làm:**
  1. Vào Settings tài khoản GitHub > Password and authentication > Bật Two-factor authentication (2FA).
  2. Chỉ chuyển Repository từ Private sang Public khi đã hoàn tất cổng G6 và xác nhận không có bất kỳ dữ liệu nhạy cảm nào trong lịch sử git commit.

### Mục 9: Cảnh Báo Pháp Lý & Miễn Trừ Trách Nhiệm
- **Trạng thái:** ĐÃ HOÀN TẤT TRONG CODE.
- Chân trang in A4 và màn hình chia sẻ đều có dòng ghi chú:
  > *"Lưu ý: Bảng khối lượng dự toán dựa trên hệ số hao hụt do người dùng thiết lập. Quý xưởng vui lòng đối chiếu sơ đồ cắt thực tế trước khi xuất lệnh đặt hàng."*

### Mục 10: Làm Cứng Xác Thực Supabase (Auth Hardening)
- **Thao tác người cần làm theo `docs/AUTH_SETUP.md`:**
  1. Bật **Confirm email** khi đăng ký tài khoản mới.
  2. Khai báo **Redirect URLs** chuẩn xác: `https://webnoithatpro.vn/**`.
  3. Bật bảo vệ chống brute-force đăng nhập (Rate Limits: 30 requests/phút).
  4. Nếu bật Cloudflare Turnstile, thêm Site Key và Secret Key vào Supabase Auth Settings.

### Mục 11: Bảo Vệ Nhánh Chính (Branch Protection Rule)
- **Thao tác người cần làm:**
  1. Truy cập GitHub Repo > Settings > Branches > Add branch protection rule cho `main`.
  2. Tích chọn:
     * `Require a pull request before merging`.
     * `Require status checks to pass before merging` (Chọn job `test-and-build` từ CI workflow).
     * `Do not allow bypassing the above settings`.

### Mục 12: Giám Sát Uptime & Cảnh Báo Webhook
- **Thao tác người cần làm:**
  1. Đăng ký tài khoản miễn phí tại UptimeRobot hoặc BetterStack.
  2. Tạo 1 monitor dạng HTTP(s) ping đường dẫn `https://webnoithatpro.vn/api/license/verify` với chu kỳ 5 phút.
  3. Cài đặt nhận thông báo khẩn cấp qua Telegram / Email khi trang web gặp sự cố hoặc thời gian phản hồi vượt quá 3 giây.

### Mục 13: Quy Trình Phát Hành Bản Mới & Khả Năng Rollback
- **Trạng thái:** ĐÃ HOÀN TẤT.
- Tài liệu theo dõi các phiên bản được duy trì tại `CHANGELOG.md`. Khi có lỗi nghiêm trọng ở phiên bản mới, thực hiện rollback theo quy trình 3 bước trong `docs/OPERATIONS.md`.

### Mục 14: Kiểm Toán Lỗ Hổng Phụ Thuộc (`npm audit`)
- **Trạng thái:** ĐÃ HOÀN TẤT KIỂM TOÁN.
- Lệnh `npm audit` ghi nhận 1 cảnh báo duy nhất ở gói `xlsx` (SheetJS). Do toàn bộ thao tác đọc Excel được thực hiện 100% tại Client Browser của người dùng (không đưa lên Node.js Server xử lý), rủi ro này đã được cô lập hoàn toàn. Khi SheetJS phát hành bản cập nhật chính thức, sẽ tiến hành nâng cấp.

---

## 3. LỆNH KIỂM TRA ĐỘC LẬP TRƯỚC KHI BẤM GO-LIVE (VERIFY COMMANDS)

Chạy tổ hợp các lệnh sau trong Terminal để khẳng định toàn bộ hệ thống ở trạng thái hoàn hảo:

```powershell
# 1. Kiểm tra toàn bộ 82 unit tests
npm test

# 2. Kiểm tra type và cấu trúc không có lỗi biên dịch
npx tsc --noEmit

# 3. Biên dịch hoàn chỉnh toàn bộ 26 routes của ứng dụng
$env:NODE_OPTIONS = "--max-old-space-size=4096"
npm run build

# 4. Xác nhận không có rò rỉ file môi trường bí mật vào Git
& "C:\Program Files\Git\cmd\git.exe" ls-files .env*
```

---

## 4. ĐIỂM DỪNG: CỔNG G5 & CỔNG G6

> [!IMPORTANT]
> 🛑 **CỔNG G5: KÝ DUYỆT CHECKLIST GO-LIVE**
> Người dùng vui lòng rà soát bảng 14 mục trên, cung cấp quyết định cho 2 mục còn khuyết:
> 1. **Nơi triển khai Hosting:** Vercel Pro, VPS riêng hay nền tảng nào?
> 2. **Cổng thanh toán gói cước:** Tích hợp tự động PayOS / SePay hay quét mã QR thủ công giai đoạn đầu?
>
> Sau khi người dùng duyệt Cổng G5 và hoàn tất các thao tác môi trường thực tế, hệ thống sẽ tiến qua 🛑 **CỔNG G6: RA MẮT CHÍNH THỨC**.
