/**
 * BỘ PHÂN GIẢI SỐ LƯỢNG CHO DÒNG CHI PHÍ (COST LINE RESOLVER)
 * Thực thi các phép tính toán học thuần túy trên 6 kind quy tắc định sẵn.
 * Tuyệt đối không dùng eval(), không phụ thuộc database, không chứa tên vật tư cụ thể.
 */

import type {
  PartDimension,
  ProjectDrivers,
  QuantityRule,
} from "./cost-line-types.ts";

/**
 * Phân giải số lượng thô và số lượng sau quy tắc cho một dòng chi phí
 */
export function resolveQuantityFromRule(
  rule: QuantityRule,
  drivers: ProjectDrivers,
  interimGroupBaseCosts?: Record<string, number>
): number {
  let raw = 0;

  switch (rule.kind) {
    case "fixed": {
      raw = rule.multiplier ?? 1;
      break;
    }

    case "perDriver": {
      const driverKey = rule.driver ?? "totalSheets";
      const driverVal = drivers[driverKey] ?? 0;
      raw = driverVal * (rule.multiplier ?? 1);
      break;
    }

    case "tiers": {
      if (rule.tierThresholds && drivers.parts && drivers.parts.length > 0) {
        const prop = rule.tierThresholds.driverProperty;
        const sortedTiers = [...rule.tierThresholds.thresholds].sort(
          (a, b) => a.maxValMm - b.maxValMm
        );
        let sum = 0;
        for (const part of drivers.parts) {
          const val = prop === "partWidthMm" ? part.widthMm : part.lengthMm;
          const matched =
            sortedTiers.find((t) => val <= t.maxValMm) ??
            sortedTiers[sortedTiers.length - 1];
          const qtyPerPart = matched?.qty ?? 0;
          const partQty = part.qty > 0 ? part.qty : 1;
          sum += qtyPerPart * partQty;
        }
        raw = sum;
      } else {
        raw = 0;
      }
      break;
    }

    case "perTaggedPart": {
      const targetTag = rule.tag ?? "";
      let count = 0;
      if (
        drivers.taggedPartCounts &&
        drivers.taggedPartCounts[targetTag] !== undefined
      ) {
        count = drivers.taggedPartCounts[targetTag];
      } else if (drivers.parts && drivers.parts.length > 0) {
        count = drivers.parts
          .filter((p) => p.tag === targetTag)
          .reduce((s, p) => s + (p.qty > 0 ? p.qty : 1), 0);
      }
      raw = count * (rule.multiplier ?? 1);
      break;
    }

    case "percentOfGroup": {
      const targetCost = interimGroupBaseCosts?.[rule.targetGroup ?? ""] ?? 0;
      raw = (targetCost * (rule.percentage ?? 0)) / 100;
      break;
    }

    case "manual": {
      raw = rule.manualQty ?? 0;
      break;
    }

    default: {
      raw = 0;
      break;
    }
  }

  // Áp dụng số lượng tối thiểu nếu cấu hình
  if (rule.minQty !== undefined && raw < rule.minQty) {
    raw = rule.minQty;
  }

  // Áp dụng phương thức làm tròn số lượng
  if (rule.roundMethod === "round") {
    raw = Math.round(raw);
  } else if (rule.roundMethod === "ceil") {
    raw = Math.ceil(raw);
  } else if (rule.roundMethod === "floor") {
    raw = Math.floor(raw);
  }

  return Number(raw.toFixed(4));
}

/**
 * Tạo đối tượng ProjectDrivers từ các số liệu đầu vào
 */
export function buildProjectDrivers(params: {
  totalSheets?: number;
  boardAreaNetM2?: number;
  boardAreaGrossM2?: number;
  edgeLengthMd?: number;
  partCount?: number;
  moduleCount?: number;
  taggedPartCounts?: Record<string, number>;
  parts?: PartDimension[];
}): ProjectDrivers {
  return {
    totalSheets: params.totalSheets ?? 0,
    boardAreaNetM2: params.boardAreaNetM2 ?? 0,
    boardAreaGrossM2: params.boardAreaGrossM2 ?? 0,
    edgeLengthMd: params.edgeLengthMd ?? 0,
    partCount:
      params.partCount ??
      params.parts?.reduce((s, p) => s + (p.qty > 0 ? p.qty : 1), 0) ??
      0,
    moduleCount: params.moduleCount ?? 0,
    taggedPartCounts: params.taggedPartCounts ?? {},
    parts: params.parts ?? [],
  };
}
