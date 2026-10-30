/**
 * ĐỘNG CƠ TÍNH TOÁN DÒNG CHI PHÍ TỔNG QUÁT (COST LINES ENGINE)
 * Hàm thuần túy, tính toán đa danh mục, đa quy tắc số lượng và biên lợi nhuận.
 * Không chứa bất kỳ hằng số hay tên loại vật tư cụ thể nào.
 */

import type {
  CostCategory,
  CostLine,
  CostLineEngineOptions,
  CostLinesEngineResult,
  ProjectDrivers,
  ResolvedCostLine,
} from "./cost-line-types.ts";
import { resolveQuantityFromRule } from "./cost-line-resolver.ts";

export const DEFAULT_ENGINE_MARKUP = 1.65;

const ALL_CATEGORIES: CostCategory[] = [
  "board",
  "edge",
  "hardware",
  "supplies",
  "surface",
  "face_material",
  "equipment",
  "labor",
  "service",
  "subcontract",
  "other",
];

export function calculateCostLines(
  lines: CostLine[],
  drivers: ProjectDrivers,
  options?: CostLineEngineOptions
): CostLinesEngineResult {
  const defaultMarkup = options?.defaultMarkup ?? DEFAULT_ENGINE_MARKUP;

  const groupTotals: Record<string, { baseCost: number; quotePrice: number }> = {};
  const groupBaseCosts: Record<string, number> = {};

  const categoryTotals = ALL_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = { baseCost: 0, quotePrice: 0 };
    return acc;
  }, {} as Record<CostCategory, { baseCost: number; quotePrice: number }>);

  const resolvedLines: ResolvedCostLine[] = [];

  const enabledLines = lines.filter((l) => l.enabled);

  // Tách hai giai đoạn: các dòng độc lập trước, các dòng phụ thuộc % của nhóm sau
  const phase1Lines = enabledLines.filter(
    (l) => l.quantityRule.kind !== "percentOfGroup"
  );
  const phase2Lines = enabledLines.filter(
    (l) => l.quantityRule.kind === "percentOfGroup"
  );

  const processLine = (
    line: CostLine,
    interimCosts?: Record<string, number>
  ) => {
    const rawQuantity = resolveQuantityFromRule(
      line.quantityRule,
      drivers,
      interimCosts
    );
    const wasteFactor =
      line.wasteFactor !== undefined && line.wasteFactor > 0
        ? line.wasteFactor
        : 1.0;
    const effectiveQuantity = Number((rawQuantity * wasteFactor).toFixed(4));
    const baseCost = Math.round(effectiveQuantity * line.unitPrice);

    const markup =
      line.markupOverride !== undefined && line.markupOverride > 0
        ? line.markupOverride
        : defaultMarkup;
    const quotePrice = Math.round(baseCost * markup);

    const resolved: ResolvedCostLine = {
      id: line.id,
      catalogItemId: line.catalogItemId,
      name: line.name,
      category: line.category,
      unit: line.unit,
      unitPrice: line.unitPrice,
      rawQuantity,
      quantity: rawQuantity,
      wasteFactor,
      effectiveQuantity,
      baseCost,
      group: line.group,
      markupOverride: line.markupOverride,
      quotePrice,
      visibleOnQuote: line.visibleOnQuote,
      source: line.source,
      enabled: line.enabled,
      notes: line.notes,
    };

    resolvedLines.push(resolved);

    // Tích lũy theo nhóm
    if (!groupTotals[line.group]) {
      groupTotals[line.group] = { baseCost: 0, quotePrice: 0 };
    }
    groupTotals[line.group].baseCost += baseCost;
    groupTotals[line.group].quotePrice += quotePrice;
    groupBaseCosts[line.group] = (groupBaseCosts[line.group] ?? 0) + baseCost;

    // Tích lũy theo danh mục
    if (!categoryTotals[line.category]) {
      categoryTotals[line.category] = { baseCost: 0, quotePrice: 0 };
    }
    categoryTotals[line.category].baseCost += baseCost;
    categoryTotals[line.category].quotePrice += quotePrice;
  };

  // Chạy giai đoạn 1
  for (const line of phase1Lines) {
    processLine(line);
  }

  // Chạy giai đoạn 2 với groupBaseCosts từ giai đoạn 1
  for (const line of phase2Lines) {
    processLine(line, groupBaseCosts);
  }

  const totalBaseCost = resolvedLines.reduce((s, l) => s + l.baseCost, 0);
  const totalQuotePrice = resolvedLines.reduce((s, l) => s + l.quotePrice, 0);
  const grossProfit = totalQuotePrice - totalBaseCost;
  const effectiveProfitMargin =
    totalBaseCost > 0
      ? Number((totalQuotePrice / totalBaseCost).toFixed(4))
      : defaultMarkup;

  return {
    resolvedLines,
    groupTotals,
    categoryTotals,
    totalBaseCost,
    totalQuotePrice,
    grossProfit,
    effectiveProfitMargin,
  };
}
