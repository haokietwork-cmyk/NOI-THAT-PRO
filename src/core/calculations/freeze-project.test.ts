import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  isProjectContractLocked,
  computeItemsHash,
  freezeProjectContract,
  createProjectRevision,
  verifyProjectIntegrity,
} from "./freeze-project.ts";
import type { SavedProject, ProjectCalculationResult } from "../types/index.ts";

describe("freeze-project: Tính năng đóng băng hợp đồng dự án (P1 - H1)", () => {
  const mockProject: SavedProject = {
    id: "proj-101",
    projectName: "Biệt thự Ecopark",
    clientName: "Chị Linh",
    status: "quoted",
    createdAt: "2026-10-31T00:00:00Z",
    roundingStep: 0.5,
    profitMargin: 1.65,
    totalCost: 16_281_950,
    totalQuote: 26_865_218,
    versionNo: 1,
    materialsSnapshot: [],
    items: [
      {
        id: "p1",
        moduleName: "Tủ bếp",
        partName: "Hông tủ",
        lengthMm: 800,
        widthMm: 600,
        thicknessMm: 17,
        qty: 2,
        materialCode: "MDF_17_VANG",
        edgeL1: true,
        edgeL2: false,
        edgeW1: true,
        edgeW2: false,
      },
    ],
  };

  const mockCalcResult: ProjectCalculationResult = {
    boards: [
      {
        materialCode: "MDF_17_VANG",
        materialName: "MDF 17mm",
        netAreaM2: 0.96,
        wasteFactor: 1.15,
        grossAreaM2: 1.104,
        standardSheetAreaM2: 2.9768,
        sheetsToBuy: 0.5,
        unitPrice: 680_000,
        totalCost: 340_000,
      },
    ],
    edges: [],
    hardwareCost: 500_000,
    laborCost: 1_200_000,
    suppliesCost: 200_000,
    totalBaseCost: 2_240_000,
    moduleQuotes: [],
    totalQuotePrice: 3_696_000,
    estimatedProfit: 1_456_000,
    totalSheets: 0.5,
    totalEdgeLengthMd: 2.8,
    missingPriceCodes: [],
  };

  test("isProjectContractLocked nhận diện chính xác các trạng thái chốt hợp đồng", () => {
    assert.equal(isProjectContractLocked("draft"), false);
    assert.equal(isProjectContractLocked("quoted"), false);
    assert.equal(isProjectContractLocked("approved"), true);
    assert.equal(isProjectContractLocked("ordered"), true);
    assert.equal(isProjectContractLocked("in_production"), true);
    assert.equal(isProjectContractLocked("finalized"), true);
    assert.equal(isProjectContractLocked("draft", true), true, "isLocked = true luôn ưu tiên");
  });

  test("freezeProjectContract khóa chặt dự án, tạo snapshot BOM và hash cutlist", () => {
    const frozen = freezeProjectContract(mockProject, mockCalcResult, "approved");

    assert.equal(frozen.isLocked, true);
    assert.equal(frozen.status, "approved");
    assert.ok(frozen.frozenAt);
    assert.equal(frozen.totalCost, 2_240_000);
    assert.equal(frozen.totalQuote, 3_696_000);

    // Kiểm tra snapshotTotals
    assert.ok(frozen.snapshotTotals);
    assert.equal(frozen.snapshotTotals?.totalCost, 2_240_000);
    assert.equal(frozen.snapshotTotals?.totalQuote, 3_696_000);
    assert.equal(frozen.snapshotTotals?.totalSheets, 0.5);
    assert.equal(frozen.snapshotTotals?.boardsSummary.length, 1);
    assert.ok(frozen.snapshotTotals?.itemsHash);

    // Tính toàn vẹn lúc này phải đạt 100%
    const check = verifyProjectIntegrity(frozen);
    assert.equal(check.intact, true);
  });

  test("verifyProjectIntegrity phát hiện can thiệp sửa đổi trái phép sau khi đóng băng", () => {
    const frozen = freezeProjectContract(mockProject, mockCalcResult, "approved");

    // 1. Can thiệp sửa giá vốn
    const tamperedCost = { ...frozen, totalCost: 1_000_000 };
    const check1 = verifyProjectIntegrity(tamperedCost);
    assert.equal(check1.intact, false);
    assert.match(check1.reason || "", /Giá vốn đã bị sửa đổi/);

    // 2. Can thiệp sửa danh sách tấm phôi
    const tamperedItems = {
      ...frozen,
      items: [
        ...frozen.items,
        {
          id: "p2",
          moduleName: "Tủ bếp",
          partName: "Đáy",
          lengthMm: 600,
          widthMm: 600,
          thicknessMm: 17,
          qty: 1,
          materialCode: "MDF_17_VANG",
          edgeL1: false,
          edgeL2: false,
          edgeW1: false,
          edgeW2: false,
        },
      ],
    };
    const check2 = verifyProjectIntegrity(tamperedItems);
    assert.equal(check2.intact, false);
    assert.match(check2.reason || "", /cutlist.*can thiệp trái phép/);
  });

  test("createProjectRevision tạo bản sao v2 độc lập và giữ nguyên bản gốc v1", () => {
    const v1 = freezeProjectContract(mockProject, mockCalcResult, "approved");

    const v2 = createProjectRevision(v1, "proj-101-v2");

    // Bản v2: mở khóa, trạng thái draft, version tăng lên 2
    assert.equal(v2.id, "proj-101-v2");
    assert.equal(v2.parentProjectId, v1.id);
    assert.equal(v2.versionNo, 2);
    assert.equal(v2.status, "draft");
    assert.equal(v2.isLocked, false);
    assert.equal(v2.frozenAt, undefined);
    assert.equal(v2.snapshotTotals, undefined);
    assert.equal(v2.items.length, 1);

    // Thử sửa đổi v2
    v2.items[0].qty = 10;
    v2.totalCost = 50_000_000;

    // Bản v1 gốc phải hoàn toàn không bị ảnh hưởng (bất biến)
    assert.equal(v1.items[0].qty, 2, "Bản v1 gốc không bị sửa chéo");
    assert.equal(v1.totalCost, 2_240_000, "Bản v1 giữ nguyên giá chốt");
    assert.equal(v1.isLocked, true);
  });
});
