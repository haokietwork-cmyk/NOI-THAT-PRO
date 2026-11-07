import assert from "node:assert";
import test from "node:test";
import {
  exportFurnitureModel,
  computeLineUsing,
  type ExportCostLine,
} from "./export-furniture-model.ts";
import { panelCncModel } from "./panel-cnc-model.ts";
import { roundHalfUp, type PricingContext } from "./pricing-context.ts";
import { SEED_PARTS, SEED_MATERIALS } from "../../services/seedData.ts";

// ============================================================================
// BƯỚC 1A: KHÓA HÀNH VI PANEL_CNC BẰNG TEST CỐ ĐỊNH (RUNBOOK MỤC 4, 1A)
// ============================================================================
test("1a. panel_cnc: Khóa hành vi tính toán ván công nghiệp chuẩn xưởng", () => {
  // - Net 38,6 m² × (1 + 15%) = 44,39 m²; khổ 1220×2440 = 2,9768 m² → ⌈44,39 / 2,9768⌉ = 15 tấm.
  // - 15 tấm × 680.000 đ = 10.200.000 đ (MDF 17mm).
  // - Giá vốn mẫu 15.913.000 đ × 1,65 = 26.256.450 đ; lãi 10.343.450 đ; biên LN = 0,65 / 1,65 ≈ 39,4%.
  const netAreaM2 = 38.6;
  const wasteFactor = 1.15;
  const grossAreaM2 = netAreaM2 * wasteFactor; // 44.39 m2
  assert.strictEqual(Number(grossAreaM2.toFixed(2)), 44.39);

  const sheetAreaM2 = 2.9768;
  const sheetsNeeded = Math.ceil(grossAreaM2 / sheetAreaM2);
  assert.strictEqual(sheetsNeeded, 15, "38.6m2 Net với hao hụt 15% phải quy đổi ra đúng 15 tấm nguyên");

  const boardCost = sheetsNeeded * 680_000;
  assert.strictEqual(boardCost, 10_200_000, "15 tấm MDF 17mm @ 680k phải ra 10.200.000 đ");

  const baseCost = 15_913_000;
  const multiplier = 1.65;
  const quotePrice = Math.round(baseCost * multiplier);
  assert.strictEqual(quotePrice, 26_256_450, "Giá vốn 15.913.000 đ x 1.65 phải ra đúng 26.256.450 đ");

  const profit = quotePrice - baseCost;
  assert.strictEqual(profit, 10_343_450, "Lãi phải ra 10.343.450 đ");

  const margin = (multiplier - 1) / multiplier;
  assert.strictEqual(Number((margin * 100).toFixed(1)), 39.4, "Biên lợi nhuận phải ra đúng 39.4%");

  // Kiểm tra mô hình panelCncModel đóng gói chạy với SEED
  const res = panelCncModel.compute({
    parts: SEED_PARTS,
    materials: SEED_MATERIALS,
    options: { profitMargin: 1.65 },
  });
  assert.strictEqual(res.modelId, "panel_cnc");
  assert.strictEqual(res.totalBaseCost, 16_281_950);
  assert.strictEqual(res.totalQuotePrice, 26_865_218);
});

// ============================================================================
// BƯỚC 1B: TEST LÀM TRÒN NỬA LÊN (ROUND HALF UP) NHƯ EXCEL
// ============================================================================
test("1b. roundHalfUp: Làm tròn nửa lên như Excel (922.5 -> 923, không làm tròn chẵn)", () => {
  assert.strictEqual(roundHalfUp(922.5, 0), 923);
  assert.strictEqual(roundHalfUp(738 * 1.25, 0), 923);
  assert.strictEqual(roundHalfUp(11.55, 0), 12);
  assert.strictEqual(roundHalfUp(12.10, 0), 12);
  assert.strictEqual(roundHalfUp(13.75, 0), 14);
  assert.strictEqual(roundHalfUp(24.20, 0), 24);
  assert.strictEqual(roundHalfUp(17.51854797, 2), 17.52);
});

