# HIẾN PHÁP DỰ ÁN (PROJECT CONSTITUTION)
## Nền Tảng Web Bóc Tách Vật Tư Nội Thất, Báo Giá Tự Động & Kho Plugin CAD

> **Tài liệu tham chiếu tối cao (Single Source of Truth) cho Antigravity AI và Đội ngũ phát triển.**
> Mọi dòng code, cấu trúc thư mục, bảng dữ liệu và logic nghiệp vụ BẮT BUỘC tuân thủ các điều khoản dưới đây.

---

## 1. TỔNG QUAN VÀ ĐỊNH VỊ SẢN PHẨM

- **Tên dự án:** Nền tảng Web Bóc tách & Báo giá Nội thất (kèm Kho Plugin CAD)
- **Mô hình:** Kết hợp giữa **B2B Micro-SaaS** (Phần mềm bóc tách/dự toán ngách) và **Digital Marketplace** (Chợ công cụ cho thợ thiết kế / xưởng mộc).
- **Khách hàng mục tiêu:**
  1. Chủ xưởng sản xuất nội thất gỗ công nghiệp vừa và nhỏ (1–2 máy CNC, 3–8 thợ).
  2. Freelance Interior Designer & Kiến trúc sư tự nhận thi công.
  3. Kỹ sư bổ kỹ thuật CAD / thợ vẽ nội thất.
- **Giá trị cốt lõi:**
  - Tiết kiệm 1–3 tiếng bóc tách thủ công trên Excel cho mỗi công trình.
  - Loại bỏ hoàn toàn nguy cơ tính thiếu ván, sót chỉ dán cạnh hoặc tính sai giá vốn.
  - "Một đầu vào, hai đầu ra": Đầu vào là file Excel Cutlist thô; đầu ra là Bảng đặt hàng vật tư nội bộ (Excel) và Bảng báo giá chuyên nghiệp gửi khách hàng (PDF A4).

---

## 2. TRIẾT LÝ KIẾN TRÚC: MODULAR MONOLITH

Hệ thống được tổ chức theo nguyên tắc **"Một lõi dùng chung, tính năng cắm thêm dần" (Single Core, Pluggable Modules)**:

1. **Lõi dùng chung (`src/core/`):**
   - Đảm nhận: Xác thực tài khoản (Supabase Auth), Thư viện vật tư & đơn giá (`materials_library`), Hồ sơ xưởng (`profiles`), Dự án chung (`projects`), và Trái tim tính toán (`calculations`).
   - Mọi module tính năng chỉ được đọc và ghi vào cơ sở dữ liệu thông qua cấu trúc lõi chuẩn, không tự tạo bảng dữ liệu phân mảnh.
2. **Module độc lập (`src/modules/`):**
   - Mỗi tính năng nằm trong một thư mục riêng biệt:
     - `src/modules/quoting/`: Tính năng chủ lực (Bóc tách Cutlist -> Báo giá).
     - `src/modules/materials/`: Quản lý danh mục vật tư xưởng.
     - `src/modules/cad-store/`: Gian hàng Plugin AutoCAD (AutoLISP) & Quản lý License.
     - `src/modules/price-checker/`: (Dự trữ cho giai đoạn sau) Thẩm định giá báo giá.
3. **Phân vùng 2 không gian rõ rệt:**
   - **Khu vực công khai (Public):** Giới thiệu sản phẩm, bảng giá gói cước, gian hàng Lisp CAD, mua hàng qua mã VietQR.
   - **Khu vực làm việc (Dashboard App):** Yêu cầu đăng nhập, làm việc trên cơ sở dữ liệu đã kích hoạt bảo mật RLS.

---

## 3. CÔNG NGHỆ CHUẨN (TECH STACK)

- **Framework:** Next.js (App Router), React, TypeScript.
- **Styling:** Tailwind CSS, Lucide React icons.
- **Backend & Database:** Supabase (PostgreSQL, Supabase Auth, Storage, Row Level Security).
- **Xử lý Excel Client-side:** `xlsx` (SheetJS) — Đọc và phân tích file Excel ngay tại trình duyệt của khách hàng, không gửi file nặng lên server.
- **Xuất PDF chuẩn in A4:** Sử dụng CSS `@media print` kết hợp `window.print()` (hoặc template HTML/CSS chuyên biệt) để đảm bảo 100% không lỗi font tiếng Việt, hiển thị đúng khổ A4.
- **Cổng thanh toán tự động tại Việt Nam:** VietQR động qua SePay hoặc PayOS kết nối Webhook.

---

