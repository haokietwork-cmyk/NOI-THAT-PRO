import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type {
  CostLine,
  ProjectDrivers,
  QuantityRule,
} from "./cost-line-types.ts";
import {
  buildProjectDrivers,
  resolveQuantityFromRule,
} from "./cost-line-resolver.ts";
import { calculateCostLines } from "./cost-lines-engine.ts";

describe("cost-lines: Bộ phân giải số lượng (QuantityRule Resolver)", () => {
  const sampleDrivers: ProjectDrivers = buildProjectDrivers({
    totalSheets: 10,
    boardAreaNetM2: 25.5,
    boardAreaGrossM2: 29.325,
    edgeLengthMd: 80,
    partCount: 30,
    moduleCount: 2,
    taggedPartCounts: {
      panel_door: 6,
      storage_drawer: 4,
    },
    parts: [
      { lengthMm: 800, widthMm: 400, qty: 2, tag: "panel_door" },
      { lengthMm: 1400, widthMm: 450, qty: 4, tag: "panel_door" },
      { lengthMm: 2200, widthMm: 600, qty: 2, tag: "panel_tall" },
      { lengthMm: 500, widthMm: 350, qty: 4, tag: "storage_drawer" },
    ],
  });

  it("Quy tắc 'fixed': Số lượng cố định mỗi dự án/hạng mục", () => {
    const rule: QuantityRule = {
      kind: "fixed",
      multiplier: 3,
    };
    const qty = resolveQuantityFromRule(rule, sampleDrivers);
    assert.equal(qty, 3);
  });

  it("Quy tắc 'perDriver': Số lượng tỷ lệ theo biến đo lường dự án", () => {
    // Theo tổng số tấm
    const ruleSheets: QuantityRule = {
      kind: "perDriver",
      driver: "totalSheets",
      multiplier: 1.5,
    };
    assert.equal(resolveQuantityFromRule(ruleSheets, sampleDrivers), 15);

    // Theo mét dài dán cạnh
    const ruleEdge: QuantityRule = {
      kind: "perDriver",
      driver: "edgeLengthMd",
      multiplier: 0.05,
    };
    assert.equal(resolveQuantityFromRule(ruleEdge, sampleDrivers), 4);
  });

  it("Quy tắc 'tiers': Bậc thang theo kích thước chi tiết", () => {
    const ruleTiers: QuantityRule = {
      kind: "tiers",
      tierThresholds: {
        driverProperty: "partLengthMm",
        thresholds: [
          { maxValMm: 900, qty: 2 },   // 800mm -> 2 cái * 2 tấm = 4
          { maxValMm: 1500, qty: 3 },  // 1400mm -> 3 cái * 4 tấm = 12
          { maxValMm: 2000, qty: 4 },
          { maxValMm: 2700, qty: 5 },  // 2200mm -> 5 cái * 2 tấm = 10
        ],                             // 500mm -> 2 cái * 4 tấm = 8
      },                               // Tổng = 4 + 12 + 10 + 8 = 34
    };
    const qty = resolveQuantityFromRule(ruleTiers, sampleDrivers);
    assert.equal(qty, 34);
  });

  it("Quy tắc 'perTaggedPart': Đếm chi tiết mang nhãn định danh", () => {
    const ruleDoor: QuantityRule = {
      kind: "perTaggedPart",
      tag: "panel_door",
      multiplier: 1,
    };
    assert.equal(resolveQuantityFromRule(ruleDoor, sampleDrivers), 6);

    const ruleDrawer: QuantityRule = {
      kind: "perTaggedPart",
      tag: "storage_drawer",
      multiplier: 1,
    };
    assert.equal(resolveQuantityFromRule(ruleDrawer, sampleDrivers), 4);
  });

  it("Quy tắc 'percentOfGroup': Tỷ lệ phần trăm giá vốn của nhóm khác", () => {
    const interimCosts = {
      wood_boards: 10_000_000,
      accessories: 2_000_000,
    };
    const rulePercent: QuantityRule = {
      kind: "percentOfGroup",
      targetGroup: "wood_boards",
      percentage: 5, // 5% của 10.000.000 = 500.000
    };
    const qty = resolveQuantityFromRule(rulePercent, sampleDrivers, interimCosts);
    assert.equal(qty, 500_000);
  });

  it("Quy tắc 'manual': Người dùng nhập số lượng trực tiếp", () => {
    const ruleManual: QuantityRule = {
      kind: "manual",
      manualQty: 12.5,
    };
    assert.equal(resolveQuantityFromRule(ruleManual, sampleDrivers), 12.5);
  });

  it("Áp dụng minQty và phương thức làm tròn roundMethod", () => {
    const ruleMin: QuantityRule = {
      kind: "perDriver",
      driver: "totalSheets",
      multiplier: 0.1, // 10 * 0.1 = 1, nhưng minQty = 5
      minQty: 5,
    };
    assert.equal(resolveQuantityFromRule(ruleMin, sampleDrivers), 5);

    const ruleCeil: QuantityRule = {
      kind: "perDriver",
      driver: "totalSheets",
      multiplier: 0.35, // 10 * 0.35 = 3.5
      roundMethod: "ceil",
    };
    assert.equal(resolveQuantityFromRule(ruleCeil, sampleDrivers), 4);

    const ruleRound: QuantityRule = {
      kind: "perDriver",
      driver: "totalSheets",
      multiplier: 0.34, // 10 * 0.34 = 3.4
      roundMethod: "round",
    };
    assert.equal(resolveQuantityFromRule(ruleRound, sampleDrivers), 3);
  });
});

