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

test("cost-config: Định mức keo mặc định là 0 (không gán cứng 0.02 kg/md) và ngưỡng bản lề tùy chỉnh", () => {
  const customConfig = {
    suppliesRatePerSheet: 18_000,
    laborRatePerSheet: 130_000,
    hingesPerSheet: 2.2,
    slidesPerSheet: 0.4,
    hingeThresholds: [
      { maxHeightMm: 1000, hingeCount: 2 },
      { maxHeightMm: 1800, hingeCount: 3 },
      { maxHeightMm: 2400, hingeCount: 4 },
    ],
    glueRatePerMd: 0.035, // Người dùng tự nhập số thực tế
    glueUnitPrice: 95_000, // Đơn giá keo thực tế tại xưởng
  };

  const res = validateAndSanitizeCostConfig(customConfig);
  assert.strictEqual(res.glueRatePerMd, 0.035);
  assert.strictEqual(res.glueUnitPrice, 95_000);
  assert.strictEqual(res.hingeThresholds?.length, 3);
  assert.strictEqual(res.hingeThresholds?.[0].maxHeightMm, 1000);

  // Mặc định khi không khai báo keo: phải là 0
  const defaultConfig = validateAndSanitizeCostConfig({});
  assert.strictEqual(defaultConfig.glueRatePerMd, 0, "Keo mặc định là 0 để xưởng tự nhập thực tế");
  assert.strictEqual(defaultConfig.glueUnitPrice, 0, "Đơn giá keo mặc định là 0");
  assert.ok(Array.isArray(defaultConfig.hingeThresholds), "Ngưỡng bản lề mặc định là mảng cấu hình");
});
