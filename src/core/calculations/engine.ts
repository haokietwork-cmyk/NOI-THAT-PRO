/**
 * TRÁI TIM TÍNH TIỀN & ĐỘNG CƠ BÁO GIÁ NỘI THẤT (CALCULATION CORE ENGINE)
 * Tuân thủ Hiến pháp GEMINI.md và Quy tắc Nghiệp vụ Bóc tách Vật tư Gỗ công nghiệp
 * Đảm bảo 100% logic tính toán tách biệt khỏi giao diện người dùng.
 */

import type {
  BoardSummaryLine,
  CutlistPart,
  EdgeSummaryLine,
  MaterialItem,
  ModuleQuoteLine,
  ProjectCalculationResult,
  WorkshopCostConfig,
} from "../types/index.ts";
import { DEFAULT_WORKSHOP_COST_CONFIG } from "../types/index.ts";
import { calculateCommercialQuote, calculateModuleQuoteLine } from "./profit-calculator.ts";

// ============================================================================
// HẰNG SỐ NGHIỆP VỤ CHUẨN XƯỞNG MỘC
// ============================================================================

export const STANDARD_BOARD = {
  LENGTH_MM: 2440,
  WIDTH_MM: 1220,
  AREA_M2: 2.9768, // (2440 * 1220) / 1,000,000 = 2.9768 m2
};

export const STANDARD_SHEET_AREA_M2 = STANDARD_BOARD.AREA_M2;

export const DEFAULT_BOARD_WASTE_FACTOR = 1.15; // Mặc định hao hụt ván 15%
export const DEFAULT_EDGE_WASTE_FACTOR = 1.08;  // Mặc định hao hụt chỉ 8%
export const DEFAULT_EDGE_ROLL_METERS = 100;    // Chiều dài 1 cuộn chỉ dán cạnh tiêu chuẩn (100 md)

export const LEGAL_DISCLAIMER =
  "Lưu ý: Bảng khối lượng dự toán dựa trên hệ số hao hụt do người dùng thiết lập. Quý xưởng vui lòng đối chiếu sơ đồ cắt thực tế trước khi xuất lệnh đặt hàng.";

// ============================================================================
// HÀM TÍNH TOÁN CƠ BẢN (PRIMITIVES)
// ============================================================================

/**
 * Tính diện tích ván thực tế (Net Area) của chi tiết tấm (m2)
 */
export function calculateNetArea(lengthMm: number, widthMm: number, qty: number = 1): number {
  if (lengthMm <= 0 || widthMm <= 0 || qty <= 0) return 0;
  return Number(((lengthMm * widthMm * qty) / 1_000_000).toFixed(4));
}

/**
 * Tính diện tích ván tính cả hao hụt (Gross Area) (m2)
 */
export function calculateGrossArea(
  netAreaM2: number,
  wasteFactor: number = DEFAULT_BOARD_WASTE_FACTOR
): number {
  if (netAreaM2 <= 0) return 0;
  return Number((netAreaM2 * wasteFactor).toFixed(4));
}

/**
 * Quy đổi diện tích net thành số tấm ván tiêu chuẩn cần đặt mua
 */
export function calculateSheetsNeeded(
  netAreaM2: number,
  wasteFactor: number = DEFAULT_BOARD_WASTE_FACTOR,
  roundingStep: 0.5 | 1 = 0.5
): number {
  if (netAreaM2 <= 0) return 0;
  const gross = netAreaM2 * wasteFactor;
  const rawSheets = gross / STANDARD_SHEET_AREA_M2;
  if (roundingStep === 0.5) {
    return Math.ceil(rawSheets * 2) / 2;
  }
  return Math.ceil(rawSheets);
}

/**
 * Tính mét dài dán chỉ của một chi tiết tấm (md)
 */
