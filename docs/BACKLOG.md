# TÀI LIỆU QUY HOẠCH KỸ THUẬT & BACKLOG HỆ THỐNG
## Nền Tảng Web Bóc Tách Vật Tư Nội Thất, Báo Giá Tự Động & Quản Trị Xưởng (AutoCutlist)

> **Tài liệu Single Source of Truth quy hoạch các hạng mục phát triển trước khi phát hành công khai (Public SaaS).**  
> *Được phân cấp theo 3 tầng ưu tiên: P0 (Chặn ra mắt) → P1 (Trải nghiệm cốt lõi) → P2 (Mở rộng & Tối ưu).*

---

## TẦNG P0: CÁC HẠNG MỤC BẮT BUỘC CHẶN RA MẮT (LAUNCH BLOCKERS)
*Tuyệt đối không public sản phẩm ra thị trường nếu chưa hoàn tất 10 hạng mục dưới đây:*

### P0-1. RLS Bảng `profiles`: Chặn Leo Thang Đặc Quyền Gói Cước
- **Nguy cơ an ninh:** Nếu policy RLS `FOR UPDATE USING (auth.uid() = id)` cho phép người dùng cập nhật toàn bộ bảng, kẻ xấu có thể dùng DevTools/Postman tự gửi request đổi trường `subscription_tier = 'enterprise'` hoặc đổi `email` / `id`.
- **Giải pháp kỹ thuật:**
  - Áp dụng phân quyền theo cột (Column-level security):
    ```sql
    REVOKE UPDATE ON public.profiles FROM authenticated;
    GRANT UPDATE (company_name, logo_url, phone, address, quote_terms, bank_info, cost_config, updated_at) ON public.profiles TO authenticated;
    ```
  - Viết trigger hoặc policy chặn tuyệt đối việc `NEW.subscription_tier != OLD.subscription_tier` từ role `authenticated`. Trường `subscription_tier` chỉ được phép cập nhật bởi role `service_role` thông qua Webhook thanh toán.

### P0-2. RLS Bảng `project_items`: Kiểm Tra Quyền Sở Hữu Dự Án Cha
- **Nguy cơ an ninh:** Hiện tại policy `project_items` chỉ kiểm tra `user_id = auth.uid()`. Kẻ xấu có thể chèn `project_id` của xưởng khác (IDOR - Insecure Direct Object References) để làm sai lệch danh sách tấm hoặc đọc trộm chi tiết nội thất.
- **Giải pháp kỹ thuật:**
  - Bổ sung ràng buộc kiểm tra chéo (Cross-table ownership check):
    ```sql
    CREATE POLICY "Users manage items of own projects" ON public.project_items
      FOR ALL USING (
        user_id = auth.uid() 
        AND EXISTS (
          SELECT 1 FROM public.projects 
          WHERE projects.id = project_items.project_id 
          AND projects.user_id = auth.uid()
        )
      );
    ```

### P0-3. Xác Thực, Rate Limiting & Schema Validation Cho 3 Tuyến API Routes
- **Tuyến 1: `/api/webhooks/payment`:**
  - Xác thực chữ ký số HMAC-SHA256 trên Request Header (`x-signature` / `x-sepay-signature`).
  - Kiểm tra tính bất biến của mã giao dịch (Idempotency Key / `transaction_id UNIQUE`). Chống tấn công phát lại (Replay Attack).
  - So khớp số tiền chuyển khoản thực tế với giá niêm yết trong DB trước khi kích hoạt Pro.
- **Tuyến 2: `/api/license/verify` (AutoLISP CAD):**
  - Rate limiting theo IP và Machine ID: Tối đa 10 req/phút/IP (trả về HTTP 429).
  - Phản hồi có ký số mật mã (Ed25519/HMAC Signed Response) để chống proxy/fiddler giả lập.
  - Ràng buộc phần cứng với Volume Serial Number kết hợp Salt bí mật.
- **Tuyến 3: `/api/projects/direct-ingest` (Nạp từ CAD/SketchUp):**
  - Bắt buộc xác thực Bearer Token / Personal Access Token của người dùng.
  - Giới hạn kích thước payload tối đa 5MB.
  - Zod Schema Validation kiểm duyệt từng phần tử mảng tấm (chặn số âm, NaN, SQL injection).
  - Cấu hình CORS chặt chẽ, chỉ cho phép domain đã xác minh.

### P0-4. Tách Biệt Project Supabase Giữa Development & Production
- Không dùng chung một database cho môi trường dev và production.
- Thiết lập 2 project Supabase độc lập:
  - `autocutlist-dev`: Dùng cho phát triển và chạy CI pipeline.
  - `autocutlist-prod`: Chỉ dùng cho môi trường production chính thức.
