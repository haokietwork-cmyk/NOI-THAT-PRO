/**
 * TRÁI TIM TÍNH TIỀN - ENGINE BÁO GIÁ VÀ TÍNH GIÁ VỐN (SINGLE SOURCE OF TRUTH)
 * Áp giá vật tư + nhân công + phụ kiện + hệ số markup lợi nhuận
 * Gom logic tính giá và phân bổ module về src/core/calculations/profit-calculator.ts
 */

import type { CutlistPart, MaterialItem, SavedProject } from "../types/index.ts";
import { calculateProject, STANDARD_BOARD, STANDARD_SHEET_AREA_M2 } from "./engine.ts";
import {
  calculateCommercialQuote,
  calculateModuleQuoteLine,
  resolveProjectProfitMargin,
  DEFAULT_NEW_PROFIT_MARGIN,
  DEFAULT_PROFIT_MARGIN,
} from "./profit-calculator.ts";
import type { EdgeBandingConfig } from "./edge-calculator.ts";

export { calculateProject, STANDARD_BOARD, STANDARD_SHEET_AREA_M2 } from "./engine.ts";
export * from "./profit-calculator.ts";

export interface CutlistItem {
  id?: string;
  moduleName: string;
  partName: string;
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

export interface MaterialPricing {
  code: string;
  name: string;
  category: "board" | "edge" | "hardware" | "labor";
  unitPrice: number;
  wasteFactor?: number;
  standardLengthMm?: number;
  standardWidthMm?: number;
}

export interface WorkshopBOMBoard {
  materialCode: string;
  totalNetAreaM2: number;
  sheetsNeeded: number;
  unitPrice: number;
  totalCost: number;
}

export interface WorkshopBOMEdge {
  totalMeters: number;
  unitPrice: number;
  totalCost: number;
}

export interface WorkshopBOMHardware {
  name: string;
  qty: number;
  unitPrice: number;
  totalCost: number;
}

export interface QuoteCalculationResult {
  // Góc nhìn Xưởng (BOM)
  boards: WorkshopBOMBoard[];
  edges: WorkshopBOMEdge;
  hardware: WorkshopBOMHardware[];
  laborRatePerSheet: number;
  totalSheets: number;
  laborCost: number;
  totalMaterialCost: number;
  totalCost: number; // Tổng giá vốn xưởng

