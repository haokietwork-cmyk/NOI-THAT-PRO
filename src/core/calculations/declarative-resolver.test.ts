import test from "node:test";
import assert from "node:assert/strict";
import {
  buildDimensionContext,
  evaluateMathExpression,
  evaluateCondition,
  resolveDeclarativeRules,
  DEFAULT_COST_GROUPS,
} from "./declarative-resolver.ts";
import type {
  CostGroupConfig,
  DeclarativeLineRule,
  AdhocCostLine,
} from "./open-schema-types.ts";

test("declarative-resolver: REQ: OPEN-DIM-1 - BaseDimensionContext tính đúng biến hình học cơ sở", () => {
  // Tủ kích thước: Rộng 1800mm, Sâu 600mm, Cao 2400mm
  const ctx = buildDimensionContext(
    { widthMm: 1800, depthMm: 600, heightMm: 2400 },
    { drawers: 2, hasStone: true }
  );

  assert.equal(ctx.W, 1.8);
  assert.equal(ctx.D, 0.6);
  assert.equal(ctx.H, 2.4);
  assert.equal(ctx.QTY, 1);

  // FACE_AREA = 1.8 * 2.4 = 4.32 m2
  assert.equal(Number(ctx.FACE_AREA.toFixed(4)), 4.32);

  // TOP_AREA = 1.8 * 0.6 = 1.08 m2
  assert.equal(Number(ctx.TOP_AREA.toFixed(4)), 1.08);

  // SIDE_AREA = 0.6 * 2.4 = 1.44 m2
  assert.equal(Number(ctx.SIDE_AREA.toFixed(4)), 1.44);

  // BOX_SURFACE = 2 * (1.8*2.4 + 1.8*0.6 + 0.6*2.4) = 2 * (4.32 + 1.08 + 1.44) = 2 * 6.84 = 13.68 m2
  assert.equal(Number(ctx.BOX_SURFACE.toFixed(4)), 13.68);

  // PERIMETER_TOP = 2 * (1.8 + 0.6) = 4.8 m
  assert.equal(Number(ctx.PERIMETER_TOP.toFixed(4)), 4.8);

  // PERIMETER_FACE = 2 * (1.8 + 2.4) = 8.4 m
  assert.equal(Number(ctx.PERIMETER_FACE.toFixed(4)), 8.4);

  // VOLUME = 1.8 * 0.6 * 2.4 = 2.592 m3
  assert.equal(Number(ctx.VOLUME.toFixed(4)), 2.592);

  // Truy cập params
  assert.equal(ctx.params.drawers, 2);
  assert.equal(ctx.params.hasStone, true);
});

test("declarative-resolver: REQ: OPEN-MATH-2 - Đánh giá an toàn biểu thức toán học không dùng eval", () => {
  const ctx = buildDimensionContext(
    { widthMm: 2000, depthMm: 500, heightMm: 1000 },
    { shelves: 3, drawerCount: 4 }
  );
  // W=2, D=0.5, H=1 -> TOP_AREA = 1.0, FACE_AREA = 2.0

  assert.equal(evaluateMathExpression("TOP_AREA * 1.05", ctx), 1.05);
  assert.equal(evaluateMathExpression("FACE_AREA * 2.5 + 0.5", ctx), 5.5);
  assert.equal(evaluateMathExpression("params.drawerCount * 2", ctx), 8);
  assert.equal(evaluateMathExpression("(W + D) * 2", ctx), 5);
  assert.equal(evaluateMathExpression("params.shelves * TOP_AREA", ctx), 3);
  assert.equal(evaluateMathExpression("42", ctx), 42);
});

test("declarative-resolver: REQ: OPEN-COND-3 - Đánh giá điều kiện whenExpression", () => {
  const ctx = buildDimensionContext(
    { widthMm: 1800, depthMm: 600, heightMm: 2400 },
    { hasStone: true, hasGlass: false, drawerCount: 3, finish: "Melamine" }
  );

  assert.equal(evaluateCondition("params.hasStone == true", ctx), true);
  assert.equal(evaluateCondition("params.hasGlass == true", ctx), false);
  assert.equal(evaluateCondition("params.drawerCount > 0", ctx), true);
  assert.equal(evaluateCondition("params.drawerCount > 5", ctx), false);
  assert.equal(evaluateCondition("params.finish == 'Melamine'", ctx), true);
  assert.equal(evaluateCondition("params.finish == 'Son2K'", ctx), false);
  assert.equal(evaluateCondition(undefined, ctx), true);
});

