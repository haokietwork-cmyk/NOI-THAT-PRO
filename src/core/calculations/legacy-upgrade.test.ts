import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  isLegacyCalculationProject,
  calculateUpgradePreview,
  applyProjectFormulaUpgrade,
} from "./legacy-upgrade.ts";
import type { SavedProject } from "../types/index.ts";

describe("legacy-upgrade: Nâng cấp dự án nháp dùng công thức cũ (P1 - H4)", () => {
  const mockLegacyProject: SavedProject = {
    id: "proj-legacy-001",
    projectName: "Tủ bếp nháp cũ",
    clientName: "Anh Dũng",
    status: "draft",
    createdAt: "2026-10-01T00:00:00Z",
    calcVersion: 0, // Công thức cũ trước đây chưa có vật tư phụ
    roundingStep: 0.5,
    profitMargin: 1.65,
    totalCost: 10_000_000,
    totalQuote: 16_500_000,
    materialsSnapshot: [],
    items: [
      {
        id: "p1",
        moduleName: "Tủ dưới",
        partName: "Hông tủ",
        lengthMm: 800,
        widthMm: 600,
        thicknessMm: 17,
        qty: 4,
        materialCode: "MDF_17",
        edgeL1: false,
        edgeL2: false,
        edgeW1: false,
        edgeW2: false,
      },
    ],
    costConfigSnapshot: {
      suppliesRatePerSheet: 0, // Chưa tính vật tư phụ
      laborRatePerSheet: 120_000,
      hingesPerSheet: 2.0,
      slidesPerSheet: 0.35,
    },
  };

  test("isLegacyCalculationProject nhận diện chính xác dự án cũ cần nâng cấp", () => {
    assert.equal(isLegacyCalculationProject(mockLegacyProject), true);

    // Dự án đã khóa hợp đồng không bao giờ cho nâng cấp
    const lockedProject: SavedProject = { ...mockLegacyProject, isLocked: true };
    assert.equal(isLegacyCalculationProject(lockedProject), false);

    // Dự án đã gửi khách (quoted/approved) không cho nâng cấp tùy tiện
    const quotedProject: SavedProject = { ...mockLegacyProject, status: "quoted" };
    assert.equal(isLegacyCalculationProject(quotedProject), false);

    // Dự án đã có calcVersion = 1 và có vật tư phụ
    const modernProject: SavedProject = {
      ...mockLegacyProject,
      calcVersion: 1,
      costConfigSnapshot: {
        suppliesRatePerSheet: 15_000,
        laborRatePerSheet: 120_000,
        hingesPerSheet: 2.0,
        slidesPerSheet: 0.35,
      },
    };
    assert.equal(isLegacyCalculationProject(modernProject), false);
  });

  test("calculateUpgradePreview tính trước mức chênh lệch tài chính minh bạch", () => {
    const preview = calculateUpgradePreview(mockLegacyProject, {
      suppliesRatePerSheet: 15_000,
      laborRatePerSheet: 120_000,
      hingesPerSheet: 2.0,
      slidesPerSheet: 0.35,
    });

    assert.equal(preview.currentCalcVersion, 0);
    assert.equal(preview.targetCalcVersion, 1);
    assert.equal(preview.currentCost, 10_000_000);
    assert.equal(preview.currentQuote, 16_500_000);
    assert.ok(preview.suppliesCostAdded > 0, "Phải tính thêm tiền vật tư phụ");
    assert.equal(typeof preview.diffCost, "number");
    assert.equal(typeof preview.diffQuote, "number");
  });

  test("applyProjectFormulaUpgrade chuyển đổi calcVersion sang 1 và cập nhật đúng số tiền", () => {
    const upgraded = applyProjectFormulaUpgrade(mockLegacyProject, {
      suppliesRatePerSheet: 15_000,
      laborRatePerSheet: 120_000,
      hingesPerSheet: 2.0,
      slidesPerSheet: 0.35,
    });

    assert.equal(upgraded.calcVersion, 1);
    assert.equal(upgraded.costConfigSnapshot?.suppliesRatePerSheet, 15_000);
    assert.ok(upgraded.totalCost > 0);
    assert.ok(upgraded.totalQuote > 0);
    assert.ok(upgraded.updatedAt);

    // Sau khi nâng cấp xong thì không còn coi là legacy nữa
    assert.equal(isLegacyCalculationProject(upgraded), false);
  });
});