## 4. QUY TẮC CẤU TRÚC THƯ MỤC BẮT BUỘC

```
src/
├── app/                                # Định tuyến Next.js App Router
│   ├── (public)/                       # Nhóm trang công khai (không cần login)
│   │   ├── page.tsx                    # Landing page giới thiệu
│   │   ├── pricing/page.tsx            # Bảng giá dịch vụ (Free / Pro)
│   │   └── cad-store/                  # Cửa hàng Plugin CAD
│   │       ├── page.tsx                # Danh mục Lisp
│   │       └── [slug]/page.tsx         # Chi tiết 1 Plugin & Thanh toán VietQR
│   ├── (auth)/                         # Nhóm trang xác thực
│   │   ├── login/page.tsx              # Đăng nhập
│   │   └── register/page.tsx           # Đăng ký
│   ├── (app)/                          # Dashboard App (bắt buộc đăng nhập)
│   │   ├── layout.tsx                  # App Shell có Sidebar cố định
│   │   ├── dashboard/page.tsx          # Bảng điều khiển tổng quan
│   │   ├── projects/                   # Module Bóc tách & Báo giá
│   │   │   ├── page.tsx                # Danh sách dự án đã lưu
│   │   │   ├── new/page.tsx            # Tải Cutlist Excel & Gán cột
│   │   │   └── [id]/page.tsx           # Không gian làm việc dự án (3 Tab)
│   │   ├── materials/page.tsx          # Thư viện vật tư & Đơn giá
│   │   ├── my-assets/page.tsx          # Quản lý file Lisp và License key
│   │   └── settings/                   # Cài đặt
│   │       ├── profile/page.tsx        # Cài đặt Logo, Hotline in lên PDF
│   │       └── billing/page.tsx        # Quản lý gói Pro & Hóa đơn
│   └── api/                            # API routes & Webhooks
│       ├── webhooks/payment/route.ts   # Webhook nhận tín hiệu VietQR
│       └── license/verify/route.ts     # API để AutoCAD kiểm tra License
│
├── core/                               # LÕI DÙNG CHUNG (Tối thượng, bất biến)
│   ├── supabase/                       # Kết nối Supabase (client, server, middleware)
│   ├── calculations/                   # TRÁI TIM TÍNH TIỀN (Chỉ viết tại 1 chỗ)
│   │   ├── board-calculator.ts         # Tính diện tích, quy đổi tấm (1220x2440), hao hụt
│   │   ├── edge-calculator.ts          # Tính mét dài chỉ dán cạnh (D1, D2, R1, R2)
│   │   └── quote-engine.ts             # Áp giá vật tư + nhân công + markup lợi nhuận
│   ├── exporters/                      # Hàm xuất file
│   │   ├── excel-exporter.ts           # Xuất bảng đặt hàng vật tư xưởng (.xlsx)
│   │   └── pdf-template/               # Bản in chuẩn A4 xuất báo giá gửi khách (.pdf)
│   └── components/                     # UI components dùng chung (Button, Table, Modal...)
│
└── modules/                            # CÁC TÍNH NĂNG ĐỘC LẬP (Cắm vào lõi)
    ├── quoting/                        # Logic bóc tách: Đọc Excel, Gán cột, Xem trước
    ├── materials/                      # CRUD Thư viện vật tư của từng xưởng
    └── cad-store/                      # Logic catalog plugin, tạo license key theo mã máy
```

---

## 5. QUY TẮC NGHIỆP VỤ & TÍNH TOÁN NỘI THẤT (BẮT BUỘC)

### 5.1. Khóa Chặt Logic Tính Toán Tại `src/core/calculations/`
- **TUYỆT ĐỐI CẤM** viết công thức tính tiền, tính diện tích, tính hao hụt rải rác bên trong các component giao diện.
- Mọi phép toán phải tập trung tại:
  - `board-calculator.ts`: Diện tích ván Net, diện tích Gross, quy đổi số tấm chuẩn.
  - `edge-calculator.ts`: Tổng mét dài dán chỉ theo mã/kích thước chỉ.
  - `quote-engine.ts`: Tính giá vốn, cộng nhân công, phụ kiện và áp hệ số lợi nhuận (markup).

### 5.2. Công Thức Nghiệp Vụ Chuẩn Ngành Nội Thất
1. **Diện tích ván thực tế (Net Area, $m^2$):**
   $$\text{Diện tích Net} = \frac{\text{Dài (mm)} \times \text{Rộng (mm)} \times \text{Số lượng}}{1.000.000}$$
