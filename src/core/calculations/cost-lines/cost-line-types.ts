/**
 * ĐẶC TẢ KIỂU DỮ LIỆU MÔ HÌNH DÒNG CHI PHÍ TỔNG QUÁT (COST LINES MODEL)
 * Tuân thủ Rule 14 & Giai đoạn A+ (Hiến pháp GEMINI.md & AGENT_RUNBOOK.md)
 * 
 * NGUYÊN TẮC BẤT BIẾN:
 * 1. Engine hoàn toàn thuần túy, không chứa tên vật tư cụ thể.
 * 2. Mọi khoản chi phí (tấm, phụ kiện, vật tư tiêu hao, nhân công, dịch vụ, thầu phụ) đều là CostLine.
 * 3. Mọi quy tắc tính toán số lượng nằm trong tập 6 kind đóng (không dùng eval).
 */

export type CostCategory =
  | 'board'         // Ván gỗ tấm
  | 'edge'          // Chỉ dán cạnh
  | 'hardware'      // Phụ kiện kim khí
  | 'supplies'      // Vật tư tiêu hao
  | 'surface'       // Bề mặt hoàn thiện
  | 'face_material' // Vật liệu mặt bàn/vách (đá, kính, inox)
  | 'equipment'     // Thiết bị và điện
  | 'labor'         // Nhân công
  | 'service'       // Dịch vụ (vận chuyển, khảo sát)
  | 'subcontract'   // Mua ngoài & Thầu phụ
  | 'other';        // Chi phí khác

export type QuantityRuleKind =
  | 'fixed'          // Số lượng cố định mỗi dự án/hạng mục
  | 'perDriver'      // Số lượng = Driver × Định mức
  | 'tiers'          // Bậc thang theo kích thước chi tiết hoặc giá trị Driver
  | 'perTaggedPart'  // Số lượng = Đếm chi tiết mang nhãn × Định mức
  | 'percentOfGroup' // Số lượng tính bằng % giá vốn của nhóm mục tiêu
  | 'manual';        // Người dùng nhập trực tiếp số lượng

export type ProjectDriverName =
  | 'totalSheets'
  | 'boardAreaNetM2'
  | 'boardAreaGrossM2'
  | 'edgeLengthMd'
  | 'partCount'
  | 'moduleCount';

export interface TierThreshold {
  maxValMm: number;
  qty: number;
}

export interface TierRule {
  driverProperty: 'partLengthMm' | 'partWidthMm';
  thresholds: TierThreshold[];
}

export type RoundMethod = 'none' | 'round' | 'ceil' | 'floor';

export interface QuantityRule {
  kind: QuantityRuleKind;
  driver?: ProjectDriverName;
  tag?: string;                // Dùng cho perTaggedPart: vd "door", "drawer"
  multiplier?: number;         // Định mức nhân
  minQty?: number;             // Số lượng tối thiểu
  roundMethod?: RoundMethod;   // Cách làm tròn số lượng
  tierThresholds?: TierRule;   // Cấu hình bậc thang
  targetGroup?: string;        // Nhóm mục tiêu dùng cho percentOfGroup
  percentage?: number;         // Phần trăm (0 - 100)
  manualQty?: number;          // Số lượng nhập tay cho manual
}

export type CostSource = 'default_reference' | 'workshop_entered' | 'project_override';

export interface CostLine {
  id: string;
  catalogItemId?: string;      // ID trỏ về danh mục vật tư chung
  name: string;                // Tên hiển thị dòng chi phí
  category: CostCategory;
  unit: string;                // Đơn vị tính: tấm, md, cái, bộ, chuyến, m2, công...
  unitPrice: number;           // Đơn giá vốn (VNĐ)
  priceIncludesVat?: boolean;  // Đơn giá đã gồm thuế GTGT chưa
  quantityRule: QuantityRule;
  wasteFactor?: number;        // Hệ số hao hụt (mặc định 1.0)
  group: string;               // Nhóm chi phí: "board", "edge", "hardware", "supplies", "labor", "subcontract"...
  markupOverride?: number;     // Hệ số bán riêng (nếu không có thì dùng markup chung)
  visibleOnQuote: boolean;     // Hiển thị trên báo giá gửi khách hay ẩn trong giá thành
  source: CostSource;          // Phân loại nguồn số
  enabled: boolean;            // Bật/tắt dòng
  notes?: string;
}

export interface ResolvedCostLine {
  id: string;
  catalogItemId?: string;
  name: string;
  category: CostCategory;
  unit: string;
  unitPrice: number;
  rawQuantity: number;
  quantity: number;            // Số lượng sau làm tròn / minQty
  wasteFactor: number;
  effectiveQuantity: number;   // quantity * wasteFactor
  baseCost: number;            // Math.round(effectiveQuantity * unitPrice)
  group: string;
  markupOverride?: number;
  quotePrice: number;
  visibleOnQuote: boolean;
  source: CostSource;
  enabled: boolean;
  notes?: string;
}

export interface PartDimension {
  lengthMm: number;
  widthMm: number;
  thicknessMm?: number;
  qty: number;
  tag?: string;
  moduleName?: string;
}

export interface ProjectDrivers {
  totalSheets: number;
  boardAreaNetM2: number;
  boardAreaGrossM2: number;
  edgeLengthMd: number;
  partCount: number;
  moduleCount: number;
  taggedPartCounts?: Record<string, number>;
  parts?: PartDimension[];
}

export interface CostLineEngineOptions {
  defaultMarkup?: number;      // Mặc định 1.65 (tương đương markup 65%)
  roundingStep?: number;       // Bước làm tròn tiền tổng nếu có
}

export interface CostLinesEngineResult {
  resolvedLines: ResolvedCostLine[];
  groupTotals: Record<string, { baseCost: number; quotePrice: number }>;
  categoryTotals: Record<CostCategory, { baseCost: number; quotePrice: number }>;
  totalBaseCost: number;
  totalQuotePrice: number;
  grossProfit: number;
  effectiveProfitMargin: number;
}