describe("cost-lines: Động cơ tính toán tổng quát (CostLines Engine)", () => {
  it("Tính toán chính xác đa danh mục, giá vốn và giá bán với markup mặc định 1.65", () => {
    const drivers: ProjectDrivers = buildProjectDrivers({
      totalSheets: 10,
      edgeLengthMd: 50,
    });

    const lines: CostLine[] = [
      {
        id: "line-1",
        name: "Khoản chi phí theo tấm",
        category: "supplies",
        unit: "tấm",
        unitPrice: 20_000,
        quantityRule: {
          kind: "perDriver",
          driver: "totalSheets",
          multiplier: 1,
        },
        wasteFactor: 1.0,
        group: "consumables",
        visibleOnQuote: false,
        source: "workshop_entered",
        enabled: true,
      },
      {
        id: "line-2",
        name: "Khoản nhân công theo tấm",
        category: "labor",
        unit: "tấm",
        unitPrice: 100_000,
        quantityRule: {
          kind: "perDriver",
          driver: "totalSheets",
          multiplier: 1,
        },
        wasteFactor: 1.0,
        group: "production",
        visibleOnQuote: false,
        source: "workshop_entered",
        enabled: true,
      },
      {
        id: "line-3-disabled",
        name: "Khoản đang tắt",
        category: "other",
        unit: "gói",
        unitPrice: 500_000,
        quantityRule: { kind: "fixed", multiplier: 1 },
        group: "other",
        visibleOnQuote: false,
        source: "workshop_entered",
        enabled: false,
      },
      {
        id: "line-4-custom-markup",
        name: "Thiết bị mua ngoài có markup riêng",
        category: "equipment",
        unit: "bộ",
        unitPrice: 1_000_000,
        quantityRule: { kind: "fixed", multiplier: 1 },
        wasteFactor: 1.0,
        group: "commercial",
        markupOverride: 1.2, // Markup riêng 20%
        visibleOnQuote: true,
        source: "workshop_entered",
        enabled: true,
      },
    ];

    const result = calculateCostLines(lines, drivers, { defaultMarkup: 1.65 });

    // Line 1: 10 * 20.000 = 200.000; quote = 200.000 * 1.65 = 330.000
    // Line 2: 10 * 100.000 = 1.000.000; quote = 1.000.000 * 1.65 = 1.650.000
    // Line 3: Disabled -> không tính
    // Line 4: 1 * 1.000.000 = 1.000.000; quote = 1.000.000 * 1.2 = 1.200.000
    assert.equal(result.resolvedLines.length, 3);
    assert.equal(result.totalBaseCost, 2_200_000);
    assert.equal(result.totalQuotePrice, 3_180_000); // 330k + 1650k + 1200k
    assert.equal(result.grossProfit, 980_000);

    // Kiểm tra nhóm
    assert.equal(result.groupTotals.consumables.baseCost, 200_000);
    assert.equal(result.groupTotals.production.baseCost, 1_000_000);
    assert.equal(result.groupTotals.commercial.baseCost, 1_000_000);
  });

  it("Xử lý chính xác dòng phụ thuộc % của nhóm khác (percentOfGroup)", () => {
    const drivers: ProjectDrivers = buildProjectDrivers({ totalSheets: 5 });

    const lines: CostLine[] = [
      {
        id: "line-base",
        name: "Gia công chính",
        category: "labor",
        unit: "tấm",
        unitPrice: 200_000,
        quantityRule: { kind: "perDriver", driver: "totalSheets", multiplier: 1 },
        group: "main_work",
        visibleOnQuote: false,
        source: "workshop_entered",
        enabled: true,
      },
      {
        id: "line-percent",
        name: "Phụ phí hoàn thiện (10% của nhóm gia công chính)",
        category: "other",
        unit: "gói",
        unitPrice: 1, // unitPrice = 1 để rawQuantity chính là số tiền
        quantityRule: {
          kind: "percentOfGroup",
          targetGroup: "main_work",
          percentage: 10,
        },
        group: "sub_work",
        visibleOnQuote: false,
        source: "workshop_entered",
        enabled: true,
      },
    ];

    const result = calculateCostLines(lines, drivers, { defaultMarkup: 1.65 });
    // Line base: 5 * 200.000 = 1.000.000 đ
    // Line percent: 10% của 1.000.000 = 100.000 đ
    assert.equal(result.groupTotals.main_work.baseCost, 1_000_000);
    assert.equal(result.groupTotals.sub_work.baseCost, 100_000);
    assert.equal(result.totalBaseCost, 1_100_000);
  });
});
