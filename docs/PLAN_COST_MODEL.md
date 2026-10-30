# Kế Hoạch Thiết Kế Mô Hình Chi Phí Tổng Quát (Cost Lines Architecture)
## Document Ref: `docs/PLAN_COST_MODEL.md` — Giai đoạn A+ (Mã việc: AX2)
> 🛑 **CỔNG KIỂM SOÁT G4: DỪNG CHỜ PHÊ DUYỆT CỦA LEAD DEVELOPER TRƯỚC KHI VIẾT CODE AX3**

---

## 1. TỔNG QUAN VÀ TRIẾT LÝ THIẾT KẾ

### 1.1. Vấn đề cốt lõi
Hệ thống hiện tại coi *"bản lề"*, *"ray trượt"*, *"ốc cam"*, *"keo"* là các trường code riêng biệt (`hingesPerSheet`, `slidesPerSheet`, `suppliesRatePerSheet`, `glueRatePerMd`). Điều này làm Engine và Schema Database bị phân mảnh, không thể mở rộng cho hàng trăm loại chi phí thực tế của xưởng nội thất (đá, kính, đèn LED, sơn PU, thầu phụ, vận chuyển, nhân công lắp đặt...).

### 1.2. Nguyên tắc "Dòng Chi Phí" (Cost Line Principle)
- **Engine thuần túy:** Engine không cần biết bản lề, đá hay kính là gì. Engine chỉ nhận:
  1. **Tập biến đo lường dự án (Drivers):** Tổng số tấm ván, tổng diện tích net, tổng mét dài dán cạnh, số chi tiết mang nhãn (cánh mở, hộc kéo...).
  2. **Danh sách dòng chi phí (Cost Lines):** Mỗi dòng gồm: quy tắc số lượng (`kind`), đơn giá, hệ số hao hụt, nhóm chi phí và hệ số bán.
- **Tính toán an toàn (Safe Closed Form):** Tuyệt đối **không dùng `eval()`** hoặc đánh giá chuỗi biểu thức do người dùng nhập. Mọi phép tính số lượng đều đi qua các `kind` quy tắc toán học đã được định hình trước.
- **Bảo toàn số vàng (Golden Preserving):** Bằng thuật toán chuyển đổi tương đương `legacyConfigToLines()`, bộ seed 48 tấm giữ nguyên 100% giá vốn $16.281.950\text{ đ}$ và giá bán $26.865.218\text{ đ}$.

---

## 2. ĐẶC TẢ CHI TIẾT MÔ HÌNH DỮ LIỆU DÒNG CHI PHÍ (`CostLine`)