2. **Quy đổi ra số tấm ván tiêu chuẩn đặt hàng:**
   - Khổ ván tiêu chuẩn: $1220 \times 2440\text{ mm} = 2.9768\text{ }m^2$.
   - Gom nhóm theo từng `Mã ván` + `Độ dày` (VD: MDF 17mm chống ẩm, MDF 6mm hậu):
   $$\text{Số tấm cần mua} = \left\lceil \frac{\sum \text{Diện tích Net} \times \text{Hệ số hao hụt ván}}{2.9768} \right\rceil$$
   *(Hệ số hao hụt ván mặc định: 1.15 tức 15%; cho phép xưởng tự chỉnh theo năng lực cắt).*
3. **Tổng mét dài chỉ dán cạnh ($md$):**
   - Cộng kích thước các cạnh được đánh dấu dán chỉ ($D1, D2, R1, R2$), quy đổi sang mét, nhân số lượng và nhân hệ số hao hụt chỉ (mặc định 1.08 tức 8%):
   $$\text{Mét dài chỉ} = \frac{\sum (\text{Kích thước cạnh dán}) \times \text{Số lượng}}{1.000} \times \text{Hệ số hao hụt chỉ}$$
4. **Một Đầu Vào, Hai Đầu Ra:**
   - **Góc nhìn Xưởng (Bảng vật tư nội bộ):** Bóc trần từng tấm ván cần mua, mét dài chỉ, phụ kiện để gửi đại lý; cho phép xuất file Excel.
   - **Góc nhìn Khách Hàng (Báo giá chuyên nghiệp):** Gom nhóm theo Hạng mục thành phẩm (Tủ áo Master, Tủ bếp trên, Kệ TV...). Ẩn sạch thông số tấm lẻ và hao hụt bên trong. Hiển thị kích thước tổng thể, chất liệu, đơn giá đã có lợi nhuận -> Xuất PDF chuẩn A4.

### 5.3. Snapshot Pricing (Bảo Toàn Giá Lịch Sử)
- Khi một dự án mới được tạo, hệ thống **sao chép trực tiếp** đơn giá từ `materials_library` vào dự án đó (`Snapshot`).
- Khi người dùng cập nhật giá thị trường trong Thư viện, các dự án cũ đã lưu **không bao giờ bị nhảy số**, đảm bảo giá trị hợp đồng đã chốt với khách được giữ nguyên 100%.

### 5.4. Cảnh Báo Miễn Trừ Trách Nhiệm (Legal Disclaimer)
Mọi bản in báo giá và bảng vật tư bắt buộc in kèm dòng ghi chú pháp lý ở chân trang:
> *"Lưu ý: Bảng khối lượng dự toán dựa trên hệ số hao hụt do người dùng thiết lập. Quý xưởng vui lòng đối chiếu sơ đồ cắt thực tế trước khi xuất lệnh đặt hàng."*

---

## 6. QUY TẮC CƠ SỞ DỮ LIỆU & BẢO MẬT (SUPABASE)

### 6.1. Bốn Bảng Dữ Liệu Cốt Lõi (Lõi Bất Biến)
1. `profiles`: Quản lý thông tin xưởng (Logo URL, Tên xưởng, SĐT, Địa chỉ, gói cước `subscription_tier`).
2. `materials_library`: Danh mục vật tư & đơn giá của từng xưởng (`category` in `board, edge, hardware, labor`, `unit_price`, `waste_factor`).
3. `projects`: Hồ sơ dự án/báo giá (`project_name`, `client_name`, `status`, `profit_margin`, `total_cost`, `total_quote`).
4. `project_items`: Chi tiết từng tấm trong Cutlist (`module_name`, `part_name`, `length_mm`, `width_mm`, `thickness_mm`, `qty`, `material_code`, 4 cạnh dán chỉ `edge_l1, edge_l2, edge_w1, edge_w2`).

### 6.2. Bảo Mật Cấp Hàng (Row Level Security - RLS)
- Bảng đơn giá và báo giá là **tài sản bí mật kinh doanh nhạy cảm**.
- BẮT BUỘC bật RLS trên tất cả các bảng với điều kiện:
  ```sql
  auth.uid() = user_id (hoặc id đối với bảng profiles)
  ```
- Tuyệt đối không để lộ dữ liệu vật tư hay khách hàng giữa các xưởng với nhau.

---

## 7. QUY TẮC XÂY DỰNG PLUGIN AUTOCAD (AUTOLISP / VISUAL LISP)