// ============================================================================
// BƯỚC 1C: BỘ SỐ KIỂM THỬ MÔ HÌNH EXPORT_FURNITURE (RUNBOOK MỤC 4, 1C)
// ============================================================================

const defaultContext: PricingContext = {
  constants: {
    fx: 25000,
    ohGeneral: 0.35,
    ohSubcon: 0.10,
    ohMarble: 0,
    markup: 0.20,
    moqTiers: [
      { moq: 20, surcharge: 0 },
      { moq: 15, surcharge: 0.05 },
      { moq: 10, surcharge: 0.10 },
      { moq: 5, surcharge: 0.25 },
      { moq: 2, surcharge: 1.20 },
      { moq: 1, surcharge: 1.20 },
    ],
  },
  rounding: "half_up",
};

test("1c. Dòng chi tiết 1: Ván WO02-0034 (18x900x1818, SL 2, waste 0.2, 4.28274 USD)", () => {
  const line: ExportCostLine = {
    group: "Wood",
    rmCode: "WO02-0034",
    unit: "m2",
    thicknessMm: 18,
    widthMm: 900,
    lengthMm: 1818,
    qty: 2,
    waste: 0.2,
    unitPriceUSD: 4.28274,
  };

  const computed = computeLineUsing(line);
  // SQM = (900 * 1818 * 2) / 1,000,000 = 3.2724
  assert.strictEqual(Number(computed.netQty.toFixed(4)), 3.2724);
  // Using = 3.2724 / (1 - 0.2) = 4.0905
  assert.strictEqual(Number(computed.usingQty.toFixed(4)), 4.0905);
  // Thành tiền = 4.0905 * 4.28274 = 17.51854797
  assert.strictEqual(Number(computed.amountUSD.toFixed(8)), 17.51854797);
});

test("1c. Dòng chi tiết 2: Gỗ Beech WO01-BEE-0003 (6x20x393, SL 12, waste 0.45, 647.094 USD/m3)", () => {
  const line: ExportCostLine = {
    group: "Wood",
    rmCode: "WO01-BEE-0003",
    unit: "m3",
    thicknessMm: 6,
    widthMm: 20,
    lengthMm: 393,
    qty: 12,
    waste: 0.45,
    unitPriceUSD: 647.094, // 16.177.350 VND / 25000 = 647.094
  };

  const computed = computeLineUsing(line);
  // CBM net = (6 * 20 * 393 * 12) / 1,000,000,000 = 0.00056592 m3
  assert.strictEqual(Number(computed.netQty.toFixed(8)), 0.00056592);
  // Using = 0.00056592 / (1 - 0.45) = 0.00102894545... m3 (~0.00102894 m3)
  assert.ok(Math.abs(computed.usingQty - 0.00102894) < 1e-5);
  // Thành tiền = 0.00102894545 * 647.094 = 0.6658244... (khớp đến 7 chữ số thập phân)
  assert.ok(Math.abs(computed.amountUSD - 0.66582442) < 1e-7);
});

test("1c. Costing sheet V1: Wood 6.7891 + Metal frame - S 0.0119 -> Giá bán 11, MOQ 11/12/12/14/24/24", () => {
  const res = exportFurnitureModel.compute(
    {
      overrideGroupTotals: {
        Wood: 6.7891,
        "Metal frame - S": 0.0119,
      },
    },
    defaultContext
  );

  // L&M = 6.7891 + 0.0119 = 6.801
  assert.strictEqual(Number(res.lmUSD.toFixed(3)), 6.801);
  // OH = (0.0119 * 10%) + (6.7891 * 35%) = 0.00119 + 2.376185 = 2.377375
  assert.strictEqual(Number(res.ohUSD.toFixed(6)), 2.377375);
  // COGS = 6.801 + 2.377375 = 9.178375
  assert.strictEqual(Number(res.cogsUSD.toFixed(6)), 9.178375);
  // Profit = 9.178375 * 20% = 1.835675
  assert.strictEqual(Number(res.profitUSD.toFixed(6)), 1.835675);
  // Giá bán = ROUND(9.178375 + 1.835675) = ROUND(11.01405) = 11
  assert.strictEqual(res.sellingPriceUSD, 11);

  // MOQ 20/15/10/5/2/1 -> 11 / 12 / 12 / 14 / 24 / 24
  const moqMap = Object.fromEntries(res.moqPrices.map((m) => [m.moq, m.unitPriceUSD]));
  assert.strictEqual(moqMap[20], 11);
  assert.strictEqual(moqMap[15], 12);
  assert.strictEqual(moqMap[10], 12);
  assert.strictEqual(moqMap[5], 14);
  assert.strictEqual(moqMap[2], 24);
  assert.strictEqual(moqMap[1], 24);
});

