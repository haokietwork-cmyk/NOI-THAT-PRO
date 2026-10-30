import assert from "node:assert";
import test from "node:test";
import {
  DEFAULT_EDGE_WASTE_FACTOR,
  calculateEdgeMeters,
} from "./edge-calculator.ts";

test("edge-calculator: Hệ số hao hụt mặc định chuẩn ngành 8%", () => {
  assert.strictEqual(DEFAULT_EDGE_WASTE_FACTOR, 1.08);
});

test("edge-calculator: Tấm không dán cạnh nào trả về 0 mét", () => {
  const metersNone = calculateEdgeMeters(1000, 500, 10, {
    l1: false,
    l2: false,
    w1: false,
    w2: false,
  });
  assert.strictEqual(metersNone, 0);

  // Không truyền config cạnh
  assert.strictEqual(calculateEdgeMeters(1000, 500, 10, {}), 0);
});

test("edge-calculator: Dán 1 cạnh, 2 cạnh và dán đủ 4 cạnh", () => {
  // Dán 1 cạnh dài L1: 1000mm, 1 tấm
  // Net = 1.0m * 1.08 = 1.08m
  const m1 = calculateEdgeMeters(1000, 500, 1, { l1: true }, 1.08);
  assert.strictEqual(m1, 1.08);

  // Dán 2 cạnh dài L1 + L2: (1000 + 1000) * 1 = 2000mm = 2.0m * 1.08 = 2.16m
  const m2 = calculateEdgeMeters(1000, 500, 1, { l1: true, l2: true }, 1.08);
  assert.strictEqual(m2, 2.16);

  // Dán đủ 4 cạnh: (1000*2 + 500*2) * 5 tấm = 3000mm * 5 = 15,000mm = 15.0m
  // Gross = 15.0 * 1.08 = 16.2m
  const m4 = calculateEdgeMeters(1000, 500, 5, { l1: true, l2: true, w1: true, w2: true }, 1.08);
  assert.strictEqual(m4, 16.2);
});

test("edge-calculator: Số lượng không hợp lệ hoặc <= 0", () => {
  assert.strictEqual(calculateEdgeMeters(1000, 500, 0, { l1: true }), 0);
  assert.strictEqual(calculateEdgeMeters(1000, 500, -5, { l1: true }), 0);
});

test("edge-calculator: Số lượng lớn tấm chi tiết (stress test)", () => {
  // 10.000 cánh tủ dán 4 cạnh (chiều dài 2000mm, rộng 500mm)
  // Mỗi cánh = 2*2.0 + 2*0.5 = 5.0m
  // 10.000 cánh = 50.000m net
  // Gross hao hụt 8% = 50.000 * 1.08 = 54.000m
  const mStress = calculateEdgeMeters(2000, 500, 10_000, {
    l1: true,
    l2: true,
    w1: true,
    w2: true,
  }, 1.08);
  assert.strictEqual(mStress, 54_000);
});