export function calculateEdgeMeters(
  lengthMm: number,
  widthMm: number,
  qty: number,
  edges: { l1?: boolean; l2?: boolean; w1?: boolean; w2?: boolean },
  wasteFactor: number = DEFAULT_EDGE_WASTE_FACTOR
): number {
  if (qty <= 0) return 0;
  let netMm = 0;
  if (edges.l1) netMm += lengthMm;
  if (edges.l2) netMm += lengthMm;
  if (edges.w1) netMm += widthMm;
  if (edges.w2) netMm += widthMm;

  const totalNetM = (netMm * qty) / 1_000;
  return Number((totalNetM * wasteFactor).toFixed(2));
}

// ============================================================================
// ĐỘNG CƠ TÍNH TOÁN TOÀN DIỆN DỰ ÁN (PROJECT CALCULATION ENGINE)
// ============================================================================

export interface CalculationOptions {
  profitMargin?: number;       // Hệ số lợi nhuận (VD: 1.65 tức markup 65%)
  roundingStep?: 0.5 | 1;      // Quy tắc làm tròn tấm ván: 0.5 tấm hoặc 1 tấm
  laborRatePerSheet?: number;  // Đơn giá nhân công theo tấm ván (ghi đè cấu hình)
  suppliesRatePerSheet?: number; // Đơn giá vật tư phụ/tấm (ghi đè cấu hình)
  costConfig?: WorkshopCostConfig; // Object cấu hình chi phí xưởng được chụp từ Profile
  defaultBoardPrice?: number;  // Giá dự phòng nếu mã ván không tìm thấy trong thư viện
  defaultEdgePrice?: number;   // Giá dự phòng nếu mã chỉ không tìm thấy
}

/**
 * Hàm trung tâm tính toán toàn bộ vật tư, giá vốn và báo giá khách hàng
 * Áp dụng công thức chuẩn: Net Area -> Hao hụt -> Quy đổi tấm -> Giá vốn -> Lợi nhuận gộp -> Báo giá A4
 */