test("1c. QOT-24169 V1: L&M 455.538 -> Giá bán 738, MOQ 200% cho bậc 1 và 2", () => {
  // Context với 200% phụ phí cho MOQ 2 và 1 (theo QOT-24169-0002)
  const qotContext: PricingContext = {
    ...defaultContext,
    constants: {
      ...defaultContext.constants,
      moqTiers: [
        { moq: 20, surcharge: 0 },
        { moq: 15, surcharge: 0.05 },
        { moq: 10, surcharge: 0.10 },
        { moq: 5, surcharge: 0.25 },
        { moq: 2, surcharge: 2.00 },
        { moq: 1, surcharge: 2.00 },
      ],
    },
  };

  const res = exportFurnitureModel.compute(
    {
      overrideGroupTotals: {
        Wood: 108.2283,
        Chemical: 32.1377,
        Hardware: 72.7281,
        Consumables: 2.33,
        Packing: 29.0,
        "Labour Cost Total": 211.1139,
      },
    },
    qotContext
  );

  // L&M = 455.538
  assert.strictEqual(Number(res.lmUSD.toFixed(3)), 455.538);
  // OH = 455.538 * 35% = 159.4383
  assert.strictEqual(Number(res.ohUSD.toFixed(4)), 159.4383);
  // COGS = 455.538 + 159.4383 = 614.9763
  assert.strictEqual(Number(res.cogsUSD.toFixed(4)), 614.9763);
  // Profit = 614.9763 * 20% = 122.99526
  assert.strictEqual(Number(res.profitUSD.toFixed(5)), 122.99526);
  // Giá bán = ROUND(737.97156) = 738
  assert.strictEqual(res.sellingPriceUSD, 738);

  // Theo MOQ: 738 / 775 / 812 / 923 / 2214 / 2214
  const moqMap = Object.fromEntries(res.moqPrices.map((m) => [m.moq, m.unitPriceUSD]));
  assert.strictEqual(moqMap[20], 738);
  assert.strictEqual(moqMap[15], 775);
  assert.strictEqual(moqMap[10], 812);
  assert.strictEqual(moqMap[5], 923); // 738 * 1.25 = 922.5 -> 923
  assert.strictEqual(moqMap[2], 2214); // 738 * (1 + 2.00) = 2214
  assert.strictEqual(moqMap[1], 2214);
});

