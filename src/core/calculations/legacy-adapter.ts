/**
 * ADAPTER CHUYỂN ĐỔI CẤU HÌNH CŨ SANG DÒNG CHI PHÍ CHUẨN
 * Chuyển WorkshopCostConfig sang CostLine[]
 * Đảm bảo 100% tính tương thích toán học và không làm đổi số vàng.
 */

import type { MaterialItem, WorkshopCostConfig } from "../types/index.ts";
import { DEFAULT_WORKSHOP_COST_CONFIG } from "../types/index.ts";
import type { CostLine } from "./cost-lines/cost-line-types.ts";

export interface LegacyHardwarePricing {
  hingeUnitPrice?: number;
  slideUnitPrice?: number;
}

export function legacyConfigToLines(
  config?: WorkshopCostConfig,
  materials?: MaterialItem[],
  customHardwarePricing?: LegacyHardwarePricing
): CostLine[] {
  const cfg = config ?? DEFAULT_WORKSHOP_COST_CONFIG;
  const suppliesRate = cfg.suppliesRatePerSheet ?? 15_000;
  const laborRate = cfg.laborRatePerSheet ?? 120_000;
  const hingesRate = cfg.hingesPerSheet ?? 2.0;
  const slidesRate = cfg.slidesPerSheet ?? 0.35;

  const hingeItem = materials?.find(
    (m) =>
      m.category === "hardware" &&
      (m.code.includes("BAN_LE") || m.name.toLowerCase().includes("bản lề"))
  );
  const slideItem = materials?.find(
    (m) =>
      m.category === "hardware" &&
      (m.code.includes("RAY") || m.name.toLowerCase().includes("ray"))
  );

  const hingeUnitPrice =
    customHardwarePricing?.hingeUnitPrice ?? hingeItem?.unitPrice ?? 28_000;
  const slideUnitPrice =
    customHardwarePricing?.slideUnitPrice ?? slideItem?.unitPrice ?? 165_000;

  const lines: CostLine[] = [
    {
      id: "line-legacy-supplies",
      name: "Vật tư phụ & phụ kiện liên kết (ốc cam, ke góc, vít, màng PE)",
      category: "supplies",
      unit: "tấm",
      unitPrice: suppliesRate,
      quantityRule: {
        kind: "perDriver",
        driver: "totalSheets",
        multiplier: 1,
      },
      wasteFactor: 1.0,
      group: "supplies",
      visibleOnQuote: false,
      source: "workshop_entered",
      enabled: suppliesRate > 0,
      notes: "Tự động sinh từ định mức vật tư phụ theo tấm",
    },
    {
      id: "line-legacy-labor",
      name: "Nhân công CNC & hoàn thiện xưởng",
      category: "labor",
      unit: "tấm",
      unitPrice: laborRate,
      quantityRule: {
        kind: "perDriver",
        driver: "totalSheets",
        multiplier: 1,
      },
      wasteFactor: 1.0,
      group: "labor",
      visibleOnQuote: false,
      source: "workshop_entered",
      enabled: laborRate > 0,
      notes: "Tự động sinh từ đơn giá nhân công theo tấm",
    },
    {
      id: "line-legacy-hinges",
      name: hingeItem?.name ?? "Bản lề bật inox 304 giảm chấn (hệ 32mm)",
      category: "hardware",
      unit: "cái",
      unitPrice: hingeUnitPrice,
      quantityRule: {
        kind: "perDriver",
        driver: "totalSheets",
        multiplier: hingesRate,
        minQty: 2,
        roundMethod: "round",
      },
      wasteFactor: 1.0,
      group: "hardware",
      visibleOnQuote: false,
      source: "workshop_entered",
      enabled: hingesRate > 0,
      notes: "Ước tính theo định mức số bản lề mỗi tấm",
    },
    {
      id: "line-legacy-slides",
      name: slideItem?.name ?? "Ray trượt âm 450mm giảm chấn mở toàn phần",
      category: "hardware",
      unit: "bộ",
      unitPrice: slideUnitPrice,
      quantityRule: {
        kind: "perDriver",
        driver: "totalSheets",
        multiplier: slidesRate,
        minQty: 1,
        roundMethod: "round",
      },
      wasteFactor: 1.0,
      group: "hardware",
      visibleOnQuote: false,
      source: "workshop_entered",
      enabled: slidesRate > 0,
      notes: "Ước tính theo định mức số ray trượt mỗi tấm",
    },
  ];

  const glueRate = cfg.glueRatePerMd ?? 0;
  const gluePrice = cfg.glueUnitPrice ?? 0;
  if (glueRate > 0 && gluePrice > 0) {
    lines.push({
      id: "line-legacy-glue",
      name: "Keo hạt dán cạnh nhiệt độ cao",
      category: "supplies",
      unit: "kg",
      unitPrice: gluePrice,
      quantityRule: {
        kind: "perDriver",
        driver: "edgeLengthMd",
        multiplier: glueRate,
      },
      wasteFactor: 1.0,
      group: "supplies",
      visibleOnQuote: false,
      source: "workshop_entered",
      enabled: true,
      notes: "Ước tính theo mét dài dán cạnh",
    });
  }

  return lines;
}
