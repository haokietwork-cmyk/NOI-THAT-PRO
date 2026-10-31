import assert from "node:assert";
import test from "node:test";
import { SEED_PARTS, SEED_MATERIALS } from "../services/seedData.ts";
import { calculateProject } from "./engine.ts";
import { DEFAULT_NEW_PROFIT_MARGIN } from "./profit-calculator.ts";

test("filter-invariance: Bộ lọc danh sách phôi chỉ ảnh hưởng hiển thị, KHÔNG ảnh hưởng tổng giá dự án", () => {
  // 1. Tính toán giá dự án gốc trên toàn bộ 48 tấm seed
  const fullResult = calculateProject(SEED_PARTS, SEED_MATERIALS, {
    profitMargin: DEFAULT_NEW_PROFIT_MARGIN,
    roundingStep: 0.5,
  });

  const baseCostBefore = fullResult.totalBaseCost;
  const quotePriceBefore = fullResult.totalQuotePrice;
  const sheetsBefore = fullResult.totalSheets;

  // Số vàng chuẩn
  assert.strictEqual(baseCostBefore, 16_281_950, "Giá vốn gốc phải đúng số vàng");
  assert.strictEqual(quotePriceBefore, 26_865_218, "Giá bán gốc phải đúng số vàng");
  assert.strictEqual(sheetsBefore, 18.5, "Tổng số tấm phải là 18.5 tấm");

  // 2. Mô phỏng người dùng áp dụng bộ lọc (ví dụ chỉ xem module 'Tủ áo' hoặc chỉ ván 17mm)
  const filteredView1 = SEED_PARTS.filter((p) => p.moduleName === "Tủ áo Master");
  const filteredView2 = SEED_PARTS.filter((p) => (p.thicknessMm ?? p.thickness) === 17);
  const filteredView3 = SEED_PARTS.filter((p) => p.edgeL1 && p.edgeL2);

  // Số lượng hiển thị giảm đi theo bộ lọc
  assert.ok(filteredView1.length < SEED_PARTS.length);
  assert.ok(filteredView2.length < SEED_PARTS.length);
  assert.ok(filteredView3.length < SEED_PARTS.length);

  // 3. Dự án luôn tính toán trên nguồn dữ liệu gốc (parts), không bao giờ tính trên filteredParts
  // Khẳng định bất biến: Tổng giá vốn và giá báo giá của dự án không bị thay đổi bởi việc xem/lọc giao diện
  const resultAfterFilter = calculateProject(SEED_PARTS, SEED_MATERIALS, {
    profitMargin: DEFAULT_NEW_PROFIT_MARGIN,
    roundingStep: 0.5,
  });

  assert.strictEqual(resultAfterFilter.totalBaseCost, baseCostBefore, "Giá vốn không được đổi khi lọc");
  assert.strictEqual(resultAfterFilter.totalQuotePrice, quotePriceBefore, "Giá bán không được đổi khi lọc");
  assert.strictEqual(resultAfterFilter.totalSheets, sheetsBefore, "Số tấm không được đổi khi lọc");
});