export function calculateProject(
  parts: CutlistPart[],
  materials: MaterialItem[],
  options?: CalculationOptions
): ProjectCalculationResult {
  const profitMargin = options?.profitMargin ?? 1.65;
  const roundingStep = options?.roundingStep ?? 0.5;

  // Bản đồ tra cứu nhanh vật tư theo mã
  const materialsMap = new Map<string, MaterialItem>();
  materials.forEach((m) => materialsMap.set(m.code, m));

  // Tra cứu đơn giá nhân công
  const laborItem = materials.find((m) => m.category === "labor");
  const laborRatePerSheet =
    options?.laborRatePerSheet ?? laborItem?.unitPrice ?? 120_000;

  // Tra cứu vật tư dán chỉ mặc định
  const defaultEdgeItem = materials.find((m) => m.category === "edge");
  const fallbackEdgePrice = options?.defaultEdgePrice ?? defaultEdgeItem?.unitPrice ?? 3_500;
  const fallbackEdgeWaste = defaultEdgeItem?.wasteFactor ?? DEFAULT_EDGE_WASTE_FACTOR;

  // 1. Gom nhóm ván theo mã ván
  interface BoardGroupAccumulator {
    materialCode: string;
    materialName: string;
    netAreaM2: number;
    wasteFactor: number;
    unitPrice: number;
  }
  const boardGroups = new Map<string, BoardGroupAccumulator>();

  // 2. Gom nhóm chỉ dán cạnh
  interface EdgeGroupAccumulator {
    edgeCode: string;
    edgeName: string;
    netLengthMd: number;
    wasteFactor: number;
    unitPrice: number;
  }
  const edgeGroups = new Map<string, EdgeGroupAccumulator>();

  // 3. Gom nhóm theo Hạng mục (Module)
  interface ModuleAccumulator {
    moduleName: string;
    partCount: number;
    boardAreaM2: number;
    partDescriptions: Set<string>;
  }
  const moduleGroups = new Map<string, ModuleAccumulator>();

  // Duyệt qua từng tấm chi tiết trong danh sách Cutlist
  parts.forEach((p) => {
    const lengthMm = p.lengthMm ?? p.length ?? 0;
    const widthMm = p.widthMm ?? p.width ?? 0;
    const thicknessMm = p.thicknessMm ?? p.thickness ?? 17;
    const qty = p.qty > 0 ? p.qty : 1;
    const moduleName = (p.moduleName && p.moduleName.trim()) || "Hạng mục chung";
    const materialCode = p.materialCode || (thicknessMm <= 6 ? "MDF_6_HAU" : "MDF_17_CHONG_AM");

    // Tính diện tích net của tấm
    const partNetArea = (lengthMm * widthMm * qty) / 1_000_000;

    // A. Gom nhóm ván
    const matInfo = materialsMap.get(materialCode);
    const boardWaste = matInfo?.wasteFactor ?? (thicknessMm <= 6 ? 1.15 : DEFAULT_BOARD_WASTE_FACTOR);
    const boardPrice = matInfo?.unitPrice ?? (thicknessMm <= 6 ? 360_000 : 680_000);
    const boardName = matInfo?.name ?? `Ván MDF ${thicknessMm}mm (${materialCode})`;

    const existingBoard = boardGroups.get(materialCode) || {
      materialCode,
      materialName: boardName,
      netAreaM2: 0,
      wasteFactor: boardWaste,
      unitPrice: boardPrice,
    };
    existingBoard.netAreaM2 += partNetArea;
    boardGroups.set(materialCode, existingBoard);

    // B. Gom nhóm dán chỉ (D1, D2, R1, R2)
    let partEdgeMm = 0;
    if (p.edgeL1) partEdgeMm += lengthMm;
    if (p.edgeL2) partEdgeMm += lengthMm;
    if (p.edgeW1) partEdgeMm += widthMm;
    if (p.edgeW2) partEdgeMm += widthMm;

    if (partEdgeMm > 0) {
      const netEdgeM = (partEdgeMm * qty) / 1_000;
      const edgeCode = defaultEdgeItem?.code || "CHI_PVC_21";
      const edgeName = defaultEdgeItem?.name || "Chỉ dán cạnh PVC 21x1mm";
      const edgeWaste = defaultEdgeItem?.wasteFactor ?? fallbackEdgeWaste;
      const edgePrice = defaultEdgeItem?.unitPrice ?? fallbackEdgePrice;

      const existingEdge = edgeGroups.get(edgeCode) || {
        edgeCode,
        edgeName,
        netLengthMd: 0,
        wasteFactor: edgeWaste,
        unitPrice: edgePrice,
      };
      existingEdge.netLengthMd += netEdgeM;
      edgeGroups.set(edgeCode, existingEdge);
    }

    // C. Gom nhóm Module
    const existingMod = moduleGroups.get(moduleName) || {
      moduleName,
      partCount: 0,
      boardAreaM2: 0,
      partDescriptions: new Set<string>(),
    };
    existingMod.partCount += qty;
    existingMod.boardAreaM2 += partNetArea;
    if (p.partName) existingMod.partDescriptions.add(p.partName.trim());
    moduleGroups.set(moduleName, existingMod);
  });

  // Thu thập các mã vật tư chưa có trong Thư viện để cảnh báo
  const missingPriceCodesSet = new Set<string>();
  parts.forEach((p) => {
    if (p.materialCode && !materialsMap.has(p.materialCode)) {
      missingPriceCodesSet.add(p.materialCode);
    }
  });
  const missingPriceCodes = Array.from(missingPriceCodesSet);

  // ==========================================================================
  // TỔNG HỢP VÁN CẦN MUA (BOARD SUMMARY)
  // ==========================================================================
  const boards: BoardSummaryLine[] = [];
  let totalBoardCost = 0;
  let totalSheetsAllBoards = 0;

  boardGroups.forEach((group) => {
    const netAreaM2 = Number(group.netAreaM2.toFixed(3));
    const grossAreaM2 = Number((group.netAreaM2 * group.wasteFactor).toFixed(3));
    
    // Đọc kích thước tấm động từ MaterialItem (hỗ trợ cả khổ chuẩn 1220x2440, Jumbo 1830x2440, kịch trần 1220x2745)
    const mat = materialsMap.get(group.materialCode);
    const lengthMm = mat?.standardLengthMm ?? mat?.standardLength ?? STANDARD_BOARD.LENGTH_MM;
    const widthMm = mat?.standardWidthMm ?? mat?.standardWidth ?? STANDARD_BOARD.WIDTH_MM;
    const sheetAreaM2 = Number(((lengthMm * widthMm) / 1_000_000).toFixed(4));
    const effectiveSheetArea = sheetAreaM2 > 0 ? sheetAreaM2 : STANDARD_SHEET_AREA_M2;

    const rawSheets = grossAreaM2 / effectiveSheetArea;
    
    // Áp dụng quy tắc làm tròn (0.5 tấm hoặc 1 tấm nguyên)
    let sheetsToBuy = 0;
    if (netAreaM2 > 0) {
      sheetsToBuy =
        roundingStep === 0.5
          ? Math.ceil(rawSheets * 2) / 2
          : Math.ceil(rawSheets);
    }

    const totalCost = Math.round(sheetsToBuy * group.unitPrice);
    totalBoardCost += totalCost;
    totalSheetsAllBoards += sheetsToBuy;

    boards.push({
      materialCode: group.materialCode,
      materialName: group.materialName,
      netAreaM2,
      wasteFactor: group.wasteFactor,
      grossAreaM2,
      standardSheetAreaM2: effectiveSheetArea,
      sheetsToBuy,
      unitPrice: group.unitPrice,
      totalCost,
    });
  });

  // Sắp xếp mã ván chính lên trước (17mm trước, 6mm sau)
  boards.sort((a, b) => b.totalCost - a.totalCost);

  // ==========================================================================
  // TỔNG HỢP CHỈ DÁN CẠNH (EDGE SUMMARY)
  // ==========================================================================
  const edges: EdgeSummaryLine[] = [];
  let totalEdgeCost = 0;
  let totalEdgeLengthMd = 0;

  edgeGroups.forEach((group) => {
    const netLengthMd = Number(group.netLengthMd.toFixed(1));
    const grossLengthMd = Number((group.netLengthMd * group.wasteFactor).toFixed(1));
    const rollsSuggested = Math.ceil(grossLengthMd / DEFAULT_EDGE_ROLL_METERS);
    const totalCost = Math.round(grossLengthMd * group.unitPrice);

    totalEdgeCost += totalCost;
    totalEdgeLengthMd += grossLengthMd;

    edges.push({
      edgeCode: group.edgeCode,
      edgeName: group.edgeName,
      netLengthMd,
      wasteFactor: group.wasteFactor,
      grossLengthMd,
      rollsSuggested,
      unitPrice: group.unitPrice,
      totalCost,
    });
  });

  // ==========================================================================
  // 3. PHỤ KIỆN KIM KHÍ ĐỘC LẬP (HARDWARE - BẢN LỀ, RAY TRƯỢT)
  // ==========================================================================
  const hingeItem = materials.find((m) => m.category === "hardware" && (m.code.includes("BAN_LE") || m.name.toLowerCase().includes("bản lề")))
    || { name: "Bản Lề Bật Inox 304 Giảm Chấn (Hệ 32mm)", unitPrice: 28_000 };
  const slideItem = materials.find((m) => m.category === "hardware" && (m.code.includes("RAY") || m.name.toLowerCase().includes("ray")))
    || { name: "Ray Trượt Âm 450mm Giảm Chấn Mở Toàn Phần", unitPrice: 165_000 };

  const hingesPerSheet = options?.costConfig?.hingesPerSheet ?? DEFAULT_WORKSHOP_COST_CONFIG.hingesPerSheet;
  const slidesPerSheet = options?.costConfig?.slidesPerSheet ?? DEFAULT_WORKSHOP_COST_CONFIG.slidesPerSheet;

  const estHingesQty = Math.max(2, Math.round(totalSheetsAllBoards * hingesPerSheet));
  const estSlidesQty = Math.max(1, Math.round(totalSheetsAllBoards * slidesPerSheet));

  // Ghi chú: Đã loại bỏ estFastenersCost khỏi Hardware để gom về mục Vật tư phụ, tránh tính trùng 15.000 đ
  const totalHardwareCost = (estHingesQty * hingeItem.unitPrice) + (estSlidesQty * slideItem.unitPrice);

  // ==========================================================================
  // 4. NHÂN CÔNG GIA CÔNG & LẮP ĐẶT (LABOR - ĐỘC LẬP HOÀN TOÀN)
  // ==========================================================================
  const effectiveLaborRate = options?.laborRatePerSheet 
    ?? options?.costConfig?.laborRatePerSheet 
    ?? laborItem?.unitPrice 
    ?? DEFAULT_WORKSHOP_COST_CONFIG.laborRatePerSheet;
  const laborCost = Math.round(totalSheetsAllBoards * effectiveLaborRate);

  // ==========================================================================
  // 5. VẬT TƯ PHỤ & PHỤ KIỆN LIÊN KẾT (SUPPLIES & FASTENERS)
  // Gồm: ốc cam chốt liên kết, ke góc định vị, vít bắt gỗ, màng PE bọc bảo vệ
  // Mặc định tạm: 15.000 đ/tấm (cho phép sửa đổi linh hoạt trong Cài đặt xưởng)
  // ==========================================================================
  const effectiveSuppliesRate = options?.suppliesRatePerSheet 
    ?? options?.costConfig?.suppliesRatePerSheet 
    ?? DEFAULT_WORKSHOP_COST_CONFIG.suppliesRatePerSheet;
  const suppliesCost = Math.round(totalSheetsAllBoards * effectiveSuppliesRate);

  // TỔNG GIÁ VỐN XƯỞNG (BOM BASE COST - ĐỦ 5 THÀNH PHẦN KHÔNG CHỒNG LẤN)
  const totalBaseCost = totalBoardCost + totalEdgeCost + totalHardwareCost + laborCost + suppliesCost;

  // TỔNG GIÁ BÁO KHÁCH HÀNG (COMMERCIAL QUOTE) DÙNG CHUNG TỪ PROFIT-CALCULATOR
  const { quotePrice: totalQuotePrice, grossProfit: estimatedProfit } = calculateCommercialQuote(
    totalBaseCost,
    profitMargin
  );

  // ==========================================================================
  // PHÂN BỔ BÁO GIÁ THEO HẠNG MỤC SẢN PHẨM (MODULE QUOTE LINES)
  // ==========================================================================
  const totalNetAllModules = Array.from(moduleGroups.values()).reduce(
    (sum, m) => sum + m.boardAreaM2,
    0
  );

  const moduleQuotes: ModuleQuoteLine[] = Array.from(moduleGroups.entries()).map(
    ([moduleName, data]) => {
      const { baseCost, quotePrice } = calculateModuleQuoteLine(
        data.boardAreaM2,
        totalNetAllModules,
        totalBaseCost,
        totalQuotePrice
      );
      const partsSummary = Array.from(data.partDescriptions).slice(0, 4).join(", ");
      const description = partsSummary ? `Bao gồm: ${partsSummary}...` : "Hoàn thiện theo thiết kế";

      return {
        moduleName,
        description,
        partCount: data.partCount,
        boardAreaM2: Number(data.boardAreaM2.toFixed(2)),
        baseCost,
        quotePrice,
      };
    }
  );

  // Sắp xếp hạng mục theo giá trị báo giá giảm dần
  moduleQuotes.sort((a, b) => b.quotePrice - a.quotePrice);

  return {
    boards,
    edges,
    hardwareCost: totalHardwareCost,
    laborCost,
    suppliesCost,
    totalBaseCost,
    moduleQuotes,
    totalQuotePrice,
    estimatedProfit,
    totalSheets: totalSheetsAllBoards,
    totalEdgeLengthMd: Number(totalEdgeLengthMd.toFixed(1)),
    missingPriceCodes,
  };
}
