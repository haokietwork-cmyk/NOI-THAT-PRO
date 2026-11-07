# KIẾN TRÚC TƯ DUY BÁO GIÁ NỘI THẤT 4 MỨC ĐỘ (THE 4-TIER ESTIMATOR LADDER)

> **Tài liệu đặc tả kiến trúc nghiệp vụ CPQ (Configure, Price, Quote) cho Nền tảng NỘI THẤT PRO.**  
> Chuyển đổi từ tư duy "thợ đếm tấm phôi" sang tư duy **"Chuyên gia dự toán giá vốn & Người mua hàng thông thái"**.

---

## 1. TƯ DUY HAI CHIỀU: ĐẶT MÌNH VÀO NGƯỜI MUA & NGƯỜI BÁO GIÁ

### 1.1. Tâm Lý & Kỳ Vọng Của Người Mua Hàng (Buyer's Perspective)
- **Cần câu trả lời nhanh:** Khi khách gửi 1 tấm hình Pinterest hoặc ảnh chụp hiện trạng, họ muốn biết ngay trong 30 giây: *"Mẫu này xưởng làm khoảng bao nhiêu tiền để em cân đối ngân sách?"*. Nếu bảo khách chờ 2-3 ngày để vẽ 3D và bóc tách từng tấm phôi, khách sẽ sang xưởng khác ngay lập tức.
- **Không hiểu thuật ngữ kỹ thuật sâu:** Khách không biết và không quan tâm "ván dày 17mm, nẹp PVC 1mm, chừa hở cánh 2mm". Họ chỉ quan tâm: *Dùng chất liệu gì có bền không? Cánh kính có an toàn không? Có đèn LED không? Bảo hành mấy năm?*
- **Cần sự minh bạch & an tâm:** Khách muốn biết rõ trong tầm giá đó họ nhận được những gì, và nếu muốn giảm giá hoặc nâng cấp thì đổi những chi tiết nào.

### 1.2. Nỗi Sợ & Trách Nhiệm Của Người Báo Giá Xưởng (Estimator's Perspective)
- **Nỗi sợ lớn nhất:** **Báo hớ giá, làm xong lỗ chổng vó** do bỏ sót các chi phí ẩn (phụ kiện nhập khẩu đắt tiền, đèn LED ray âm, kính cường lực, độ khó uốn cong/vát mòi, chi phí thử cữ máy cho 1 cái lẻ).
- **Nghịch lý ở khâu đầu:** Người báo giá **không thể có bản vẽ chi tiết khi khách mới chỉ hỏi giá sơ bộ**.
- **Giải pháp đúng đắn:** Công cụ đóng vai trò như một **"Trợ lý kỹ thuật tự động dựng BOM giả định"**, người báo giá chỉ cần rà soát các giả định và điều chỉnh chỗ cần, không bao giờ phải nhập lại từ đầu.

---

## 2. PHÂN TÍCH CA ĐIỂN HÌNH: TỦ TRƯNG BÀY RƯỢU & DECOR CAO CẤP

Một sản phẩm nội thất như Tủ trưng bày không bao giờ chỉ có "ván". Một chuyên gia báo giá sẽ phân rã thành **7 lớp chi phí cốt lõi**:

```text
[TỦ TRƯNG BÀY RƯỢU & DECOR LUXURY]
 ├── 1. Khối gỗ & Thùng (Carcass)       : Thùng MDF 17mm chống ẩm phủ Melamine/Veneer Óc chó + Hậu 6mm
 ├── 2. Phụ kiện lắp ráp kết cấu        : Ốc cam chốt âm, bas treo chịu lực âm tường, chốt đợt kính tăng chỉnh
 ├── 3. Phụ kiện trang trí & Cao cấp    : Cánh kính khung nhôm Anode Slim 16mm (kính xám khói), ray âm Blum,
 │                                        tay nắm phay rãnh kim loại PVD
 ├── 4. Hệ thống điện & Đèn LED         : Thanh nhôm định hình hắt sáng đợt kính, dây điện luồn giấu âm,
 │                                        cảm biến đóng mở cánh, bộ nguồn hạ áp 12V 60W
 ├── 5. Mức độ gia công & Độ khó        : Cắt vát mòi 45 độ giấu nẹp, phay rãnh nhôm led âm gỗ, khoan khoét kính
 │                                        (Độ khó cao -> tăng giờ công các bộ phận CNC, ASS, Fitting)
 ├── 6. Xuất xứ vật tư (Nội địa/Nhập)   : Ván An Cường / Dongwha (nội địa) vs Phụ kiện Hafele/Blum (nhập khẩu Áo)
 ├── 7. Bậc số lượng đặt hàng (MOQ)     : 1 chiếc (mẫu lẻ may đo +25% chi phí rập/cữ) vs 10 chiếc (sản xuất lô)
 └── Biên lợi nhuận mục tiêu & Rủi ro   : Lợi nhuận gộp 25-35% + 5-10% Dự phòng rủi ro kỹ thuật khi chưa có bản vẽ
```

