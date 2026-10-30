import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createIndustrialWorkshopPreset,
  createTurnkeyContractorPreset,
} from "./default-presets.ts";
import { calculateCostLines } from "./cost-lines/cost-lines-engine.ts";
import { buildProjectDrivers } from "./cost-lines/cost-line-resolver.ts";

describe("default-presets: Mẫu xưởng dòng chi phí và các ca biên quy tắc (AX4)", () => {
  it("Khởi tạo preset ván công nghiệp với đầy đủ 5 dòng chi phí", () => {
    const preset = createIndustrialWorkshopPreset();
    assert.equal(preset.length, 5);

    const suppliesLine = preset.find((l) => l.id === "preset-industrial-supplies");
    const laborLine = preset.find((l) => l.id === "preset-industrial-labor");
    const hingesLine = preset.find((l) => l.id === "preset-industrial-hinges");
    const slidesLine = preset.find((l) => l.id === "preset-industrial-slides");
    const glueLine = preset.find((l) => l.id === "preset-industrial-glue");

    assert.ok(suppliesLine && suppliesLine.enabled);
    assert.ok(laborLine && laborLine.enabled);
    assert.ok(hingesLine && hingesLine.enabled);
    assert.ok(slidesLine && slidesLine.enabled);
    // Keo mặc định tắt vì định mức = 0 theo Rule 15
    assert.ok(glueLine && !glueLine.enabled);
  });

  it("Kiểm thử ca biên của quy tắc TIERS (chiều cao cánh và bản lề)", () => {
    const preset = createIndustrialWorkshopPreset();
    const hingesLine = preset.find((l) => l.id === "preset-industrial-hinges")!;

    // 1. Đúng ngưỡng: 900mm -> 2 cái; 1500mm -> 3 cái; 2000mm -> 4 cái; 2700mm -> 5 cái
    const driversExact = buildProjectDrivers({
      parts: [
        { lengthMm: 900, widthMm: 450, qty: 1 },  // đúng ngưỡng 1 -> 2
        { lengthMm: 1500, widthMm: 450, qty: 1 }, // đúng ngưỡng 2 -> 3
        { lengthMm: 2000, widthMm: 500, qty: 1 }, // đúng ngưỡng 3 -> 4
        { lengthMm: 2700, widthMm: 600, qty: 1 }, // đúng ngưỡng 4 -> 5
      ],
    });
    const resExact = calculateCostLines([hingesLine], driversExact);
    // 2 + 3 + 4 + 5 = 14 cái * 28.000 đ = 392.000 đ
    assert.equal(resExact.resolvedLines[0].rawQuantity, 14);
    assert.equal(resExact.resolvedLines[0].baseCost, 392_000);

    // 2. Dưới ngưỡng (750mm -> 2 cái) và giữa các ngưỡng (1200mm -> 3 cái, 1800mm -> 4 cái)
    const driversBetween = buildProjectDrivers({
      parts: [
        { lengthMm: 750, widthMm: 400, qty: 2 },  // < 900 -> 2 cái * 2 = 4
        { lengthMm: 1200, widthMm: 450, qty: 1 }, // 900..1500 -> 3 cái * 1 = 3
        { lengthMm: 1800, widthMm: 500, qty: 1 }, // 1500..2000 -> 4 cái * 1 = 4
      ],
    });
    const resBetween = calculateCostLines([hingesLine], driversBetween);
    // 4 + 3 + 4 = 11 cái * 28.000 = 308.000 đ
    assert.equal(resBetween.resolvedLines[0].rawQuantity, 11);
    assert.equal(resBetween.resolvedLines[0].baseCost, 308_000);

    // 3. Vượt ngưỡng trên (2800mm kịch trần -> rơi vào bậc cao nhất 5 cái)
    const driversAbove = buildProjectDrivers({
      parts: [{ lengthMm: 2800, widthMm: 600, qty: 2 }], // > 2700 -> 5 cái * 2 = 10
    });
    const resAbove = calculateCostLines([hingesLine], driversAbove);
    assert.equal(resAbove.resolvedLines[0].rawQuantity, 10);
    assert.equal(resAbove.resolvedLines[0].baseCost, 280_000);

    // 4. Danh sách parts rỗng
    const driversEmpty = buildProjectDrivers({ parts: [] });
    const resEmpty = calculateCostLines([hingesLine], driversEmpty);
    assert.equal(resEmpty.resolvedLines[0].rawQuantity, 0);
    assert.equal(resEmpty.resolvedLines[0].baseCost, 0);
  });

  it("Bật/tắt dòng keo dán cạnh và phân bổ đúng theo mét dài dán cạnh", () => {
    // Khi xưởng nhập định mức keo thực tế: 0.015 kg/md @ 85.000 đ/kg
    const presetWithGlue = createIndustrialWorkshopPreset({
      glueRatePerMd: 0.015,
      glueUnitPrice: 85_000,
    });
    const glueLine = presetWithGlue.find((l) => l.id === "preset-industrial-glue")!;
    assert.equal(glueLine.enabled, true);

    const drivers = buildProjectDrivers({ edgeLengthMd: 200 });
    const res = calculateCostLines([glueLine], drivers);

    // 200 md * 0.015 = 3 kg * 85.000 = 255.000 đ
    assert.equal(res.resolvedLines[0].rawQuantity, 3);
    assert.equal(res.resolvedLines[0].baseCost, 255_000);
  });

  it("Kiểm thử preset thầu trọn gói với đá, logistics và phí quản lý", () => {
    const turnkeyPreset = createTurnkeyContractorPreset();
    assert.equal(turnkeyPreset.length, 3);

    // Bật dòng mặt đá nhập tay: 4.5 md
    const stoneLine = turnkeyPreset.find((l) => l.id === "preset-turnkey-stone")!;
    stoneLine.quantityRule.manualQty = 4.5;

    const logisticsLine = turnkeyPreset.find((l) => l.id === "preset-turnkey-logistics")!;

    const drivers = buildProjectDrivers({ totalSheets: 8 });
    const res = calculateCostLines([logisticsLine, stoneLine], drivers);

    // Logistics: 1 chuyến * 500.000 = 500.000 đ; quote (markup 1.15) = 575.000 đ
    // Mặt đá: 4.5 md * 1.05 (hao hụt 5%) = 4.725 md * 1.200.000 = 5.670.000 đ; quote (markup 1.35) = 7.654.500 đ
    assert.equal(res.resolvedLines[0].baseCost, 500_000);
    assert.equal(res.resolvedLines[0].quotePrice, 575_000);
    assert.equal(res.resolvedLines[1].baseCost, 5_670_000);
    assert.equal(res.resolvedLines[1].quotePrice, 7_654_500);
  });
});
