import { z } from "zod";
import type { WorkshopCostConfig, HingeHeightThreshold } from "../types/index.ts";
import { DEFAULT_WORKSHOP_COST_CONFIG, DEFAULT_HINGE_THRESHOLDS } from "../types/index.ts";

/**
 * Zod Schema kiểm duyệt Ngưỡng bản lề theo chiều cao cánh
 */
export const HingeHeightThresholdSchema = z.object({
  maxHeightMm: z.number().min(100, "Chiều cao cánh tối thiểu 100mm").max(5000, "Chiều cao cánh tối đa 5000mm"),
  hingeCount: z.number().int().min(1, "Tối thiểu 1 bản lề").max(20, "Tối đa 20 bản lề"),
});

/**
 * Zod Schema kiểm duyệt Cấu hình Đơn giá & Định mức xưởng (WorkshopCostConfig)
 * Quy tắc:
 * - Không âm (>= 0)
 * - Có trần vật lý/thị trường hợp lý
 * - Định mức keo và ngưỡng bản lề tùy chỉnh theo xưởng, không gán cứng
 * - Tự động fallback về mặc định chuẩn xưởng nếu giá trị rỗng/không hợp lệ
 */
export const WorkshopCostConfigSchema = z.object({
  suppliesRatePerSheet: z
    .number()
    .min(0, "Định mức vật tư phụ không được âm")
    .max(500_000, "Định mức vật tư phụ không được vượt quá 500.000 đ/tấm")
    .default(DEFAULT_WORKSHOP_COST_CONFIG.suppliesRatePerSheet),

  laborRatePerSheet: z
    .number()
    .min(0, "Đơn giá nhân công không được âm")
    .max(1_000_000, "Đơn giá nhân công không được vượt quá 1.000.000 đ/tấm")
    .default(DEFAULT_WORKSHOP_COST_CONFIG.laborRatePerSheet),

  hingesPerSheet: z
    .number()
    .min(0, "Định mức bản lề không được âm")
    .max(20, "Định mức bản lề không được vượt quá 20 cái/tấm")
    .default(DEFAULT_WORKSHOP_COST_CONFIG.hingesPerSheet),

  slidesPerSheet: z
    .number()
    .min(0, "Định mức ray trượt không được âm")
    .max(10, "Định mức ray trượt không được vượt quá 10 bộ/tấm")
    .default(DEFAULT_WORKSHOP_COST_CONFIG.slidesPerSheet),

  hingeThresholds: z
    .array(HingeHeightThresholdSchema)
    .optional()
    .default(DEFAULT_HINGE_THRESHOLDS),

  glueRatePerMd: z
    .number()
    .min(0, "Định mức keo không được âm")
    .max(1, "Định mức keo không vượt quá 1 kg/md")
    .optional()
    .default(0),

  glueUnitPrice: z
    .number()
    .min(0, "Đơn giá keo không được âm")
    .max(1_000_000, "Đơn giá keo không vượt quá 1.000.000 đ/kg")
    .optional()
    .default(0),
});

export type ValidatedWorkshopCostConfig = z.infer<typeof WorkshopCostConfigSchema>;

/**
 * Làm sạch và chuẩn hóa cấu hình xưởng.
 * Đảm bảo mọi giá trị đầu vào đều an toàn, không âm, không vượt trần, và fallback về default nếu thiếu.
 */
export function validateAndSanitizeCostConfig(input: unknown): WorkshopCostConfig {
  if (!input || typeof input !== "object") {
    return { ...DEFAULT_WORKSHOP_COST_CONFIG };
  }

  const raw = input as Record<string, unknown>;

  const parsed = WorkshopCostConfigSchema.safeParse({
    suppliesRatePerSheet:
      typeof raw.suppliesRatePerSheet === "number" && !isNaN(raw.suppliesRatePerSheet)
        ? raw.suppliesRatePerSheet
        : DEFAULT_WORKSHOP_COST_CONFIG.suppliesRatePerSheet,
    laborRatePerSheet:
      typeof raw.laborRatePerSheet === "number" && !isNaN(raw.laborRatePerSheet)
        ? raw.laborRatePerSheet
        : DEFAULT_WORKSHOP_COST_CONFIG.laborRatePerSheet,
    hingesPerSheet:
      typeof raw.hingesPerSheet === "number" && !isNaN(raw.hingesPerSheet)
        ? raw.hingesPerSheet
        : DEFAULT_WORKSHOP_COST_CONFIG.hingesPerSheet,
    slidesPerSheet:
      typeof raw.slidesPerSheet === "number" && !isNaN(raw.slidesPerSheet)
        ? raw.slidesPerSheet
        : DEFAULT_WORKSHOP_COST_CONFIG.slidesPerSheet,
    hingeThresholds: Array.isArray(raw.hingeThresholds)
      ? raw.hingeThresholds
      : DEFAULT_WORKSHOP_COST_CONFIG.hingeThresholds,
    glueRatePerMd:
      typeof raw.glueRatePerMd === "number" && !isNaN(raw.glueRatePerMd)
        ? raw.glueRatePerMd
        : DEFAULT_WORKSHOP_COST_CONFIG.glueRatePerMd ?? 0,
    glueUnitPrice:
      typeof raw.glueUnitPrice === "number" && !isNaN(raw.glueUnitPrice)
        ? raw.glueUnitPrice
        : DEFAULT_WORKSHOP_COST_CONFIG.glueUnitPrice ?? 0,
  });

  if (parsed.success) {
    return parsed.data;
  }

  // Trường hợp có giá trị vượt trần hoặc âm, clamp lại về ngưỡng an toàn
  const clamp = (val: unknown, min: number, max: number, fallback: number): number => {
    const num = Number(val);
    if (isNaN(num)) return fallback;
    return Math.max(min, Math.min(max, num));
  };

  const sanitizeHingeThresholds = (thresholds: unknown): HingeHeightThreshold[] => {
    if (!Array.isArray(thresholds) || thresholds.length === 0) {
      return [...DEFAULT_HINGE_THRESHOLDS];
    }
    return thresholds
      .map((t) => {
        if (!t || typeof t !== "object") return null;
        const maxH = Number(t.maxHeightMm);
        const count = Number(t.hingeCount);
        if (isNaN(maxH) || isNaN(count)) return null;
        return {
          maxHeightMm: Math.max(100, Math.min(5000, maxH)),
          hingeCount: Math.max(1, Math.min(20, Math.round(count))),
        };
      })
      .filter((t): t is HingeHeightThreshold => t !== null);
  };

  return {
    suppliesRatePerSheet: clamp(raw.suppliesRatePerSheet, 0, 500_000, DEFAULT_WORKSHOP_COST_CONFIG.suppliesRatePerSheet),
    laborRatePerSheet: clamp(raw.laborRatePerSheet, 0, 1_000_000, DEFAULT_WORKSHOP_COST_CONFIG.laborRatePerSheet),
    hingesPerSheet: clamp(raw.hingesPerSheet, 0, 20, DEFAULT_WORKSHOP_COST_CONFIG.hingesPerSheet),
    slidesPerSheet: clamp(raw.slidesPerSheet, 0, 10, DEFAULT_WORKSHOP_COST_CONFIG.slidesPerSheet),
    hingeThresholds: sanitizeHingeThresholds(raw.hingeThresholds),
    glueRatePerMd: clamp(raw.glueRatePerMd, 0, 1, 0),
    glueUnitPrice: clamp(raw.glueUnitPrice, 0, 1_000_000, 0),
  };
}
