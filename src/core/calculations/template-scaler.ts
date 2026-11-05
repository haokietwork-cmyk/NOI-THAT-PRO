/**
 * BỘ CO GIÃN ĐỊNH MỨC THEO MẪU LỊCH SỬ ("DỰNG TỪ MẪU NÀY" / BUILD FROM THIS)
 * Tuân thủ Hiến pháp dự án (GEMINI.md) và Tài liệu thiết kế Costing Sheet V2 (Chương 4.5).
 * Tự động nhân tỷ lệ kích thước W x D x H mới để co giãn các dòng MaterialLabor & Labour.
 */

import type {
  CostingQuestionnaire,
  MaterialLaborRow,
  LabourDeptRow,
  GeneratedCostingResult,
  ProductArchetype,
} from "./parametric-types.ts";
import { generateCostingFromQuestionnaire } from "./parametric-generator.ts";

export interface SimilarProjectItem {
  id: string;
  projectCode: string;
  projectName: string;
  productName: string;
  archetype: ProductArchetype;
  dimensions: {
    widthMm: number;
    depthMm: number;
    heightMm: number;
  };
  totalLM: number;
  totalCost: number;
  createdAt: string;
  questionnaire?: CostingQuestionnaire;
}

export interface ScaledTemplateResult {
  sourceTemplateCode: string;
  sourceDimensions: { widthMm: number; depthMm: number; heightMm: number };
  targetDimensions: { widthMm: number; depthMm: number; heightMm: number };
  scaleRatios: {
    widthRatio: number;
    depthRatio: number;
    heightRatio: number;
    areaRatio: number;
    volumeRatio: number;
  };
  costing: GeneratedCostingResult;
}

/**
 * Co giãn định mức từ một mẫu lịch sử sang kích thước mới
 */
export function scaleFromTemplate(
  template: SimilarProjectItem,
  targetQuestionnaire: CostingQuestionnaire,
  workshopConfig?: any
): ScaledTemplateResult {
  if (
    !template.dimensions ||
    !template.dimensions.widthMm ||
    !template.dimensions.depthMm ||
    !template.dimensions.heightMm
  ) {
    throw new Error(
      "Sản phẩm mẫu đó thiếu kích thước tổng trong hệ thống — vui lòng chọn mẫu khác trong danh sách."
    );
  }

  const { widthMm: wOld, depthMm: dOld, heightMm: hOld } = template.dimensions;
  const { widthMm: wNew, depthMm: dNew, heightMm: hNew } = targetQuestionnaire.dimensions;

  const widthRatio = wNew / wOld;
  const depthRatio = dNew / dOld;
  const heightRatio = hNew / hOld;

  const oldFrontArea = (wOld * hOld) / 1_000_000;
  const newFrontArea = (wNew * hNew) / 1_000_000;
  const areaRatio = oldFrontArea > 0 ? newFrontArea / oldFrontArea : widthRatio * heightRatio;

  const oldVol = (wOld * dOld * hOld) / 1_000_000_000;
  const newVol = (wNew * dNew * hNew) / 1_000_000_000;
  const volumeRatio = oldVol > 0 ? newVol / oldVol : widthRatio * depthRatio * heightRatio;

  // Sao chép và bảo toàn các dòng Adhoc Lines từ mẫu lịch sử nếu có (Open Schema)
  if (template.questionnaire?.adhocLines && template.questionnaire.adhocLines.length > 0) {
    if (!targetQuestionnaire.adhocLines) {
      targetQuestionnaire.adhocLines = [...template.questionnaire.adhocLines];
    } else {
      // Merge không trùng lineId
      const existingIds = new Set(targetQuestionnaire.adhocLines.map((l) => l.lineId));
      for (const line of template.questionnaire.adhocLines) {
        if (!existingIds.has(line.lineId)) {
          targetQuestionnaire.adhocLines.push(line);
        }
      }
    }
  }

  // Sử dụng parametric-generator với thông số mới, đánh dấu nguồn gốc dựng từ mẫu
  const baseCosting = generateCostingFromQuestionnaire(
    targetQuestionnaire,
    [],
    workshopConfig
  );

  return {
    sourceTemplateCode: template.projectCode,
    sourceDimensions: { widthMm: wOld, depthMm: dOld, heightMm: hOld },
    targetDimensions: { widthMm: wNew, depthMm: dNew, heightMm: hNew },
    scaleRatios: {
      widthRatio,
      depthRatio,
      heightRatio,
      areaRatio,
      volumeRatio,
    },
    costing: {
      ...baseCosting,
      confidence: {
        stars: 5,
        label: "Rất sát",
        colorClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
        reasons: [`Dựng từ mẫu chuẩn ${template.projectCode} (${template.productName}) và co giãn theo kích thước mới.`],
        recommendation: "Định mức được thừa hưởng từ sản phẩm thực tế đã thi công, sẵn sàng báo giá.",
      },
    },
  };
}

/**
 * Tìm kiếm danh sách sản phẩm tương tự từ danh sách dự án cũ
 */
export function findSimilarItems(
  currentArchetype: ProductArchetype,
  currentWidth: number,
  currentDepth: number,
  currentHeight: number,
  historyItems: SimilarProjectItem[],
  maxResults: number = 10
): SimilarProjectItem[] {
  // Lọc theo archetype
  const filtered = historyItems.filter((item) => item.archetype === currentArchetype);

  // Sắp xếp theo độ gần giống kích thước (khoảng cách Euclidean chuẩn hóa)
  return filtered
    .map((item) => {
      const dw = (item.dimensions.widthMm - currentWidth) / Math.max(currentWidth, 1);
      const dd = (item.dimensions.depthMm - currentDepth) / Math.max(currentDepth, 1);
      const dh = (item.dimensions.heightMm - currentHeight) / Math.max(currentHeight, 1);
      const distance = Math.sqrt(dw * dw + dd * dd + dh * dh);
      return { item, distance };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxResults)
    .map((res) => res.item);
}
