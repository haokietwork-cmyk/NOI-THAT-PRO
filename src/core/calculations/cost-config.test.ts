import assert from "node:assert";
import test from "node:test";
import {
  WorkshopCostConfigSchema,
  validateAndSanitizeCostConfig,
} from "./cost-config-validator.ts";
import { DEFAULT_WORKSHOP_COST_CONFIG } from "../types/index.ts";

test("cost-config: Giá trị hợp lệ chuẩn xưởng được parse thành công", () => {
  const valid = {
    suppliesRatePerSheet: 20_000,
    laborRatePerSheet: 150_000,
    hingesPerSheet: 3.0,
    slidesPerSheet: 0.5,
  };

  const res = validateAndSanitizeCostConfig(valid);
  assert.strictEqual(res.suppliesRatePerSheet, 20_000);
  assert.strictEqual(res.laborRatePerSheet, 150_000);
  assert.strictEqual(res.hingesPerSheet, 3.0);
  assert.strictEqual(res.slidesPerSheet, 0.5);
});

test("cost-config: Giá trị âm tự động được chặn về 0", () => {
  const negativeInput = {
    suppliesRatePerSheet: -10_000,
    laborRatePerSheet: -50_000,
    hingesPerSheet: -2,
    slidesPerSheet: -1,
  };

  const res = validateAndSanitizeCostConfig(negativeInput);
  assert.strictEqual(res.suppliesRatePerSheet, 0, "Vật tư phụ âm phải bị chặn về 0");
  assert.strictEqual(res.laborRatePerSheet, 0, "Nhân công âm phải bị chặn về 0");
  assert.strictEqual(res.hingesPerSheet, 0, "Bản lề âm phải bị chặn về 0");
  assert.strictEqual(res.slidesPerSheet, 0, "Ray trượt âm phải bị chặn về 0");
});

test("cost-config: Giá trị vượt trần tự động bị giới hạn về ngưỡng trần", () => {
  const overCeilingInput = {
    suppliesRatePerSheet: 1_000_000, // Trần là 500.000
    laborRatePerSheet: 2_000_000,    // Trần là 1.000.000
    hingesPerSheet: 50,              // Trần là 20
    slidesPerSheet: 25,              // Trần là 10
  };

  const res = validateAndSanitizeCostConfig(overCeilingInput);
  assert.strictEqual(res.suppliesRatePerSheet, 500_000, "Vật tư phụ phải bị kẹp tại 500.000 đ/tấm");
  assert.strictEqual(res.laborRatePerSheet, 1_000_000, "Nhân công phải bị kẹp tại 1.000.000 đ/tấm");
  assert.strictEqual(res.hingesPerSheet, 20, "Bản lề phải bị kẹp tại 20 cái/tấm");
  assert.strictEqual(res.slidesPerSheet, 10, "Ray trượt phải bị kẹp tại 10 bộ/tấm");
});

test("cost-config: Thiếu trường hoặc input null/undefined fallback về mặc định an toàn", () => {
  const resNull = validateAndSanitizeCostConfig(null);
  assert.deepStrictEqual(resNull, DEFAULT_WORKSHOP_COST_CONFIG);

  const resUndefined = validateAndSanitizeCostConfig(undefined);
  assert.deepStrictEqual(resUndefined, DEFAULT_WORKSHOP_COST_CONFIG);

  const resEmptyObj = validateAndSanitizeCostConfig({});
  assert.deepStrictEqual(resEmptyObj, DEFAULT_WORKSHOP_COST_CONFIG);

  const resPartial = validateAndSanitizeCostConfig({
    suppliesRatePerSheet: 25_000,
  });
  assert.strictEqual(resPartial.suppliesRatePerSheet, 25_000);
  assert.strictEqual(resPartial.laborRatePerSheet, DEFAULT_WORKSHOP_COST_CONFIG.laborRatePerSheet);
  assert.strictEqual(resPartial.hingesPerSheet, DEFAULT_WORKSHOP_COST_CONFIG.hingesPerSheet);
  assert.strictEqual(resPartial.slidesPerSheet, DEFAULT_WORKSHOP_COST_CONFIG.slidesPerSheet);
});

test("cost-config: Zod schema safeParse trả về lỗi cụ thể khi dữ liệu không hợp lệ", () => {
  const invalidNegative = WorkshopCostConfigSchema.safeParse({
    suppliesRatePerSheet: -100,
    laborRatePerSheet: 100_000,
    hingesPerSheet: 2,
    slidesPerSheet: 1,
  });

  assert.strictEqual(invalidNegative.success, false);
  if (!invalidNegative.success) {
    const issue = invalidNegative.error.issues[0];
    assert.strictEqual(issue.path[0], "suppliesRatePerSheet");
  }
});
