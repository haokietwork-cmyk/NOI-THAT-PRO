import assert from "node:assert";
import test from "node:test";
import { calculateProject } from "./engine.ts";
import { calculateQuoteEngine } from "./quote-engine.ts";
import { SEED_PARTS, SEED_MATERIALS } from "../services/seedData.ts";

test("engine: GOLDEN TEST - Một engine duy nhất đồng nhất giữa engine.ts và quote-engine.ts", () => {
  const resEngine = calculateProject(SEED_PARTS, SEED_MATERIALS, { profitMargin: 1.65 });
  const resQuote = calculateQuoteEngine(SEED_PARTS, SEED_MATERIALS, 1.65);

  // So sánh chính xác từng số tiền (loại bỏ tính trùng ốc cam 2 lần)
  assert.strictEqual(resEngine.totalBaseCost, resQuote.totalCost, "Tổng giá vốn xưởng phải trùng khớp 100%");
  assert.strictEqual(resEngine.totalQuotePrice, resQuote.totalQuotePrice, "Tổng giá báo khách phải trùng khớp 100%");
  assert.strictEqual(resEngine.estimatedProfit, resQuote.grossProfit, "Lãi gộp dự kiến phải trùng khớp 100%");
  assert.strictEqual(resEngine.totalSheets, resQuote.totalSheets, "Tổng số tấm ván đặt mua phải trùng khớp 100%");

  // Giá vốn chuẩn xưởng (không tính trùng ốc cam): 16.281.950 đ
  assert.strictEqual(resEngine.totalBaseCost, 16_281_950);
  assert.strictEqual(resEngine.totalQuotePrice, 26_865_218);
});

test("engine: CẤU HÌNH XƯỞNG (WorkshopCostConfig) - Đổi cấu hình giá đổi đúng, dự án giữ snapshot", () => {
  // 1. Cùng cutlist, đổi cấu hình xưởng thì giá vốn và giá bán đổi chính xác
  const customConfig = {
    suppliesRatePerSheet: 25_000,
    laborRatePerSheet: 150_000,
    hingesPerSheet: 2.5,
    slidesPerSheet: 0.5,
  };

  const resCustom = calculateProject(SEED_PARTS, SEED_MATERIALS, {
    profitMargin: 1.65,
    costConfig: customConfig,
  });

  assert.strictEqual(resCustom.suppliesCost, 462_500, "Vật tư phụ: 18.5 tấm * 25.000 = 462.500 đ");
  assert.strictEqual(resCustom.laborCost, 2_775_000, "Nhân công: 18.5 tấm * 150.000 = 2.775.000 đ");
  assert.strictEqual(resCustom.hardwareCost, 2_773_000, "Phụ kiện: 46 bản lề (1.288k) + 9 ray (1.485k) = 2.773.000 đ");
  assert.strictEqual(resCustom.totalBaseCost, 17_768_950, "Tổng giá vốn theo cấu hình mới là 17.768.950 đ");

  // 2. Dự án đã lưu giữ snapshot cấu hình: Khi xưởng đổi cấu hình toàn cục, dự án cũ mở lại vẫn giữ nguyên giá
  const savedProjectOld = {
    id: "proj-old-01",
    projectName: "Dự án đã lưu với cấu hình chuẩn",
    clientName: "Khách hàng A",
    createdAt: "2026-03-01T00:00:00Z",
    status: "quoted" as const,
    items: SEED_PARTS,
    materialsSnapshot: SEED_MATERIALS,
    profitMargin: 1.65,
    roundingStep: 0.5 as const,
    totalCost: 16_281_950,
    totalQuote: 26_865_218,
    calcVersion: 1,
    costConfigSnapshot: {
      suppliesRatePerSheet: 15_000,
      laborRatePerSheet: 120_000,
      hingesPerSheet: 2.0,
      slidesPerSheet: 0.35,
    },
  };

  const calcOldProject = calculateQuoteEngine(
    savedProjectOld.items,
    savedProjectOld.materialsSnapshot,
    savedProjectOld.profitMargin,
    undefined,
    savedProjectOld.costConfigSnapshot
  );

  // Giá dự án cũ phải được bảo vệ nguyên vẹn 16.281.950 đ
  assert.strictEqual(calcOldProject.totalCost, 16_281_950, "Dự án đã lưu giữ đúng cấu hình đã chụp");
  assert.strictEqual(calcOldProject.totalQuotePrice, 26_865_218);
});
