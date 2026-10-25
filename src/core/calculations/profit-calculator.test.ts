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
} from "./profit-calculator.ts";

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


