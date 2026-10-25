import assert from "node:assert";
import test from "node:test";
import fs from "node:fs";
import {
  calculateMarkupPercent,
  calculateProfitMarginPercent,
  calculateCommercialQuote,
  calculateModuleQuoteLine,
  formatPercentVi,
  resolveProjectProfitMargin,
  DEFAULT_LEGACY_PROFIT_MARGIN,
  DEFAULT_NEW_PROFIT_MARGIN,
} from "./profit-calculator.ts";
import { calculateProject } from "./engine.ts";
import { calculateQuoteEngine, calculateLegacyV1 } from "./quote-engine.ts";
import { SEED_PARTS, SEED_MATERIALS, SEED_PROJECTS } from "../services/seedData.ts";

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

  assert.strictEqual(markup, 50.0, "Markup của k=1.50 phải là 50.0%");
  assert.strictEqual(margin, 33.3, "Biên lợi nhuận của k=1.50 phải là 33.3%");
  assert.strictEqual(formatPercentVi(markup), "50%");
  assert.strictEqual(formatPercentVi(margin), "33,3%");
});

test("profit-calculator: Case k = 2.0 (Gấp đôi giá vốn)", () => {
  const k = 2.0;
  const markup = calculateMarkupPercent(k);
  const margin = calculateProfitMarginPercent(k);

  assert.strictEqual(markup, 100.0, "Markup của k=2.0 phải là 100.0%");
  assert.strictEqual(margin, 50.0, "Biên lợi nhuận của k=2.0 phải là 50.0%");
  assert.strictEqual(formatPercentVi(markup), "100%");
  assert.strictEqual(formatPercentVi(margin), "50%");
});

test("profit-calculator: Case k = 1.0 (Hòa vốn)", () => {
  const k = 1.0;
  const markup = calculateMarkupPercent(k);
  const margin = calculateProfitMarginPercent(k);

  assert.strictEqual(markup, 0.0, "Markup của k=1.0 phải là 0%");
  assert.strictEqual(margin, 0.0, "Biên lợi nhuận của k=1.0 phải là 0%");
  assert.strictEqual(formatPercentVi(markup), "0%");
  assert.strictEqual(formatPercentVi(margin), "0%");
});

test("profit-calculator: Case 0 < k < 1 (Lãi âm / Bán lỗ dưới giá vốn)", () => {
  const k = 0.8;
  const markup = calculateMarkupPercent(k);
  const margin = calculateProfitMarginPercent(k);

  assert.strictEqual(markup, -20.0, "Markup của k=0.8 phải là -20.0%");
  assert.strictEqual(margin, -25.0, "Biên lợi nhuận của k=0.8 phải là -25.0%");
  assert.strictEqual(formatPercentVi(markup), "-20%");
  assert.strictEqual(formatPercentVi(margin), "-25%");
});

test("profit-calculator: Case k <= 0 (Biên an toàn, không chia cho 0)", () => {
  const markupZero = calculateMarkupPercent(0);
  const marginZero = calculateProfitMarginPercent(0);
  assert.strictEqual(markupZero, -100, "Markup của k=0 phải an toàn trả về -100");
  assert.strictEqual(marginZero, -100, "Margin của k=0 phải an toàn không chia 0 và trả về -100");

  const markupNeg = calculateMarkupPercent(-0.5);
  const marginNeg = calculateProfitMarginPercent(-0.5);
  assert.strictEqual(markupNeg, -100, "Markup của k<0 phải an toàn trả về -100");
  assert.strictEqual(marginNeg, -100, "Margin của k<0 phải an toàn không chia 0 và trả về -100");
});

test("profit-calculator: calculateCommercialQuote tính đúng doanh thu và lãi gộp", () => {
  const baseCost = 10_000_000;
  const res = calculateCommercialQuote(baseCost, 1.65);

  assert.strictEqual(res.quotePrice, 16_500_000, "Giá báo khách phải là 16.500.000 đ");
  assert.strictEqual(res.grossProfit, 6_500_000, "Lãi gộp phải là 6.500.000 đ");
  assert.strictEqual(res.markupPercent, 65.0);
  assert.strictEqual(res.profitMarginPercent, 39.4);
});

test("profit-calculator: calculateModuleQuoteLine phân bổ chính xác theo tỷ lệ diện tích", () => {
  const moduleArea = 10;
  const totalArea = 40;
  const totalBaseCost = 20_000_000;
  const totalQuotePrice = 33_000_000;

  const line = calculateModuleQuoteLine(moduleArea, totalArea, totalBaseCost, totalQuotePrice);
  assert.strictEqual(line.ratio, 0.25);
  assert.strictEqual(line.baseCost, 5_000_000);
  assert.strictEqual(line.quotePrice, 8_250_000);
});