Khi viết công cụ CAD hỗ trợ để bán trên web hoặc xuất dữ liệu sang web, BẮT BUỘC tuân thủ 6 quy tắc:
1. **Khởi tạo:** Luôn có `(vl-load-com)` ở dòng đầu tiên.
2. **Khai báo biến cục bộ:** Mọi hàm `(defun c:TenLenh ( / var1 var2 ...))` PHẢI khai báo đầy đủ biến sau dấu `/` để không xung đột bộ nhớ giữa các lần chạy.
3. **Bảo toàn biến hệ thống & Xử lý lỗi:**
   - Luôn lưu lại các biến `CMDECHO`, `OSMODE`, `CLAYER` trước khi chạy lệnh.
   - Luôn có hàm `*error*` cục bộ để khôi phục lại các biến này khi người dùng bấm `ESC`.
   - Bọc toàn bộ thao tác trong cặp `vla-StartUndoMark` và `vla-EndUndoMark` (1 lần `Ctrl + Z` hoàn tác toàn bộ).
4. **Hộp thoại DCL tự hủy:** Nhúng nội dung DCL vào file `.lsp`, tự động ghi ra file tạm trong `%TEMP%` và tự xóa sau khi đóng hộp thoại.
5. **Chuẩn hóa xuất CSV sang Web:**
   - Xuất file `.csv` có UTF-8 BOM để Excel trên Windows mở không bị lỗi font tiếng Việt.
   - Khớp chính xác 8 cột chuẩn của web: `Hang_Muc, Ten_Chi_Tiet, Dai, Rong, Day, So_Luong, Ma_Vat_Lieu, Dan_Canh`.
6. **Khóa bản quyền (License Key):** Lấy Volume Serial Number ổ cứng qua `Scripting.FileSystemObject`, xác thực với API web `/api/license/verify`.

---

## 8. QUY TẮC LÀM VIỆC DÀNH CHO AI (AGENT DIRECTIVES)

1. **Ponytail & Karpathy Discipline:**
   - Viết ít code nhất có thể để giải quyết trọn vẹn bài toán. Không over-engineering.
   - Thay đổi chính xác (Surgical changes), không sửa đổi hay tái cấu trúc các file đang chạy ổn định.
   - Mọi dòng code sinh ra phải liên hệ trực tiếp đến yêu cầu của người dùng.
2. **Làm Từng Bước Nhỏ (Step-by-Step Execution):**
   - Không làm gộp nhiều tính năng lớn cùng lúc.
   - Luôn kiểm tra kết quả từng bước (Demo Mode / Test) trước khi sang bước tiếp theo.
3. **Không Tự Ý Đẻ Thêm Bảng CSDL:**
   - Tuyệt đối tuân thủ 4 bảng cốt lõi. Chỉ thêm bảng mới khi có yêu cầu module mới cụ thể (`plugins`, `plugin_orders`).
4. **Ngôn ngữ & Thuật ngữ:**
   - Giao diện người dùng 100% tiếng Việt, dùng đúng thuật ngữ xưởng mộc: *Ván MDF chống ẩm, Ván hậu, Chỉ dán cạnh PVC, Bản lề giảm chấn, Ray trượt âm, Hệ số hao hụt, Khổ ván tiêu chuẩn 1220x2440*.
5. **Tiêu Chuẩn Vượt Trội Công Cụ Gốc (Superior Benchmarking Law):**
   - **TỪ NAY MỌI CÔNG CỤ / PLUGIN ĐƯỢC TẠO RA (SketchUp, AutoCAD, Web) BẮT BUỘC PHẢI TỐI ƯU HƠN CÔNG CỤ GỐC** (các benchmark như Profile Builder 4, OpenCutList, CutList Plus, ABF, v.v.) cả về số lượng tính năng hữu ích lẫn chất lượng & độ sâu của từng tính năng.
   - Tuyệt đối KHÔNG làm bản sao chép hời hợt hoặc cắt bớt tính năng lõi.
   - Luôn giải quyết triệt để các hạn chế của công cụ gốc bằng các giải pháp thông minh vượt trội:
     + Tự động tính toán số cây / số tấm nguyên kèm hệ số hao hụt thực tế (5% góc mòi, 15% ván).
     + Tối ưu hình học (Lật X/Y, Xoay góc 360°, Cập nhật tức thì đối tượng đã dựng).
     + Tích hợp thư viện phụ kiện chuẩn ngành nội thất Việt Nam (Gola, máng LED có tai, nhôm cánh kính, phào PU).
     + Lưu trữ cấu hình và biên dạng tự vẽ vĩnh viễn trên máy xưởng.
     + Xuất trực tiếp bảng đặt hàng Excel chuẩn xưởng không phụ thuộc thư viện bên ngoài.
