# Báo Cáo Kiểm Toán Toàn Diện Hệ Thống Sẵn Sàng Ra Mắt (AUDIT_REPORT.md)
## AutoCutlist SaaS Platform — Giai đoạn B (Chế độ CHỈ ĐỌC)
> **Ngày thực hiện:** 31/10/2026  
> **Người thực hiện:** Antigravity Lead Engineer  
> 🛑 **CỔNG KIỂM SOÁT G1: DỪNG CHỜ LEAD DEVELOPER DUYỆT THỨ TỰ SỬA CHỮA TRƯỚC KHI BƯỚC VÀO GIAI ĐOẠN C/D**

---

## MỤC LỤC & TỔNG QUAN XẾP HẠNG RỦI RO

| Mức Độ Rủi Ro | Số Lượng Phát Hiện | Tác Động Nghiệp Vụ |
| :--- | :---: | :--- |
| 🚨 **CHẶN RA MẮT (Launch Blockers)** | **4** | Lỗ hổng bảo mật nghiêm trọng (bỏ qua xác thực webhook, IDOR, rò rỉ quyền ghi, thiếu CSRF/Headers). |
| ⚠️ **MỨC ĐỘ CAO (High Severity)** | **4** | Lệch số liệu giữa Dashboard và Chi tiết, lỗ hổng thư viện SheetJS, phình bundle, middleware không bảo vệ route. |
| 🟡 **MỨC ĐỘ TRUNG BÌNH (Medium)** | **4** | Chưa có trang pháp lý (Terms/Privacy), thiếu Error Boundary, thiếu kiểm tra kích thước payload. |
| 🟢 **MỨC ĐỘ THẤP (Low)** | **3** | Dependency chưa dùng (27 gói), ESLint chưa kích hoạt, route license chưa kết nối database thật. |

---

## PHẦN 1: CHI TIẾT 11 HẠNG MỤC KIỂM TOÁN HỆ THỐNG

### 1. BÍ MẬT & CẤU HÌNH BIẾN MÔI TRƯỜNG (SECRETS MANAGEMENT)
- **Trạng thái:** **ĐẠT CÓ ĐIỀU KIỆN**
- **Bằng chứng:**
  - Kiểm tra Git tracking: `git ls-files "*env*"` $\rightarrow$ Chỉ có `.env.local.example`. Toàn bộ file cấu hình thật `.env.local` được `.gitignore` bảo vệ 100%, chưa từng lọt vào git log.
  - Quét `SERVICE_ROLE` trong client code: `git grep -ni "SERVICE_ROLE" src/` $\rightarrow$ Kết quả rỗng (0 hit).
  - Danh sách biến môi trường trong hệ thống:
    - *Công khai (Client-safe):* `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_APP_URL`.
    - *Bảo mật (Server-only):* `SUPABASE_SERVICE_ROLE_KEY`, `VIETQR_BANK_ID`, `VIETQR_ACCOUNT_NO`, `VIETQR_ACCOUNT_NAME`, `SEPAY_API_KEY`, `SEPAY_WEBHOOK_TOKEN`, `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`.
- **Mức độ:** 🟡 **TRUNG BÌNH**
- **Đề xuất sửa nhỏ nhất:** Thêm bước tiền kiểm CI (Secret scanning check) trong `.github/workflows/ci.yml` để chặn commit nếu vô tình chứa chuỗi service role key.

---

### 2. XÁC THỰC NGƯỜI DÙNG & BẢO VỆ ĐIỀU HƯỚNG (AUTH & MIDDLEWARE)
- **Trạng thái:** 🚨 **RỦI RO CAO**
- **Bằng chứng:**
  - `src/middleware.ts:43-45`: Middleware chỉ gọi `await supabase.auth.getUser()` để refresh cookie nhưng **không hề có lệnh `NextResponse.redirect(new URL('/login', request.url))`** đối với các route riêng tư (`/dashboard`, `/settings/*`, `/projects/*`).
  - Hậu quả: Bất kỳ ai chưa đăng nhập đều có thể truy cập thẳng vào App Shell. Hệ thống hiện đang dựa hoàn toàn vào fallback dữ liệu LocalStorage/Demo.
  - Form Auth (`src/app/(auth)/login/page.tsx`): Có tab đăng nhập số điện thoại và email, tab đăng ký, nhưng **hoàn toàn thiếu luồng "Quên mật khẩu / Đặt lại mật khẩu"** và chưa có trang riêng biệt `/register`.
