# NoiThatPro Cutlist & BOM Pro cho SketchUp

> **Phiên bản:** 1.0.0 Pro (Build 2026)  
> **Nền tảng:** Trimble SketchUp 2017, 2019, 2021, 2022, 2023, 2024, 2025, 2026 (64-bit Windows)  
> **Định dạng đóng gói:** Extension `.rbz` chuẩn SketchUcation / Trimble Extension Warehouse  
> **Ngôn ngữ:** 100% Tiếng Việt chuẩn xưởng mộc công nghiệp  

---

## 1. GIỚI THIỆU & TỔNG QUAN

**NoiThatPro Cutlist & BOM Pro** là tiện ích mở rộng (SketchUp Extension) chuyên dụng dành riêng cho các xưởng sản xuất nội thất gỗ công nghiệp (MDF lõi xanh, Melamine, MFC, Plywood, HDF) và các kiến trúc sư / kỹ sư nội thất tại Việt Nam.

Công cụ được thiết kế như một **bản nâng cấp toàn diện vượt trội hơn OpenCutList**, giải quyết triệt để các bài toán thực tế của xưởng sản xuất:
* **Bóc tách đệ quy xuyên suốt:** Tự động quét sâu qua mọi cấp Assembly lồng nhau (`Căn hộ -> Hệ tủ -> Mô-đun tủ -> Hộc kéo -> Tấm ván lẻ`).
* **Khử sai lệch Scale / Mirror:** Tự động phân rã ma trận biến đổi $4 \times 4$ để đo kích thước thực tế hiển thị ($Dài \times Rộng \times Dày$) với độ chính xác $100\%$, không bao giờ bị sai số khi co kéo tủ.
* **Tự động dán chỉ Zero-Click:** Phân bổ dán cạnh theo chuẩn xưởng: Cánh tủ & Ngăn kéo dán 4 cạnh (`4_CANH`); Hồi vách, Đáy nóc, Đợt tủ dán 1 cạnh mặt tiền (`1_DAI`); Ván hậu không dán (`KHONG_DAN`).
* **Khóa chiều vân gỗ thông minh:** Giữ đúng chiều vân đứng cho Cánh tủ và chiều vân ngang cho Ngăn kéo khi chuyển sang máy CNC Nesting.
* **Tối ưu chi tiết bo cong & khoét góc:** Tự động bao phủ toàn bộ đỉnh uốn cong $R$, đảm bảo phôi thô không bao giờ bị hụt ván.
* **Xuất 2 trong 1:** 
  1. **File Excel Xưởng (.xls):** Có kẻ bảng, tô màu, tính tổng $m^2$ ván và bảng đặt mua ván đại lý (Sheet 1: Danh mục cắt, Sheet 2: Tổng hợp đặt ván).
  2. **File CSV Web:** UTF-8 có mã BOM để ném thẳng vào Web Báo Giá.

---

## 2. CẤU TRÚC GÓI ĐÓNG GÓI PHÁT HÀNH

```
noithatpro-cutlist/
├── noithatpro_cutlist.rbz             # [QUAN TRỌNG] File cài đặt 1 chạm cho SketchUp
├── noithatpro_cutlist.rb              # Loader chính đăng ký SketchupExtension
├── README.md                          # Tài liệu hướng dẫn sử dụng và cài đặt chi tiết
├── sample_sketchup_cutlist.csv        # File CSV mẫu chuẩn UTF-8 có dấu BOM
├── sample_workshop_order.xls          # File Excel mẫu 2 sheet chuyên nghiệp cho xưởng
└── noithatpro_cutlist/                # Thư mục mã nguồn mở rộng
    ├── main.rb                        # Đăng ký Menu Plugins & Toolbar icon
    ├── core/
    │   ├── extractor.rb               # Trái tim bóc tách hình học, vân gỗ & dán chỉ
    │   ├── exporter.rb                # Bộ xuất file Excel (.xls) & CSV UTF-8
    │   └── licensing.rb               # Hệ thống khóa phần cứng Hardware ID & Web API
    └── ui/
        ├── dialog.rb                  # Quản lý giao diện UI::HtmlDialog
        └── index.html                 # Giao diện Dashboard HTML5/Tailwind hiện đại
```

---

## 3. HƯỚNG DẪN CÀI ĐẶT VÀO SKETCHUP

### Cách 1: Cài đặt tự động bằng file `.rbz` (Khuyên dùng - Nhanh nhất)
1. Mở phần mềm **SketchUp**.
2. Trên thanh menu, vào **Extensions** (Tiện ích mở rộng) $\to$ chọn **Extension Manager** (Trình quản lý tiện ích).
3. Tại góc dưới cửa sổ, nhấn nút màu đỏ **Install Extension** (Cài đặt tiện ích).
4. Dẫn đến file **`noithatpro_cutlist.rbz`** (Đã tạo sẵn trên Desktop của bạn hoặc trong thư mục này) $\to$ Bấm **Open**.
5. Ngay lập tức, thanh công cụ **NoiThatPro Tools** và menu **Plugins > NoiThatPro Nội Thất > Bóc Tách Cutlist & Báo Giá (QC)** sẽ xuất hiện.