test("declarative-resolver: REQ: OPEN-OH-4 - Kiểm soát Overhead qua Behavior Tags thay vì hardcode tên", () => {
  const groups: CostGroupConfig[] = [
    { groupKey: "stone", label: "Đá", overheadTier: "exempt_no_oh", sortOrder: 1 },
    { groupKey: "rattan", label: "Mây tre đan", overheadTier: "subcon_light", sortOrder: 2 },
    { groupKey: "wood", label: "Ván gỗ", overheadTier: "workshop_full", sortOrder: 3 },
  ];

  const rules: DeclarativeLineRule[] = [
    {
      ruleId: "r_stone",
      blockName: "Stone",
      costGroupKey: "stone",
      descriptionTemplate: "Mặt đá Vicostone",
      quantityExpression: "TOP_AREA",
      unit: "m2",
      wasteRate: 0.05,
      roundingMode: "none",
      defaultUnitPrice: 2000000,
    },
    {
      ruleId: "r_wood",
      blockName: "Carcass",
      costGroupKey: "wood",
      descriptionTemplate: "Ván thùng",
      quantityExpression: "BOX_SURFACE",
      unit: "m2",
      wasteRate: 0.15,
      roundingMode: "none",
      defaultUnitPrice: 150000,
    },
    {
      ruleId: "r_rattan",
      blockName: "Fronts",
      costGroupKey: "rattan",
      descriptionTemplate: "Mây mắt cáo thầu phụ",
      quantityExpression: "FACE_AREA * 0.5",
      unit: "m2",
      wasteRate: 0.1,
      roundingMode: "none",
      defaultUnitPrice: 400000,
    },
  ];

  const result = resolveDeclarativeRules(
    { widthMm: 1800, depthMm: 600, heightMm: 2400 },
    {},
    rules,
    [],
    groups,
    { workshopOhRate: 0.3, subcontractOhRate: 0.1 }
  );

  // Dòng đá: exempt_no_oh -> ohRate = 0, ohAmount = 0
  const stoneLine = result.lines.find((l) => l.costGroupKey === "stone");
  assert.ok(stoneLine);
  assert.equal(stoneLine.overheadTier, "exempt_no_oh");
  assert.equal(stoneLine.ohRate, 0);
  assert.equal(stoneLine.ohAmount, 0);

  // Dòng gỗ: workshop_full -> ohRate = 0.3 (30%)
  const woodLine = result.lines.find((l) => l.costGroupKey === "wood");
  assert.ok(woodLine);
  assert.equal(woodLine.overheadTier, "workshop_full");
  assert.equal(woodLine.ohRate, 0.3);
  assert.equal(woodLine.ohAmount, Math.round(woodLine.totalCost * 0.3));

  // Dòng mây: subcon_light -> ohRate = 0.1 (10%)
  const rattanLine = result.lines.find((l) => l.costGroupKey === "rattan");
  assert.ok(rattanLine);
  assert.equal(rattanLine.overheadTier, "subcon_light");
  assert.equal(rattanLine.ohRate, 0.1);
  assert.equal(rattanLine.ohAmount, Math.round(rattanLine.totalCost * 0.1));
});