- Đồng bộ database schema giữa 2 môi trường thông qua Supabase CLI migrations có kiểm soát phiên bản.

### P0-5. Quản Lý Bí Mật & Chống Rò Rỉ Biến Môi Trường (Secrets Management)
- Tuyệt đối cấm đặt `SUPABASE_SERVICE_ROLE_KEY`, `PAYMENT_WEBHOOK_SECRET` vào các biến có tiền tố `NEXT_PUBLIC_*`.
- Kiểm tra toàn bộ log build và server response: Không in ra console hay client bất kỳ nội dung file `.env*`.
- Sử dụng pre-commit hook chặn commit các file secret.

### P0-6. Điều Khoản Dịch Vụ (Terms of Service) & Chính Sách Quyền Riêng Tư (Privacy Policy)
- Soạn thảo và công bố trang pháp lý chính thức `/terms` và `/privacy`.
- Quy định rõ:
  - Cam kết bảo mật dữ liệu đơn giá vốn và danh sách khách hàng của từng xưởng mộc.
  - Điều khoản miễn trừ trách nhiệm pháp lý đối với sai lệch khối lượng thi công thực tế tại công trình.

### P0-7. Xóa Tài Khoản (Right to be Forgotten) & Xuất Dữ Liệu Cá Nhân
- Đáp ứng quy định bảo vệ dữ liệu cá nhân (GDPR / Nghị định 13/2023/NĐ-CP):
  - Cung cấp nút *"Tải toàn bộ dữ liệu xưởng (.zip/.json)"* để xuất danh sách dự án và thư viện vật tư.
  - Cung cấp tính năng *"Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu xưởng"* (xóa cascade profiles, projects, items, materials).

### P0-8. Sao Lưu & Phục Hồi Tự Động (Disaster Recovery & Backup)
- Kích hoạt tính năng Daily Automated Backups và Point-in-time Recovery (PITR) trên Supabase Pro.
- Lập quy trình diễn tập phục hồi dữ liệu từ bản backup tối thiểu 1 lần trước khi mở bán.

### P0-9. Giám Sát Lỗi Hệ Thống & Hiệu Năng Thời Gian Thực (Error Monitoring)
- Tích hợp công cụ giám sát lỗi (Sentry hoặc tương đương):
  - Bắt toàn bộ unhandled exceptions ở client và API routes.
  - Tự động lọc sạch (sanitize) thông tin cá nhân (PII: tên khách, SĐT, địa chỉ) trước khi gửi log lỗi.

### P0-10. Chuẩn Hóa Schema Migration Nền Bảng `projects` & Trigger Khởi Tạo Profile
- **(a) Bỏ `profit_margin DEFAULT 1.25`:** Schema Supabase cũ gán `profit_margin numeric DEFAULT 1.25` lệch pha với chuẩn xưởng duy nhất hiện tại ($k = 1.65$). Cần chạy lệnh `ALTER TABLE public.projects ALTER COLUMN profit_margin DROP DEFAULT;` (hoặc `SET DEFAULT 1.65`) trong migration nền để bảo đảm tính nhất quán với `resolveProjectProfitMargin()`.
- **(b) Bổ sung cột `client_address`:** Mã nguồn giao diện và `SavedProject.clientAddress` đã hỗ trợ nhập địa chỉ công trình, nhưng bảng `public.projects` thực tế chưa có cột này (chỉ có `client_name, client_phone`). Cần bổ sung `ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS client_address TEXT;` vào migration nền để lưu trữ trọn vẹn thông tin giao hàng lên Cloud.
- **(c) Trigger khởi tạo Profile khi Signup (`handle_new_user`):** Bảng `public.profiles` đã `REVOKE INSERT` từ role `authenticated` để chống tấn công. Vì vậy, bắt buộc tạo trigger `on_auth_user_created` trên `auth.users` chạy hàm `SECURITY DEFINER` để tự động tạo bản ghi `profiles` ban đầu khi khách đăng ký. Phía client `storageService.saveProfile` chỉ gọi lệnh `.update().eq("id", user.id)`.

---

## TẦNG P1: TRẢI NGHIỆM CỐT LÕI & VẬN HÀNH XƯỞNG
*Triển khai ngay sau khi hoàn thành nền tảng an ninh P0:*

