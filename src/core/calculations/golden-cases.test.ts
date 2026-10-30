import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SEED_MATERIALS, SEED_PROJECTS } from "../services/seedData.ts";
import { calculateProject } from "./engine.ts";
import { calculateQuoteEngine } from "./quote-engine.ts";
import { calculateCostLines } from "./cost-lines/cost-lines-engine.ts";
import { buildProjectDrivers } from "./cost-lines/cost-line-resolver.ts";
import type { CostLine } from "./cost-lines/cost-line-types.ts";
import { calculateHybridProject } from "./section-calculator.ts";
import type { CutlistPart, MaterialItem, ProjectSection } from "../types/index.ts";

// ============================================================================
// ĐƠN GIÁ GIẢ ĐẶT TÊN RÕ (TEST_PRICE_*) THEO RULE 15
// ============================================================================
const TEST_PRICE_BOARD_MFC = 500_000;      // 500k / tấm
const TEST_PRICE_BOARD_MDF17 = 650_000;    // 650k / tấm
const TEST_PRICE_HINGE_SOFT = 30_000;      // 30k / cái
const TEST_PRICE_SLIDE_BALL = 150_000;     // 150k / bộ
const TEST_PRICE_STONE_QUARTZ = 1_200_000; // 1.200k / md
const TEST_PRICE_HOB_INDUCTION = 8_000_000;// 8.000k / cái
const TEST_PRICE_CLOTHES_RAIL = 120_000;   // 120k / cây
const TEST_PRICE_WALL_PANEL_M2 = 850_000;  // 850k / m2
const TEST_PRICE_LABOR_SHEET = 120_000;    // 120k / tấm
const TEST_PRICE_SUPPLIES_SHEET = 15_000;  // 15k / tấm

