# AutoCutlist Pro (Bóc Tách Cutlist AutoCAD Sang Web V3.0)

> **Phiên bản:** 3.0 Pro (Build 2026)  
> **Lệnh khởi động:** `QC` *(Quick Cutlist)*  
> **Bản quyền:** Host Developer Master (Kích hoạt sẵn cho máy chủ phát triển)  
> **Tương thích:** AutoCAD 2014, 2018, 2020, 2022, 2024, 2026 (64-bit Windows) & CADCraft Engine  

---

## 1. GIỚI THIỆU & 7 ĐIỂM NÂNG CẤP VƯỢT TRỘI TRONG BẢN V3.0

**AutoCutlist Pro V3.0** là công cụ AutoLISP chuyên dụng đỉnh cao dành cho kỹ sư bổ kỹ thuật và thợ thiết kế nội thất gỗ công nghiệp (MDF, MFC, Plywood). 

Thay vì phải ngồi đo từng tấm, gõ kích thước thủ công vào Excel mất 1–3 tiếng cho mỗi công trình, **AutoCutlist Pro V3.0** tự động bóc tách từ bản vẽ 2D/3D với **7 tính năng tối ưu chuẩn xưởng**:

1. **Tự động nối nét vẽ rời (Auto-Chain Line/Arc):** Quét cả các đoạn `LINE` và `ARC` rời rạc, tự động ghép nối đầu mút thành chuỗi khép kín thành tấm, không lo thợ quên `JOIN` hay `PEDIT`.
2. **Khóa chiều vân gỗ thông minh (Grain Direction):** Nhận diện đúng chiều thớ vân cho Cánh tủ (`CANH_TU` - vân dọc), Mặt ngăn kéo (`NGAN_KEO` - vân ngang). Không bị ép cứng $\max/\min$ làm lệch vân khi cắt CNC Nesting.
3. **Bóc tách Block tỉ lệ & xoay (`INSERT` Scale & Rotation):** Nhân ma trận Scale X, Y, Z và góc xoay khi duyệt chi tiết con trong Block, phản ánh đúng 100% kích thước thực tế hiển thị trên bản vẽ.
4. **Dán chỉ thông minh Zero-Click (Smart Edge Banding):** Phân bổ dán cạnh tự động theo nghề mộc: Cánh tủ (4 cạnh), Hồi/Vách/Đáy/Nóc/Đợt (1 dài), Ván hậu (Không dán). Tiết kiệm hơn **45% mét dán chỉ** dư thừa so với việc gán cứng 4 cạnh. Hỗ trợ tag layer (`_DAN1D`, `_DAN2D1R`...).
5. **Tối ưu bo góc & Cạnh cong (Bulge / Fillet / Arcs):** Tính độ võng Sagitta, Bán kính $R$ và cực trị đỉnh cong (Apex). Đưa toàn bộ đỉnh cong vào khung bao phôi thô và tính chiều dài cung dán chỉ $S = R \cdot \theta$, không bao giờ bị hụt ván khi cắt phôi.
6. **Lọc nét vẽ trùng đè (Overkill Filter):** Nhận diện tọa độ tâm và kích thước tương đương, tự động bỏ qua các hình chữ nhật vẽ đè cùng vị trí để không bị nhân đôi số lượng.
7. **Khối 3D Solid xoay nghiêng:** Kiểm tra thể tích thực $V = \text{Volume}$ và hiệu chỉnh diện tích phôi thực tế $S = V / \text{Độ dày}$ khi khối 3D bị xoay nghiêng trong không gian.

---

## 2. CẤU TRÚC GÓI CÔNG CỤ

```
autocutlist-pro/
├── AutoCutlist_Pro.lsp           # Mã nguồn Lisp V3.0 tối ưu toàn diện
├── sample-cutlist-output.csv     # File CSV mẫu chuẩn UTF-8 có BOM xuất từ bản vẽ
└── README.md                     # Tài liệu hướng dẫn sử dụng chi tiết
```

---

## 3. HƯỚNG DẪN CÀI ĐẶT VÀO AUTOCAD

### Cách 1: Kéo thả nhanh (Dùng tạm thời)
1. Mở AutoCAD và mở bản vẽ cần bóc tách.
2. Kéo file `AutoCutlist_Pro.lsp` thả thẳng vào màn hình làm việc của AutoCAD.
3. Nhìn dòng lệnh Command bên dưới màn hình, thấy thông báo:  
   `[ĐÃ NẠP AUTOCUTLIST PRO V3.0] - Gõ lệnh 'QC' để bắt đầu!` là đã sẵn sàng.

### Cách 2: Khởi động vĩnh viễn cùng AutoCAD (Khuyên dùng)
1. Gõ lệnh `APPLOAD` $\to$ Nhấn `Enter`.
2. Tại mục **Startup Suite** (biểu tượng chiếc cặp xách), bấm **Contents...**
3. Bấm **Add...** $\to$ Chọn file `AutoCutlist_Pro.lsp`.
4. Bấm **Close** $\to$ **Close**.  
   *Từ nay mỗi khi mở bất kỳ bản vẽ AutoCAD nào, lệnh `QC` sẽ luôn sẵn sàng.*

---

## 4. THAO TÁC BÓC TÁCH VỚI LỆNH `QC`

1. Gõ lệnh **`QC`** $\to$ Nhấn `Enter`.
2. Hộp thoại thiết lập hiện ra:
   * **Tên Hạng Mục:** Nhập tên mô-đun (Ví dụ: `Tu_Ao_Master`, `Tu_Bep_Duoi`...).
   * **Độ dày mặc định:** Mặc định `17mm`.
   * **Mã vật tư ván:** Chọn `MDF_CHONG_AM_17`, `MDF_VAN_HAU_6`...
   * **Quy tắc dán chỉ:** Mặc định `TU_DONG_SMART` (Plugin tự động phân bổ theo chi tiết).
   * **Định hướng chiều vân:** Mặc định `TU_DONG_THEO_CHI_TIET`.
3. Bấm **OK**.
4. Quét chọn toàn bộ các chi tiết trên bản vẽ (Polyline, Line rời, Block, 3D Solid) $\to$ Nhấn `Enter`.
5. Plugin tự động gom nhóm số lượng (Aggregation Qty), lọc nét vẽ đè và xuất file CSV UTF-8 có dấu BOM ra Desktop.
6. Kéo thả file CSV này vào [Web Báo Giá](https://webnoithatpro.vn/quoting) để tạo báo giá PDF A4 và bảng đặt hàng trong 3 giây!
