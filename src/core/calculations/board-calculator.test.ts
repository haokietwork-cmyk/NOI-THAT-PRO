import assert from "node:assert";
import test from "node:test";
import {
  STANDARD_BOARD,
  DEFAULT_BOARD_WASTE_FACTOR,
  calculateNetArea,
  calculateGrossArea,
  calculateSheetsNeeded,
} from "./board-calculator.ts";

test("board-calculator: Chuẩn kích thước khổ tấm ván tiêu chuẩn", () => {
  assert.strictEqual(STANDARD_BOARD.LENGTH_MM, 2440);
  assert.strictEqual(STANDARD_BOARD.WIDTH_MM, 1220);
  assert.strictEqual(STANDARD_BOARD.AREA_M2, 2.9768);
  assert.strictEqual(DEFAULT_BOARD_WASTE_FACTOR, 1.15);
});

test("board-calculator: Tính diện tích Net chính xác cho 1 tấm và nhiều tấm", () => {
  // 1 tấm đúng khổ 2440 x 1220
  const netSingle = calculateNetArea(2440, 1220, 1);
  assert.strictEqual(Number(netSingle.toFixed(4)), 2.9768);

  // 10 tấm cánh tủ 2000 x 500
  const netTen = calculateNetArea(2000, 500, 10);
  assert.strictEqual(netTen, 10); // 2 * 0.5 * 10 = 10 m2

  // Kích thước hoặc số lượng không hợp lệ (<= 0) trả về 0
  assert.strictEqual(calculateNetArea(0, 500, 1), 0);
  assert.strictEqual(calculateNetArea(2000, -100, 1), 0);
  assert.strictEqual(calculateNetArea(2000, 500, 0), 0);
});

test("board-calculator: Tính diện tích Gross với các hệ số hao hụt 1.15, 1.12, 1.18", () => {
  const net = 10; // 10 m2

  // Ván chuẩn 17mm: hao hụt 15% (1.15)
  assert.strictEqual(calculateGrossArea(net, 1.15), 11.5);

  // Ván hậu 6mm: hao hụt 12% (1.12)
  assert.strictEqual(calculateGrossArea(net, 1.12), 11.2);

  // Ván khổ lớn Jumbo: hao hụt 18% (1.18)
  assert.strictEqual(calculateGrossArea(net, 1.18), 11.8);
});

test("board-calculator: Quy đổi số tấm với bước làm tròn 0.5 tấm và 1.0 tấm", () => {
  // Net = 10m2, waste = 1.15 -> Gross = 11.5m2
  // Raw sheets = 11.5 / 2.9768 = 3.8632 tấm

  // Làm tròn theo bước 0.5 tấm -> 4.0 tấm
  const sheetsHalf = calculateSheetsNeeded(10, 1.15, 2.9768, true);
  assert.strictEqual(sheetsHalf, 4.0);

  // Làm tròn theo tấm nguyên (1.0) -> 4.0 tấm
  const sheetsWhole = calculateSheetsNeeded(10, 1.15, 2.9768, false);
  assert.strictEqual(sheetsWhole, 4.0);

  // Trường hợp raw = 3.2 tấm:
  // Gross = 3.2 * 2.9768 = 9.52576m2
  const netFor32 = 9.52576 / 1.0;
  assert.strictEqual(calculateSheetsNeeded(netFor32, 1.0, 2.9768, true), 3.5, "3.2 tấm làm tròn 0.5 lên 3.5");
  assert.strictEqual(calculateSheetsNeeded(netFor32, 1.0, 2.9768, false), 4.0, "3.2 tấm làm tròn nguyên lên 4.0");

  // Diện tích <= 0 trả về 0 tấm
  assert.strictEqual(calculateSheetsNeeded(0, 1.15, 2.9768, true), 0);
});

test("board-calculator: Chịu tải với số lượng lớn (stress test)", () => {
  // 50.000 chi tiết tấm
  const netLarge = calculateNetArea(1200, 600, 50_000);
  assert.strictEqual(netLarge, 36_000); // 1.2 * 0.6 * 50000 = 36000 m2
  const sheetsLarge = calculateSheetsNeeded(netLarge, 1.15, 2.9768, true);
  // Gross = 36000 * 1.15 = 41400 m2 / 2.9768 = 13907.5517 -> 13908 tấm
  assert.strictEqual(sheetsLarge, 13908);
});
