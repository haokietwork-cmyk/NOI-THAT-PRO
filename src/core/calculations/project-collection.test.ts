import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  createProjectProduct,
  createBlankProduct,
  duplicateProjectProduct,
  calculateProjectCollectionTotals,
  generateProjectRolledUpBOM,
  computeSingleProductCosting,
  DEFAULT_SAMPLE_PROJECT_PRODUCTS,
  type ProjectProductItem,
} from "./project-collection.ts";
import type { GeneratedCostingResult } from "./parametric-types.ts";

describe("project-collection: Mô hình Dự Án & Bộ Sưu Tập Đa Sản Phẩm", () => {
  test("createProjectProduct: Khởi tạo sản phẩm hợp lệ với kích thước và vật tư chuẩn", () => {
    const prod = createProjectProduct({
      name: "Tủ Quần Áo Con",
      room: "Phòng ngủ nhỏ",
      archetypeId: "wardrobe_kids",
      qty: 2,
      dimensions: { widthMm: 1400, depthMm: 550, heightMm: 2200 },
    });

    assert.equal(prod.name, "Tủ Quần Áo Con");
    assert.equal(prod.room, "Phòng ngủ nhỏ");
    assert.equal(prod.qty, 2);
    assert.equal(prod.questionnaire.dimensions.widthMm, 1400);
    assert.equal(prod.questionnaire.dimensions.depthMm, 550);
    assert.equal(prod.questionnaire.dimensions.heightMm, 2200);
    assert.equal(prod.laborHourlyRate, 105000);
    assert.ok(prod.id.startsWith("prod_"));
  });

  test("duplicateProjectProduct: Nhân bản sản phẩm thành công với ID mới", () => {
    const original = DEFAULT_SAMPLE_PROJECT_PRODUCTS[0];
    const clone = duplicateProjectProduct(original, "Tủ Áo Phòng Khách", "Phòng khách");

    assert.notEqual(clone.id, original.id);
    assert.equal(clone.name, "Tủ Áo Phòng Khách");
    assert.equal(clone.room, "Phòng khách");
    assert.equal(clone.questionnaire.dimensions.widthMm, original.questionnaire.dimensions.widthMm);
  });

  test("calculateProjectCollectionTotals: Tính toán chính xác tổng COGS, Báo giá và Biên lợi nhuận", () => {
    const products = DEFAULT_SAMPLE_PROJECT_PRODUCTS;
    const mockCostings: Record<string, GeneratedCostingResult> = {
      "prod-vinhomes-01": {
        estimationLevel: 2,
        questionnaire: {} as any,
        drivers: {} as any,
        confidence: { stars: 5, label: "Rất sát" } as any,
        summary: {
          stone: 0,
          upholstery: 0,
          metalFrameS: 0,
          subContract: 0,
          wood: 6266000,
          metalFrameP: 0,
          glass: 0,
          chemical: 0,
          hardware: 1230000,
          consumables: 363858,
          packingDelivery: 450000,
          laborCostTotal: 1711500,
          totalDirectLM: 10021358,
          ohWorkshopAmount: 2505340,
          ohSubcontractAmount: 0,
          totalOH: 2505340,
          cogs: 12526698,
          profitAmount: 8142354,
          calculateSalesPrice: 20669052,
          moqPrices: {},
        } as any,
        materialsLabor: [],
        labourDepts: [],
        assumptions: [],
      },
      "prod-vinhomes-02": {
        estimationLevel: 2,
        questionnaire: {} as any,
        drivers: {} as any,
        confidence: { stars: 5, label: "Rất sát" } as any,
        summary: {
          stone: 0,
          upholstery: 0,
          metalFrameS: 0,
          subContract: 0,
          wood: 2500000,
          metalFrameP: 0,
          glass: 0,
          chemical: 0,
          hardware: 500000,
          consumables: 200000,
          packingDelivery: 300000,
          laborCostTotal: 620000,
          totalDirectLM: 4120000,
          ohWorkshopAmount: 1030000,
          ohSubcontractAmount: 0,
          totalOH: 1030000,
          cogs: 5150000,
          profitAmount: 3347500,
          calculateSalesPrice: 8497500,
          moqPrices: {},
        } as any,
        materialsLabor: [],
        labourDepts: [],
        assumptions: [],
      },
      "prod-vinhomes-03": {
        estimationLevel: 2,
        questionnaire: {} as any,
        drivers: {} as any,
        confidence: { stars: 5, label: "Rất sát" } as any,
        summary: {
          stone: 2000000,
          upholstery: 0,
          metalFrameS: 0,
          subContract: 0,
          wood: 4000000,
          metalFrameP: 0,
          glass: 0,
          chemical: 0,
          hardware: 1500000,
          consumables: 300000,
          packingDelivery: 400000,
          laborCostTotal: 1200000,
          totalDirectLM: 9400000,
          ohWorkshopAmount: 1850000,
          ohSubcontractAmount: 0,
          totalOH: 1850000,
          cogs: 11250000,
          profitAmount: 6012500,
          calculateSalesPrice: 17262500,
          moqPrices: {},
        } as any,
        materialsLabor: [],
        labourDepts: [],
        assumptions: [],
      },
    };

    const totals = calculateProjectCollectionTotals(products, mockCostings);

    assert.equal(totals.totalProductsCount, 3);
    assert.equal(totals.totalItems, 3);
    assert.equal(totals.totalCOGS, 12526698 + 5150000 + 11250000); // 28.926.698 đ
    assert.equal(totals.totalQuote, 20669052 + 8497500 + 17262500); // 46.429.052 đ
    assert.equal(totals.totalProfit, 46429052 - 28926698); // 17.502.354 đ
    assert.ok(totals.profitMarginPercent > 30);
  });

  test("generateProjectRolledUpBOM: Cuộn và cộng dồn vật tư từ nhiều sản phẩm", () => {
    const products: ProjectProductItem[] = [
      {
        ...DEFAULT_SAMPLE_PROJECT_PRODUCTS[0],
        id: "p1",
        qty: 2, // 2 tủ áo
      },
      {
        ...DEFAULT_SAMPLE_PROJECT_PRODUCTS[1],
        id: "p2",
        qty: 1, // 1 tủ giày
      },
    ];

    const mockCostings: Record<string, GeneratedCostingResult> = {
      p1: {
        estimationLevel: 2,
        questionnaire: {} as any,
        drivers: {} as any,
        confidence: { stars: 5, label: "Rất sát" } as any,
        summary: {} as any,
        materialsLabor: [
          {
            id: "row-1",
            block: "Wood",
            name: "MDF 17mm Chống Ẩm",
            description: "",
            qty: 5, // 5 tấm mỗi tủ áo
            unit: "tấm",
            unitPrice: 680000,
            wasteFactor: 1.15,
            totalAmount: 3910000,
          },
        ],
        labourDepts: [],
        assumptions: [],
      },
      p2: {
        estimationLevel: 2,
        questionnaire: {} as any,
        drivers: {} as any,
        confidence: { stars: 5, label: "Rất sát" } as any,
        summary: {} as any,
        materialsLabor: [
          {
            id: "row-2",
            block: "Wood",
            name: "MDF 17mm Chống Ẩm",
            description: "",
            qty: 3, // 3 tấm cho tủ giày
            unit: "tấm",
            unitPrice: 680000,
            wasteFactor: 1.15,
            totalAmount: 2346000,
          },
        ],
        labourDepts: [],
        assumptions: [],
      },
    };

    const rolledUp = generateProjectRolledUpBOM(products, mockCostings);

    assert.equal(rolledUp.length, 1);
    // 2 tủ * 5 tấm + 1 tủ * 3 tấm = 13 tấm
    assert.equal(rolledUp[0].qty, 13);
    assert.equal(rolledUp[0].totalAmount, 3910000 * 2 + 2346000 * 1);
  });

  test("createBlankProduct: Khởi tạo sản phẩm mới không gò bó mẫu có sẵn", () => {
    const blank = createBlankProduct({
      name: "Bàn Ăn 6 Ghế",
      tag: "Bàn ăn",
      widthMm: 1600,
      depthMm: 800,
      heightMm: 750,
      qty: 1,
    });

    assert.equal(blank.name, "Bàn Ăn 6 Ghế");
    assert.equal(blank.tag, "Bàn ăn");
    assert.equal(blank.questionnaire.dimensions.widthMm, 1600);
    assert.equal(blank.questionnaire.dimensions.depthMm, 800);
    assert.equal(blank.questionnaire.dimensions.heightMm, 750);
    assert.equal(blank.archetypeId, "custom");
  });

  test("computeSingleProductCosting: Tôn trọng customProfitMargin riêng của sản phẩm trong BST", () => {
    const prod = createBlankProduct({
      name: "Ghế Đôn Da Cao Cấp",
      tag: "Ghế & Đôn",
      customProfitMargin: 1.85, // 85% markup riêng cho sản phẩm này
    });

    const costingWithCustomMargin = computeSingleProductCosting(prod, [], 1.5, 0.5);
    // Giá bán đề xuất phải phản ánh markup 1.85 chứ không phải 1.5 chung
    const cogs = costingWithCustomMargin.summary.cogs;
    const expectedProfit = Math.round(cogs * 0.85);
    assert.equal(costingWithCustomMargin.summary.profitAmount, expectedProfit);
  });
});
