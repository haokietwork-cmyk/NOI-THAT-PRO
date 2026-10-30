/**
 * ĐỘNG CƠ TÍNH TOÁN ĐA CHẾ ĐỘ NHẬP & HẠNG MỤC DỰ ÁN (SECTION CALCULATOR)
 * Hỗ trợ 3 chế độ: (1) Cutlist chi tiết, (2) Báo nhanh m2/md, (3) Dòng nhập tay.
 * Cho phép trộn lẫn trong cùng một dự án và xuất cảnh báo BOM rõ ràng.
 */

import type { CutlistPart, MaterialItem, ProjectSection } from "../types/index.ts";
import { calculateProject } from "./engine.ts";
import { calculateCommercialQuote } from "./profit-calculator.ts";
import type { CostLine } from "./cost-lines/cost-line-types.ts";
import { calculateCostLines } from "./cost-lines/cost-lines-engine.ts";
import { buildProjectDrivers } from "./cost-lines/cost-line-resolver.ts";

export interface SectionCalculationResult {
  sectionId: string;
  sectionName: string;
  inputMode: string;
  baseCost: number;
  quotePrice: number;
  profit: number;
  hasCutlist: boolean;
  bomWarning?: string;
  partCount: number;
  areaM2?: number;
}

export interface HybridProjectResult {
  sections: SectionCalculationResult[];
  totalBaseCost: number;
  totalQuotePrice: number;
  totalGrossProfit: number;
  effectiveProfitMargin: number;
  bomWarnings: string[];
}

export function calculateHybridProject(params: {
  sections: ProjectSection[];
  parts?: CutlistPart[];
  materials: MaterialItem[];
  defaultMarkup?: number;
  extraCostLines?: CostLine[];
}): HybridProjectResult {
  const markup = params.defaultMarkup ?? 1.65;
  const sectionResults: SectionCalculationResult[] = [];
  const bomWarnings: string[] = [];

  let grandBaseCost = 0;
  let grandQuotePrice = 0;

  for (const sec of params.sections) {
    if (sec.inputMode === "cutlist") {
      // Lọc các tấm thuộc hạng mục này
      const secParts = (params.parts ?? []).filter(
        (p) => p.moduleName?.trim().toLowerCase() === sec.name.trim().toLowerCase()
      );

      if (secParts.length > 0) {
        const proj = calculateProject(secParts, params.materials, {
          profitMargin: markup,
        });

        grandBaseCost += proj.totalBaseCost;
        grandQuotePrice += proj.totalQuotePrice;

        sectionResults.push({
          sectionId: sec.id,
          sectionName: sec.name,
          inputMode: "cutlist",
          baseCost: proj.totalBaseCost,
          quotePrice: proj.totalQuotePrice,
          profit: proj.estimatedProfit,
          hasCutlist: true,
          partCount: secParts.reduce((s, p) => s + (p.qty || 1), 0),
          areaM2: Number(
            secParts
              .reduce((s, p) => s + ((p.lengthMm * p.widthMm * (p.qty || 1)) / 1_000_000), 0)
              .toFixed(2)
          ),
        });
      } else {
        const warning = `Hạng mục '${sec.name}' ở chế độ Cutlist nhưng chưa có chi tiết tấm nào trong danh sách.`;
        bomWarnings.push(warning);
        sectionResults.push({
          sectionId: sec.id,
          sectionName: sec.name,
          inputMode: "cutlist",
          baseCost: 0,
          quotePrice: 0,
          profit: 0,
          hasCutlist: false,
          bomWarning: warning,
          partCount: 0,
        });
      }
    } else if (sec.inputMode === "quick_module" && sec.quickCalc) {
      // Chế độ báo nhanh theo m2 / md / module
      const qty = sec.quickCalc.quantity;
      const unitP = sec.quickCalc.unitPrice;
      const totalQ = Math.round(qty * unitP);
      // Giả định đơn giá nhanh là giá bán khách (đã có lãi); quy đổi giá vốn: baseCost = totalQ / markup
      const baseCost = Math.round(totalQ / markup);
      const profit = totalQ - baseCost;

      grandBaseCost += baseCost;
      grandQuotePrice += totalQ;

      const warning = `Hạng mục '${sec.name}' được ước tính nhanh theo ${sec.quickCalc.unitType} (${qty} ${sec.quickCalc.unitType}), chưa có phôi tấm. Khối lượng ván/chỉ của hạng mục này không hiển thị trên BOM xưởng.`;
      bomWarnings.push(warning);

      sectionResults.push({
        sectionId: sec.id,
        sectionName: sec.name,
        inputMode: "quick_module",
        baseCost,
        quotePrice: totalQ,
        profit,
        hasCutlist: false,
        bomWarning: warning,
        partCount: 0,
        areaM2: sec.quickCalc.unitType === "m2" ? qty : undefined,
      });
    } else if (sec.inputMode === "manual_lines" && sec.manualLines) {
      // Chế độ dòng nhập tay
      let secBaseCost = 0;
      let secQuotePrice = 0;

      for (const line of sec.manualLines) {
        const lineBase = Math.round(line.quantity * line.unitPrice);
        const lineMarkup = line.markupOverride ?? markup;
        const lineQuote = Math.round(lineBase * lineMarkup);
        secBaseCost += lineBase;
        secQuotePrice += lineQuote;
      }

      grandBaseCost += secBaseCost;
      grandQuotePrice += secQuotePrice;

      const warning = `Hạng mục '${sec.name}' gồm ${sec.manualLines.length} dòng chi phí nhập tay (mua ngoài/thầu phụ). Không phát sinh phôi ván trên BOM xưởng.`;
      bomWarnings.push(warning);

      sectionResults.push({
        sectionId: sec.id,
        sectionName: sec.name,
        inputMode: "manual_lines",
        baseCost: secBaseCost,
        quotePrice: secQuotePrice,
        profit: secQuotePrice - secBaseCost,
        hasCutlist: false,
        bomWarning: warning,
        partCount: 0,
      });
    }
  }

  // Nếu có thêm các dòng chi phí dự án phụ trợ (extraCostLines)
  if (params.extraCostLines && params.extraCostLines.length > 0) {
    const drivers = buildProjectDrivers({
      totalSheets: 0,
      partCount: params.parts?.reduce((s, p) => s + (p.qty || 1), 0) ?? 0,
    });
    const extraRes = calculateCostLines(params.extraCostLines, drivers, {
      defaultMarkup: markup,
    });
    grandBaseCost += extraRes.totalBaseCost;
    grandQuotePrice += extraRes.totalQuotePrice;
  }

  const totalGrossProfit = grandQuotePrice - grandBaseCost;
  const effectiveProfitMargin =
    grandBaseCost > 0
      ? Number((grandQuotePrice / grandBaseCost).toFixed(4))
      : markup;

  return {
    sections: sectionResults,
    totalBaseCost: grandBaseCost,
    totalQuotePrice: grandQuotePrice,
    totalGrossProfit,
    effectiveProfitMargin,
    bomWarnings,
  };
}
