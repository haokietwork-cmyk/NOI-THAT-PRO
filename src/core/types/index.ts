// ============================================================================
// LÕI DÙNG CHUNG (SINGLE CORE) - CÁC KIỂU DỮ LIỆU TỐI THƯỢNG CHO DỰ TOÁN NỘI THẤT
// Tuân thủ triết lý Single Source of Truth và Kiến trúc Modular Monolith
// ============================================================================

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface HingeHeightThreshold {
  maxHeightMm: number; // Ngưỡng chiều cao tối đa của cánh (mm)
  hingeCount: number;  // Số lượng bản lề tương ứng
}

export const DEFAULT_HINGE_THRESHOLDS: HingeHeightThreshold[] = [
  { maxHeightMm: 900, hingeCount: 2 },
  { maxHeightMm: 1500, hingeCount: 3 },
  { maxHeightMm: 2000, hingeCount: 4 },
  { maxHeightMm: 2700, hingeCount: 5 },
];

export interface WorkshopCostConfig {
  suppliesRatePerSheet: number; // Đơn giá vật tư phụ & phụ kiện liên kết (ốc cam, ke góc, màng PE - VNĐ/tấm)
  laborRatePerSheet: number;    // Đơn giá nhân công CNC & hoàn thiện xưởng (VNĐ/tấm)
  hingesPerSheet: number;       // Định mức bản lề ước tính (cái/tấm)
  slidesPerSheet: number;       // Định mức ray trượt ước tính (bộ/tấm)
  // Ngưỡng bản lề theo chiều cao cánh (nằm trong cấu hình xưởng, không gán cứng)
  hingeThresholds?: HingeHeightThreshold[];
  // Định mức keo dán cạnh (xưởng tự nhập thực tế, mặc định 0/trống kèm nhãn "hãy nhập số thực tế")
  glueRatePerMd?: number;       // Tiêu hao keo (kg/md)
  glueUnitPrice?: number;       // Đơn giá keo (VNĐ/kg)
}

export const DEFAULT_WORKSHOP_COST_CONFIG: WorkshopCostConfig = {
  suppliesRatePerSheet: 15_000,
  laborRatePerSheet: 120_000,
  hingesPerSheet: 2.0,
  slidesPerSheet: 0.35,
  hingeThresholds: DEFAULT_HINGE_THRESHOLDS,
  glueRatePerMd: 0,
  glueUnitPrice: 0,
};

export interface WorkshopProfile {
  name: string;
  companyName?: string;
  phone: string;
  address: string;
  logoUrl?: string;
  quoteTerms?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  subscriptionTier: SubscriptionTier;
  costConfig?: WorkshopCostConfig; // Cấu hình định mức chi phí sản xuất xưởng
  updatedAt?: string;
}

export type MaterialCategory =
  | 'board'         // Ván gỗ tấm
  | 'edge'          // Chỉ dán cạnh
  | 'hardware'      // Phụ kiện kim khí
  | 'supplies'      // Vật tư tiêu hao (ốc cam, vít, keo)
  | 'surface'       // Bề mặt hoàn thiện (laminate, acrylic)
  | 'face_material' // Vật liệu mặt bàn / vách (đá, kính, inox)
  | 'equipment'     // Thiết bị và điện (bếp, hút mùi, LED)
  | 'labor'         // Nhân công
  | 'service'       // Dịch vụ (vận chuyển, khảo sát)
  | 'subcontract'   // Mua ngoài & thầu phụ
  | 'other';        // Chi phí khác

export interface GeneralCatalogItem {
  id: string;
  code: string;
  name: string;
  category: MaterialCategory;
  unit: string;
  unitPrice: number;
  priceIncludesVat?: boolean;
  effectiveDate?: string;
  packSize?: number;
  packUnit?: string;
  supplierName?: string;
  source: 'default_reference' | 'workshop_entered' | 'project_override';
  notes?: string;
  standardLengthMm?: number;
  standardWidthMm?: number;
  thicknessMm?: number;
  wasteFactor?: number;
}

export type ProjectInputMode = 'cutlist' | 'quick_module' | 'manual_lines' | 'hybrid';

export interface ProjectSection {
  id: string;
  name: string;
  inputMode: ProjectInputMode;
  notes?: string;
  quickCalc?: {
    unitType: 'm2' | 'md' | 'module';
    quantity: number;
    unitPrice: number;
    description?: string;
  };
  manualLines?: Array<{
    id: string;
    name: string;
    category: MaterialCategory;
    unit: string;
    quantity: number;
    unitPrice: number;
    markupOverride?: number;
    visibleOnQuote: boolean;
  }>;
}

export interface MaterialItem {
  id: string;
  code: string;
  name: string;
  category: MaterialCategory;
  unit: 'tấm' | 'md' | 'cái' | 'bộ' | string;
  standardLengthMm?: number; // 2440 mm
  standardWidthMm?: number;  // 1220 mm
  thicknessMm?: number;      // 17, 6, 9...
  // Backward-compatibility aliases
  standardLength?: number;
  standardWidth?: number;
  thickness?: number;
  unitPrice: number;         // Đơn giá VNĐ
  wasteFactor: number;       // 1.15 (ván), 1.08 (chỉ), 1.0 (phụ kiện/nhân công)
  brand?: string;            // An Cường, Hettich, Imundex, etc.
  surface?: string;          // Melamine, Acrylic Noline, Laminate Kingdom, etc.
  coreStandard?: string;     // HMR V313 E1, WPB Chống nước 100%, E2...
  note?: string;
}