- **Mức độ:** 🚨 **CHẶN RA MẮT**
- **Đề xuất sửa nhỏ nhất:**
  1. Cập nhật `src/middleware.ts` kiểm tra nếu `!user` và truy cập các route thuộc nhóm `(app)` như `/settings`, `/dashboard` thì chuyển hướng về `/login?redirect=...`.
  2. Bổ sung liên kết và form "Đặt lại mật khẩu" qua email trong `login/page.tsx`.

---

### 3. BẢO MẬT 3 TUYẾN API ROUTES (`/api/*`)
- **Trạng thái:** 🚨 **RỦI RO CỰC KỲ NGHIÊM TRỌNG**
- **Bằng chứng:**
  1. **Tuyến `/api/webhooks/payment/route.ts`:**
     - `Dòng 36-68`: Hoàn toàn **KHÔNG kiểm tra chữ ký HMAC-SHA256** (`x-signature` của PayOS hoặc `Authorization/Token` của SePay). Kẻ xấu có thể gửi HTTP POST giả mạo nâng tài khoản lên Pro miễn phí.
     - `Dòng 101`: Gọi `await supabase.auth.getUser()` trong webhook! Webhook ngân hàng là server-to-server không có cookie session người dùng, dẫn đến câu lệnh nâng cấp Pro trên DB thực tế không bao giờ chạy được.
     - `Dòng 166-189`: Cho phép tham số `?simulate=true` trên HTTP GET công khai tự sinh License Key thành công.
     - `Dòng 22`: `paymentCache` lưu trên RAM Map, sẽ mất sạch dữ liệu khi restart hoặc chạy serverless đa instance.
  2. **Tuyến `/api/projects/direct-ingest/route.ts`:**
     - Không có xác thực Bearer token, không có schema validation (Zod), không giới hạn kích thước payload (DDoS memory).
  3. **Tuyến `/api/license/verify/route.ts`:**
     - Không có Rate Limiting (nguy cơ brute-force dò key), thuật toán kiểm tra thuần string memory, không có bảng DB lưu license.
- **Mức độ:** 🚨 **CHẶN RA MẮT**
- **Đề xuất sửa nhỏ nhất:**
  1. Thêm hàm kiểm tra chữ ký số HMAC `verifyWebhookSignature()` trước khi đọc payload payment. Bỏ tham số `simulate=true` trên production.
  2. Thêm Zod schema và giới hạn dung lượng body (`request.headers.get("content-length") < 5MB`) cho `/api/projects/direct-ingest`.
  3. Thêm rate limiting (tối đa 10 req/phút/IP) cho `/api/license/verify`.

---

### 4. RLS BẢO MẬT CƠ SỞ DỮ LIỆU & SCHEMA DRIFT
- **Trạng thái:** 🚨 **RỦI RO CAO**
- **Bằng chứng:**
  - Đối chiếu schema DB thực tế vs migration:
    - Bảng `feature_leads` tồn tại trên DB thật nhưng hoàn toàn không có file migration trong `supabase/migrations/`.
    - Bảng `projects`: Cột `profit_margin` trên DB thật đang để `DEFAULT 1.25`, lệch pha với chuẩn xưởng duy nhất trong code hiện hành ($k = 1.65$).
    - Cột `client_address` được form thu thập nhưng DB thật chưa có cột này.
    - Policy RLS bảng `project_items`: Hiện chỉ kiểm tra `user_id = auth.uid()` mà **chưa kiểm tra ràng buộc `EXISTS (SELECT 1 FROM projects WHERE projects.id = project_items.project_id AND projects.user_id = auth.uid())`** $\rightarrow$ Nguy cơ IDOR (chèn tấm vào dự án của xưởng khác).