test("1c. QOT-24169 V2: L&M 371.9793 -> Giá bán 603, MOQ 603/633/663/754/1809/1809", () => {
  const qotContext: PricingContext = {
    ...defaultContext,
    constants: {
      ...defaultContext.constants,
      moqTiers: [
        { moq: 20, surcharge: 0 },
        { moq: 15, surcharge: 0.05 },
        { moq: 10, surcharge: 0.10 },
        { moq: 5, surcharge: 0.25 },
        { moq: 2, surcharge: 2.00 },
        { moq: 1, surcharge: 2.00 },
      ],
    },
  };

  const res = exportFurnitureModel.compute(
    {
      overrideGroupTotals: {
        Wood: 97.0055,
        Chemical: 26.0129,
        Hardware: 6.517,
        Consumables: 2.33,
        Packing: 29.0,
        "Labour Cost Total": 211.1139,
      },
    },
    qotContext
  );

  // L&M = 371.9793
  assert.strictEqual(Number(res.lmUSD.toFixed(4)), 371.9793);
  // OH = 371.9793 * 35% = 130.192755
  assert.strictEqual(Number(res.ohUSD.toFixed(6)), 130.192755);
  // COGS = 371.9793 + 130.192755 = 502.172055
  assert.strictEqual(Number(res.cogsUSD.toFixed(6)), 502.172055);
  // Profit = 502.172055 * 20% = 100.434411
  assert.strictEqual(Number(res.profitUSD.toFixed(6)), 100.434411);
  // Giá bán = ROUND(602.606466) = 603
  assert.strictEqual(res.sellingPriceUSD, 603);

  // MOQ: 603 / 633 / 663 / 754 / 1809 / 1809
  const moqMap = Object.fromEntries(res.moqPrices.map((m) => [m.moq, m.unitPriceUSD]));
  assert.strictEqual(moqMap[20], 603);
  assert.strictEqual(moqMap[15], 633);
  assert.strictEqual(moqMap[10], 663);
  assert.strictEqual(moqMap[5], 754);
  assert.strictEqual(moqMap[2], 1809);
  assert.strictEqual(moqMap[1], 1809);
});

test("1d. Nhân công công đoạn thực tế (Quy trình cột M-Q & Đơn giá dòng 723 Material: 4.2 USD/hr)", () => {
  // Bộ 10 công đoạn thực tế theo file QOT-24169
  const laborLines = [
    { processCode: "RAW", name: "Nguyên vật liệu đầu vào", hours: 2.75, hourlyRateUSD: 4.2 },
    { processCode: "MAC", name: "Gia công cơ khí", hours: 9.5, hourlyRateUSD: 4.2 },
    { processCode: "CNC-MDF", name: "Gia công CNC trên ván MDF", hours: 4.67, hourlyRateUSD: 4.2 },
    { processCode: "VEN", name: "Phủ veneer", hours: 10.66, hourlyRateUSD: 4.2 },
    { processCode: "ASS", name: "Lắp ráp", hours: 6.0, hourlyRateUSD: 4.2 },
    { processCode: "SandSpay", name: "Chà nhám và phun", hours: 2.5, hourlyRateUSD: 4.2 },
    { processCode: "Antique", name: "Hoàn thiện giả cổ", hours: 7.93522512, hourlyRateUSD: 4.2 },
    { processCode: "FIT", name: "Gắn phụ kiện", hours: 1.25, hourlyRateUSD: 4.2 },
    { processCode: "FitWas", name: "Gắn vòng đệm", hours: 1.0, hourlyRateUSD: 4.2 },
    { processCode: "Packing", name: "Đóng gói", hours: 4.0, hourlyRateUSD: 4.2 },
  ];

  const res = exportFurnitureModel.compute(
    {
      laborLines,
      overrideGroupTotals: {
        Wood: 97.0055,
        Chemical: 26.0129,
        Hardware: 6.517,
        Consumables: 2.33,
        Packing: 29.0,
      },
    },
    defaultContext
  );

  // Tổng giờ: 2.75 + 9.5 + 4.67 + 10.66 + 6 + 2.5 + 7.93522512 + 1.25 + 1 + 4 = 50.26522512 giờ
  // Tổng tiền nhân công: 50.26522512 * 4.2 = 211.113945504 USD
  const laborTotal = res.groupSubtotals["Labour Cost Total"];
  assert.ok(Math.abs(laborTotal - 211.1139) < 0.001, "Tổng nhân công phải khớp ~211.1139 USD");
  assert.strictEqual(res.computedLaborLines.length, 10);
  assert.strictEqual(res.computedLaborLines[0].amountUSD, 2.75 * 4.2); // 11.55
});