### 2.1. Cấu trúc TypeScript Chuẩn
```typescript
export type CostCategory =
  | 'board'         // Ván gỗ tấm (MDF, MFC, HDF, Plywood, Jumbo...)
  | 'edge'          // Chỉ dán cạnh (PVC, ABS, Acrylic...)
  | 'hardware'       // Phụ kiện kim khí (Bản lề, ray trượt, tay nâng, tay nắm...)
  | 'supplies'       // Vật tư tiêu hao (Ốc cam, ke góc, keo hạt PUR/EVA, màng PE...)
  | 'surface'        // Bề mặt hoàn thiện (Melamine, Laminate, Acrylic noline, Veneer...)
  | 'face_material'  // Vật liệu mặt bàn/vách (Mặt đá nhân tạo/Vicostone, kính ốp bếp, inox...)
  | 'equipment'      // Thiết bị và điện (Bếp từ, hút mùi, chậu vòi, đèn LED nhôm...)
  | 'labor'          // Nhân công (Gia công CNC, dán cạnh, hoàn thiện, lắp ráp, lắp đặt...)
  | 'service'        // Dịch vụ xưởng (Khảo sát thiết kế, vận chuyển xe tải, bốc xếp...)
  | 'subcontract'    // Mua ngoài & Thầu phụ chuyên trách (Sơn PU bóng, xưởng kính...)
  | 'other';         // Các chi phí phát sinh khác

export type QuantityRuleKind =
  | 'fixed'           // Số lượng cố định mỗi dự án/hạng mục (VD: 1 chuyến xe 500k)
  | 'perDriver'       // Số lượng = Driver × Định mức (VD: mét chỉ × keo; số tấm × ốc cam)
  | 'tiers'           // Bậc thang theo giá trị Driver (VD: Chiều cao cánh <= 900 -> 2 bản lề)
  | 'perTaggedPart'   // Số lượng = Đếm chi tiết mang nhãn × Định mức (VD: nhãn "cánh" × 1 tay nắm)
  | 'percentOfGroup'  // Số lượng tính bằng % giá vốn của một nhóm khác (VD: phụ phí 5% tiền ván)
  | 'manual';         // Người dùng nhập trực tiếp số lượng cụ thể cho dự án

export interface QuantityRule {
  kind: QuantityRuleKind;
  driver?: 'totalSheets' | 'boardAreaNetM2' | 'boardAreaGrossM2' | 'edgeLengthMd' | 'partCount';
  tag?: string;                // Dùng cho perTaggedPart: "door", "drawer", "shelf", "back"
  multiplier?: number;         // Định mức nhân (VD: 15.000 đ/tấm, 1 bộ ray/hộc kéo)
  tierThresholds?: {
    driverProperty: 'partLengthMm' | 'partWidthMm';
    thresholds: { maxValMm: number; qty: number }[]; // [{maxValMm: 900, qty: 2}, ...]
  };
  targetGroup?: string;        // Dùng cho percentOfGroup
  percentage?: number;         // % (0 - 100)
  manualQty?: number;          // Dùng cho manual
}

export type CostSource = 'default_reference' | 'workshop_entered' | 'project_override';

export interface CostLine {
  id: string;
  catalogItemId?: string;      // ID trỏ về danh mục vật tư dùng chung của xưởng
  name: string;                // Tên dòng: "Ốc cam liên kết & vật tư phụ", "Ray trượt bi 3 tầng"
  category: CostCategory;
  unit: string;                // "tấm", "md", "cái", "bộ", "chuyến", "gói", "công"
  unitPrice: number;           // Đơn giá vốn (VNĐ)
  priceIncludesVat?: boolean;   // Đơn giá này đã gồm thuế GTGT chưa
  quantityRule: QuantityRule;
  wasteFactor: number;         // 1.0 = không hao hụt; 1.08 = 8%; 1.15 = 15%
  group: string;               // "board", "edge", "hardware", "labor", "supplies", "subcontract"
  markupOverride?: number;     // Hệ số bán riêng (nếu undefined thì lấy markup chung k=1.65)
  visibleOnQuote: boolean;     // true = in ra cho khách xem; false = chi phí nội bộ ẩn trong giá thành
  source: CostSource;          // Nhãn phân loại nguồn số
  enabled: boolean;            // Cho phép bật/tắt dòng linh hoạt
  notes?: string;
}
```

---

## 3. THUẬT TOÁN BẢO TOÀN SỐ VÀNG: `legacyConfigToLines`

Để đảm bảo quy tắc **Rule 12 (Snapshot Pricing)** và số vàng không thay đổi dù chỉ 1 đồng:
```typescript
export function legacyConfigToLines(config?: WorkshopCostConfig): CostLine[] {
  const suppliesRate = config?.suppliesRatePerSheet ?? 15_000;
  const laborRate = config?.laborRatePerSheet ?? 120_000;
  const hingesRate = config?.hingesPerSheet ?? 2.0;
  const slidesRate = config?.slidesPerSheet ?? 0.35;

  return [
    {
      id: "line-legacy-supplies",
      name: "Vật tư phụ & phụ kiện liên kết (ốc cam, vít, màng PE)",
      category: "supplies",
      unit: "tấm",
      unitPrice: suppliesRate,
      quantityRule: {
        kind: "perDriver",
        driver: "totalSheets",
        multiplier: 1,
      },
      wasteFactor: 1.0,
      group: "supplies",
      visibleOnQuote: false,
      source: "workshop_entered",
      enabled: suppliesRate > 0,
    },
    {
      id: "line-legacy-labor",
      name: "Nhân công sản xuất hoàn thiện xưởng",
      category: "labor",
      unit: "tấm",
      unitPrice: laborRate,
      quantityRule: {
        kind: "perDriver",
        driver: "totalSheets",
        multiplier: 1,
      },
      wasteFactor: 1.0,
      group: "labor",
      visibleOnQuote: false,
      source: "workshop_entered",
      enabled: laborRate > 0,
    },
    {
      id: "line-legacy-hinges",
      name: "Bản lề giảm chấn tiêu chuẩn (ước tính)",
      category: "hardware",
      unit: "cái",
      unitPrice: 0, // Đã bao gồm trong chi phí hoặc báo theo phụ kiện thực tế
      quantityRule: {
        kind: "perDriver",
        driver: "totalSheets",
        multiplier: hingesRate,
      },
      wasteFactor: 1.0,
      group: "hardware",
      visibleOnQuote: false,
      source: "workshop_entered",
      enabled: hingesRate > 0,
    },
    {
      id: "line-legacy-slides",
      name: "Ray trượt bi 3 tầng 450mm (ước tính)",
      category: "hardware",
      unit: "bộ",
      unitPrice: 0,
      quantityRule: {
        kind: "perDriver",
        driver: "totalSheets",
        multiplier: slidesRate,
      },
      wasteFactor: 1.0,
      group: "hardware",
      visibleOnQuote: false,
      source: "workshop_entered",
      enabled: slidesRate > 0,
    },
  ];
}
```

