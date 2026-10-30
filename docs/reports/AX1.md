# Báo Cáo Kiểm Kê Tư Duy Cục Bộ & Đề Xuất Mô Hình Dòng Chi Phí Chung (AX1)

> **Mã việc:** AX1 (Giai đoạn A+)  
> **Chế độ:** CHỈ ĐỌC (Không sửa code, không đổi database)  
> **Mục tiêu:** Kiểm kê toàn diện mọi nơi trong mã nguồn và schema database đang xử lý riêng lẻ từng loại vật tư (bản lề, ray, keo, ốc cam, ván, nhân công...), làm cơ sở thiết kế mô hình dòng chi phí tổng quát (`CostLine`) tại AX2.

---

## 1. TỔNG QUAN NGUY CƠ TƯ DUY CỤC BỘ (LOCAL COUPLING)

Hiện tại, mã nguồn AutoCutlist đang đi theo lối: *"Mỗi khi phát sinh một loại chi phí mới trong xưởng mộc, lập tức thêm một trường dữ liệu riêng, một hàm kiểm duyệt riêng, một ô nhập liệu UI riêng, và một nhánh tính toán riêng trong Engine"*.
- Thêm phụ kiện liên kết $\rightarrow$ sinh ra trường `suppliesRatePerSheet` (15.000 đ/tấm).
- Thêm nhân công gia công $\rightarrow$ sinh ra trường `laborRatePerSheet` (120.000 đ/tấm).
- Thêm ước tính bản lề $\rightarrow$ sinh ra trường `hingesPerSheet` (2.0 cái/tấm).
- Thêm ước tính ray trượt $\rightarrow$ sinh ra trường `slidesPerSheet` (0.35 bộ/tấm).
- Dự kiến tính keo $\rightarrow$ định thêm `glueRatePerMd`, `glueUnitPrice`.
- Dự kiến đếm bản lề theo chiều cao cánh $\rightarrow$ định thêm `hingeThresholds`.

**Hậu quả kỹ thuật & kinh doanh:**
1. **Không bao giờ phủ hết thực tế ngành mộc:** Xưởng mộc thực tế có hàng trăm hạng mục: tay nắm nhôm, chân tăng chỉnh, rổ chén bát inox, đèn LED nhôm định hình, mặt đá Granite/Vicostone, kính ốp bếp cường lực, thầu phụ sơn PU, phụ phí vận chuyển bốc vác, chi phí lắp đặt ngoại tỉnh, thiết bị bếp (bếp từ, hút mùi, chậu vòi)... Nếu mỗi thứ đều đòi 1 cột DB và 1 ô UI thì hệ thống sẽ vỡ vụn.
2. **Khóa chặt schema database:** Mỗi vật tư mới lại đòi chạy một migration `ALTER TABLE` và cập nhật CHECK constraint JSONB.
3. **Engine phình to và mất kiểm soát:** Engine liên tục phải thêm các biến trung gian `suppliesCost`, `laborCost`, `hardwareCost`, làm mất tính tổng quát của bài toán dự toán.

---

## 2. KẾT QUẢ QUÉT TOÀN DIỆN MÃ NGUỒN (OUTPUT LỆNH GREP)

Lệnh thực thi:
```powershell
git grep -niE "hinge|slide|glue|ban le|ray|oc cam|PerSheet|PerMd" -- src supabase
```

**Tổng hợp các điểm nóng phát hiện:**

| Nhóm chức năng | Số lượng xuất hiện | Các tệp liên quan |
| :--- | :---: | :--- |
| **Types & Interfaces** | 22 | `src/core/types/index.ts` |
| **Zod Schema Validator** | 35 | `src/core/calculations/cost-config-validator.ts` |
| **Core Calculations Engine** | 48 | `src/core/calculations/engine.ts`, `quote-engine.ts` |
| **UI Components & Forms** | 42 | `src/app/(app)/settings/profile/page.tsx`, `quoting/page.tsx`, `materials/page.tsx` |
| **Data Exporter & Seed** | 28 | `src/core/exporters/excel-exporter.ts`, `src/core/services/seedData.ts` |
| **Database Migrations & Tests** | 24 | `supabase/migrations/20261025131700_add_cost_config_and_calc_version.sql`, `supabase/tests/test_cost_config_migration.sql` |

---

## 3. BẢNG KIỂM KÊ CHI TIẾT (INVENTORY TABLE)