test("profit-calculator: formatPercentVi kiểm thử toàn diện các định dạng số", () => {
  assert.strictEqual(formatPercentVi(65), "65%", "Số nguyên phải rút gọn bỏ ,0");
  assert.strictEqual(formatPercentVi(65.0), "65%", "Số 65.0 phải rút gọn thành 65%");
  assert.strictEqual(formatPercentVi(39.4), "39,4%", "Số thập phân phải dùng dấu phẩy tiếng Việt");
  assert.strictEqual(formatPercentVi(65, true), "+65%", "includeSign=true cho số dương phải có dấu +");
  assert.strictEqual(formatPercentVi(0, true), "0%", "Số 0 không hiển thị dấu +");
  assert.strictEqual(formatPercentVi(-20, true), "-20%", "Số âm luôn giữ dấu -");
  assert.strictEqual(formatPercentVi(-15.5), "-15,5%", "Số âm thập phân định dạng chuẩn");
});

test("profit-calculator: resolveProjectProfitMargin phân giải đúng dự án cũ vs mới", () => {
  // Dự án cũ không có profitMargin -> fallback về 1.35
  assert.strictEqual(resolveProjectProfitMargin(undefined, false), DEFAULT_LEGACY_PROFIT_MARGIN);
  assert.strictEqual(resolveProjectProfitMargin(null, false), DEFAULT_LEGACY_PROFIT_MARGIN);
  assert.strictEqual(resolveProjectProfitMargin(0, false), DEFAULT_LEGACY_PROFIT_MARGIN);
  assert.strictEqual(resolveProjectProfitMargin(NaN, false), DEFAULT_LEGACY_PROFIT_MARGIN);

  // Dự án đã lưu có profitMargin cụ thể -> bảo toàn giá trị đã lưu
  assert.strictEqual(resolveProjectProfitMargin(1.35, false), 1.35);
  assert.strictEqual(resolveProjectProfitMargin(1.50, false), 1.50);
  assert.strictEqual(resolveProjectProfitMargin(1.65, false), 1.65);

  // Dự án mới tạo -> mặc định 1.65
  assert.strictEqual(resolveProjectProfitMargin(undefined, true), DEFAULT_NEW_PROFIT_MARGIN);
  assert.strictEqual(resolveProjectProfitMargin(null, true), DEFAULT_NEW_PROFIT_MARGIN);
});

test("profit-calculator: GOLDEN TEST - Cùng cutlist 48 tấm chạy qua engine.ts và quote-engine.ts", () => {
  const resEngine = calculateProject(SEED_PARTS, SEED_MATERIALS, { profitMargin: 1.65 });
  const resQuote = calculateQuoteEngine(SEED_PARTS, SEED_MATERIALS, 1.65);

  // So sánh chính xác từng số tiền
  assert.strictEqual(resEngine.totalBaseCost, resQuote.totalCost, "Tổng giá vốn xưởng phải trùng khớp 100%");
  assert.strictEqual(resEngine.totalQuotePrice, resQuote.totalQuotePrice, "Tổng giá báo khách phải trùng khớp 100%");
  assert.strictEqual(resEngine.estimatedProfit, resQuote.grossProfit, "Lãi gộp dự kiến phải trùng khớp 100%");
  assert.strictEqual(resEngine.totalSheets, resQuote.totalSheets, "Tổng số tấm ván đặt mua phải trùng khớp 100%");

  // Kiểm tra số tiền cụ thể của bộ benchmark 48 chi tiết (chuẩn xưởng)
  assert.strictEqual(resEngine.totalBaseCost, 16_559_450, "Giá vốn chuẩn xưởng là 16.559.450 đ");
  assert.strictEqual(resEngine.totalQuotePrice, 27_323_093, "Giá báo khách k=1.65 là 27.323.093 đ");
  assert.strictEqual(resEngine.estimatedProfit, 10_763_643, "Lãi gộp k=1.65 là 10.763.643 đ");
});

