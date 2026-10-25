# QUY TẮC TÍNH TOÁN BÓC TÁCH VẬT TƯ & BÁO GIÁ (CALCULATIONS RULES)

> **Vị trí bắt buộc:** Mọi hàm tính toán dưới đây chỉ được phép cài đặt tại thư mục `src/core/calculations/`. Tuyệt đối không viết rải rác trong các component giao diện.

---

## 1. PHỄU XỬ LÝ DỮ LIỆU ĐẦU VÀO (INPUT & COLUMN MAPPING)

Dữ liệu đầu vào là file Excel (`.xlsx` hoặc `.csv`) xuất từ các phần mềm thiết kế nội thất:
- SketchUp (Plugin ABF, OpenCutList).
- AutoCAD (Lisp bóc tách).
- Bảng Excel tính tay của thợ/kỹ thuật.

### 8 Trường Chuẩn Của Hệ Thống
Khi tải file Excel lên, hệ thống cung cấp giao diện gán cột (Column Mapping) tương ứng với 8 trường chuẩn:
1. `module_name`: Tên Hạng mục / Sản phẩm (VD: Tủ áo Master, Tủ bếp trên).
2. `part_name`: Tên tấm chi tiết (VD: Hông trái, Đợt ngang, Cánh cửa, Hậu tủ).
3. `length_mm`: Chiều dài (mm).
4. `width_mm`: Chiều rộng (mm).
5. `thickness_mm`: Chiều dày (mm, mặc định 17 hoặc 6).
6. `qty`: Số lượng tấm (mặc định 1).
7. `material_code`: Mã hoặc tên loại ván (VD: MDF Chống ẩm 17mm, Hậu 6mm).
8. `edge_banding`: Quy cách dán cạnh 4 cạnh (D1, D2, R1, R2).

---

## 2. THUẬT TOÁN TÍNH TOÁN CỐT LÕI

### 2.1. Diện Tích Ván Thực Tế (Net Area)
Mỗi tấm chi tiết có diện tích thực:
$$\text{Area}_{\text{item}} (m^2) = \frac{\text{length\_mm} \times \text{width\_mm} \times \text{qty}}{1.000.000}$$

### 2.2. Gom Nhóm & Quy Đổi Ra Số Tấm Tiêu Chuẩn Cần Đặt Hàng
Gom nhóm tất cả các tấm chi tiết có cùng `material_code` (hoặc cùng độ dày `thickness_mm`):
- Khổ ván tiêu chuẩn ngành gỗ công nghiệp:
  $$1220 \text{ mm} \times 2440 \text{ mm} = 2.9768 \text{ } m^2$$
- Số tấm ván cần mua (đã tính hệ số hao hụt):
  $$\text{Số tấm cần mua} = \left\lceil \frac{\left( \sum \text{Area}_{\text{item}} \right) \times \text{waste\_factor}}{2.9768} \right\rceil$$
- `waste_factor` mặc định là `1.15` (hao hụt 15% do đường cưa đĩa và cắt vát/đầu mẩu). Người dùng có quyền tùy chỉnh từ `1.10` đến `1.25` trong Thư viện hoặc trên từng dự án.

### 2.3. Tính Tổng Mét Dài Chỉ Dán Cạnh (Edge Banding)
Đối với mỗi tấm chi tiết:
$$\text{Length}_{\text{edge}} (m) = \frac{\sum (\text{chiều dài các cạnh được tích dán}) \times \text{qty}}{1.000}$$
- Trong đó:
  - Cạnh dài 1 ($D1$) = `length_mm`
  - Cạnh dài 2 ($D2$) = `length_mm`
  - Cạnh rộng 1 ($R1$) = `width_mm`
  - Cạnh rộng 2 ($R2$) = `width_mm`
- Tổng mét dài chỉ dán cạnh cần đặt:
  $$\text{Tổng md chỉ} = \left( \sum \text{Length}_{\text{edge}} \right) \times \text{edge\_waste\_factor}$$
  *(Hệ số hao hụt chỉ `edge_waste_factor` mặc định là `1.08` tức 8% hao hụt do bo góc và cắt đầu mẩu).*

### 2.4. Áp Giá & Tính Biên Lợi Nhuận
- **Giá vốn vật tư (Material Cost):**
  $$\text{Cost}_{\text{material}} = \sum (\text{Số lượng vật tư quy đổi} \times \text{unit\_price})$$
- **Chi phí phụ kiện & nhân công (Hardware & Labor Cost):**
  Cộng thêm chi phí bản lề, ray bi, phụ kiện và đơn giá nhân công gia công/lắp đặt.
- **Giá chào khách hàng (Quote Price):**
  $$\text{Quote Price} = \text{Total Cost} \times \text{profit\_margin}$$
  *(Hệ số lợi nhuận `profit_margin` mặc định là `1.25` tức markup 25%; cho phép xưởng linh hoạt điều chỉnh).*

---

## 3. CƠ CHẾ "MỘT ĐẦU VÀO, HAI ĐẦU RA"

### Đầu Ra 1: Bảng Đặt Hàng Vật Tư Nội Bộ (Workshop Material BOM)
- **Mục đích:** Dành cho chủ xưởng, bộ phận thu mua vật tư để gọi đại lý ván và phụ kiện.
- **Nội dung hiển thị:**
  - Danh sách số lượng tấm ván chuẩn cần đặt theo từng loại (VD: 14 tấm MDF 17mm An Cường mã 388EV, 4 tấm hậu 6mm).
  - Tổng số mét dài chỉ dán cạnh đồng màu.
  - Số lượng phụ kiện (bản lề, ray trượt).
  - Chi phí giá vốn dự kiến.
- **Định dạng xuất:** File Excel (`.xlsx`).

### Đầu Ra 2: Bảng Báo Giá Khách Hàng (Client PDF Quote)
- **Mục đích:** Dành cho chủ nhà, chủ đầu tư để chốt hợp đồng.
- **Nội dung hiển thị:**
  - **TUYỆT ĐỐI ẨN:** Không hiển thị kích thước tấm lẻ, số tấm ván mua, hệ số hao hụt hay giá vốn.
  - **HIỂN THỊ GOM NHÓM:** Gom theo `module_name` (VD: Hạng mục 1: Tủ áo kịch trần phòng Master; Hạng mục 2: Tủ bếp trên Acrylic...).
  - Kích thước tổng thể sản phẩm (Dài x Rộng x Cao).
  - Quy cách vật liệu cam kết (VD: Thùng MDF lõi xanh chống ẩm phủ Melamine, Cánh Acrylic An Cường).
  - Đơn giá thành phẩm và thành tiền.
  - Đầu trang có Logo xưởng, Hotline, Địa chỉ lấy từ bảng `profiles`.
  - Chân trang có điều khoản thanh toán, bảo hành và dòng lưu ý pháp lý.
- **Định dạng xuất:** File PDF chuẩn in khổ A4 (CSS `@media print`).
