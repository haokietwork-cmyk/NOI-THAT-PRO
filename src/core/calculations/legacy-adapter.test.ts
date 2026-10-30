import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { legacyConfigToLines } from "./legacy-adapter.ts";
import { calculateProject } from "./engine.ts";
import { calculateCostLines } from "./cost-lines/cost-lines-engine.ts";
import { buildProjectDrivers } from "./cost-lines/cost-line-resolver.ts";
import { SEED_MATERIALS, SEED_PROJECTS } from "../services/seedData.ts";
import { DEFAULT_WORKSHOP_COST_CONFIG } from "../types/index.ts";

describe("legacy-adapter: Chuyển đổi WorkshopCostConfig sang CostLine[] và so sánh đối chiếu", () => {
  const seedProject = SEED_PROJECTS[0];

  it("SO SÁNH ĐỐI CHIẾU VỚI ENGINE CŨ: Khớp chính xác từng dòng và từng tổng trên SEED_PARTS", () => {
    // 1. Chạy engine cũ để lấy kết quả chuẩn
    const oldResult = calculateProject(seedProject.items, SEED_MATERIALS, {
      profitMargin: seedProject.profitMargin,
      costConfig: seedProject.costConfigSnapshot || DEFAULT_WORKSHOP_COST_CONFIG,
    });

    // Xác nhận số vàng của engine cũ
    assert.equal(oldResult.totalSheets, 18.5);
    assert.equal(oldResult.suppliesCost, 277_500, "Vật tư phụ cũ: 277.500 đ");
    assert.equal(oldResult.laborCost, 2_220_000, "Nhân công cũ: 2.220.000 đ");
    assert.equal(oldResult.hardwareCost, 2_026_000, "Phụ kiện cũ: 2.026.000 đ");
    assert.equal(oldResult.totalBaseCost, 16_281_950, "Tổng giá vốn cũ: 16.281.950 đ");
    assert.equal(oldResult.totalQuotePrice, 26_865_218, "Tổng báo giá cũ: 26.865.218 đ");

    // 2. Chuyển đổi cấu hình xưởng cũ sang các dòng chi phí chuẩn CostLine[]
    const costLines = legacyConfigToLines(
      seedProject.costConfigSnapshot || DEFAULT_WORKSHOP_COST_CONFIG,
      SEED_MATERIALS
    );

    // Xác nhận sinh đủ 4 dòng mặc định (supplies, labor, hinges, slides)
    assert.equal(costLines.length, 4);

    // 3. Xây dựng Drivers từ kết quả bóc tách tấm và chỉ
    const drivers = buildProjectDrivers({
      totalSheets: oldResult.totalSheets,
      edgeLengthMd: oldResult.totalEdgeLengthMd,
      partCount: seedProject.items.reduce((s, p) => s + (p.qty || 1), 0),
    });

    // 4. Chạy động cơ dòng chi phí mới (CostLines Engine)
    const newLinesResult = calculateCostLines(costLines, drivers, {
      defaultMarkup: seedProject.profitMargin ?? 1.65,
    });

    // 5. Đối chiếu chi tiết từng nhóm chi phí
    const suppliesLine = newLinesResult.resolvedLines.find(
      (l) => l.category === "supplies"
    );
    const laborLine = newLinesResult.resolvedLines.find(
      (l) => l.category === "labor"
    );
    const hardwareLines = newLinesResult.resolvedLines.filter(
      (l) => l.category === "hardware"
    );

    assert.ok(suppliesLine, "Phải có dòng vật tư phụ");
    assert.equal(
      suppliesLine.baseCost,
      oldResult.suppliesCost,
      "Vật tư phụ mới phải bằng chính xác vật tư phụ cũ (277.500 đ)"
    );

    assert.ok(laborLine, "Phải có dòng nhân công");
    assert.equal(
      laborLine.baseCost,
      oldResult.laborCost,
      "Nhân công mới phải bằng chính xác nhân công cũ (2.220.000 đ)"
    );

    const newHardwareCost = hardwareLines.reduce((s, l) => s + l.baseCost, 0);
    assert.equal(
      newHardwareCost,
      oldResult.hardwareCost,
      "Tổng phụ kiện mới phải bằng chính xác phụ kiện cũ (2.026.000 đ)"
    );

    // 6. Tổng hợp toàn dự án (Ván + Chỉ + Dòng chi phí mới)
    const boardCost = oldResult.boards.reduce((s, b) => s + b.totalCost, 0);
    const edgeCost = oldResult.edges.reduce((s, e) => s + e.totalCost, 0);
    const newTotalBaseCost = boardCost + edgeCost + newLinesResult.totalBaseCost;

    assert.equal(
      newTotalBaseCost,
      16_281_950,
      "Tổng giá vốn toàn dự án theo mô hình dòng chi phí mới phải bằng chính xác 16.281.950 đ"
    );

    const newTotalQuotePrice = Math.round(newTotalBaseCost * (seedProject.profitMargin ?? 1.65));
    assert.equal(
      newTotalQuotePrice,
      26_865_218,
      "Tổng báo giá toàn dự án theo mô hình dòng chi phí mới phải bằng chính xác 26.865.218 đ"
    );

    const newGrossProfit = newTotalQuotePrice - newTotalBaseCost;
    assert.equal(
      newGrossProfit,
      10_583_268,
      "Lãi gộp theo mô hình dòng chi phí mới phải bằng chính xác 10.583.268 đ"
    );
  });

  it("Hỗ trợ bổ sung dòng keo dán cạnh khi có cấu hình keo > 0", () => {
    const configWithGlue = {
      ...DEFAULT_WORKSHOP_COST_CONFIG,
      glueRatePerMd: 0.02,
      glueUnitPrice: 80_000,
    };

    const lines = legacyConfigToLines(configWithGlue, SEED_MATERIALS);
    assert.equal(lines.length, 5, "Phải có thêm dòng keo");

    const glueLine = lines.find((l) => l.id === "line-legacy-glue");
    assert.ok(glueLine);
    assert.equal(glueLine.quantityRule.kind, "perDriver");
    assert.equal(glueLine.quantityRule.driver, "edgeLengthMd");
    assert.equal(glueLine.unitPrice, 80_000);
  });
});