### Chứng minh toán học bảo toàn số vàng:
- **Tiền ván:** 14 tấm 17mm @ 680k ($9.520.000$) + 4.5 tấm 6mm @ 360k ($1.620.000$) = $11.140.000\text{ đ}$.
- **Tiền chỉ:** $618.450\text{ đ}$.
- **Tiền phụ kiện cam chốt seed:** $2.026.000\text{ đ}$.
- **Tiền nhân công (`line-legacy-labor`):** $18.5\text{ tấm} \times 120.000\text{ đ} = 2.220.000\text{ đ}$.
- **Tiền vật tư phụ (`line-legacy-supplies`):** $18.5\text{ tấm} \times 15.000\text{ đ} = 277.500\text{ đ}$.
- $\rightarrow$ **Tổng giá vốn (Total Base Cost):**
  $$11.140.000 + 618.450 + 2.026.000 + 2.220.000 + 277.500 = \mathbf{16.281.950\text{ \textbf{đ}}}$$
- $\rightarrow$ **Giá bán báo khách ($k = 1.65$):**
  $$16.281.950 \times 1.65 = \mathbf{26.865.218\text{ \textbf{đ}}}$$
- $\rightarrow$ **Biên lợi nhuận gộp:**
  $$\frac{26.865.218 - 16.281.950}{26.865.218} = \mathbf{39,4\%}$$
Số vàng tuyệt đối không bị dịch chuyển dù chỉ 1 đồng.

---

## 4. ẢNH HƯỞNG TỚI SCHEMA DATABASE NỀN (C1)

So sánh giữa 2 phương án lưu trữ trên PostgreSQL (Supabase):

| Tiêu chí | Phương án A: Lưu từng dòng thành Bảng quan hệ (`project_lines`) | Phương án B: Lưu lai (Hybrid) - Bảng danh mục `catalog_items` + Cột `cost_lines` JSONB trong `projects` (ĐỀ XUẤT) |
| :--- | :--- | :--- |
| **Cấu trúc dữ liệu** | Bảng `catalog_items` và bảng con `project_lines(project_id, ...)` | Bảng `catalog_items` (quản lý thư viện chung) + Cột `cost_lines` (JSONB) lưu snapshot các dòng trong `projects`. |
| **Ưu điểm** | Có thể truy vấn SQL quan hệ, khóa ngoại chặt chẽ. | 1. **Snapshot Pricing tự nhiên 100%:** Khi lưu dự án, toàn bộ dòng và đơn giá đóng băng trong JSONB, không sợ xưởng đổi giá làm nhảy số dự án cũ.<br>2. **Tốc độ đọc nhanh:** 1 query lấy trọn vẹn dự án kèm cost lines, không cần JOIN 3-4 bảng.<br>3. **Không làm phình migration:** Thêm quy tắc mới chỉ cập nhật Zod schema client và CHECK schemaVersion, không sửa bảng. |
| **Nhược điểm** | Rất cồng kềnh khi lưu snapshot (phải duplicate toàn bộ dòng sang bảng snapshot hoặc trigger phức tạp). | Query báo cáo tổng hợp cross-project cần dùng toán tử JSONB (`->>`). |
| **Đánh giá** | Phù hợp hệ thống ERP lớn. | **Khuyên dùng cho Micro-SaaS AutoCutlist vì tính bảo toàn lịch sử và tốc độ phát triển.** |

---

## 5. ẢNH HƯỞNG TỚI BOM XƯỞNG, BÁO GIÁ KHÁCH A4 & XUẤT EXCEL

