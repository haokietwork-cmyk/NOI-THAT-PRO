/**
 * ĐẶC TẢ KIỂU DỮ LIỆU BÁO GIÁ NHANH & COSTING SHEET V2 (PARAMETRIC TYPES)
 * Thiết kế theo tài liệu thiet_ke_kien_truc_costing_sheet_v2.md
 * Độc lập hoàn toàn với file Cutlist tấm lẻ; tính toán từ Bảng câu hỏi thông số (Costing V2)
 */

export type {
  CostGroupConfig,
  DynamicQuestionField,
  DeclarativeLineRule,
  AdhocCostLine,
  BaseDimensionContext,
  CostingArchetypeDefinition,
  ResolvedOpenCostLine,
  DynamicCostSummary,
  OverheadTier,
  LineRoundingMode,
} from "./open-schema-types.ts";

import type { AdhocCostLine } from "./open-schema-types.ts";

export type ProductArchetype =
  | "wardrobe"       // Tủ áo (kịch trần / lửng)
  | "kitchen_base"   // Tủ bếp dưới
  | "kitchen_upper"  // Tủ bếp trên
  | "bed"            // Giường ngủ (có ngăn kéo / bọc nệm)
  | "table"          // Bàn làm việc / Bàn ăn
  | "tv_shelf"       // Kệ tivi / Tủ trang trí thấp
  | "wall_panel"     // Vách ốp trang trí / Lam sóng
  | "shoe_cabinet"   // Tủ giày
  | "vanity"         // Tủ lavabo phòng tắm
  | "custom";        // Hạng mục đặt đóng tự do

export interface DimensionsInput {
  widthMm: number;   // Rộng (W) phủ bì
  depthMm: number;   // Sâu (D) phủ bì
  heightMm: number;  // Cao (H) phủ bì
  unit?: "mm" | "cm" | "m";
}

export interface MaterialAnswers {
  coreCode: string;          // Mã cốt ván chính: vd MDF_17_CHONG_AM, PLYWOOD_17, WPB_17
  surfaceCode: string;       // Bề mặt: Melamine, Acrylic, Son2K, Veneer, Laminate
  backPanelCode?: string;    // Mã ván hậu: vd MDF_6_HAU, MDF_9_CHONG_AM
  hasStone: boolean;         // Có mặt đá / ốp đá (*) - Rất nhạy cảm giá
  stoneType?: string;        // Loại đá: Đá trắng sứ, Kim sa, Vicostone thạch anh
  hasGlass: boolean;         // Có kính / cánh kính khung nhôm (*)
  hasMetal: boolean;         // Có khung sắt / inox (*)
  hasUpholstery: boolean;    // Có bọc nệm / da / vải / mây (*)
  hasLed: boolean;           // Có hệ đèn LED nội thất / cảm ứng (*)
}

export interface DetailAnswers {
  drawerCount?: number;      // Số ngăn kéo (nếu để trống tự ước tính)
  doorCount?: number;        // Số cánh cửa (nếu để trống tự ước tính)
  specialNotes?: string;     // Yêu cầu hoàn thiện & gia công đặc biệt
  moqTiers?: number[];       // Các bậc số lượng (vd [1, 5, 10, 20])
}

export interface CostingQuestionnaire {
  id?: string;
  productType: ProductArchetype;
  name: string;              // Tên hạng mục (vd "Tủ áo Master kịch trần")
  dimensions: DimensionsInput;
  materials: MaterialAnswers;
  details?: DetailAnswers;
  calcMode: "detail" | "quick"; // "detail": bung đủ từng dòng | "quick": ước nhanh theo nhóm
  adhocLines?: AdhocCostLine[]; // Dòng vật tư / công đoạn tự do người dùng thêm tay (Open Schema)
}