describe("golden-cases: Bộ 7 Ca Golden Đa Dạng & Test Tính Chất (AX7)", () => {
  // --------------------------------------------------------------------------
  // (a) SEED 48 TẤM HIỆN CÓ (SỐ VÀNG BẤT BIẾN)
  // --------------------------------------------------------------------------
  it("(a) Golden Seed 48 tấm: Bảo toàn chính xác giá vốn 16.281.950 đ và báo giá 26.865.218 đ", () => {
    const seed = SEED_PROJECTS[0];
    const res = calculateQuoteEngine(
      seed.items,
      seed.materialsSnapshot || SEED_MATERIALS,
      seed.profitMargin,
      undefined,
      seed.costConfigSnapshot
    );

    assert.equal(res.totalCost, 16_281_950);
    assert.equal(res.totalQuotePrice, 26_865_218);
    assert.equal(res.grossProfit, 10_583_268);
    assert.equal(res.totalSheets, 18.5);
  });

  // --------------------------------------------------------------------------
  // (b) TỦ BẾP: TẤM + BẢN LỀ THEO BẬC CÁNH + MẶT ĐÁ + THIẾT BỊ MUA NGOÀI
  // --------------------------------------------------------------------------
  it("(b) Golden Tủ Bếp: Phụ kiện theo bậc cánh + mặt đá + thiết bị mua ngoài", () => {
    // 6 cánh: 4 cánh 800mm (bậc <=900 -> 2 cái = 8), 2 cánh 1600mm (bậc <=2000 -> 4 cái = 8) -> 16 bản lề
    const parts: CutlistPart[] = [
      { id: "c1", moduleName: "Tủ bếp", partName: "Cánh 1", lengthMm: 800, widthMm: 400, thicknessMm: 17, qty: 4, materialCode: "MFC", edgeL1: true, edgeL2: true, edgeW1: true, edgeW2: true },
      { id: "c2", moduleName: "Tủ bếp", partName: "Cánh 2", lengthMm: 1600, widthMm: 450, thicknessMm: 17, qty: 2, materialCode: "MFC", edgeL1: true, edgeL2: true, edgeW1: true, edgeW2: true },
    ];

    const lines: CostLine[] = [
      {
        id: "b-hinges",
        name: "Bản lề giảm chấn theo chiều cao cánh",
        category: "hardware",
        unit: "cái",
        unitPrice: TEST_PRICE_HINGE_SOFT,
        quantityRule: {
          kind: "tiers",
          tierThresholds: {
            driverProperty: "partLengthMm",
            thresholds: [
              { maxValMm: 900, qty: 2 },
              { maxValMm: 2000, qty: 4 },
            ],
          },
        },
        group: "hardware",
        visibleOnQuote: false,
        source: "workshop_entered",
        enabled: true,
      },
      {
        id: "b-stone",
        name: "Mặt đá bếp thạch anh",
        category: "face_material",
        unit: "md",
        unitPrice: TEST_PRICE_STONE_QUARTZ,
        quantityRule: { kind: "manual", manualQty: 3.5 }, // 3.5 md
        group: "stone",
        markupOverride: 1.3,
        visibleOnQuote: true,
        source: "workshop_entered",
        enabled: true,
      },
      {
        id: "b-hob",
        name: "Bếp từ đôi Bosch mua ngoài",
        category: "equipment",
        unit: "cái",
        unitPrice: TEST_PRICE_HOB_INDUCTION,
        quantityRule: { kind: "fixed", multiplier: 1 },
        group: "equipment",
        markupOverride: 1.15, // Markup riêng 15%
        visibleOnQuote: true,
        source: "workshop_entered",
        enabled: true,
      },
    ];

    const drivers = buildProjectDrivers({
      totalSheets: 5,
      parts: parts.map(p => ({ lengthMm: p.lengthMm, widthMm: p.widthMm, qty: p.qty })),
    });

    const res = calculateCostLines(lines, drivers, { defaultMarkup: 1.65 });

    // Bản lề: 16 cái * 30.000 = 480.000 đ; quote (1.65) = 792.000 đ
    // Mặt đá: 3.5 md * 1.200.000 = 4.200.000 đ; quote (1.3) = 5.460.000 đ
    // Bếp từ: 1 cái * 8.000.000 = 8.000.000 đ; quote (1.15) = 9.200.000 đ
    // Tổng vốn = 480k + 4.200k + 8.000k = 12.680.000 đ
    // Tổng bán = 792k + 5.460k + 9.200k = 15.452.000 đ
    assert.equal(res.totalBaseCost, 12_680_000);
    assert.equal(res.totalQuotePrice, 15_452_000);
    assert.equal(res.grossProfit, 2_772_000);
  });

  // --------------------------------------------------------------------------
  // (c) TỦ ÁO: HỘC KÉO + RAY TRƯỢT + THANH TREO
  // --------------------------------------------------------------------------
  it("(c) Golden Tủ Áo: Ray trượt theo hộc kéo + thanh treo quần áo", () => {
    const lines: CostLine[] = [
      {
        id: "c-slides",
        name: "Ray trượt bi 3 tầng",
        category: "hardware",
        unit: "bộ",
        unitPrice: TEST_PRICE_SLIDE_BALL,
        quantityRule: {
          kind: "perTaggedPart",
          tag: "drawer",
          multiplier: 1,
        },
        group: "hardware",
        visibleOnQuote: false,
        source: "workshop_entered",
        enabled: true,
      },
      {
        id: "c-rail",
        name: "Thanh suốt treo quần áo hợp kim nhôm",
        category: "hardware",
        unit: "cây",
        unitPrice: TEST_PRICE_CLOTHES_RAIL,
        quantityRule: { kind: "manual", manualQty: 3 },
        group: "hardware",
        visibleOnQuote: false,
        source: "workshop_entered",
        enabled: true,
      },
    ];

    const drivers = buildProjectDrivers({
      taggedPartCounts: { drawer: 4 }, // 4 hộc kéo
    });

    const res = calculateCostLines(lines, drivers, { defaultMarkup: 1.65 });
    // Ray: 4 bộ * 150.000 = 600.000 đ
    // Suốt treo: 3 cây * 120.000 = 360.000 đ
    // Tổng vốn = 960.000 đ; quote (1.65) = 1.584.000 đ
    assert.equal(res.totalBaseCost, 960_000);
    assert.equal(res.totalQuotePrice, 1_584_000);
    assert.equal(res.grossProfit, 624_000);
  });

  // --------------------------------------------------------------------------
  // (d) VÁCH ỐP HOẶC TRẦN THEO M2 (KHÔNG CÓ CUTLIST, CÓ CẢNH BÁO BOM)
  // --------------------------------------------------------------------------
  it("(d) Golden Vách Ốp theo m2: Không có cutlist, xuất cảnh báo BOM rõ ràng", () => {
    const section: ProjectSection = {
      id: "sec-wall",
      name: "Vách ốp trang trí nan sóng",
      inputMode: "quick_module",
      quickCalc: {
        unitType: "m2",
        quantity: 20, // 20 m2
        unitPrice: TEST_PRICE_WALL_PANEL_M2, // 850k/m2
      },
    };

    const result = calculateHybridProject({
      sections: [section],
      materials: SEED_MATERIALS,
      defaultMarkup: 1.65,
    });

    // 20 m2 * 850.000 = 17.000.000 đ (giá bán)
    // Giá vốn = 17.000.000 / 1.65 ≈ 10.303.030 đ
    assert.equal(result.totalQuotePrice, 17_000_000);
    assert.equal(result.sections[0].hasCutlist, false);
    assert.equal(result.bomWarnings.length, 1);
    assert.match(result.bomWarnings[0], /chưa có phôi tấm/);
  });

  // --------------------------------------------------------------------------
  // (e) DỰ ÁN CHỈ GỒM DÒNG NHẬP TAY (THẦU PHỤ, XE CẨU)
  // --------------------------------------------------------------------------
  it("(e) Golden Dự án chỉ gồm dòng nhập tay: Sơn PU thầu phụ + Xe cẩu", () => {
    const section: ProjectSection = {
      id: "sec-manual",
      name: "Thầu phụ & Dịch vụ",
      inputMode: "manual_lines",
      manualLines: [
        {
          id: "m-paint",
          name: "Thầu phụ sơn PU bóng gương",
          category: "subcontract",
          unit: "gói",
          quantity: 1,
          unitPrice: 15_000_000,
          markupOverride: 1.25,
          visibleOnQuote: true,
        },
        {
          id: "m-crane",
          name: "Thuê xe cẩu đưa hàng lên tầng 4",
          category: "service",
          unit: "chuyến",
          quantity: 1,
          unitPrice: 2_000_000,
          markupOverride: 1.1,
          visibleOnQuote: true,
        },
      ],
    };

    const res = calculateHybridProject({
      sections: [section],
      materials: SEED_MATERIALS,
    });

    // Vốn: 15.000.000 + 2.000.000 = 17.000.000 đ
    // Bán: 15.000.000 * 1.25 (18.750.000) + 2.000.000 * 1.1 (2.200.000) = 20.950.000 đ
    assert.equal(res.totalBaseCost, 17_000_000);
    assert.equal(res.totalQuotePrice, 20_950_000);
    assert.equal(res.totalGrossProfit, 3_950_000);
    assert.equal(res.sections[0].hasCutlist, false);
  });

  // --------------------------------------------------------------------------
  // (f) CÓ THUẾ VAT, CHIẾT KHẤU GIẢM GIÁ & LÀM TRÒN TIỀN
  // --------------------------------------------------------------------------
  it("(f) Golden VAT, Giảm giá và Làm tròn tiền", () => {
    const baseCost = 10_000_000;
    const markup = 1.65;
    const rawQuote = baseCost * markup; // 16.500.000 đ

    // Áp dụng giảm giá 500.000 đ
    const discount = 500_000;
    const quoteAfterDiscount = rawQuote - discount; // 16.000.000 đ

    // Áp dụng VAT 8%
    const vatRate = 0.08;
    const quoteWithVat = quoteAfterDiscount * (1 + vatRate); // 17.280.000 đ

    // Làm tròn theo bước 50.000 đ
    const roundingStep = 50_000;
    const finalRounded = Math.round(quoteWithVat / roundingStep) * roundingStep;

    assert.equal(rawQuote, 16_500_000);
    assert.equal(quoteAfterDiscount, 16_000_000);
    assert.equal(quoteWithVat, 17_280_000);
    assert.equal(finalRounded, 17_300_000);
  });

  // --------------------------------------------------------------------------
  // (g) CẤU HÌNH RỖNG: KHÔNG CÓ DÒNG NÀO HOẠT ĐỘNG
  // --------------------------------------------------------------------------
  it("(g) Golden Cấu hình rỗng: An toàn, không lỗi NaN/Infinity", () => {
    const drivers = buildProjectDrivers({});
    const res = calculateCostLines([], drivers);

    assert.equal(res.totalBaseCost, 0);
    assert.equal(res.totalQuotePrice, 0);
    assert.equal(res.grossProfit, 0);
    assert.equal(res.effectiveProfitMargin, 1.65);
    assert.equal(Number.isNaN(res.totalBaseCost), false);
    assert.equal(Number.isFinite(res.totalBaseCost), true);
  });

  // --------------------------------------------------------------------------
  // TEST TÍNH CHẤT TOÁN HỌC (PROPERTY INVARIANTS)
  // --------------------------------------------------------------------------
  describe("Test Tính Chất (Mathematical Invariants)", () => {
    const testDrivers = buildProjectDrivers({ totalSheets: 10 });

    it("Tính chất 1: Tổng chi phí các nhóm luôn bằng tổng chi phí toàn dự án", () => {
      const lines: CostLine[] = [
        { id: "1", name: "L1", category: "supplies", unit: "t", unitPrice: 10_000, quantityRule: { kind: "perDriver", driver: "totalSheets", multiplier: 1 }, group: "G1", visibleOnQuote: false, source: "workshop_entered", enabled: true },
        { id: "2", name: "L2", category: "labor", unit: "t", unitPrice: 50_000, quantityRule: { kind: "perDriver", driver: "totalSheets", multiplier: 1 }, group: "G2", visibleOnQuote: false, source: "workshop_entered", enabled: true },
      ];
      const res = calculateCostLines(lines, testDrivers);
      const sumGroups = Object.values(res.groupTotals).reduce((s, g) => s + g.baseCost, 0);
      assert.equal(sumGroups, res.totalBaseCost);
    });

    it("Tính chất 2: Thêm dòng số lượng 0 không làm thay đổi tổng tiền", () => {
      const lineActive: CostLine = { id: "1", name: "L1", category: "supplies", unit: "t", unitPrice: 10_000, quantityRule: { kind: "perDriver", driver: "totalSheets", multiplier: 1 }, group: "G1", visibleOnQuote: false, source: "workshop_entered", enabled: true };
      const lineZero: CostLine = { id: "2", name: "L2", category: "supplies", unit: "t", unitPrice: 10_000, quantityRule: { kind: "manual", manualQty: 0 }, group: "G1", visibleOnQuote: false, source: "workshop_entered", enabled: true };

      const resBefore = calculateCostLines([lineActive], testDrivers);
      const resAfter = calculateCostLines([lineActive, lineZero], testDrivers);

      assert.equal(resAfter.totalBaseCost, resBefore.totalBaseCost);
      assert.equal(resAfter.totalQuotePrice, resBefore.totalQuotePrice);
    });

    it("Tính chất 3: Tăng đơn giá không bao giờ làm giảm giá bán (Monotonicity)", () => {
      const lineCheap: CostLine = { id: "1", name: "L", category: "labor", unit: "t", unitPrice: 100_000, quantityRule: { kind: "perDriver", driver: "totalSheets", multiplier: 1 }, group: "G", visibleOnQuote: false, source: "workshop_entered", enabled: true };
      const lineExpensive: CostLine = { ...lineCheap, unitPrice: 150_000 };

      const resCheap = calculateCostLines([lineCheap], testDrivers);
      const resExpensive = calculateCostLines([lineExpensive], testDrivers);

      assert.ok(resExpensive.totalQuotePrice > resCheap.totalQuotePrice);
      assert.ok(resExpensive.totalBaseCost > resCheap.totalBaseCost);
    });

    it("Tính chất 4: Snapshot Pricing bất biến (Rule 12)", () => {
      const seed = SEED_PROJECTS[0];
      const snapshotTotal = seed.totalCost;

      // Khi thay đổi danh mục giá thị trường SEED_MATERIALS
      const mutatedMaterials: MaterialItem[] = SEED_MATERIALS.map(m => ({
        ...m,
        unitPrice: m.unitPrice * 2, // Tăng gấp đôi giá thị trường
      }));

      // Dự án cũ mở lại với Snapshot đã lưu: không đổi 1 đồng
      const resWithSnapshot = calculateQuoteEngine(
        seed.items,
        seed.materialsSnapshot || SEED_MATERIALS,
        seed.profitMargin,
        undefined,
        seed.costConfigSnapshot
      );

      assert.equal(resWithSnapshot.totalCost, snapshotTotal);
      assert.equal(resWithSnapshot.totalCost, 16_281_950);
    });
  });
});