1. **Góc nhìn Xưởng (Workshop BOM):**
   - Gom nhóm trực quan theo `category`:
     - Nhóm 1: Ván tấm tiêu chuẩn cần mua (17mm, 6mm...).
     - Nhóm 2: Chỉ dán cạnh PVC (cuộn 100m, mét dài).
     - Nhóm 3: Phụ kiện kim khí (bản lề, ray âm, tay nâng).
     - Nhóm 4: Vật tư tiêu hao (keo hạt, vít, ốc cam, màng PE).
     - Nhóm 5: Nhân công & Dịch vụ ngoài (nhân công hoàn thiện, xe cẩu, vận chuyển).
2. **Góc nhìn Khách hàng (Client Quote A4 / Link Online):**
   - Chỉ xuất hiện các dòng có `visibleOnQuote = true` (ví dụ: Mặt đá Vicostone, Bếp từ Bosch, Kính ốp bếp).
   - Các dòng vật tư nội bộ (`visibleOnQuote = false`: ốc cam, tiền ván, hao hụt, nhân công gia công) **được che sạch ở server**, phân bổ tỷ lệ vào giá thành từng Hạng mục hoàn thiện (Tủ áo Master, Tủ bếp).
3. **Xuất file Excel đặt hàng (`excel-exporter.ts`):**
   - Thay thế việc hardcode 2 dòng `"Vật tư phụ"` và `"Nhân công"` bằng vòng lặp duyệt mảng `resolvedLines`, tự động chia Sheet hoặc bảng kê vật tư chuyên nghiệp gửi nhà phân phối.

---

## 6. LỘ TRÌNH TRIỂN KHAI TỪNG BƯỚC (SAU KHI ĐƯỢC DUYỆT G4)

- **Bước 1 (AX3):** Xây dựng thư mục `src/core/calculations/cost-lines/` chứa các hàm thuần:
  - `cost-line-resolver.ts`: Phân giải số lượng theo `QuantityRuleKind` (`fixed`, `perDriver`, `tiers`, `perTaggedPart`, `manual`).
  - `legacy-adapter.ts`: Hàm `legacyConfigToLines()`.
  - Unit tests so sánh Engine cũ vs Engine mới trên `SEED_PARTS`: Phải bằng nhau 100% trước khi chuyển đổi.
- **Bước 2 (AX4):** Đưa bản lề, ray, keo, ốc cam thành các Preset dòng mẫu, bỏ hoàn toàn các trường lẻ.
- **Bước 3 (AX5):** Cập nhật UI Thư viện vật tư và Form cài đặt xưởng thành bảng động.
- **Bước 4 (AX6):** Hỗ trợ thêm dòng tự do (mua ngoài, thầu phụ đá/kính) trực tiếp trong trang Quoting.
- **Bước 5 (AX7):** Viết bộ 7 test golden đa dạng cho các loại hình (tủ bếp có đá, tủ áo có ray, vách m², dòng nhập tay, VAT).
- **Bước 6 (AX8):** Tổng kiểm A+, chạy toàn bộ bộ lệnh VERIFY và nộp báo cáo.

---

## 7. DỰ PHÒNG MỞ RỘNG TƯƠNG LAI (FUTURE EXTENSIONS)

Cấu trúc `CostLine` được thiết kế để mở rộng trong Giai đoạn H & I mà không phá vỡ tính tương thích:
- **Phương án A/B (Option Tùy chọn):** Thêm trường `isOptional?: boolean` và `selectedOptionId?: string` để khách hàng tự bấm chọn đổi từ bản lề thường sang bản lề Blum giảm chấn trên link online.
- **Quy cách đóng gói (Pack Size):** Thêm `packSize?: number` để tự động làm tròn mua theo túi (túi 100 cái ốc cam, cuộn 100m chỉ).
- **Nhà cung cấp (Supplier):** Thêm `supplierId?: string` để xuất từng bảng đặt hàng riêng cho An Cường, Hafele, xưởng đá.

---
> 🛑 **KẾT THÚC PLAN AX2 — DỪNG LẠI TẠI CỔNG G4 ĐỂ CHỜ LEAD DEVELOPER PHÊ DUYỆT.**  
> *Trong thời gian chờ duyệt, Agent chuyển sang thực hiện Giai đoạn B (Audit sẵn sàng ra mắt - Chế độ CHỈ ĐỌC).*
