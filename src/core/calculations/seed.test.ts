import assert from "node:assert";
import test from "node:test";
import { calculateQuoteEngine } from "./quote-engine.ts";
import { SEED_MATERIALS, SEED_PROJECTS } from "../services/seedData.ts";

test("seed: SEED_PROJECTS đồng bộ 100% với engine hiện tại", () => {
  const seedProject = SEED_PROJECTS[0];
  assert.ok(seedProject, "Phải có ít nhất 1 seed project");

  const calcResult = calculateQuoteEngine(
    seedProject.items,
    seedProject.materialsSnapshot || SEED_MATERIALS,
    seedProject.profitMargin,
    undefined,
    seedProject.costConfigSnapshot
  );

  // Khớp chính xác với các trường được lưu cứng trong SEED_PROJECTS
  assert.strictEqual(seedProject.totalCost, 16_281_950, "SEED_PROJECTS[0].totalCost phải là 16.281.950 đ");
  assert.strictEqual(seedProject.totalQuote, 26_865_218, "SEED_PROJECTS[0].totalQuote phải là 26.865.218 đ");

  // Đảm bảo kết quả engine tính toán trực tiếp từ items khớp 100% với dữ liệu lưu
  assert.strictEqual(calcResult.totalCost, seedProject.totalCost, "Engine tính ra totalCost phải trùng khớp 100% với SEED_PROJECTS[0].totalCost");
  assert.strictEqual(calcResult.totalQuotePrice, seedProject.totalQuote, "Engine tính ra totalQuotePrice phải trùng khớp 100% với SEED_PROJECTS[0].totalQuote");
  assert.strictEqual(calcResult.grossProfit, seedProject.totalQuote - seedProject.totalCost, "Lãi gộp = 10.583.268 đ");
});