- **Mức độ:** 🚨 **CHẶN RA MẮT**
- **Đề xuất sửa nhỏ nhất:**
  1. Thực hiện migration nền sạch (Baseline Migration ở Giai đoạn C) đồng bộ toàn bộ bảng `feature_leads`, `profiles`, `projects`, `project_items`.
  2. Cập nhật Policy RLS cho `project_items` kiểm tra quyền sở hữu dự án cha.

---

### 5. TRÁI TIM TÍNH TIỀN & ĐỐI SOÁT NGUỒN SỐ LIỆU DASHBOARD
- **Trạng thái:** ⚠️ **MỨC ĐỘ CAO**
- **Bằng chứng:**
  - **Mâu thuẫn nguồn số liệu:**
    - `src/app/(app)/dashboard/page.tsx:101-102`: Đọc trực tiếp `p.totalCost` và `p.totalQuote` lưu tĩnh trong bản ghi dự án (`projects` row).
    - `src/app/(app)/projects/[id]/page.tsx:150`: Lại gọi `calculateQuoteEngine(...)` tính lại động từ `project.items` và `project.materialsSnapshot`.
    - Hệ quả: Nếu công thức tính giá hoặc đơn giá vật tư snapshot có sai lệch nhỏ, số tiền hiển thị trên Dashboard sẽ khác với số tiền khi bấm vào xem chi tiết dự án!
  - **Độ phủ kiểm thử lõi tính toán:** Đạt **95.30% line coverage** (33 tests pass, đã kiểm thử các ca biên: ván chuẩn 2.9768m2, hao hụt 1.15/1.12/1.18, chỉ 8%, làm tròn 0.5/1.0, k <= 0, k=1.65).
- **Mức độ:** ⚠️ **MỨC ĐỘ CAO**
- **Đề xuất sửa nhỏ nhất:** Chốt MỘT nguồn sự thật: Khi dự án được lưu, `total_cost` và `total_quote` được ghi nhận từ kết quả tính toán của engine. Trang chi tiết và Dashboard cùng tham chiếu `project.totalCost` / `project.totalQuote` đã lưu (Snapshot Totals). Khi người dùng chỉnh sửa tấm thì mới kích hoạt re-calculate và cập nhật cả 2 nơi.

---

### 6. XỬ LÝ LỖI, ERROR BOUNDARY & GIÁM SÁT HỆ THỐNG
- **Trạng thái:** 🟡 **TRUNG BÌNH**
- **Bằng chứng:**
  - Quét `catch` rỗng: 0 hit (đã xử lý sạch, không còn nuốt lỗi âm thầm).
  - Quét Error Boundary: `Get-ChildItem -Path src/app -Filter "error.tsx"` $\rightarrow$ **0 file**. Chưa có file `error.tsx` toàn cục hay cục bộ. Khi có lỗi render React phía client, màn hình sẽ bị trắng xóa.
  - Chưa tích hợp dịch vụ bắt lỗi tập trung (Sentry/LogRocket).
- **Mức độ:** 🟡 **TRUNG BÌNH**
- **Đề xuất sửa nhỏ nhất:** Tạo file `src/app/error.tsx` và `src/app/(app)/error.tsx` hiển thị giao diện báo lỗi kỹ thuật thân thiện kèm nút "Tải lại trang" và nút "Khôi phục dữ liệu".

---