---

## 3. THANG 4 MỨC ĐỘ BÁO GIÁ TĂNG DẦN (4-TIER ESTIMATION LADDER)

Hệ thống cho phép nhân viên dừng ở bất kỳ mức nào tùy vào mức độ thông tin họ có và yêu cầu của khách:

| Tiêu chí | Mức 1: Giá khoảng từ kích thước bao | Mức 2: Chọn mẫu kết cấu, tự sinh BOM giả định | Mức 3: Dựng từ báo giá cũ tương tự | Mức 4: BOM chi tiết đầy đủ |
| :--- | :--- | :--- | :--- | :--- |
| **Bối cảnh sử dụng** | Khách gửi ảnh hỏi giá nhanh qua Zalo/Facebook; chưa có bản vẽ; cần trả lời trong 30 giây | Khách chốt sơ bộ nhu cầu, chọn được kiểu dáng; cần gửi báo giá kèm quy cách rõ ràng | Xưởng đã từng làm các mẫu tương tự; khách muốn mẫu giống công trình cũ | Đã chốt hợp đồng, đã có bản vẽ kỹ thuật CAD/3D; xuất lệnh cho xưởng sản xuất |
| **Đầu vào người dùng** | • Kích thước bao $W \times D \times H$<br>• Vật liệu chính (MDF, Gỗ thịt, Đá)<br>• Vài thẻ: Có kính, có led, có nệm | • Chọn 1 mẫu kết cấu trong catalog<br>• Trả lời 3-5 câu hỏi: Số cánh, số hộc kéo, số tầng kệ, loại kính/đá | • Tải ảnh hoặc chọn 1 báo giá cũ trong kho xưởng<br>• Nhập kích thước mới $W \times D \times H$ | • Nạp file CSV từ AutoCAD / SketchUp<br>• Hoặc bóc tách từng tấm phôi lẻ |
| **Cơ chế tính toán** | Hệ số kinh nghiệm ($m^2$ mặt đứng, $md$, hoặc $m^3$ phủ bì) $\pm 15-20\%$ | **Tự sinh Draft BOM** theo quy tắc chuẩn xưởng (độ dày, chừa khe hở, định mức phụ kiện) | Co giãn khối lượng (`scaleFromTemplate`) và cập nhật đơn giá theo Snapshot hiện hành | Động cơ `panel_cnc` hoặc `export_furniture` chiết tính 15 nhóm chi phí + 37 công đoạn |
| **Độ tin cậy & Nhãn** | 🟡 **Báo giá Sơ bộ** (Khoảng giá $[min - max]$) | 🟠 **Theo mẫu giả định** (Có danh sách giả định đi kèm) | 🟠 **Theo mẫu lịch sử** (Có đối chiếu độ lệch %) | 🟢 **Chuẩn sản xuất** (Độ tin cậy 5 sao) |
| **Dự phòng rủi ro** | Tự động cộng $+10\%$ Contingency Buffer | Tự động cộng $+5\%$ Contingency Buffer | Tự động cộng $+5\%$ Contingency Buffer | Không cộng dự phòng (Tính đúng thực tế) |
| **Quyền xuất hợp đồng** | ✕ Khóa xuất hợp đồng chốt giá cuối | ✕ Khóa xuất hợp đồng nếu còn giả định chưa duyệt | ✓ Cho phép xuất báo giá thương mại | ✓ Xuất trọn vẹn Báo giá A4 & Excel Xưởng |

---

## 4. CƠ CHẾ HỖ TRỢ BẰNG ẢNH & DANH SÁCH "GIẢ ĐỊNH KỸ THUẬT"

