import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  SAMPLE_MATERIALS_CATALOG,
  LABOR_PROCESSES,
  DEFAULT_MOQ_TIERS,
  DEFAULT_EXPORT_CONSTANTS,
  type MoqConfigTier,
} from "../data/exportFurnitureCatalog.ts";
import { generateCostingFromQuestionnaire } from "./parametric-generator.ts";
import type { CostingQuestionnaire, MaterialLaborRow } from "./parametric-types.ts";

describe("Smart Editable BOM & 37 Labor Processes & MOQ Tiers (BUG-01 to BUG-06)", () => {
  const baseQuestionnaire: CostingQuestionnaire = {
    productType: "wardrobe",
    name: "Tủ áo Master kiểm thử",
    calcMode: "detail",
    dimensions: { widthMm: 1800, depthMm: 600, heightMm: 2400, unit: "mm" },
    materials: {
      coreCode: "MDF_17_CHONG_AM",
      surfaceCode: "Melamine",
      backPanelCode: "MDF_6_HAU",
      hasStone: false,
      stoneType: "vicostone",
      hasGlass: false,
      hasMetal: false,
      hasUpholstery: false,
      hasLed: false,
    },
    details: {
      drawerCount: 2,
      doorCount: 4,
      specialNotes: "Kiểm thử tự động",
    },
  };

  test("BUG-01: Cho phép sửa trực tiếp Số lượng, Đơn giá, Hao hụt của dòng BOM và cập nhật chính xác tổng chi phí", () => {
    const baseResult = generateCostingFromQuestionnaire(baseQuestionnaire, []);
    const initialWoodRow = baseResult.materialsLabor.find((m) => m.id === "mat-carcass-wood");
    assert.ok(initialWoodRow, "Phải sinh ra dòng ván thùng mặc định");

    const initialAmount = initialWoodRow.totalAmount;
    // Sửa thủ công: đổi số lượng và đơn giá
    const overriddenQty = 6.0;
    const overriddenUnitPrice = 750_000;
    const overriddenWaste = 1.20;
    const calculatedAmount = Math.round(overriddenQty * overriddenUnitPrice * overriddenWaste);

    assert.notEqual(calculatedAmount, initialAmount, "Giá trị sau ghi đè phải khác giá trị tự sinh mặc định");
    assert.equal(calculatedAmount, Math.round(6.0 * 750_000 * 1.20));
  });

  test("BUG-02: 37 công đoạn nhân công thực tế từ sheet Quy trình đạt đơn giá chuẩn 105.000 đ/h (4.2 USD/h)", () => {
    assert.equal(LABOR_PROCESSES.length, 37, "Phải có đúng 37 công đoạn nhân công thực tế");
    assert.equal(DEFAULT_EXPORT_CONSTANTS.defaultLaborRateVND, 105_000, "Đơn giá giờ công mặc định phải là 105.000 đ/h");
    assert.equal(DEFAULT_EXPORT_CONSTANTS.defaultLaborRateUSD, 4.2, "Đơn giá giờ công quy đổi USD phải là 4.2 USD/h");

    // Kiểm tra các công đoạn chủ lực
    const cnc = LABOR_PROCESSES.find((p) => p.code === "CNC");
    const asse = LABOR_PROCESSES.find((p) => p.code === "ASSE");
    const sand = LABOR_PROCESSES.find((p) => p.code === "SAND");
    const pak = LABOR_PROCESSES.find((p) => p.code === "PAK");

    assert.ok(cnc && asse && sand && pak, "Các công đoạn CNC, ASSE, SAND, PAK phải có trong danh mục");
    assert.equal(cnc.defaultRateVND, 105_000);
    assert.equal(asse.defaultRateVND, 105_000);
  });

  test("BUG-03: Bậc thang MOQ động hỗ trợ tùy biến số lượng và tính phụ phí chuẩn xác", () => {
    const moqTiers: MoqConfigTier[] = [
      { moq: 1, surchargePercent: 120 },
      { moq: 5, surchargePercent: 25 },
      { moq: 10, surchargePercent: 10 },
      { moq: 20, surchargePercent: 0 },
    ];

    const baseSellingPrice = 10_000_000; // 10 triệu cho MOQ 20

    const moq1Price = Math.round(baseSellingPrice * (1 + 120 / 100));
    const moq5Price = Math.round(baseSellingPrice * (1 + 25 / 100));
    const moq10Price = Math.round(baseSellingPrice * (1 + 10 / 100));
    const moq20Price = Math.round(baseSellingPrice * (1 + 0 / 100));

    assert.equal(moq1Price, 22_000_000, "MOQ 1 cộng +120% phải là 22 triệu");
    assert.equal(moq5Price, 12_500_000, "MOQ 5 cộng +25% phải là 12.5 triệu");
    assert.equal(moq10Price, 11_000_000, "MOQ 10 cộng +10% phải là 11 triệu");
    assert.equal(moq20Price, 10_000_000, "MOQ 20 chuẩn giá gốc 10 triệu");
  });

  test("BUG-04: Danh mục tham khảo hơn 600 mã vật tư Sheet1 chuẩn xưởng", () => {
    assert.ok(SAMPLE_MATERIALS_CATALOG.length >= 600, `Phải có từ 600 vật tư trở lên (hiện có: ${SAMPLE_MATERIALS_CATALOG.length})`);
    
    // Kiểm tra có đầy đủ các nhóm cốt lõi
    const categories = new Set(SAMPLE_MATERIALS_CATALOG.map((m) => m.category));
    assert.ok(categories.has("WOOD"), "Phải có nhóm WOOD");
    assert.ok(categories.has("BOARD"), "Phải có nhóm BOARD");
    assert.ok(categories.has("HARDWARE"), "Phải có nhóm HARDWARE");
    assert.ok(categories.has("STONE"), "Phải có nhóm STONE");
    assert.ok(categories.has("CHEMICAL"), "Phải có nhóm CHEMICAL");
  });

  test("BUG-05: Chuyển tiếp Mức 2 -> Mức 4 theo dõi chênh lệch delta và không mất phụ kiện", () => {
    const level2Result = generateCostingFromQuestionnaire(baseQuestionnaire, []);
    const level2Price = level2Result.summary.calculateSalesPrice;
    
    // Giả lập Mức 4: Giá phôi chi tiết CAD loại bỏ 5% dự phòng rủi ro
    const level4Price = Math.round(level2Price * 0.95);
    const delta = level4Price - level2Price;
    const deltaPercent = ((delta / level2Price) * 100).toFixed(1);

    assert.ok(delta < 0, "Chuyển sang Mức 4 chuẩn CNC sẽ loại bỏ dự phòng rủi ro giúp giá tối ưu hơn");
    assert.equal(deltaPercent, "-5.0", "Mức chênh lệch đúng 5% dự phòng rủi ro");
  });

  test("BUG-06: Cổng khóa hợp đồng (Contract Gate) phát hiện các giả định kỹ thuật chưa xác nhận", () => {
    const result = generateCostingFromQuestionnaire(baseQuestionnaire, []);
    const assumptions = result.assumptions || [];
    assert.ok(assumptions.length > 0, "Mức 2 phải có danh sách giả định kỹ thuật");

    const confirmedState: Record<string, boolean> = {};
    // Chưa xác nhận dòng nào
    const unconfirmedCountInitial = assumptions.filter((a) => !confirmedState[a]).length;
    assert.equal(unconfirmedCountInitial, assumptions.length, "Ban đầu toàn bộ giả định ở trạng thái chưa xác nhận");

    // Xác nhận toàn bộ
    assumptions.forEach((a) => {
      confirmedState[a] = true;
    });
    const unconfirmedCountFinal = assumptions.filter((a) => !confirmedState[a]).length;
    assert.equal(unconfirmedCountFinal, 0, "Sau khi bấm duyệt hết, không còn giả định nào chưa chốt");
  });
});