### 7. QUẢN LÝ THƯ VIỆN PHỤ THUỘC & SECURITY HEADERS
- **Trạng thái:** ⚠️ **MỨC ĐỘ CAO**
- **Bằng chứng:**
  - `npm audit`: Phát hiện **1 lỗ hổng High Severity** trong thư viện `xlsx` (Prototype Pollution & Regular Expression Denial of Service - ReDoS).
  - Cấu hình `next.config.mjs`: Hoàn toàn **thiếu các HTTP Security Headers** (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
  - 27 dependency chưa dùng từ gói data-table cũ (đã được cô lập, chờ dọn dẹp tại E9).
- **Mức độ:** ⚠️ **MỨC ĐỘ CAO**
- **Đề xuất sửa nhỏ nhất:**
  1. Thêm cấu hình `headers()` trong `next.config.mjs` với `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`.
  2. Cô lập việc import `xlsx` thành dynamic import khi thao tác file, không import tĩnh tại bundle chính.

---

### 8. PHÁP LÝ, ĐIỀU KHOẢN DỊCH VỤ & BẢO VỆ DỮ LIỆU CÁ NHÂN
- **Trạng thái:** 🟡 **TRUNG BÌNH**
- **Bằng chứng:**
  - Hệ thống chưa có trang Điều khoản dịch vụ (`/terms`) và Chính sách quyền riêng tư (`/privacy`).
  - Chưa có tính năng "Xóa vĩnh viễn tài khoản" (Right to be Forgotten) và "Xuất toàn bộ dữ liệu xưởng (.zip/.json)".
  - Danh mục dữ liệu cá nhân thu thập:
    - Chủ xưởng: Tên công ty, SĐT, địa chỉ, email, thông tin tài khoản ngân hàng.
    - Khách hàng cuối của xưởng: Tên khách, SĐT khách, địa chỉ công trình (`projects.client_address`).
- **Mức độ:** 🟡 **TRUNG BÌNH**
- **Đề xuất sửa nhỏ nhất:** Soạn thảo trang nháp `/terms` và `/privacy` công bố rõ: Nền tảng là bên xử lý dữ liệu (Data Processor), Chủ xưởng là bên kiểm soát dữ liệu khách của họ (Data Controller).

---

### 9. HIỆU NĂNG BUNDLE & GIAO DIỆN DI ĐỘNG (MOBILE 375PX)
- **Trạng thái:** ⚠️ **MỨC ĐỘ CAO**
- **Bằng chứng:**
  - `src/app/(app)/quoting/page.tsx:6`: Dòng lệnh `import * as XLSX from "xlsx";` nạp trực tiếp toàn bộ thư viện SheetJS (~1MB) ngay khi tải trang Quoting, làm tăng thời gian tải trang ban đầu (First Contentful Paint).
  - Bảng Cutlist và BOM có nhiều cột số liệu ngang: trên màn hình điện thoại 375px cần thanh cuộn ngang `overflow-x-auto` và kích thước touch target đạt tối thiểu 44x44px.
- **Mức độ:** ⚠️ **MỨC ĐỘ CAO**
- **Đề xuất sửa nhỏ nhất:** Chuyển `import * as XLSX` sang `const XLSX = await import("xlsx")` khi người dùng kéo thả file hoặc bấm nút xuất Excel.

---

### 10. MÔI TRƯỜNG TRIỂN KHAI & SAO LƯU DỰ PHÒNG
- **Trạng thái:** 🟡 **TRUNG BÌNH**
- **Bằng chứng:**
  - Hiện tại chỉ có 1 Supabase Project duy nhất (`awpzkxurcqyzdedipymx`). Chưa tách biệt giữa Database phát triển (Dev) và Database chính thức (Prod).
  - CI Workflow `.github/workflows/ci.yml` đã được cấu hình chuẩn Node 24 và biến môi trường build placeholder.
- **Mức độ:** 🟡 **TRUNG BÌNH**
- **Đề xuất sửa nhỏ nhất:** Soạn thảo tài liệu `docs/OPERATIONS.md` quy định quy trình tách 2 project Supabase (Dev/Prod) và quy trình sao lưu PITR hàng ngày.

---

### 11. KHÓA BẢN QUYỀN PLUGIN AUTOCAD (CAD STORE)
- **Trạng thái:** 🟢 **MỨC ĐỘ THẤP**
- **Bằng chứng:**
  - Schema cơ sở dữ liệu hiện tại chưa có bảng `plugins` và `plugin_orders`.
  - API `/api/license/verify` hiện đang hoạt động như một khung mô phỏng xác thực thuật toán chuỗi Volume ID, chưa truy vấn bảng đơn hàng thật.
- **Mức độ:** 🟢 **THẤP (Để xử lý ở Giai đoạn I - P2)**
- **Đề xuất sửa nhỏ nhất:** Giữ nguyên khung mô phỏng trong giai đoạn này, chỉ bổ sung rate limiting và xác thực khóa master, tập trung giải quyết lõi Web Quoting trước.

---

## PHẦN 2: BẢNG TỔNG HỢP VÀ THỨ TỰ SỬA CHỮA TỐI ƯU (TOP 10 ACTION PLAN)

Dưới đây là danh sách **10 việc cần sửa đầu tiên**, xếp theo thứ tự ưu tiên giảm dần từ Chặn Ra Mắt đến Ổn định hệ thống. Mỗi việc được thiết kế như một commit phẫu thuật nhỏ, độc lập và chạy bộ kiểm tra VERIFY:

| Thứ tự | Mã việc | Tên việc cần làm | Mức độ | Mục tiêu giải quyết |
| :---: | :---: | :--- | :---: | :--- |
| **1** | **D3** | Khóa chặt Webhook thanh toán `/api/webhooks/payment` | 🚨 Chặn | Xác thực chữ ký HMAC-SHA256, xóa `simulate=true`, chống replay attack. |
| **2** | **C1-C2** | Migration nền sạch (Baseline Schema & RLS) | 🚨 Chặn | Chuẩn hóa RLS `project_items` chống IDOR, bổ sung `client_address`, sửa default `profit_margin`. |
| **3** | **D2** | Bảo mật API `/api/projects/direct-ingest` & `/api/license/verify` | 🚨 Chặn | Zod schema validation, chặn body > 5MB, rate limiting 10 req/phút. |
| **4** | **D10** | Cấu hình Middleware bảo vệ điều hướng ứng dụng | 🚨 Chặn | Redirect người dùng chưa đăng nhập về `/login`, phân tách rõ trang công khai và trang xưởng. |
| **5** | **D4** | Bổ sung HTTP Security Headers trong `next.config.mjs` | ⚠️ Cao | X-Frame-Options, X-Content-Type-Options, Referrer-Policy chống Clickjacking. |
| **6** | **AX3** | Thống nhất nguồn số liệu giữa Dashboard và Chi tiết dự án | ⚠️ Cao | Đồng bộ snapshot totals, tránh tình trạng lệch số tiền khi mở dự án. |
| **7** | **D8** | Thêm Error Boundary toàn app (`error.tsx`) | 🟡 Vừa | Ngăn chặn màn hình trắng xóa khi gặp lỗi runtime phía trình duyệt. |
| **8** | **E1** | Dynamic Import thư viện `xlsx` để tối ưu tải trang `/quoting` | ⚠️ Cao | Giảm kích thước bundle ban đầu từ 1.2MB xuống < 300KB. |
| **9** | **D5** | Tạo trang nháp Điều khoản dịch vụ `/terms` và Chính sách `/privacy` | 🟡 Vừa | Khung pháp lý về bảo vệ dữ liệu cá nhân theo Nghị định 13/2023. |
| **10** | **D6** | Bổ sung nút "Tải dữ liệu xưởng" và "Xóa tài khoản" | 🟡 Vừa | Đáp ứng quyền xuất dữ liệu và quyền được lãng quên (GDPR). |

---

> 🛑 **KẾT THÚC BÁO CÁO AUDIT — ĐÃ DỪNG LẠI TẠI CỔNG G1 & G4.**  
> **Xin kính mời Lead Developer phê duyệt thứ tự ưu tiên trên và định hướng triển khai tiếp theo!**
