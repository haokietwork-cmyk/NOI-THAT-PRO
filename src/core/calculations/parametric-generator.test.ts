import assert from "node:assert";
import test from "node:test";
import { generateCostingFromQuestionnaire } from "./parametric-generator.ts";
import type { CostingQuestionnaire } from "./parametric-types.ts";

test("parametric-generator: Tủ áo 2m4 x 0.6m x 2m6 (wardrobe) sinh đủ nhóm vật tư và công thợ", () => {
  const q: CostingQuestionnaire = {
    productType: "wardrobe",
    name: "Tủ áo Master kịch trần",
    dimensions: {
      widthMm: 2400,
      depthMm: 600,
      heightMm: 2600,
    },
    materials: {
      coreCode: "MDF_17_CHONG_AM",
      surfaceCode: "Melamine",
      backPanelCode: "MDF_6_HAU",
      hasStone: false,
      hasGlass: false,
      hasMetal: false,
      hasUpholstery: false,
      hasLed: true,
    },
    details: {
      doorCount: 4,
      drawerCount: 3,
    },
    calcMode: "detail",
  };

  const res = generateCostingFromQuestionnaire(q);

  // 1. Kiểm tra cấu trúc Cost Summary
  assert.ok(res.summary.wood > 0, "Tiền gỗ phải > 0");
  assert.ok(res.summary.consumables > 0, "Tiền chỉ và vật tư tiêu hao phải > 0");
  assert.ok(res.summary.hardware > 0, "Tiền phụ kiện (bản lề + ray + LED) phải > 0");
  assert.ok(res.summary.laborCostTotal > 0, "Tiền nhân công phải > 0");
  assert.strictEqual(res.summary.stone, 0, "Không chọn đá thì tiền đá = 0");

  // 2. Kiểm tra công thức OH phân tầng (Workshop 25%, Subcontract 10%)
  const expectedWorkshopBasis = res.summary.wood + res.summary.chemical + res.summary.consumables + res.summary.laborCostTotal;
  assert.strictEqual(res.summary.ohWorkshopAmount, Math.round(expectedWorkshopBasis * 0.25));
  assert.strictEqual(res.summary.ohSubcontractAmount, 0); // Không có thầu phụ
  assert.strictEqual(res.summary.totalOH, res.summary.ohWorkshopAmount);

  // 3. Kiểm tra COGS và Sales Price
  assert.strictEqual(res.summary.cogs, res.summary.totalDirectLM + res.summary.totalOH);
  assert.strictEqual(res.summary.profitAmount, Math.round(res.summary.cogs * 0.2));
  assert.strictEqual(res.summary.calculateSalesPrice, res.summary.cogs + res.summary.profitAmount);

  // 4. Kiểm tra bậc MOQ
  assert.strictEqual(res.summary.moqPrices[1], res.summary.calculateSalesPrice);
  assert.ok(res.summary.moqPrices[5] < res.summary.moqPrices[1]);
  assert.ok(res.summary.moqPrices[20] < res.summary.moqPrices[5]);

  // 5. Kiểm tra độ tin cậy: Đầy đủ thông tin -> 5 sao
  assert.strictEqual(res.confidence.stars, 5);
  assert.strictEqual(res.confidence.label, "Rất sát");
});

test("parametric-generator: Bàn ăn mặt đá khung sắt (table) xác nhận Đá no OH (0%) và Kim loại OH 10%", () => {
  const q: CostingQuestionnaire = {
    productType: "table",
    name: "Bàn ăn mặt đá khung kim loại",
    dimensions: {
      widthMm: 1800,
      depthMm: 900,
      heightMm: 750,
    },
    materials: {
      coreCode: "MDF_17_CHONG_AM",
      surfaceCode: "Melamine",
      hasStone: true,
      stoneType: "Đá Vicostone trắng thạch anh",
      hasGlass: false,
      hasMetal: true, // Khung chân sắt
      hasUpholstery: false,
      hasLed: false,
    },
    details: {
      drawerCount: 0,
      doorCount: 0,
    },
    calcMode: "detail",
  };

  const res = generateCostingFromQuestionnaire(q);

  // Đá phải có tiền
  assert.ok(res.summary.stone > 0, "Tiền đá phải > 0");
  // Kim loại phải có tiền
  assert.ok(res.summary.metalFrameS > 0, "Tiền khung sắt phải > 0");

  // BẤT BIẾN HIẾN PHÁP: Đá không chịu OH (no OH - 0%)
  // OH Subcontract (10%) chỉ áp cho kim loại
  assert.strictEqual(res.summary.ohSubcontractAmount, Math.round(res.summary.metalFrameS * 0.1));

  // Kiểm tra bảng MaterialLabor có dòng Stone gắn nhãn [no OH]
  const stoneRow = res.materialsLabor.find((m) => m.block === "Stone");
  assert.ok(stoneRow, "Phải có dòng Stone trong bảng MaterialLabor");
  assert.ok(stoneRow.name.includes("[no OH]"));
});

test("parametric-generator: Cánh kính khung nhôm phân tách đúng diện tích kính và khung nhôm", () => {
  const q: CostingQuestionnaire = {
    productType: "wardrobe",
    name: "Tủ áo cánh kính",
    dimensions: {
      widthMm: 2000,
      depthMm: 600,
      heightMm: 2400,
    },
    materials: {
      coreCode: "MDF_17_CHONG_AM",
      surfaceCode: "Melamine",
      hasStone: false,
      hasGlass: true, // Có cánh kính
      hasMetal: false,
      hasUpholstery: false,
      hasLed: true,
    },
    details: {
      doorCount: 4,
    },
    calcMode: "detail",
  };

  const res = generateCostingFromQuestionnaire(q);

  assert.ok(res.summary.glass > 0, "Tiền kính & khung nhôm phải > 0");
  const glassPanel = res.materialsLabor.find((m) => m.id === "mat-glass-panel");
  const glassAluminum = res.materialsLabor.find((m) => m.id === "mat-glass-aluminum");

  assert.ok(glassPanel, "Phải có kính cường lực");
  assert.ok(glassAluminum, "Phải có thanh nhôm hệ cánh kính");
});

test("parametric-generator: Chế độ ước nhanh (quick mode) gán nhãn 3 sao Tham khảo", () => {
  const q: CostingQuestionnaire = {
    productType: "kitchen_base",
    name: "Tủ bếp dưới",
    dimensions: {
      widthMm: 3000,
      depthMm: 600,
      heightMm: 810,
    },
    materials: {
      coreCode: "MDF_17_CHONG_AM",
      surfaceCode: "Melamine",
      hasStone: false,
      hasGlass: false,
      hasMetal: false,
      hasUpholstery: false,
      hasLed: false,
    },
    calcMode: "quick",
  };

  const res = generateCostingFromQuestionnaire(q);
  assert.strictEqual(res.confidence.stars, 3);
  assert.strictEqual(res.confidence.label, "Tham khảo");
});
