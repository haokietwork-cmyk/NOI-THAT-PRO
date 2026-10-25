/**
 * TRÁI TIM TÍNH TIỀN - ENGINE BÁO GIÁ VÀ TÍNH GIÁ VỐN (LEGACY VERSION 1)
 * 
 * ============================================================================
 * CẢNH BÁO KIẾN TRÚC (ARCHITECTURAL INVARIANT):
 * ĐÂY LÀ PHIÊN BẢN TÍNH TOÁN LỊCH SỬ (CALC_VERSION = 1).
 * Áp dụng cho các dự án đã tạo trước khi nâng cấp hệ thống bóc tách.
 * TUYỆT ĐỐI KHÔNG SỬA ĐỔI FILE NÀY ĐỂ BẢO VỆ NGUYÊN TẮC SNAPSHOT PRICING:
 * Dự án cũ mở lại bắt buộc phải ra ĐÚNG 100% số tiền cũ (sai số 0 đồng).
 * ============================================================================
 */

import type { CutlistPart, MaterialItem } from "../types/index.ts";
import { calculateNetArea, calculateSheetsNeeded, DEFAULT_BOARD_WASTE_FACTOR } from "./board-calculator.ts";
import { calculateEdgeMeters, type EdgeBandingConfig } from "./edge-calculator.ts";

export interface CutlistItemV1 {
  id?: string;
  moduleName?: string;
  partName?: string;
  lengthMm?: number;
  widthMm?: number;
  thicknessMm?: number;
  length?: number;
  width?: number;
  thickness?: number;
  qty: number;
  materialCode: string;
  edges?: EdgeBandingConfig;
  edgeL1?: boolean;
  edgeL2?: boolean;
  edgeW1?: boolean;
  edgeW2?: boolean;
}

export interface MaterialPricingV1 {
  code: string;
  name: string;
  category: "board" | "edge" | "hardware" | "labor";
  unitPrice: number;
  wasteFactor?: number;
  standardLengthMm?: number;
  standardWidthMm?: number;
}

export interface WorkshopBOMBoardV1 {
  materialCode: string;
  totalNetAreaM2: number;
  sheetsNeeded: number;
  unitPrice: number;
  totalCost: number;
}

export interface WorkshopBOMEdgeV1 {
  totalMeters: number;
  unitPrice: number;
  totalCost: number;
}

export interface WorkshopBOMHardwareV1 {
  name: string;
  qty: number;
  unitPrice: number;
  totalCost: number;
}

export interface QuoteCalculationResultV1 {
  // Góc nhìn Xưởng (BOM)
  boards: WorkshopBOMBoardV1[];
  edges: WorkshopBOMEdgeV1;
  hardware: WorkshopBOMHardwareV1[];
  laborRatePerSheet: number;
  totalSheets: number;
  laborCost: number;
  totalMaterialCost: number;
  totalCost: number; // Tổng giá vốn xưởng V1

  // Góc nhìn Khách (Báo giá theo hạng mục module)
  profitMargin: number;
  totalQuotePrice: number; // Giá chào khách V1
  grossProfit: number;     // Lợi nhuận gộp V1
  moduleSummaries: {
    moduleName: string;
    itemCount: number;
    totalNetAreaM2: number;
    estimatedCost: number;
    estimatedQuote: number;
  }[];
}

/**
 * Thuật toán tính giá vốn và báo giá Legacy V1 (Bảo tồn Snapshot các dự án cũ)
 */