export type GrainDirection = 'along_length' | 'along_width' | 'none';

export interface CutlistPart {
  id: string;
  moduleName: string;        // Hạng mục sản phẩm: "Tủ áo Master", "Tủ bếp dưới", "Kệ TV"...
  partName: string;          // Tên tấm: "Hông tủ trái", "Đợt đứng", "Cánh mở"...
  lengthMm: number;          // Chiều dài (mm)
  widthMm: number;           // Chiều rộng (mm)
  thicknessMm: number;       // Chiều dày (mm)
  // Backward-compatibility aliases
  length?: number;
  width?: number;
  thickness?: number;
  qty: number;               // Số lượng chi tiết giống nhau
  materialCode: string;      // Mã vật tư: MDF_17_CHONG_AM, MDF_6_HAU...
  edgeL1: boolean;           // Dán chỉ Cạnh dài 1
  edgeL2: boolean;           // Dán chỉ Cạnh dài 2
  edgeW1: boolean;           // Dán chỉ Cạnh rộng 1
  edgeW2: boolean;           // Dán chỉ Cạnh rộng 2
  grainDirection?: GrainDirection; // Vân gỗ (dọc chiều dài / ngang chiều rộng / không vân)
  note?: string;             // Ghi chú gia công (khoét ổ cắm, soi rãnh hậu, vát 45 độ...)
}

export interface BoardSummaryLine {
  materialCode: string;
  materialName: string;
  netAreaM2: number;         // Diện tích net thực tế m2
  wasteFactor: number;       // Hệ số hao hụt (VD: 1.15)
  grossAreaM2: number;       // Diện tích tính cả hao hụt m2
  standardSheetAreaM2: number; // 2.9768 m2 (khổ 1220 x 2440 mm)
  sheetsToBuy: number;       // Số tấm cần đặt mua (làm tròn theo step 0.5 hoặc 1)
  unitPrice: number;         // Đơn giá / tấm
  totalCost: number;         // Thành tiền VNĐ
}

export interface EdgeSummaryLine {
  edgeCode: string;
  edgeName: string;
  netLengthMd: number;       // Mét dài dán chỉ thực tế
  wasteFactor: number;       // Hệ số hao hụt (VD: 1.08)
  grossLengthMd: number;     // Mét dài tính cả hao hụt
  rollsSuggested: number;    // Số cuộn gợi ý (mỗi cuộn tiêu chuẩn 100 mét)
  unitPrice: number;         // Đơn giá / mét dài
  totalCost: number;         // Thành tiền VNĐ
}

export interface ModuleQuoteLine {
  moduleName: string;
  description?: string;
  partCount: number;         // Tổng số chi tiết trong module
  boardAreaM2: number;       // Tổng diện tích ván net m2
  baseCost: number;          // Giá vốn phân bổ cho module
  quotePrice: number;        // Giá chào khách hàng sau khi áp lợi nhuận
}

export interface ProjectCalculationResult {
  boards: BoardSummaryLine[];
  edges: EdgeSummaryLine[];
  hardwareCost: number;      // Tổng chi phí phụ kiện (bản lề, ray trượt...)
  laborCost: number;         // Chi phí nhân công gia công xưởng & lắp đặt
  suppliesCost: number;      // Vật tư phụ (keo hạt dán cạnh EVA/PUR, vít liên kết, màng PE)
  totalBaseCost: number;     // Tổng giá vốn xưởng (BOM)
  moduleQuotes: ModuleQuoteLine[]; // Báo giá khách hàng theo từng module
  totalQuotePrice: number;   // Tổng tiền báo khách hàng
  estimatedProfit: number;   // Lợi nhuận gộp dự kiến (totalQuotePrice - totalBaseCost)
  totalSheets: number;       // Tổng số tấm ván cần mua tất cả các loại
  totalEdgeLengthMd: number; // Tổng mét dài chỉ dán cạnh
  missingPriceCodes: string[]; // Danh sách mã ván chưa có đơn giá trong Thư viện xưởng
}

export type ProjectStatus = 'draft' | 'quoted' | 'ordered' | 'approved' | 'in_production' | 'finalized';

export interface SavedProject {
  id: string;
  projectName: string;
  clientName: string;
  clientPhone?: string;
  clientAddress?: string;
  createdAt: string;
  updatedAt?: string;
  version?: number;                  // Phiên bản báo giá (v1, v2...)
  status: ProjectStatus;
  items: CutlistPart[];
  materialsSnapshot: MaterialItem[]; // Snapshot pricing bảo toàn giá lịch sử
  materialSnapshots?: MaterialItem[]; // Alias tương thích ngược
  profitMargin?: number;             // Hệ số lợi nhuận (VD: 1.65 cho 65% markup, optional khi đọc dự án cũ)
  roundingStep: 0.5 | 1;             // Quy tắc làm tròn số tấm ván (0.5 hoặc 1 tấm)
  totalCost: number;                 // Tổng giá vốn xưởng (VNĐ)
  totalQuote: number;                // Tổng tiền báo khách hàng (VNĐ)
  calcVersion?: number;              // Phiên bản thuật toán tính toán (1: công thức hiện tại)
  costConfigSnapshot?: WorkshopCostConfig; // Snapshot cấu hình chi phí xưởng (bảo toàn giá khi đổi setting)
  snapshotTotals?: any;              // Snapshot tổng tiền đóng băng
}

export interface FeatureLead {
  id?: string;
  email?: string;
  phone?: string;
  source: string;
  createdAt: string;
  updatedAt?: string;
}