### P1-1. Rút Gọn Luồng `/quoting` Thành 3 Bước Rõ Ràng
- Tổ chức giao diện thành Stepper trực quan:
  - **Bước 1:** Nhập {Danh sách tấm (Cutlist)}: Kéo thả Excel, nạp mẫu tủ, dán clipboard, sửa nhanh số đo và nẹp dán chỉ.
  - **Bước 2:** Xem Báo Giá & Tinh Chỉnh Giá: Xem BOM xưởng, xem bản A4 khách hàng, kéo trượt hệ số lãi và biên lợi nhuận.
  - **Bước 3:** Xuất Báo Giá & Lệnh Đặt Hàng: Xuất Excel đặt ván đại lý, In PDF A4 gửi khách, lưu đám mây.
- Đưa phễu lọc 6 tiêu chí và quản lý bản v2 vào *"Chế độ nâng cao"* (mặc định tắt, nhớ qua `localStorage`).

### P1-2. Chia Sẻ Báo Giá Bằng Link Bảo Mật (Quote Share Links)
- Tạo bảng `project_share_tokens` với chuỗi băm token SHA-256.
- Thiết lập thời hạn hết hạn tự động (+14 ngày mặc định) và nút thu hồi link tức thì.
- Giao diện xem trực tuyến công khai cho khách: Chỉ xem thành phẩm tổng thể và điều khoản bảo hành, ẩn sạch thông số phôi tấm và tỷ lệ hao hụt nội bộ.
- Ghi nhận lượt mở xem báo giá của khách hàng.

### P1-3. Đóng Băng Dự Án Khi Status Chuyển Sang `approved`
- Viết Postgres Trigger `fn_prevent_frozen_project_modifications()` chặn mọi thao tác `UPDATE` và `DELETE` trên `projects` và `project_items` khi dự án đã chốt duyệt hoặc đang sản xuất.
- Chỉ cho phép mở khóa khi người dùng chủ động bấm nút mở khóa (kèm nhật ký audit log).
- Khóa toàn bộ các trường nhập và thanh trượt trên giao diện khi đang ở trạng thái đóng băng.

### P1-4. Thuật Toán Bóc Tách Bản Lề & Ray Từ Danh Sách Chi Tiết Tấm (Kèm Định Mức Keo)
- **Định mức keo hạt dán cạnh EVA/PUR:**
  - Tuyệt đối loại bỏ công thức gán cứng `0.02 kg/md` và đơn giá keo chưa kiểm chứng.
  - Lượng keo tiêu hao (`glueRatePerMd`) và đơn giá keo (`glueUnitPrice`) do xưởng tự khai báo theo thực tế máy dán cạnh của họ.
  - Mặc định để 0 / trống kèm nhãn *"hãy nhập số thực tế"* trên giao diện.
- **Ngưỡng bản lề theo chiều cao cánh:**
  - Các ngưỡng chiều cao cánh ($\le 900\text{ mm} \rightarrow 2\text{ bản lề}$, $900 - 1500\text{ mm} \rightarrow 3\text{ bản lề}$...) bắt buộc nằm trong cấu hình xưởng (`WorkshopCostConfig.hingeThresholds`), không được gán cứng (hardcode) trong code tính toán.
  - Xưởng có thể tự do tùy chỉnh ngưỡng (ví dụ xưởng làm tủ kịch trần 2m8 cần 6 bản lề).
  - Cho phép người dùng ghi đè (override) số lượng bản lề/ray theo thiết kế thực tế tại từng chi tiết tấm.
  - Mỗi cụm hộc kéo $\rightarrow 1\text{ bộ ray trượt âm}$.

---

## TẦNG P2: MỞ RỘNG TÍNH NĂNG & TỐI ƯU HÓA
*Triển khai trong các giai đoạn phát triển tiếp theo:*

### P2-1. Tinh Chỉnh Quy Tắc Làm Tròn Tấm Ván Theo Module
- Cho phép thiết lập bước làm tròn độc lập (0.5 tấm vs 1.0 tấm) cho từng module hoặc từng loại mã ván đặc biệt (ván phủ Acrylic, Laminate, ván hậu).

### P2-2. Xuất Dữ Liệu Sang Máy Cắt CNC & Phần Mềm Sắp Tấm (Nesting)
- Xuất file CSV định dạng chuẩn tích hợp trực tiếp cho phần mềm cắt tấm: ABF, CutList Plus, OptiCut, Aspire.

### P2-3. Quản Lý Kho Tồn Ván Tấm Lẻ (Offcut Management)
- Ghi nhận và theo dõi kích thước các tấm ván thừa sau khi cắt tại xưởng để tái sử dụng cho các dự án tiếp theo.

### P2-4. Module Thẩm Định Giá Báo Giá (Price Checker)
- So sánh đơn giá của xưởng với mức giá trung bình của thị trường gỗ công nghiệp tại từng khu vực (Hà Nội, TP.HCM, Bình Dương).