export function calculateLegacyV1(
  parts: (CutlistPart | CutlistItemV1)[],
  materials: (MaterialItem | MaterialPricingV1)[],
  profitMargin: number = 1.35,
  customLaborRate?: number
): QuoteCalculationResultV1 {
  const materialsMap = new Map<string, MaterialItem | MaterialPricingV1>();
  materials.forEach((m) => materialsMap.set(m.code, m));

  const laborMaterial = materials.find((m) => m.category === "labor");
  const laborRatePerSheet = customLaborRate ?? (laborMaterial?.unitPrice ?? 120_000);

  // 1. Gom nhóm ván theo mã
  const boardGroups = new Map<string, { totalNetArea: number; wasteFactor: number }>();
  let totalEdgeMeters = 0;

  // Gom theo Module để làm Báo giá khách
  const moduleMap = new Map<string, { itemCount: number; totalNetArea: number }>();

  parts.forEach((p) => {
    const lengthMm = ("length" in p && p.length !== undefined) ? p.length : (p.lengthMm ?? 0);
    const widthMm = ("width" in p && p.width !== undefined) ? p.width : (p.widthMm ?? 0);
    const qty = p.qty > 0 ? p.qty : 1;
    const moduleName = p.moduleName || "Hạng mục chung";
    const materialCode = p.materialCode;
    const edges: EdgeBandingConfig = ("edges" in p && p.edges)
      ? p.edges
      : {
          l1: "edgeL1" in p ? Boolean(p.edgeL1) : false,
          l2: "edgeL2" in p ? Boolean(p.edgeL2) : false,
          w1: "edgeW1" in p ? Boolean(p.edgeW1) : false,
          w2: "edgeW2" in p ? Boolean(p.edgeW2) : false,
        };

    const netArea = calculateNetArea(lengthMm, widthMm, qty);
    const matPrice = materialsMap.get(materialCode);
    const wasteFactor = matPrice?.wasteFactor ?? DEFAULT_BOARD_WASTE_FACTOR;

    // Ván
    const currentBoard = boardGroups.get(materialCode) || { totalNetArea: 0, wasteFactor };
    currentBoard.totalNetArea += netArea;
    boardGroups.set(materialCode, currentBoard);

    // Chỉ dán cạnh
    const edgeM = calculateEdgeMeters(lengthMm, widthMm, qty, edges);
    totalEdgeMeters += edgeM;

    // Module
    const mod = moduleMap.get(moduleName) || { itemCount: 0, totalNetArea: 0 };
    mod.itemCount += qty;
    mod.totalNetArea += netArea;
    moduleMap.set(moduleName, mod);
  });

  // 2. Tính tiền ván
  let totalSheetsAllBoards = 0;
  const boardsResult: WorkshopBOMBoardV1[] = [];
  let totalBoardCost = 0;

  boardGroups.forEach((data, code) => {
    const priceInfo = materialsMap.get(code);
    const lengthMm = priceInfo?.standardLengthMm || 2440;
    const widthMm = priceInfo?.standardWidthMm || 1220;
    const standardArea = Number(((lengthMm * widthMm) / 1_000_000).toFixed(4));

    // Quy đổi số tấm làm tròn lên 0.5 tấm
    const sheets = calculateSheetsNeeded(data.totalNetArea, data.wasteFactor, standardArea, true);
    totalSheetsAllBoards += sheets;
    const unitPrice = priceInfo?.unitPrice ?? 680_000;
    const cost = sheets * unitPrice;
    totalBoardCost += cost;

    boardsResult.push({
      materialCode: code,
      totalNetAreaM2: Number(data.totalNetArea.toFixed(3)),
      sheetsNeeded: sheets,
      unitPrice,
      totalCost: cost,
    });
  });

  // 3. Tính tiền chỉ dán cạnh
  const edgePriceInfo = materials.find((m) => m.category === "edge")?.unitPrice ?? 3_500;
  const edgeTotalCost = Math.round(totalEdgeMeters * edgePriceInfo);
  const edgesResult: WorkshopBOMEdgeV1 = {
    totalMeters: Number(totalEdgeMeters.toFixed(1)),
    unitPrice: edgePriceInfo,
    totalCost: edgeTotalCost,
  };

  // 4. Ước lượng phụ kiện cơ bản theo số tấm (Logic V1)
  const hingeItem = materials.find((m) => m.category === "hardware" && (m.code.includes("BAN_LE") || m.name.toLowerCase().includes("bản lề")))
    || { name: "Bản Lề Bật Inox 304 Giảm Chấn (Hệ 32mm)", unitPrice: 28_000 };
  const slideItem = materials.find((m) => m.category === "hardware" && (m.code.includes("RAY") || m.name.toLowerCase().includes("ray")))
    || { name: "Ray Trượt Âm 450mm Giảm Chấn Mở Toàn Phần", unitPrice: 165_000 };
  const fastenerItem = { name: "Ốc cam chốt liên kết, ke góc định vị", unitPrice: 15_000 };

  const estHingesQty = Math.max(2, Math.round(totalSheetsAllBoards * 2.0));
  const estSlidesQty = Math.max(1, Math.round(totalSheetsAllBoards * 0.35));
  const estFastenersQty = Math.max(1, Math.round(totalSheetsAllBoards));

  const hardwareResult: WorkshopBOMHardwareV1[] = [
    {
      name: hingeItem.name,
      qty: estHingesQty,
      unitPrice: hingeItem.unitPrice,
      totalCost: estHingesQty * hingeItem.unitPrice,
    },
    {
      name: slideItem.name,
      qty: estSlidesQty,
      unitPrice: slideItem.unitPrice,
      totalCost: estSlidesQty * slideItem.unitPrice,
    },
    {
      name: fastenerItem.name,
      qty: estFastenersQty,
      unitPrice: fastenerItem.unitPrice,
      totalCost: estFastenersQty * fastenerItem.unitPrice,
    },
  ];
  const totalHardwareCost = hardwareResult.reduce((sum, h) => sum + h.totalCost, 0);

  // 5. Tiền nhân công xưởng
  const totalLaborCost = Math.round(totalSheetsAllBoards * laborRatePerSheet);

  // 6. Tổng giá vốn (V1 không có suppliesCost)
  const totalCost = totalBoardCost + edgeTotalCost + totalHardwareCost + totalLaborCost;
  const totalQuotePrice = Math.round(totalCost * profitMargin);
  const grossProfit = totalQuotePrice - totalCost;

  // 7. Phân bổ giá chào theo từng module
  const totalNetAll = Array.from(moduleMap.values()).reduce((sum, m) => sum + m.totalNetArea, 0);
  const moduleSummaries = Array.from(moduleMap.entries()).map(([moduleName, data]) => {
    const ratio = totalNetAll > 0 ? data.totalNetArea / totalNetAll : 0;
    const estCost = Math.round(totalCost * ratio);
    const estQuote = Math.round(totalQuotePrice * ratio);
    return {
      moduleName,
      itemCount: data.itemCount,
      totalNetAreaM2: Number(data.totalNetArea.toFixed(2)),
      estimatedCost: estCost,
      estimatedQuote: estQuote,
    };
  });

  return {
    boards: boardsResult,
    edges: edgesResult,
    hardware: hardwareResult,
    laborRatePerSheet,
    totalSheets: totalSheetsAllBoards,
    laborCost: totalLaborCost,
    totalMaterialCost: totalBoardCost + edgeTotalCost,
    totalCost,
    profitMargin,
    totalQuotePrice,
    grossProfit,
    moduleSummaries,
  };
}
