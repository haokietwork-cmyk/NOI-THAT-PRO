/**
 * MODULE NÂNG CẤP CÔNG THỨC DỰ TOÁN CŨ (P1 - GIAI ĐOẠN H4)
 * Tuân thủ Rule 12: Không đổi số âm thầm.
 * Bảo toàn Snapshot Pricing; hiển thị xem trước mức chênh trước khi nâng cấp.
 */

import type { SavedProject, WorkshopCostConfig, CutlistPart, MaterialItem } from "../types/index.ts";
import { DEFAULT_WORKSHOP_COST_CONFIG } from "../types/index.ts";
import { calculateProject } from "./engine.ts";
import { resolveProjectProfitMargin } from "./profit-calculator.ts";

export interface UpgradePreviewResult {
  currentCalcVersion: number;
  targetCalcVersion: number;
  currentCost: number;
  currentQuote: number;
  upgradedCost: number;
  upgradedQuote: number;
  diffCost: number;
  diffQuote: number;
  suppliesCostAdded: number;
  totalSheets: number;
}

/**
 * Kiểm tra xem dự án có đang dùng phiên bản thuật toán cũ (chưa có vật tư phụ) hay không
 */
export function isLegacyCalculationProject(project: SavedProject): boolean {
  // Bản hợp đồng đã khóa không bao giờ coi là cần nâng cấp (phải giữ nguyên 100%)
  if (project.isLocked) return false;
  if (project.status !== "draft") return false;

  const version = project.calcVersion ?? 0;
  if (version < 1) return true;

  // Nếu costConfigSnapshot thiếu hẳn suppliesRatePerSheet
  if (!project.costConfigSnapshot || (project.costConfigSnapshot.suppliesRatePerSheet ?? 0) === 0) {
    return true;
  }

  return false;
}

/**
 * Tính toán xem trước mức chênh lệch tài chính trước khi người dùng bấm xác nhận nâng cấp
 */
export function calculateUpgradePreview(
  project: SavedProject,
  workshopConfig?: WorkshopCostConfig
): UpgradePreviewResult {
  const currentCost = project.totalCost || 0;
  const currentQuote = project.totalQuote || 0;
  const targetConfig: WorkshopCostConfig = {
    ...DEFAULT_WORKSHOP_COST_CONFIG,
    ...workshopConfig,
    suppliesRatePerSheet: workshopConfig?.suppliesRatePerSheet || DEFAULT_WORKSHOP_COST_CONFIG.suppliesRatePerSheet,
  };

  const margin = resolveProjectProfitMargin(project.profitMargin);
  const materials: MaterialItem[] = project.materialsSnapshot || [];

  const calcResult = calculateProject(project.items, materials, {
    profitMargin: margin,
    roundingStep: project.roundingStep ?? 0.5,
    costConfig: targetConfig,
  });

  const upgradedCost = calcResult.totalBaseCost;
  const upgradedQuote = calcResult.totalQuotePrice;
  const diffCost = upgradedCost - currentCost;
  const diffQuote = upgradedQuote - currentQuote;

  return {
    currentCalcVersion: project.calcVersion ?? 0,
    targetCalcVersion: 1,
    currentCost,
    currentQuote,
    upgradedCost,
    upgradedQuote,
    diffCost,
    diffQuote,
    suppliesCostAdded: calcResult.suppliesCost,
    totalSheets: calcResult.totalSheets,
  };
}

/**
 * Thực hiện nâng cấp dự án sang phiên bản công thức tính toán mới nhất
 */
export function applyProjectFormulaUpgrade(
  project: SavedProject,
  workshopConfig?: WorkshopCostConfig
): SavedProject {
  const preview = calculateUpgradePreview(project, workshopConfig);
  const now = new Date().toISOString();

  const targetConfig: WorkshopCostConfig = {
    ...DEFAULT_WORKSHOP_COST_CONFIG,
    ...workshopConfig,
    suppliesRatePerSheet: workshopConfig?.suppliesRatePerSheet || DEFAULT_WORKSHOP_COST_CONFIG.suppliesRatePerSheet,
  };

  return {
    ...project,
    calcVersion: 1,
    totalCost: preview.upgradedCost,
    totalQuote: preview.upgradedQuote,
    costConfigSnapshot: targetConfig,
    updatedAt: now,
  };
}