### 4.1. Vai Trò Đúng Đắn Của Trợ Lý AI Khi Đọc Ảnh
- **Ảnh thiếu thông tin kết cấu bên trong:** Ảnh chụp không thể thấy được ván hậu dày mấy ly, phụ kiện dùng ray trượt loại gì, đáy ngăn kéo chịu lực ra sao, liên kết mộng hay cam chốt.
- **Nguyên tắc bất di bất dịch:** 
  1. AI đọc ảnh chỉ đóng vai trò **"Trợ lý phân tích đề xuất"**: tự động nhận diện kiểu dáng, đếm sơ bộ số cánh cửa, số ngăn kéo, phát hiện có mặt đá hay cánh kính $\rightarrow$ **Điền sẵn các trường vào Mức 2**.
  2. **Tuyệt đối KHÔNG để AI tự quyết định giá tiền cuối cùng**.
  3. Mọi kết quả do AI đề xuất đều mang nhãn `isAiUnconfirmed: true` để người báo giá kiểm duyệt trước khi tính.

### 4.2. Cột "Giả Định Kỹ Thuật" (Assumptions Checklist) Hiển Thị Bên Cạnh Giá
Để bảo vệ xưởng và minh bạch với khách, bên cạnh con số giá tính ra ở Mức 1 và Mức 2 luôn có danh sách giả định:
> **Bảng giả định kỹ thuật áp dụng cho báo giá này:**
> - [x] Thùng tủ: MDF chống ẩm 17mm phủ Melamine vân gỗ tiêu chuẩn.
> - [x] Cánh tủ: Cánh kính khung nhôm Slim 16mm, kính cường lực xám khói 5mm.
> - [x] Hậu tủ: MDF 6mm chống ẩm giấu rãnh âm.
> - [x] Đèn LED: Đèn LED dây 12V 10W/m hắt đợt kính, kèm 01 bộ nguồn 60W cảm ứng đóng mở.
> - [x] Phụ kiện: 04 cặp bản lề cánh kính giảm chấn đồng bộ, 02 bộ ray trượt hộc kéo ray âm.
> 
> *(Ghi chú: Nếu công trình thực tế thay đổi vật liệu hoặc tăng số lượng phụ kiện, đơn giá sẽ được hiệu chỉnh theo khối lượng nghiệm thu).*

---

## 5. CƠ CHẾ BẢO VỆ LỢI NHUẬN & QUẢN TRỊ RỦI RO PHÁT SINH

1. **Khoản Dự Phòng Rủi Ro Kỹ Thuật (Risk Contingency Margin):**
   - Khi ở Mức 1 và Mức 2 (chưa có bản vẽ kỹ thuật chi tiết), động cơ tự động tính thêm một khoản dự phòng rủi ro:
     $$\text{Giá vốn dự toán} = \text{COGS cơ sở} \times (1 + \text{Tỷ lệ rủi ro thiếu chi tiết})$$
     *(Mức 1: $+10\%$; Mức 2: $+5\%$; Mức 4: $0\%$)*.
   - Khoản dự phòng này bảo vệ xưởng không bao giờ bị lỗ khi thực tế phát sinh thêm pát sắt gia cố, keo bọt hay đinh vít đặc chủng.
2. **Khóa Cổng Xuất Bản Chốt Hợp Đồng (Contract Sign-off Gate):**
   - Hệ thống cho phép in bản "Báo giá tham khảo sơ bộ" cho khách ở Mức 1 & 2.
   - Nhưng **chặn nút xuất Hợp đồng thi công chính thức** nếu các dòng vật tư cốt lõi vẫn còn ở trạng thái `Giả định chưa xác nhận`.
3. **Theo Dõi Chênh Lệch Giá Giữa Các Phiên Bản ($\Delta$ Version Tracking):**
   - Khách duyệt từ ảnh (Mức 1: $15.500.000\text{ đ}$) $\rightarrow$ Chọn mẫu chi tiết (Mức 2: $16.200.000\text{ đ}$) $\rightarrow$ Bổ bản vẽ sản xuất (Mức 4: $16.450.000\text{ đ}$).
   - Hệ thống hiển thị rõ mức chênh lệch ($\Delta = +250.000\text{ đ}$ do khách chọn thêm ray trượt Hafele), giúp nhân viên giải trình minh bạch với khách mà không gây cảm giác "báo giá lòng vòng".