### Cách 2: Nạp nhanh qua Ruby Console (Để test thử nghiệm)
1. Trong SketchUp, vào **Window** $\to$ **Ruby Console**.
2. Gõ lệnh:
   ```ruby
   load 'C:/Users/KIET_PC/Desktop/Web nội thất/public/plugins/sketchup/noithatpro_cutlist.rb'
   ```
3. Gõ tiếp lệnh bật cửa sổ:
   ```ruby
   NoiThatPro::CutlistPro::DialogManager.show
   ```

### Cách 3: Cài thủ công vào thư mục Plugins
Copy file `noithatpro_cutlist.rb` và thư mục `noithatpro_cutlist/` vào:
```text
C:\Users\<Tên_User>\AppData\Roaming\SketchUp\SketchUp 202X\SketchUp\Plugins\
```

---

## 4. HƯỚNG DẪN SỬ DỤNG BÓC TÁCH & DỰ TOÁN

### Bước 1: Chuẩn bị mô hình 3D trong SketchUp
* Các tấm ván nên được đóng thành `Component` hoặc `Group` độc lập (dày 17mm, 6mm, 9mm, 25mm...).
* Đặt tên gợi nhớ cho tấm ván (Ví dụ: `Hoi_Trai`, `Canh_Tu`, `Day_Tu`, `Van_Hau_6mm`...).
* Nếu muốn ghi đè quy cách dán cạnh đặc thù, chỉ cần thêm đuôi tag vào tên Component:
  * `#4C`: Ép dán 4 cạnh.
  * `#1D`: Ép dán 1 cạnh dài trước.
  * `#2D1R`: Ép dán 2 cạnh dài và 1 cạnh rộng.
  * `#0C`: Ép không dán cạnh.

### Bước 2: Khởi động công cụ
* Bấm vào biểu tượng **NoiThatPro** trên thanh Toolbar hoặc vào Menu **Plugins > NoiThatPro Nội Thất > Bóc Tách Cutlist & Báo Giá (QC)**.
* Cửa sổ Dashboard HTML5 hiện đại lập tức hiện ra và tự động quét toàn bộ bản vẽ.

### Bước 3: Xem tổng hợp & Dự toán vật tư
* **Thẻ thống kê (KPIs):**
  * Số lượng tấm ván MDF 17mm ($1220 \times 2440\text{mm}$) cần đặt mua (kèm 15% hao hụt).
  * Số lượng tấm ván hậu 6mm cần đặt mua.
  * Tổng mét dài chỉ dán viền PVC và số cuộn chỉ 100m cần đặt hàng.
  * Ước tính giá vốn sản xuất và giá báo giá đề xuất (biên lợi nhuận 35%).
* **Bảng danh mục chi tiết:** Xem lại kích thước từng tấm, số lượng sau khi gom nhóm, mã vật tư và quy cách dán chỉ.

### Bước 4: Xuất file sản xuất
* **Bấm "Xuất Excel Xưởng (.xls)":** Tạo bảng đặt hàng vật tư có kẻ khung, tô màu, công thức tính tổng diện tích để gửi đại lý ván và in cho thợ xưởng.
* **Bấm "Xuất CSV Web":** Tạo file dữ liệu chuẩn để kéo thả trực tiếp vào nền tảng Web Báo Giá.
* Phần mềm tự động mở thư mục chứa file vừa xuất trên Windows Explorer.

---

## 5. CƠ CHẾ BẢO VỆ BẢN QUYỀN (LICENSING)

1. **Khóa cứng theo máy (Hardware ID):**
   * Mỗi máy tính được định danh bởi một mã phần cứng độc nhất (kết hợp UUID bo mạch chủ và Serial ổ C) dạng: `NTPRO-XXXX-XXXX-XXXX-XXXX`.
   * Người dùng bấm vào huy hiệu bản quyền trên giao diện để xem và sao chép Mã Máy.
2. **Kích hoạt Online:**
   * Khách hàng nhập mã máy khi thanh toán VietQR trên Web.
   * Nhập License Key được cấp vào plugin $\to$ Bấm **"Kích Hoạt Ngay"** $\to$ Plugin kết nối với Web API `/api/license/verify` và lưu token kích hoạt offline trong `%APPDATA%/NoiThatPro/`.
3. **Chế độ Host Developer Master (Dành cho máy bạn):**
   * Máy tính của bạn được tự động nhận diện và kích hoạt vĩnh viễn với huy hiệu **`Host Master Active`**, mở khóa toàn bộ tính năng mà không cần nhập key.

---

## 6. THÔNG TIN HỖ TRỢ & BẢO HÀNH

* **Đơn vị phát triển:** NoiThatPro Platform Team
* **Website:** [https://webnoithatpro.vn](https://webnoithatpro.vn)
* **Báo giá & Dự toán trực tuyến:** [https://webnoithatpro.vn/quoting](https://webnoithatpro.vn/quoting)
* **Email hỗ trợ kỹ thuật:** `hotro@webnoithatpro.vn`