6. **Đồng Bộ Giao Diện Song Sinh Với Web (Web-Twin Design System - Nghiêm Cấm AI Slop):**
   - **TẤT CẢ CÁC CÔNG CỤ (SketchUp HtmlDialog, AutoCAD DCL / Dialog, Web App)** BẮT BUỘC tuân thủ 100% hệ thống nhận diện thương hiệu của Web App chính (`webnoithatpro.vn`), không được dùng giao diện tối (dark neon) mặc định của AI:
     * **Bảng màu chuẩn ngành mộc kỹ thuật (Web Technical Palette):**
       - Nền chính (Canvas): `--bg: #f8fafc` (Slate 50) kết hợp lưới kỹ thuật CAD `.bg-blueprint-grid` (24px).
       - Thẻ khối (Card Surface): `--card-bg: #ffffff` (Pure White), viền kỹ thuật `--border: rgba(226, 232, 240, 0.85)` (Slate 200).
       - Chữ chính (Text): `--text: #0f172a` (Slate 900), phụ `--text-muted: #64748b` (Slate 500).
       - Màu thương hiệu xưởng gỗ (Brand Wood Amber): `--brand: #f59e0b` (Amber 500), hover `#d97706` (Amber 600).
       - Màu hành động tạo giá trị (Action Success): `--primary: #059669` (Emerald 600) cho nút Xuất Excel, Chạy lệnh bóc tách.
       - Màu kỹ thuật & chọn 3D (CAD Accent): `--accent: #0284c7` (Sky 600) cho đường nét CAD, chọn đối tượng 3D.
     * **Hệ thống Font chữ (Typography):**
       - Font giao diện: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
       - Font số liệu, kích thước kỹ thuật, tiền tệ VND: `"JetBrains Mono", monospace` kết hợp `font-variant-numeric: tabular-nums` và `font-feature-settings: "tnum" 1, "zero" 1`.
     * **Chuẩn hóa Component Tối Giản, Dễ Sử Dụng (Nghiêm cấm chèn logo cồng kềnh):**
       - **KHÔNG CHÈN LOGO / BANNER TIẾP THỊ VÀO CÔNG CỤ:** Trong SketchUp HtmlDialog và AutoCAD Dialog, TUYỆT ĐỐI KHÔNG đưa logo, icon thương hiệu hay banner tiếp thị cồng kềnh làm choán màn hình làm việc. Thợ thiết kế và xưởng mộc cần công cụ thực dụng, gọn nhẹ, mở lên là dùng được ngay.
       - Thanh công cụ trên cùng (Compact Action Header): Tích hợp trực tiếp thanh Tab phân đoạn (Pill Nav) với các nút thao tác chính (`Quét Chọn`, `Quét Toàn Bộ`, `Xuất Excel`, `Bản quyền`), tiết kiệm tối đa diện tích đứng.
       - Thẻ chỉ số (KPI Metric Cards): Nền trắng tinh, số to đậm font mono, nhãn màu Slate 500, rõ ràng trực quan.
       - Bảng kê chi tiết & Bản vẽ CAD: Tối đa hóa không gian hiển thị, kẻ mảnh `border-slate-100`, hover nổi bật nhẹ nhàng.
       - Hộp thoại Toast & Modal: Tông màu sáng thanh lịch, ăn khớp 100% với Web App.
7. **Tự Động Hóa & Điều Khiển Trực Tiếp SketchUp Qua MCP (`sketchup` MCP Server):**
   - Tương tự như `cadcraft` MCP cho AutoCAD, hệ sinh thái sở hữu riêng một MCP Server cho SketchUp (`sketchup`) kết nối qua cầu nối Ruby Bridge trên cổng `127.0.0.1:9898`.
   - File bridge: `%APPDATA%\SketchUp\SketchUp 2025\SketchUp\Plugins\sketchup_mcp_bridge.rb`.
   - Khi người dùng yêu cầu kiểm tra mô hình 3D, bóc tách khối lượng, dựng hình phào nẹp, tạo tấm ván 3D, chụp ảnh viewport hoặc chạy code Ruby: Antigravity chủ động sử dụng các công cụ thuộc server `sketchup` (`status`, `eval`, `get_selection`, `create_box`, `create_face`, `screenshot`, `run_cutlist`, `run_profile`, `open_dialog`).
   - Nếu SketchUp chưa kết nối, hướng dẫn người dùng dán `load 'sketchup_mcp_bridge.rb'` vào Ruby Console hoặc mở file `Kich_Hoat_SketchUp_MCP.bat` trên Desktop.