export interface MaterialLaborRow {
  id: string;
  block: string;             // Tên khối: "Carcass", "Fronts", "BackPanel", "Consumables", "Stone", "Glass", "Metal", "Upholstery", "Hardware"
  name: string;              // Tên vật tư
  description: string;       // Quy chuẩn kỹ thuật / mô tả
  thicknessMm?: number;
  widthMm?: number;
  lengthMm?: number;
  qty: number;
  unit: string;
  unitPrice: number;
  wasteFactor: number;       // Hệ số hao hụt (vd 1.15)
  totalAmount: number;
}

export interface LabourDeptRow {
  department: "cnc_cutting" | "assembly" | "sanding_spray" | "packing_install";
  name: string;              // Tên công đoạn
  hours: number;             // Giờ công
  hourlyRate: number;        // Đơn giá giờ công (VNĐ/giờ)
  totalAmount: number;
}

export interface CostSummary {
  // 12 Nhóm chi phí chuẩn xưởng
  stone: number;             // 1. Đá tự nhiên / Đá nhân tạo [no OH 0%]
  upholstery: number;        // 2. Bọc nệm / Da / Vải / Mây
  metalFrameS: number;       // 3. Khung kim loại gia công ngoài
  subContract: number;       // 4. Gia công ngoài / Cánh Acrylic / CNC
  wood: number;              // 5. Gỗ & Ván công nghiệp
  metalFrameP: number;       // 6. Khung kim loại tự sản xuất
  glass: number;             // 7. Kính / Gương / Cánh kính
  chemical: number;          // 8. Hóa chất / Sơn / Dung môi
  hardware: number;          // 9. Phụ kiện kim khí (bản lề, ray, tay nắm, LED)
  consumables: number;       // 10. Chỉ dán cạnh & Vật tư tiêu hao (keo, vít cam)
  packingDelivery: number;   // 11. Đóng gói & Vận chuyển
  laborCostTotal: number;    // 12. Tổng chi phí nhân công trực tiếp

  // Tổng hợp giá thành
  totalDirectLM: number;     // Tổng vật tư & nhân công trực tiếp (L&M)
  
  // Chi phí quản lý & sản xuất chung (OH) phân tầng
  ohWorkshopRate: number;    // Tỷ lệ OH Xưởng (mặc định 25%)
  ohWorkshopAmount: number;  // Áp cho (Gỗ + Chỉ + Sơn + Tiêu hao + Nhân công)
  ohSubcontractRate: number; // Tỷ lệ OH Gia công ngoài (mặc định 10%)
  ohSubcontractAmount: number; // Áp cho (Kim loại ngoài + Bọc nệm + Thầu phụ)
  totalOH: number;           // Tổng OH

  // Giá vốn & Giá bán
  cogs: number;              // Giá vốn sản xuất toàn diện (COGS = L&M + OH)
  profitRate: number;        // Tỷ lệ lợi nhuận mục tiêu (vd 20% = 0.2)
  profitAmount: number;      // Lợi nhuận gộp
  calculateSalesPrice: number; // Giá bán đề xuất (Sales Price = COGS + Profit)
  moqPrices: Record<number, number>; // Bảng giá theo bậc MOQ: { 1: price, 5: price, 10: price }
  customGroups?: Record<string, number>; // Các nhóm chi phí mở rộng từ Adhoc Lines
}

export type ConfidenceStars = 1 | 2 | 3 | 4 | 5;

export interface ConfidenceRating {
  stars: ConfidenceStars;
  label: "Rất sát" | "Sát" | "Tham khảo" | "Chỉ để định hướng" | "Không tin cậy";
  colorClass: string;
  reasons: string[];
  recommendation: string;
}

export interface GeneratedCostingResult {
  questionnaire: CostingQuestionnaire;
  summary: CostSummary;
  materialsLabor: MaterialLaborRow[];
  labourDepts: LabourDeptRow[];
  confidence: ConfidenceRating;
  adhocLines?: AdhocCostLine[];
  drivers: {
    boardAreaNetM2: number;
    boardAreaGrossM2: number;
    sheetsCount: number;
    edgeLengthMd: number;
    drawerCount: number;
    doorCount: number;
  };
}
