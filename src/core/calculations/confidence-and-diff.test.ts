import test from "node:test";
import assert from "node:assert/strict";
import {
  evaluateConfidence,
  calculateVersionDiff,
  getConfidenceBadgeStyle,
} from "./confidence-and-diff.ts";
import type { CostingQuestionnaire } from "./parametric-types.ts";

test("confidence-and-diff: Đánh giá 1 sao khi chọn vật tư đắt tiền mà thiếu giá", () => {
  const q: CostingQuestionnaire = {
    productType: "wardrobe",
    name: "Tủ áo Master",
    calcMode: "detail",
    dimensions: { widthMm: 1800, depthMm: 600, heightMm: 2400 },
    materials: {
      coreCode: "MDF_17_CHONG_AM",
      surfaceCode: "Melamine",
      hasStone: true,
      hasGlass: false,
      hasMetal: false,
      hasUpholstery: false,
      hasLed: false,
    },
    details: { drawerCount: 2, doorCount: 4 },
  };

  const res = evaluateConfidence("detail", q, true, 1);
  assert.equal(res.stars, 1);
  assert.equal(res.label, "Không tin cậy");
});

test("confidence-and-diff: Đánh giá 2 sao khi kích thước phi tiêu chuẩn", () => {
  const q: CostingQuestionnaire = {
    productType: "wardrobe",
    name: "Tủ áo Master",
    calcMode: "detail",
    dimensions: { widthMm: 5000, depthMm: 600, heightMm: 2400 }, // Quá rộng
    materials: {
      coreCode: "MDF_17_CHONG_AM",
      surfaceCode: "Melamine",
      hasStone: false,
      hasGlass: false,
      hasMetal: false,
      hasUpholstery: false,
      hasLed: false,
    },
    details: { drawerCount: 4, doorCount: 6 },
  };

  const res = evaluateConfidence("detail", q, true, 0);
  assert.equal(res.stars, 2);
  assert.equal(res.label, "Chỉ để định hướng");
});

test("confidence-and-diff: Đánh giá 3 sao khi tính ước nhanh hoặc để trống ngăn kéo", () => {
  const q: CostingQuestionnaire = {
    productType: "wardrobe",
    name: "Tủ áo Master",
    calcMode: "detail",
    dimensions: { widthMm: 1800, depthMm: 600, heightMm: 2400 },
    materials: {
      coreCode: "MDF_17_CHONG_AM",
      surfaceCode: "Melamine",
      hasStone: false,
      hasGlass: false,
      hasMetal: false,
      hasUpholstery: false,
      hasLed: false,
    },
    details: { drawerCount: undefined, doorCount: 4 }, // Tự nội suy
  };

  const res = evaluateConfidence("detail", q, true, 0);
  assert.equal(res.stars, 3);
  assert.equal(res.label, "Tham khảo");
});

test("confidence-and-diff: Đánh giá 4 sao khi chi tiết đủ và 5 sao khi từ mẫu chuẩn", () => {
  const q: CostingQuestionnaire = {
    productType: "wardrobe",
    name: "Tủ áo Master",
    calcMode: "detail",
    dimensions: { widthMm: 1800, depthMm: 600, heightMm: 2400 },
    materials: {
      coreCode: "MDF_17_CHONG_AM",
      surfaceCode: "Melamine",
      hasStone: false,
      hasGlass: false,
      hasMetal: false,
      hasUpholstery: false,
      hasLed: false,
    },
    details: { drawerCount: 2, doorCount: 4 },
  };

  const res4 = evaluateConfidence("detail", q, true, 0, false);
  assert.equal(res4.stars, 4);

  const res5 = evaluateConfidence("detail", q, true, 0, true);
  assert.equal(res5.stars, 5);
});

test("confidence-and-diff: Tính toán chênh lệch % giữa hai phiên bản", () => {
  const diffPositive = calculateVersionDiff(22_000_000, 20_000_000);
  assert.equal(diffPositive.isDifferent, true);
  assert.equal(diffPositive.formattedDiff, "+10.0%");
  assert.equal(diffPositive.diffAmount, 2_000_000);

  const diffNegative = calculateVersionDiff(18_000_000, 20_000_000);
  assert.equal(diffNegative.isDifferent, true);
  assert.equal(diffNegative.formattedDiff, "-10.0%");
  assert.equal(diffNegative.diffAmount, -2_000_000);

  const diffEqual = calculateVersionDiff(20_000_000, 20_000_000);
  assert.equal(diffEqual.isDifferent, false);
  assert.equal(diffEqual.formattedDiff, "0%");
});
