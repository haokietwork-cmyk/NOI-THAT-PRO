/**
 * ĐẶC TẢ KIẾN TRÚC MỞ & SCHEMA ĐỘNG (OPEN SCHEMA TYPES)
 * Tuân thủ Quy tắc 14 (GEMINI.md) & nguyen_ly_kien_truc_mo_cho_agent.md
 * 
 * NGUYÊN TẮC BẤT BIẾN:
 * 1. Không hardcode danh mục vật liệu, nhóm chi phí hay tên loại tủ bằng enum đóng.
 * 2. Mọi vật tư & chi phí phân loại qua Thuộc tính Hành vi (Behavior Tags & Overhead Tiers).
 * 3. Bảng câu hỏi & quy tắc định mức được điều khiển bởi Schema (Declarative Driver Rules).
 * 4. Cho phép chèn Ad-hoc Cost Lines tự do mọi lúc trên giao diện.
 */

// 1. Phân tầng Overhead chuẩn ngành mộc & thầu phụ
export type OverheadTier = "workshop_full" | "subcon_light" | "exempt_no_oh";

// 2. Quy tắc làm tròn mua hàng thực tế
export type LineRoundingMode = "none" | "ceil_standard_unit" | "ceil_whole_number";

// 3. Cấu hình Nhóm chi phí động (Lưu trong profiles hoặc Preset)
export interface CostGroupConfig {
  groupKey: string;          // Chuỗi mở: "wood", "stone", "glass", "rattan", "smart_led", "metal_out", "custom_xyz"...
  label: string;             // Tên hiển thị: "Gỗ & Ván", "Đá (no OH)", "Mây tre đan", "Thiết bị thông minh"...
  overheadTier: OverheadTier;
  sortOrder: number;
  description?: string;
}

// 4. Cấu hình Câu hỏi động cho Bảng câu hỏi (Costing V2)
export interface DynamicQuestionField {
  fieldKey: string;          // Khóa biến lưu vào params.<fieldKey>
  section: "product" | "materials" | "details" | string; // Nhóm hiển thị trên form
  label: string;             // Nội dung câu hỏi hiển thị trên UI
  inputType: "boolean" | "number" | "material_select" | "select_option" | "text";
  required: boolean;         // true -> Bắt buộc (*), kiểm tra trong Checklist 3 trạng thái
  defaultValue?: unknown;
  sensitivityHint?: string;  // Cảnh báo độ nhạy giá, VD: "Chọn nhầm làm lệch giá ~30–35%"
  materialGroupFilter?: string; // Dùng cho material_select để lọc vật tư theo groupKey
  options?: Array<{ value: string; label: string; factor?: number }>;
}

// 5. Quy tắc sinh dòng định mức MaterialLabor & Labour từ Biểu thức khai báo
export interface DeclarativeLineRule {
  ruleId: string;
  blockName: string;         // Khối hiển thị trong MaterialLabor (VD: "Carcass", "Stone", "Finishing", "Labor"...)
  costGroupKey: string;      // Trỏ tới CostGroupConfig.groupKey
  processOrDept?: string;    // Bộ phận nhân công hoặc công đoạn (VD: "CNC", "ASS", "SandSpray", "Packing"...)
  descriptionTemplate: string; // Mô tả dòng (hỗ trợ biến, VD: "Ván thùng {{params.coreCode}}")
  whenExpression?: string;   // Điều kiện kích hoạt, VD: "params.hasStone == true" hoặc "params.drawerCount > 0"
  quantityExpression: string;// Biểu thức toán học từ biến hình học & params, VD: "TOP_AREA * 1.05"
  unit: string;              // ĐVT tự do: "m2", "md", "m3", "tấm", "cây", "bộ", "cái", "kg", "lít", "giờ"...
  wasteRate: number;         // Hệ số hao hụt (VD: 0.15 = 15%)
  roundingMode: LineRoundingMode;
  standardUnitSize?: number; // Kích thước chuẩn để quy đổi đơn vị nguyên (VD: 2.9768 m2 cho tấm 1220x2440, 6m cho cây nhôm)
  materialBindingKey?: string; // Lấy đơn giá từ câu hỏi chọn vật tư nào (hoặc mã vật tư mặc định)
  defaultUnitPrice?: number; // Đơn giá dự phòng nếu chưa có trong thư viện
}

