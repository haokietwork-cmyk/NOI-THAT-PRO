/**
 * THƯ VIỆN MẪU XƯỞNG DÒNG CHI PHÍ (WORKSHOP COST LINE PRESETS)
 * Tuân thủ Rule 14, 15 (GEMINI.md & AGENT_RUNBOOK.md)
 * Các preset cấu trúc định hình sẵn cho các mô hình xưởng nội thất Việt Nam.
 * Đơn giá và định mức mặc định nếu có đều được gắn nhãn tham khảo rõ ràng.
 */

import type { CostLine } from "./cost-lines/cost-line-types.ts";

/**
 * 1. MẪU XƯỞNG VÁN CÔNG NGHIỆP (MDF / MFC / HDF / PLYWOOD)
 * Định hình các dòng vật tư phụ, nhân công, bản lề, ray trượt và keo dán cạnh.
 */
export function createIndustrialWorkshopPreset(options?: {
  suppliesUnitPrice?: number;
  laborUnitPrice?: number;
  hingeUnitPrice?: number;
  slideUnitPrice?: number;
  glueRatePerMd?: number;
  glueUnitPrice?: number;
}): CostLine[] {
  return [
    {
      id: "preset-industrial-supplies",
      name: "Vật tư phụ liên kết (ốc cam, ke góc, vít gỗ, màng PE)",
      category: "supplies",
      unit: "tấm",
      unitPrice: options?.suppliesUnitPrice ?? 15_000,
      quantityRule: {
        kind: "perDriver",
        driver: "totalSheets",
        multiplier: 1,
      },
      wasteFactor: 1.0,
      group: "supplies",
      visibleOnQuote: false,
      source: "workshop_entered",
      enabled: true,
      notes: "Định mức theo tấm ván tiêu chuẩn của xưởng",
    },
    {
      id: "preset-industrial-labor",
      name: "Nhân công CNC & hoàn thiện xưởng",
      category: "labor",
      unit: "tấm",
      unitPrice: options?.laborUnitPrice ?? 120_000,
      quantityRule: {
        kind: "perDriver",
        driver: "totalSheets",
        multiplier: 1,
      },
      wasteFactor: 1.0,
      group: "labor",
      visibleOnQuote: false,
      source: "workshop_entered",
      enabled: true,
      notes: "Đơn giá gia công, cắt dán và ráp hoàn thiện",
    },
    {
      id: "preset-industrial-hinges",
      name: "Bản lề bật inox 304 giảm chấn (hệ 32mm)",
      category: "hardware",
      unit: "cái",
      unitPrice: options?.hingeUnitPrice ?? 28_000,
      quantityRule: {
        kind: "tiers",
        tierThresholds: {
          driverProperty: "partLengthMm",
          thresholds: [
            { maxValMm: 900, qty: 2 },
            { maxValMm: 1500, qty: 3 },
            { maxValMm: 2000, qty: 4 },
            { maxValMm: 2700, qty: 5 },
          ],
        },
      },
      wasteFactor: 1.0,
      group: "hardware",
      visibleOnQuote: false,
      source: "default_reference",
      enabled: true,
      notes: "Tự động phân bổ số lượng bản lề theo chiều cao cánh tủ",
    },
    {
      id: "preset-industrial-slides",
      name: "Ray trượt âm 450mm giảm chấn mở toàn phần",
      category: "hardware",
      unit: "bộ",
      unitPrice: options?.slideUnitPrice ?? 165_000,
      quantityRule: {
        kind: "perTaggedPart",
        tag: "drawer",
        multiplier: 1,
      },
      wasteFactor: 1.0,
      group: "hardware",
      visibleOnQuote: false,
      source: "default_reference",
      enabled: true,
      notes: "Tự động tính theo số lượng hộc kéo có gắn nhãn 'drawer'",
    },
    {
      id: "preset-industrial-glue",
      name: "Keo hạt dán cạnh nhiệt độ cao",
      category: "supplies",
      unit: "kg",
      unitPrice: options?.glueUnitPrice ?? 0,
      quantityRule: {
        kind: "perDriver",
        driver: "edgeLengthMd",
        multiplier: options?.glueRatePerMd ?? 0,
      },
      wasteFactor: 1.0,
      group: "supplies",
      visibleOnQuote: false,
      source: "workshop_entered",
      enabled: (options?.glueRatePerMd ?? 0) > 0 && (options?.glueUnitPrice ?? 0) > 0,
      notes: "Mặc định tham khảo: 0. Hãy nhập định mức thực tế của xưởng",
    },
  ];
}

/**
 * 2. MẪU XƯỞNG THẦU THI CÔNG TRỌN GÓI (ĐÁ, KÍNH, VẬN CHUYỂN, THIẾT BỊ)
 */
export function createTurnkeyContractorPreset(): CostLine[] {
  return [
    {
      id: "preset-turnkey-logistics",
      name: "Vận chuyển và bốc xếp công trình",
      category: "service",
      unit: "chuyến",
      unitPrice: 500_000,
      quantityRule: {
        kind: "fixed",
        multiplier: 1,
      },
      wasteFactor: 1.0,
      group: "logistics",
      markupOverride: 1.15,
      visibleOnQuote: true,
      source: "workshop_entered",
      enabled: true,
      notes: "Xe tải 1.5 tấn và đội bốc vác lên tầng",
    },
    {
      id: "preset-turnkey-stone",
      name: "Mặt đá bếp nhân tạo thạch anh",
      category: "face_material",
      unit: "md",
      unitPrice: 1_200_000,
      quantityRule: {
        kind: "manual",
        manualQty: 0,
      },
      wasteFactor: 1.05,
      group: "stone_glass",
      markupOverride: 1.35,
      visibleOnQuote: true,
      source: "workshop_entered",
      enabled: true,
      notes: "Đơn giá bao gồm thi công bo cạnh và khoét chậu vòi",
    },
    {
      id: "preset-turnkey-subcontract-contingency",
      name: "Phí giám sát và hao hụt công trình (5% giá thành ván)",
      category: "other",
      unit: "gói",
      unitPrice: 1,
      quantityRule: {
        kind: "percentOfGroup",
        targetGroup: "board",
        percentage: 5,
      },
      wasteFactor: 1.0,
      group: "management",
      markupOverride: 1.0,
      visibleOnQuote: false,
      source: "workshop_entered",
      enabled: false,
      notes: "Dự phòng rủi ro thi công",
    },
  ];
}