test("declarative-resolver: REQ: OPEN-ROUND-5 - Quy đổi đơn vị tiêu chuẩn roundingMode & standardUnitSize", () => {
  const groups = DEFAULT_COST_GROUPS;

  const rules: DeclarativeLineRule[] = [
    {
      ruleId: "r1",
      blockName: "Carcass",
      costGroupKey: "wood",
      descriptionTemplate: "Ván tấm 1220x2440",
      quantityExpression: "5.5", // 5.5 m2
      unit: "tấm",
      wasteRate: 0,
      roundingMode: "ceil_standard_unit",
      standardUnitSize: 2.9768, // 5.5 / 2.9768 = 1.847 -> 2 tấm
      defaultUnitPrice: 500000,
    },
    {
      ruleId: "r2",
      blockName: "Metal",
      costGroupKey: "metal",
      descriptionTemplate: "Cây nhôm Slim 6m",
      quantityExpression: "14", // 14 mét dài
      unit: "cây",
      wasteRate: 0,
      roundingMode: "ceil_standard_unit",
      standardUnitSize: 6, // 14 / 6 = 2.33 -> 3 cây
      defaultUnitPrice: 300000,
    },
    {
      ruleId: "r3",
      blockName: "Hardware",
      costGroupKey: "hardware",
      descriptionTemplate: "Bản lề",
      quantityExpression: "4.2",
      unit: "cái",
      wasteRate: 0,
      roundingMode: "ceil_whole_number", // 4.2 -> 5 cái
      defaultUnitPrice: 35000,
    },
  ];

  const result = resolveDeclarativeRules(
    { widthMm: 1000, depthMm: 1000, heightMm: 1000 },
    {},
    rules,
    [],
    groups
  );

  const sheetLine = result.lines.find((l) => l.unit === "tấm");
  assert.equal(sheetLine?.effectiveQuantity, 2);

  const barLine = result.lines.find((l) => l.unit === "cây");
  assert.equal(barLine?.effectiveQuantity, 3);

  const hwLine = result.lines.find((l) => l.unit === "cái");
  assert.equal(hwLine?.effectiveQuantity, 5);
});

test("declarative-resolver: REQ: OPEN-ADHOC-6 - Chèn Ad-hoc Cost Line tự do cho vật liệu/kỹ thuật lạ", () => {
  const adhocLines: AdhocCostLine[] = [
    {
      lineId: "adhoc_gold",
      blockName: "LuxuryFinishing",
      costGroupKey: "gold_leaf",
      overheadTierOverride: "subcon_light",
      description: "Dát vàng Ý 24K viền phào chỉ",
      unit: "md",
      quantityOrExpression: "PERIMETER_FACE", // Dùng biến chu vi mặt tiền
      unitPrice: 150000,
      wasteRate: 0.1,
    },
    {
      lineId: "adhoc_sensor",
      blockName: "SmartTech",
      costGroupKey: "smart_tech",
      overheadTierOverride: "exempt_no_oh", // Hàng điện tử đắt tiền miễn OH
      description: "Bộ cảm biến chuyển động Zigbee âm tủ",
      unit: "bộ",
      quantityOrExpression: 2,
      unitPrice: 850000,
      wasteRate: 0,
    },
  ];

  const result = resolveDeclarativeRules(
    { widthMm: 1800, depthMm: 600, heightMm: 2400 }, // PERIMETER_FACE = 2 * (1.8 + 2.4) = 8.4m
    {},
    [],
    adhocLines
  );

  assert.equal(result.lines.length, 2);

  const goldLine = result.lines.find((l) => l.id === "adhoc_gold");
  assert.ok(goldLine);
  assert.equal(goldLine.isAdhoc, true);
  assert.equal(goldLine.rawQuantity, 8.4);
  assert.equal(goldLine.effectiveQuantity, 9.24); // 8.4 * 1.1 = 9.24
  assert.equal(goldLine.overheadTier, "subcon_light");
  assert.equal(goldLine.ohRate, 0.1);

  const sensorLine = result.lines.find((l) => l.id === "adhoc_sensor");
  assert.ok(sensorLine);
  assert.equal(sensorLine.effectiveQuantity, 2);
  assert.equal(sensorLine.overheadTier, "exempt_no_oh");
  assert.equal(sensorLine.ohAmount, 0); // 0% OH

  // Kiểm tra nhóm động trong summary
  assert.ok(result.summary.groupTotals["gold_leaf"] > 0);
  assert.equal(result.summary.groupTotals["smart_tech"], 2 * 850000);
});