// 6. Dòng vật tư / công đoạn tự do (Ad-hoc Line) cho các trường hợp nằm ngoài mọi mẫu có sẵn
export interface AdhocCostLine {
  lineId: string;
  blockName: string;
  costGroupKey: string;
  overheadTierOverride?: OverheadTier;
  description: string;
  supplier?: string;
  unit: string;
  quantityOrExpression: number | string; // Cho phép nhập số trực tiếp hoặc gõ công thức theo W, D, H
  unitPrice: number;         // Đơn giá Snapshot
  wasteRate: number;
  saveToLibrary?: boolean;   // Tùy chọn lưu vật tư mới này vào materials_library của xưởng
}

// 7. Từ điển Biến số Hình học Cơ sở (Base Dimension Context)
export interface BaseDimensionContext {
  W: number;   // Rộng theo mét (widthMm / 1000)
  D: number;   // Sâu theo mét (depthMm / 1000)
  H: number;   // Cao theo mét (heightMm / 1000)
  DIA: number; // Đường kính theo mét (nếu là hình trụ / bàn tròn)
  QTY: number; // Số lượng sản phẩm
  
  // Biến dẫn xuất hình học
  FACE_AREA: number;      // W * H (Diện tích mặt đứng / mặt tiền)
  TOP_AREA: number;       // W * D (Diện tích mặt bằng / mặt nắp / mặt đáy)
  SIDE_AREA: number;      // D * H (Diện tích mặt bên / hồi)
  BOX_SURFACE: number;    // 2 * (W*H + W*D + D*H) (Diện tích vỏ hộp 6 mặt)
  PERIMETER_TOP: number;  // 2 * (W + D) (Chu vi mặt bằng)
  PERIMETER_FACE: number; // 2 * (W + H) (Chu vi mặt đứng)
  VOLUME: number;         // W * D * H (Thể tích phủ bì)

  // Biến câu hỏi động
  params: Record<string, any>;
}

// 8. Định nghĩa Mẫu Sản phẩm Động (Archetype Definition)
export interface CostingArchetypeDefinition {
  archetypeKey: string;
  name: string;
  icon?: string;
  category: "cabinet" | "table" | "bed" | "decor" | "custom";
  description: string;
  defaultDimensions: {
    widthMm: number;
    depthMm: number;
    heightMm: number;
  };
  dimensionHints?: Array<{ label: string; widthMm: number; depthMm: number; heightMm: number }>;
  questions: DynamicQuestionField[];
  rules: DeclarativeLineRule[];
}

// 9. Kết quả chiết tính mở rộng
export interface ResolvedOpenCostLine {
  id: string;
  ruleId?: string;
  blockName: string;
  costGroupKey: string;
  overheadTier: OverheadTier;
  description: string;
  unit: string;
  rawQuantity: number;
  effectiveQuantity: number;
  unitPrice: number;
  totalCost: number;
  ohRate: number;
  ohAmount: number;
  totalWithOh: number;
  isAdhoc?: boolean;
}

export interface DynamicCostSummary {
  groupTotals: Record<string, number>; // Tổng tiền theo từng groupKey
  totalDirectLM: number;               // Tổng vật tư & nhân công trực tiếp
  ohWorkshopAmount: number;            // Tổng OH Xưởng (áp cho workshop_full)
  ohSubcontractAmount: number;         // Tổng OH Thầu phụ (áp cho subcon_light)
  totalOH: number;                     // Tổng Overhead
  cogs: number;                        // Giá vốn toàn diện (L&M + OH)
  profitAmount: number;                // Lợi nhuận mục tiêu
  salesPrice: number;                  // Giá bán đề xuất
  moqPrices: Record<number, number>;   // Giá theo bậc số lượng
}