| Vị trí (File:Dòng) | Loại chi phí / Vật tư | Đang cục bộ kiểu gì | Sẽ thay bằng gì trong Mô hình Dòng Chi Phí Chung (`CostLine`) |
| :--- | :--- | :--- | :--- |
| `src/core/types/index.ts:21` | Vật tư phụ (ốc cam, màng PE) | Trường số cứng `suppliesRatePerSheet: number` | Dòng chi phí danh mục `supplies`, quy tắc `perDriver` (driver = `totalSheets`, định mức = 15.000 đ). |
| `src/core/types/index.ts:22` | Nhân công xưởng | Trường số cứng `laborRatePerSheet: number` | Dòng chi phí danh mục `labor`, quy tắc `perDriver` (driver = `totalSheets`, định mức = 120.000 đ). |
| `src/core/types/index.ts:23` | Bản lề giảm chấn | Trường số cứng `hingesPerSheet: number` | Dòng chi phí danh mục `hardware`, quy tắc `perDriver` hoặc `tiers` theo chiều cao cánh. |
| `src/core/types/index.ts:24` | Ray trượt ngăn kéo | Trường số cứng `slidesPerSheet: number` | Dòng chi phí danh mục `hardware`, quy tắc `perTaggedPart` (nhãn = `drawer`, định mức = 1 bộ). |
| `src/core/types/index.ts:26` | Ngưỡng bản lề | Kiểu mảng `hingeThresholds?: HingeHeightThreshold[]` | Quy tắc số lượng `tiers` bên trong `CostLine.quantityRule` (dữ liệu cấu hình, không phải trường ngoài). |
| `src/core/types/index.ts:28-29` | Keo hạt PUR/EVA | Trường `glueRatePerMd`, `glueUnitPrice` | Dòng chi phí danh mục `supplies`, quy tắc `perDriver` (driver = `totalEdgeLengthMd`). |
| `src/core/calculations/cost-config-validator.ts:13-36` | 4 thông số xưởng | 4 trường Zod number với min/max riêng biệt | Schema tổng quát kiểm tra mảng `costLines: z.array(CostLineSchema)` với kiểm duyệt cấu hình theo từng `kind`. |
| `src/core/calculations/engine.ts:327-355` | Ốc cam, nhân công, bản lề, ray | 4 biến trung gian tính tiền độc lập (`totalHardwareCost`, `laborCost`, `suppliesCost`) | Duyệt mảng `costLines`, áp dụng hàm thuần `resolveLineQuantity(line, drivers)` và nhân đơn giá. |
| `src/core/calculations/engine.ts:399-404` | Kết quả BOM | Trường cố định `hardwareCost`, `laborCost`, `suppliesCost` | Mảng kết quả `resolvedLines: ResolvedCostLine[]` gom nhóm linh hoạt theo `category` hoặc `group`. |
| `src/app/(app)/settings/profile/page.tsx:34-58` | Cài đặt xưởng | 4 ô input riêng biệt (`suppliesRate`, `laborRate`, `hingesPerSheet`, `slidesPerSheet`) | Bảng quản lý dòng chi phí xưởng (Thêm dòng mới, chọn loại, chọn quy tắc tính, nhập định mức/đơn giá). |
| `src/app/(app)/quoting/page.tsx:1607-1620` | BOM Quoting UI | Khối HTML gán cứng hiển thị nhãn `Ray bi / ray âm 450mm` và `Bản lề giảm chấn` | Component lặp danh sách `resolvedLines` lọc theo category = `hardware` hoặc `supplies`. |
| `src/core/exporters/excel-exporter.ts:101-111` | Xuất file Excel BOM | Gán cứng 2 dòng bảng tính: `"Vật tư phụ & phụ kiện liên kết"` và `"Nhân công sản xuất hoàn thiện xưởng"` | Lặp mảng `costLines` xuất từng dòng chi tiết theo nhóm danh mục của xưởng. |
| `supabase/migrations/...:94-97` | Kiểm tra DB CHECK | Hàm `_cc_num_ok` kiểm tra đích danh 4 key `suppliesRatePerSheet`, `laborRatePerSheet`... | CHECK kiểm tra cấu trúc JSON tổng quát: `{ "version": 2, "lines": [...] }` kiểm tra độ dài mảng và kích thước <= 8192 bytes. |

---

## 4. KẾT LUẬN & ĐỀ XUẤT CHO BƯỚC AX2

1. **Tách biệt hoàn toàn Tri thức Nghiệp vụ khỏi Engine:**
   - Engine không cần biết *"bản lề"*, *"ốc cam"* hay *"keo"* là gì. Engine chỉ đóng vai trò bộ phân giải công thức hình học: nhận đầu vào là các `Drivers` (tổng diện tích tấm, tổng số tấm, tổng mét chỉ dán, số chi tiết theo nhãn) kết hợp danh sách `CostLines` để tính ra bảng chi phí chi tiết.
2. **Preset Xưởng thay thế cho Default Hardcoded:**
   - Thay vì gán cứng số 15.000 đ hay 120.000 đ vào code, tạo ra các Preset xưởng mẫu (Xưởng ván công nghiệp chuẩn, Xưởng gỗ tự nhiên sơn PU, Đơn vị thầu trọn gói thi công).
3. **Bảo toàn số vàng:**
   - Xây dựng adapter `legacyConfigToLines()` chuyển đổi 1-1 cấu hình hiện tại thành danh sách `CostLine` tương đương. Cam kết bộ seed 48 tấm giữ chính xác $16.281.950\text{ đ}$ giá vốn và $26.865.218\text{ đ}$ giá bán.

---
*Báo cáo được lập ngày 31/10/2026 bởi Antigravity Lead Engineer.*
