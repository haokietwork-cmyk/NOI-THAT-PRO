import test from "node:test";
import assert from "node:assert/strict";
import {
  scaleFromTemplate,
  findSimilarItems,
} from "./template-scaler.ts";
import type { SimilarProjectItem } from "./template-scaler.ts";
import type { CostingQuestionnaire } from "./parametric-types.ts";

const mockTemplates: SimilarProjectItem[] = [
  {
    id: "tpl-1",
    projectCode: "QOT-2026-001",
    projectName: "Căn hộ Vinhomes 2PN",
    productName: "Tủ áo Master 3 cánh",
    archetype: "wardrobe",
    dimensions: { widthMm: 1600, depthMm: 600, heightMm: 2400 },
    totalLM: 18_000_000,
    totalCost: 22_500_000,
    createdAt: "2026-10-15",
  },
  {
    id: "tpl-2",
    projectCode: "QOT-2026-002",
    projectName: "Biệt thự Ciputra",
    productName: "Tủ áo kịch trần 4 cánh",
    archetype: "wardrobe",
    dimensions: { widthMm: 2200, depthMm: 600, heightMm: 2600 },
    totalLM: 25_000_000,
    totalCost: 31_000_000,
    createdAt: "2026-10-20",
  },
  {
    id: "tpl-3",
    projectCode: "QOT-2026-003",
    projectName: "Nhà phố Ecopark",
    productName: "Bàn ăn mặt đá 6 ghế",
    archetype: "table",
    dimensions: { widthMm: 1600, depthMm: 800, heightMm: 750 },
    totalLM: 12_000_000,
    totalCost: 15_000_000,
    createdAt: "2026-10-25",
  },
];

test("template-scaler: Báo lỗi khi mẫu thiếu kích thước tổng W x D x H", () => {
  const badTemplate: any = {
    id: "bad",
    projectCode: "BAD-01",
    productName: "Mẫu hỏng",
    dimensions: null,
  };

  const targetQ: CostingQuestionnaire = {
    productType: "wardrobe",
    name: "Tủ áo",
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

  assert.throws(
    () => scaleFromTemplate(badTemplate, targetQ),
    /Sản phẩm mẫu đó thiếu kích thước tổng trong hệ thống — vui lòng chọn mẫu khác trong danh sách\./
  );
});

test("template-scaler: Co giãn định mức từ mẫu chuẩn và gắn nhãn 5 sao", () => {
  const targetQ: CostingQuestionnaire = {
    productType: "wardrobe",
    name: "Tủ áo",
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

  const res = scaleFromTemplate(mockTemplates[0], targetQ);
  assert.equal(res.sourceTemplateCode, "QOT-2026-001");
  assert.equal(res.scaleRatios.widthRatio, 1800 / 1600);
  assert.equal(res.costing.confidence.stars, 5);
  assert.equal(res.costing.confidence.label, "Rất sát");
});

test("template-scaler: Tìm kiếm sản phẩm tương tự sắp xếp theo độ gần kích thước", () => {
  const similar = findSimilarItems("wardrobe", 1700, 600, 2400, mockTemplates);
  assert.equal(similar.length, 2);
  // tpl-1 (1600mm) gần 1700mm hơn tpl-2 (2200mm)
  assert.equal(similar[0].id, "tpl-1");
  assert.equal(similar[1].id, "tpl-2");
});