test("profit-calculator: KIỂM SOÁT RỦI RO - Mở lại 3 dự án (có và không có profitMargin)", () => {
  // Dự án 1: Dự án cũ không có profitMargin (legacy project missing profitMargin)
  const legacyQuote = calculateQuoteEngine(SEED_PARTS, SEED_MATERIALS, undefined);
  assert.strictEqual(legacyQuote.profitMargin, 1.35, "Dự án cũ thiếu profitMargin phải tự nhận mặc định cũ 1.35");
  assert.strictEqual(legacyQuote.totalCost, 16_559_450);
  assert.strictEqual(legacyQuote.totalQuotePrice, 22_355_258, "Giá bán của dự án cũ giữ nguyên ở 22.355.258 đ, KHÔNG bị nhảy lên 27.323.093 đ");

  // Dự án 2: Dự án cũ đã lưu với profitMargin = 1.35
  const saved135Quote = calculateQuoteEngine(SEED_PARTS, SEED_MATERIALS, 1.35);
  assert.strictEqual(saved135Quote.profitMargin, 1.35);
  assert.strictEqual(saved135Quote.totalCost, 16_559_450);
  assert.strictEqual(saved135Quote.totalQuotePrice, 22_355_258);

  // Dự án 3: Dự án mới có profitMargin = 1.65
  const new165Quote = calculateQuoteEngine(SEED_PARTS, SEED_MATERIALS, 1.65);
  assert.strictEqual(new165Quote.profitMargin, 1.65);
  assert.strictEqual(new165Quote.totalCost, 16_559_450);
  assert.strictEqual(new165Quote.totalQuotePrice, 27_323_093);
});

test("profit-calculator: REGRESSION FIXTURE TEST - So sánh đối soát với file fixture JSON code cũ", () => {
  const fixturePath = new URL("./fixtures/legacy-quotes-fixture.json", import.meta.url);
  const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf-8"));

  // 1. Đối soát bộ 48 tấm:
  const new48 = calculateQuoteEngine(SEED_PARTS, SEED_MATERIALS, 1.35);
  const expected48 = fixture.dataset_48_parts;

  const boardCost48 = new48.boards.reduce((s, b) => s + b.totalCost, 0);
  const hwCost48 = new48.hardware.reduce((s, h) => s + h.totalCost, 0);

  assert.strictEqual(boardCost48, expected48.totalBoardCost, "Chi phí ván phải khớp 100% với fixture code cũ");
  assert.strictEqual(hwCost48, expected48.totalHardwareCost, "Chi phí phụ kiện phải khớp 100% với fixture code cũ");
  assert.strictEqual(new48.laborCost, expected48.totalLaborCost, "Chi phí nhân công phải khớp 100% với fixture code cũ");
  assert.strictEqual(new48.totalSheets, expected48.totalSheets, "Tổng số tấm phải khớp 100% với fixture code cũ");

  // Kiểm tra sai lệch giá vốn: Giá vốn mới có thêm suppliesCost (+277.500 đ), ốc cam tính theo số tấm thực (-7.500 đ) và làm tròn chỉ (-70 đ)
  // Tổng chênh lệch đúng bằng 269.930 đ (+1.66%)
  const expectedDifference = 269_930;
  assert.strictEqual(
    new48.totalCost - expected48.totalCost,
    expectedDifference,
    "Sai lệch giữa engine mới và code cũ phải đúng bằng 269.930 đ (vật tư phụ 277.500 đ - 7.570 đ làm tròn)"
  );

  // 2. Đối soát bộ 18 tấm Tủ áo:
  const newTuAo = calculateQuoteEngine(SEED_PARTS.slice(0, 18), SEED_MATERIALS, 1.35);
  const expectedTuAo = fixture.dataset_tu_ao_18_parts;
  const boardCostTuAo = newTuAo.boards.reduce((s, b) => s + b.totalCost, 0);
  assert.strictEqual(boardCostTuAo, expectedTuAo.totalBoardCost, "Chi phí ván Tủ áo phải khớp 100% với fixture");
  assert.strictEqual(newTuAo.laborCost, expectedTuAo.totalLaborCost, "Nhân công Tủ áo phải khớp 100% với fixture");
});