  // Góc nhìn Khách (Báo giá theo hạng mục module)
  profitMargin: number;
  totalQuotePrice: number; // Giá chào khách đã có lời
  grossProfit: number;     // Lợi nhuận gộp dự kiến (totalQuotePrice - totalCost)
  moduleSummaries: {
    moduleName: string;
    itemCount: number;
    totalNetAreaM2: number;
    estimatedCost: number;
    estimatedQuote: number;
  }[];
}

export const LEGAL_DISCLAIMER =
  "Lưu ý: Bảng khối lượng dự toán dựa trên hệ số hao hụt do người dùng thiết lập. Quý xưởng vui lòng đối chiếu sơ đồ cắt thực tế trước khi xuất lệnh đặt hàng.";

/**
 * Tính toán toàn diện giá vốn và báo giá từ danh sách chi tiết tấm Cutlist
 * Lớp bọc chuẩn hóa chuyển tiếp dữ liệu đến calculateProject (Engine duy nhất)
 */
export function calculateQuoteEngine(
  parts: (CutlistPart | CutlistItem)[],
  materials: (MaterialItem | MaterialPricing)[],
  profitMargin?: number,
  customLaborRate?: number
): QuoteCalculationResult {
  const effectiveMargin = resolveProjectProfitMargin(profitMargin);

  // Chuẩn hóa dữ liệu tấm đầu vào tương thích giữa CutlistPart và CutlistItem
  const normalizedParts: CutlistPart[] = parts.map((p, idx) => {
    const lengthMm = ("length" in p && p.length !== undefined) ? p.length : (p.lengthMm ?? 0);
    const widthMm = ("width" in p && p.width !== undefined) ? p.width : (p.widthMm ?? 0);
    const thicknessMm = ("thickness" in p && p.thickness !== undefined) ? p.thickness : (p.thicknessMm ?? 17);
    const edgeL1 = "edgeL1" in p ? Boolean(p.edgeL1) : Boolean(p.edges?.l1);
    const edgeL2 = "edgeL2" in p ? Boolean(p.edgeL2) : Boolean(p.edges?.l2);
    const edgeW1 = "edgeW1" in p ? Boolean(p.edgeW1) : Boolean(p.edges?.w1);
    const edgeW2 = "edgeW2" in p ? Boolean(p.edgeW2) : Boolean(p.edges?.w2);

    return {
      id: p.id || `part-${idx}`,
      moduleName: p.moduleName || "Hạng mục chung",
      partName: p.partName || `Chi tiết ${idx + 1}`,
      lengthMm,
      widthMm,
      thicknessMm,
      length: lengthMm,
      width: widthMm,
      thickness: thicknessMm,
      qty: p.qty > 0 ? p.qty : 1,
      materialCode: p.materialCode,
      edgeL1,
      edgeL2,
      edgeW1,
      edgeW2,
    };
  });

  const projResult = calculateProject(normalizedParts, materials as MaterialItem[], {
    profitMargin: effectiveMargin,
    laborRatePerSheet: customLaborRate,
    roundingStep: 0.5,
  });

  const totalSheets = projResult.totalSheets;
  const hingeItem = materials.find((m) => m.category === "hardware" && (m.code.includes("BAN_LE") || m.name.toLowerCase().includes("bản lề")))
    || { name: "Bản Lề Bật Inox 304 Giảm Chấn (Hệ 32mm)", unitPrice: 28_000 };
  const slideItem = materials.find((m) => m.category === "hardware" && (m.code.includes("RAY") || m.name.toLowerCase().includes("ray")))
    || { name: "Ray Trượt Âm 450mm Giảm Chấn Mở Toàn Phần", unitPrice: 165_000 };
  const fastenerItem = { name: "Ốc cam chốt liên kết, ke góc định vị", unitPrice: 15_000 };

  const estHingesQty = Math.max(2, Math.round(totalSheets * 2.0));
  const estSlidesQty = Math.max(1, Math.round(totalSheets * 0.35));
  const estFastenersQty = Math.max(1, Math.round(totalSheets));

  const hardwareResult: WorkshopBOMHardware[] = [
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

  const totalBoardCost = projResult.boards.reduce((s, b) => s + b.totalCost, 0);
  const totalEdgeCost = projResult.edges.reduce((s, e) => s + e.totalCost, 0);

  return {
    boards: projResult.boards.map((b) => ({
      materialCode: b.materialCode,
      totalNetAreaM2: b.netAreaM2,
      sheetsNeeded: b.sheetsToBuy,
      unitPrice: b.unitPrice,
      totalCost: b.totalCost,
    })),
    edges: {
      totalMeters: projResult.totalEdgeLengthMd,
      unitPrice: projResult.edges[0]?.unitPrice ?? 3500,
      totalCost: totalEdgeCost,
    },
    hardware: hardwareResult,
    laborRatePerSheet: projResult.laborCost > 0 && totalSheets > 0 ? Math.round(projResult.laborCost / totalSheets) : (customLaborRate ?? 120_000),
    totalSheets,
    laborCost: projResult.laborCost,
    totalMaterialCost: projResult.totalBaseCost - projResult.laborCost,
    totalCost: projResult.totalBaseCost,
    profitMargin: effectiveMargin,
    totalQuotePrice: projResult.totalQuotePrice,
    grossProfit: projResult.estimatedProfit,
    moduleSummaries: projResult.moduleQuotes.map((m) => ({
      moduleName: m.moduleName,
      itemCount: m.partCount,
      totalNetAreaM2: m.boardAreaM2,
      estimatedCost: m.baseCost,
      estimatedQuote: m.quotePrice,
    })),
  };
}

/**
 * Trích xuất hoặc tính toán tổng tiền của dự án:
 * - Nếu dự án đã có snapshot tổng tiền đóng băng (is_locked/snapshotTotals): lấy trực tiếp từ snapshot.
 * - Nếu chưa có snapshot: tính bằng engine hiện tại.
 */
export function getProjectTotals(
  project: SavedProject,
  materials?: MaterialItem[]
): {
  totalCost: number;
  totalQuote: number;
  grossProfit: number;
  profitMargin: number;
} {
  const effectiveMaterials = (project.materialsSnapshot && project.materialsSnapshot.length > 0)
    ? project.materialsSnapshot
    : (materials || []);

  const margin = resolveProjectProfitMargin(project.profitMargin);
  const calc = calculateQuoteEngine(project.items, effectiveMaterials, margin);

  return {
    totalCost: calc.totalCost,
    totalQuote: calc.totalQuotePrice,
    grossProfit: calc.grossProfit,
    profitMargin: margin,
  };
}
