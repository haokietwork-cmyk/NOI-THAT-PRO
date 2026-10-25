import assert from "node:assert";
import test from "node:test";
import {
  calculateMarkupPercent,
  calculateProfitMarginPercent,
  calculateCommercialQuote,
  calculateModuleQuoteLine,
  formatPercentVi,
  resolveProjectProfitMargin,
  DEFAULT_PROFIT_MARGIN,
  DEFAULT_NEW_PROFIT_MARGIN,
} from "./profit-calculator.ts";
import { calculateProject } from "./engine.ts";
import { calculateQuoteEngine } from "./quote-engine.ts";
import { SEED_PARTS, SEED_MATERIALS } from "../services/seedData.ts";

test("profit-calculator: Case k = 1.65 (Mặc định chuẩn xưởng)", () => {
  const k = 1.65;
  const markup = calculateMarkupPercent(k);
  const margin = calculateProfitMarginPercent(k);

  assert.strictEqual(markup, 65.0, "Markup của k=1.65 phải là 65.0%");
  assert.strictEqual(margin, 39.4, "Biên lợi nhuận của k=1.65 phải xấp xỉ 39.4%");
  assert.strictEqual(formatPercentVi(markup), "65%");
  assert.strictEqual(formatPercentVi(margin), "39,4%");
});

test("profit-calculator: Case k = 1.50 (Markup 50%)", () => {
  const k = 1.50;
  const markup = calculateMarkupPercent(k);
  const margin = calculateProfitMarginPercent(k);

  assert.strictEqual(markup, 50.0);
  assert.strictEqual(margin, 33.3);
  assert.strictEqual(formatPercentVi(markup), "50%");
  assert.strictEqual(formatPercentVi(margin), "33,3%");
});

test("profit-calculator: Case k = 2.0 (Gấp đôi giá vốn)", () => {
  const k = 2.0;
  const markup = calculateMarkupPercent(k);
  const margin = calculateProfitMarginPercent(k);

  assert.strictEqual(markup, 100.0);
  assert.strictEqual(margin, 50.0);
  assert.strictEqual(formatPercentVi(markup), "100%");
  assert.strictEqual(formatPercentVi(margin), "50%");
});

test("profit-calculator: Case k = 1.0 (Hòa vốn)", () => {
  const k = 1.0;
  const markup = calculateMarkupPercent(k);
  const margin = calculateProfitMarginPercent(k);

  assert.strictEqual(markup, 0.0);
  assert.strictEqual(margin, 0.0);
  assert.strictEqual(formatPercentVi(markup), "0%");
  assert.strictEqual(formatPercentVi(margin), "0%");
});

test("profit-calculator: Case 0 < k < 1 (Lãi âm / Bán lỗ dưới giá vốn)", () => {
  const k = 0.8;
  const markup = calculateMarkupPercent(k);
  const margin = calculateProfitMarginPercent(k);

  assert.strictEqual(markup, -20.0);
  assert.strictEqual(margin, -25.0);
  assert.strictEqual(formatPercentVi(markup), "-20%");
  assert.strictEqual(formatPercentVi(margin), "-25%");
});

test("profit-calculator: Case k <= 0 (Biên an toàn, không chia cho 0)", () => {
  assert.strictEqual(calculateMarkupPercent(0), -100);
  assert.strictEqual(calculateProfitMarginPercent(0), -100);

  assert.strictEqual(calculateMarkupPercent(-0.5), -100);
  assert.strictEqual(calculateProfitMarginPercent(-0.5), -100);
});

test("profit-calculator: calculateCommercialQuote tính đúng doanh thu và lãi gộp", () => {
  const cost = 10_000_000;
  const k = 1.65;
  const { quotePrice, grossProfit } = calculateCommercialQuote(cost, k);

  assert.strictEqual(quotePrice, 16_500_000);
  assert.strictEqual(grossProfit, 6_500_000);
});

test("profit-calculator: calculateModuleQuoteLine phân bổ chính xác theo tỷ lệ diện tích", () => {
  const totalBaseCost = 10_000_000;
  const totalQuotePrice = 16_500_000;
  const totalAreaM2 = 20.0;
  const moduleAreaM2 = 5.0; // Chiếm 25%

  const line = calculateModuleQuoteLine(moduleAreaM2, totalAreaM2, totalBaseCost, totalQuotePrice);
  assert.strictEqual(line.ratio, 0.25);
  assert.strictEqual(line.baseCost, 2_500_000);
  assert.strictEqual(line.quotePrice, 4_125_000);
});

test("profit-calculator: formatPercentVi kiểm thử toàn diện các định dạng số", () => {
  assert.strictEqual(formatPercentVi(50), "50%");
  assert.strictEqual(formatPercentVi(39.3939), "39,4%");
  assert.strictEqual(formatPercentVi(0), "0%");
  assert.strictEqual(formatPercentVi(0.04), "0%");
  assert.strictEqual(formatPercentVi(100), "100%");
});

test("profit-calculator: resolveProjectProfitMargin phân giải đúng (mặc định duy nhất 1.65)", () => {
  // Dự án không có profitMargin -> mặc định duy nhất 1.65
  assert.strictEqual(resolveProjectProfitMargin(undefined), DEFAULT_PROFIT_MARGIN);
  assert.strictEqual(resolveProjectProfitMargin(null), DEFAULT_PROFIT_MARGIN);
  assert.strictEqual(resolveProjectProfitMargin(0), DEFAULT_PROFIT_MARGIN);
  assert.strictEqual(resolveProjectProfitMargin(NaN), DEFAULT_PROFIT_MARGIN);

  // Dự án có profitMargin cụ thể -> bảo toàn giá trị
  assert.strictEqual(resolveProjectProfitMargin(1.35), 1.35);
  assert.strictEqual(resolveProjectProfitMargin(1.50), 1.50);
  assert.strictEqual(resolveProjectProfitMargin(1.65), 1.65);
});

test("profit-calculator: GOLDEN TEST - Một engine duy nhất đồng nhất giữa engine.ts và quote-engine.ts", () => {
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

test("profit-calculator: CẤU HÌNH XƯỞNG (WorkshopCostConfig) - Đổi cấu hình giá đổi đúng, dự án giữ snapshot", () => {
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