test("profit-calculator: GOLDEN TEST - calculateLegacyV1 chạy qua fixture cũ đạt chuẩn sai số 0 đồng", () => {
  const fixturePath = new URL("./fixtures/legacy-quotes-fixture.json", import.meta.url);
  const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf-8"));

  // 1. Chạy benchmark 48 tấm qua calculateLegacyV1
  const leg48 = calculateLegacyV1(SEED_PARTS, SEED_MATERIALS, 1.35);
  const exp48 = fixture.dataset_48_parts;

  assert.strictEqual(leg48.totalCost, exp48.totalCost, "Giá vốn V1 bộ 48 tấm phải ĐÚNG 16.289.520 đ (sai số 0 đồng)");
  assert.strictEqual(leg48.totalQuotePrice, exp48.totalQuotePrice_k135, "Giá bán V1 bộ 48 tấm phải ĐÚNG 21.990.852 đ (sai số 0 đồng)");
  assert.strictEqual(leg48.grossProfit, exp48.grossProfit_k135, "Lãi gộp V1 bộ 48 tấm phải ĐÚNG 5.701.332 đ (sai số 0 đồng)");
  assert.strictEqual(leg48.totalSheets, exp48.totalSheets, "Tổng số tấm V1 phải ĐÚNG 18.5 tấm");

  // Kiểm tra cộng khớp nội bộ các khoản mục V1
  const sumV1_48 = leg48.boards.reduce((s, b) => s + b.totalCost, 0) +
    leg48.edges.totalCost +
    leg48.hardware.reduce((s, h) => s + h.totalCost, 0) +
    leg48.laborCost;
  assert.strictEqual(sumV1_48, leg48.totalCost, "Tổng các dòng khoản mục V1 phải cộng khớp 100% với totalCost (sai số 0 đồng)");

  // 2. Chạy bộ 18 tấm Tủ áo qua calculateLegacyV1
  const leg18 = calculateLegacyV1(SEED_PARTS.slice(0, 18), SEED_MATERIALS, 1.35);
  const exp18 = fixture.dataset_tu_ao_18_parts;
  assert.strictEqual(leg18.totalCost, exp18.totalCost, "Giá vốn V1 Tủ áo 18 tấm phải ĐÚNG 8.252.485 đ (sai số 0 đồng)");
  assert.strictEqual(leg18.totalQuotePrice, exp18.totalQuotePrice_k135, "Giá bán V1 Tủ áo 18 tấm phải ĐÚNG 11.140.855 đ (sai số 0 đồng)");

  // 3. Chạy bộ 16 tấm Tủ bếp qua calculateLegacyV1
  const leg16 = calculateLegacyV1(SEED_PARTS.slice(18, 34), SEED_MATERIALS, 1.35);
  const exp16 = fixture.dataset_tu_bep_16_parts;
  assert.strictEqual(leg16.totalCost, exp16.totalCost, "Giá vốn V1 Tủ bếp 16 tấm phải ĐÚNG 4.082.705 đ (sai số 0 đồng)");
  assert.strictEqual(leg16.totalQuotePrice, exp16.totalQuotePrice_k135, "Giá bán V1 Tủ bếp 16 tấm phải ĐÚNG 5.511.652 đ (sai số 0 đồng)");

  // 4. Dự án thật prj-sample-01 (Vinhomes Smart City) qua calculateLegacyV1
  const sampleProj = SEED_PROJECTS[0];
  const legSample = calculateLegacyV1(sampleProj.items, SEED_MATERIALS, 1.35);
  assert.strictEqual(legSample.totalCost, 16_289_520, "Dự án Vinhomes cũ qua V1 phải giữ nguyên 16.289.520 đ");
});

test("profit-calculator: BẢO TỒN PHIÊN BẢN (calcVersion 1 vs 2) TRONG calculateQuoteEngine", () => {
  // Dự án cũ (calcVersion = 1): Chạy calculateLegacyV1 ra ĐÚNG số cũ
  const resV1 = calculateQuoteEngine(SEED_PARTS, SEED_MATERIALS, 1.35, undefined, 1);
  assert.strictEqual(resV1.totalCost, 16_289_520, "calcVersion = 1 phải ra đúng giá vốn cũ 16.289.520 đ");
  assert.strictEqual(resV1.totalQuotePrice, 21_990_852, "calcVersion = 1 phải ra đúng giá bán cũ 21.990.852 đ");

  // Dự án mới (calcVersion = 2): Chạy engine chuẩn xưởng V2
  const resV2 = calculateQuoteEngine(SEED_PARTS, SEED_MATERIALS, 1.35, undefined, 2);
  assert.strictEqual(resV2.totalCost, 16_559_450, "calcVersion = 2 phải ra đúng giá vốn chuẩn xưởng 16.559.450 đ");
  assert.strictEqual(resV2.totalQuotePrice, 22_355_258, "calcVersion = 2 phải ra đúng giá bán chuẩn xưởng 22.355.258 đ");
});

test("profit-calculator: KHUNG ĐỐI SOÁT DỰ ÁN THỰC TẾ DO CHỦ XƯỞNG CUNG CẤP (fixtures/user-real-projects.json)", () => {
  const realProjPath = new URL("./fixtures/user-real-projects.json", import.meta.url);
  if (fs.existsSync(realProjPath)) {
    const realProjects = JSON.parse(fs.readFileSync(realProjPath, "utf-8"));
    realProjects.forEach((p: any) => {
      if (p.expectedTotalCost > 0 && p.expectedTotalQuote > 0) {
        const res = calculateQuoteEngine(SEED_PARTS, SEED_MATERIALS, p.k, undefined, p.calcVersion ?? 1);
        assert.strictEqual(res.totalCost, p.expectedTotalCost, `Dự án [${p.projectName}] giá vốn phải khớp với số thực tế`);
        assert.strictEqual(res.totalQuotePrice, p.expectedTotalQuote, `Dự án [${p.projectName}] giá bán phải khớp với số thực tế`);
      }
    });
  }
});


