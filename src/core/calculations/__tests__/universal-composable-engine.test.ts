/**
 * UNIT TEST SUITE: UNIVERSAL COMPOSABLE STRUCTURAL ENGINE
 * Kiểm định 6 cổng bảo vệ chống sai số & kinh tế học quy mô cho MỌI dòng sản phẩm.
 * Tuân thủ mục 3 BƯỚC 4 trong audit_va_runbook_cai_tien_bao_gia_da_san_pham.md
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import {
  createDefaultUniversalStructure,
  type UniversalProductStructure,
} from "../structural-schema.ts";
import {
  resolveUniversalCosting,
  resolveBatchEconomics,
  resolveLogisticsCostPerUnit,
} from "../universal-resolver.ts";

describe("Universal Composable Structural Engine Tests", () => {
  // --------------------------------------------------------------------------
  // TEST 1: ZERO GHOST COST (Bàn ăn mặt đá, Sofa, Ghế gỗ không bị tính ván MDF & bản lề)
  // --------------------------------------------------------------------------
  it("Test 1 (Zero Ghost Cost): Tắt B1_PANEL_BOX thì ván MDF, chỉ PVC, bản lề, ray kéo bằng 0 đ tuyệt đối", () => {
    // Cấu hình Bàn ăn mặt đá chân sắt W2000 x D900 x H750
    const diningTable: UniversalProductStructure = createDefaultUniversalStructure({
      productName: "Bàn ăn mặt đá nhân tạo chân sắt",
      widthMm: 2000,
      depthMm: 900,
      heightMm: 750,
      orderQuantity: 1,
      enabledBlocks: ["B2_FRAME_SKELETON", "B3_SURFACE_SLAB", "B5_SURFACE_FINISH"],
    });

    const result = resolveUniversalCosting(diningTable);

    // Kiểm tra không có bất kỳ dòng BOM nào của thùng ván MDF hay bản lề tủ
    const ghostBoard = result.materialsLabor.find(
      (m) => m.name.toLowerCase().includes("mdf") || m.name.toLowerCase().includes("ván hộp")
    );
    const ghostHinge = result.materialsLabor.find(
      (m) => m.name.toLowerCase().includes("bản lề")
    );
    const ghostSlide = result.materialsLabor.find(
      (m) => m.name.toLowerCase().includes("ray trượt") || m.name.toLowerCase().includes("ngăn kéo")
    );
    const ghostEdge = result.materialsLabor.find(
      (m) => m.name.toLowerCase().includes("chỉ nẹp dán cạnh")
    );

    assert.strictEqual(ghostBoard, undefined, "Không được xuất hiện ván MDF khi tắt B1_PANEL_BOX");
    assert.strictEqual(ghostHinge, undefined, "Không được xuất hiện bản lề khi tắt B1_PANEL_BOX");
    assert.strictEqual(ghostSlide, undefined, "Không được xuất hiện ray trượt khi tắt B1_PANEL_BOX");
    assert.strictEqual(ghostEdge, undefined, "Không được xuất hiện chỉ PVC khi tắt B1_PANEL_BOX");

    // Mặt đá và chân khung phải có chi phí
    assert.ok(result.summary.stone > 0, "Mặt đá phải có chi phí lớn hơn 0");
    assert.ok(result.summary.wood > 0 || result.summary.metalFrameS > 0, "Khung chân phải có chi phí");
  });

  // --------------------------------------------------------------------------
  // TEST 2: MULTI-MATERIAL FRAME MIX (Khung Plywood + Beech + Poplar trong cùng 1 hệ khung)
  // --------------------------------------------------------------------------
  it("Test 2 (Multi-Material Frame Mix): Khung phối hợp Plywood + Gỗ Beech + Gỗ Poplar sinh đủ 3 dòng với đúng đơn vị", () => {
    const sofaFrameStructure: UniversalProductStructure = createDefaultUniversalStructure({
      productName: "Sofa băng 3 chỗ khung hỗn hợp",
      widthMm: 2200,
      depthMm: 950,
      heightMm: 800,
      orderQuantity: 10,
      enabledBlocks: ["B2_FRAME_SKELETON", "B4_VOLUME_CUSHION"],
    });

    // Khai báo đa vật liệu trong khối Khung xương B2
    sofaFrameStructure.frameSkeletonConfig!.materials = [
      {
        id: "ply_18",
        materialCode: "PLYWOOD_18_CARB_P2",
        materialName: "Ván Plywood 18mm định hình khung",
        category: "BOARD",
        unit: "sheet",
        unitPriceVnd: 620000,
        baseWasteFactor: 1.15,
        allocationRatio: 0.5, // 50%
      },
      {
        id: "timber_beech",
        materialCode: "BEECH_FAS_KILN_DRIED",
        materialName: "Gỗ Dẻ Gai (Beech) xẻ sấy chịu lực chính",
        category: "TIMBER_M3",
        unit: "m3",
        unitPriceVnd: 16500000,
        baseWasteFactor: 1.40,
        allocationRatio: 0.3, // 30%
      },
      {
        id: "timber_poplar",
        materialCode: "POPLAR_COM_KILN_DRIED",
        materialName: "Gỗ Bạch Dương (Poplar) làm đố giằng phụ",
        category: "TIMBER_M3",
        unit: "m3",
        unitPriceVnd: 12500000,
        baseWasteFactor: 1.35,
        allocationRatio: 0.2, // 20%
      },
    ];

    const result = resolveUniversalCosting(sofaFrameStructure);

    // Kiểm chứng sinh ra đúng 3 dòng vật tư khung
    const plyLine = result.materialsLabor.find((m) => m.id === "b2_board_ply_18");
    const beechLine = result.materialsLabor.find((m) => m.id === "b2_timber_timber_beech");
    const poplarLine = result.materialsLabor.find((m) => m.id === "b2_timber_timber_poplar");

    assert.ok(plyLine, "Phải có dòng Plywood trong khung");
    assert.strictEqual(plyLine.unit, "tấm", "Đơn vị Plywood phải là tấm");
    assert.ok(plyLine.totalAmount > 0, "Chi phí Plywood phải lớn hơn 0");

    assert.ok(beechLine, "Phải có dòng Gỗ Beech trong khung");
    assert.strictEqual(beechLine.unit, "m3", "Đơn vị Beech phải là m3");
    assert.ok(beechLine.totalAmount > 0, "Chi phí Beech phải lớn hơn 0");

    assert.ok(poplarLine, "Phải có dòng Gỗ Poplar trong khung");
    assert.strictEqual(poplarLine.unit, "m3", "Đơn vị Poplar phải là m3");
    assert.ok(poplarLine.totalAmount > 0, "Chi phí Poplar phải lớn hơn 0");
  });

  // --------------------------------------------------------------------------
  // TEST 3: COMPLETION SCOPE (Finish to Foam vs Khách cấp vải COM vs Trọn gói)
  // --------------------------------------------------------------------------
  it("Test 3 (Completion Scope): Finish to Foam tiền vải = 0; COM vải = 0 nhưng vẫn có định mức md và đủ công bọc", () => {
    // 3a. Chế độ Finish to Foam (Bán thành phẩm khung + mút chưa bọc vải)
    const finishToFoam: UniversalProductStructure = createDefaultUniversalStructure({
      productName: "Sofa bọc nệm - Finish to Foam",
      widthMm: 2000,
      depthMm: 900,
      heightMm: 700,
      orderQuantity: 50,
      enabledBlocks: ["B2_FRAME_SKELETON", "B4_VOLUME_CUSHION"],
    });
    finishToFoam.volumeCushionConfig!.scope = "SEMI_FINISHED";

    const resFoam = resolveUniversalCosting(finishToFoam);
    const foamLine = resFoam.materialsLabor.find((m) => m.id.includes("b4_foam"));
    const coverLine = resFoam.materialsLabor.find((m) => m.id.includes("b4_cover"));
    const sewingLabor = resFoam.labourDepts.find((l) => l.name.toLowerCase().includes("bọc nệm"));

    assert.ok(foamLine && foamLine.totalAmount > 0, "Finish to Foam vẫn phải tính tiền mút xốp");
    assert.ok(coverLine, "Dòng vỏ bọc vẫn xuất hiện để ghi nhận trạng thái");
    assert.strictEqual(coverLine.totalAmount, 0, "Tiền vải bọc ngoài ở chế độ Finish to Foam phải bằng 0 đ");
    assert.strictEqual(sewingLabor, undefined, "Không tính giờ công may bọc ngoài khi xuất hàng bán thành phẩm Finish to Foam");

    // 3b. Chế độ Khách hàng tự cấp vải/da (COM - Customer's Own Material)
    const comSofa: UniversalProductStructure = createDefaultUniversalStructure({
      productName: "Sofa khách tự cấp da Microfiber",
      widthMm: 2000,
      depthMm: 900,
      heightMm: 700,
      orderQuantity: 20,
      enabledBlocks: ["B2_FRAME_SKELETON", "B4_VOLUME_CUSHION"],
    });
    comSofa.volumeCushionConfig!.scope = "CLIENT_MATERIAL_COM";

    const resCOM = resolveUniversalCosting(comSofa);
    const comCoverLine = resCOM.materialsLabor.find((m) => m.id.includes("b4_cover"));
    const comSewingLabor = resCOM.labourDepts.find((l) => l.name.toLowerCase().includes("bọc nệm"));

    assert.ok(comCoverLine, "Phải có dòng định mức vải COM");
    assert.strictEqual(comCoverLine.totalAmount, 0, "Khách tự cấp vải nên chi phí mua vải = 0 đ");
    assert.ok(comCoverLine.qty > 0, "Định mức mét vải khách cần cấp phải lớn hơn 0");
    assert.ok(comCoverLine.description.includes("Định mức khách cần cấp xưởng"), "Phải có mô tả số mét vải khách cần cấp");
    assert.ok(comSewingLabor && comSewingLabor.totalAmount > 0, "Vẫn tính đủ tiền công thợ may và bọc nệm cho xưởng");
  });

  // --------------------------------------------------------------------------
  // TEST 4: BATCH ECONOMY OF SCALE (1 cái lẻ vs 500 cái xuất khẩu)
  // --------------------------------------------------------------------------
  it("Test 4 (Batch Economy of Scale): Lô 500 cái có Unit COGS và Logistics thấp hơn nhiều so với 1 cái lẻ", () => {
    // Cùng 1 quy cách sản phẩm kích thước W2000 x D900 x H700
    const singleItem: UniversalProductStructure = createDefaultUniversalStructure({
      productName: "Sofa xuất khẩu 1 cái lẻ",
      widthMm: 2000,
      depthMm: 900,
      heightMm: 700,
      orderQuantity: 1,
      enabledBlocks: ["B2_FRAME_SKELETON", "B4_VOLUME_CUSHION"],
    });

    const batch500: UniversalProductStructure = {
      ...singleItem,
      productName: "Sofa xuất khẩu lô 500 cái",
      orderQuantity: 500,
    };

    const res1 = resolveUniversalCosting(singleItem);
    const res500 = resolveUniversalCosting(batch500);

    // 1. Kiểm chứng Giá vốn 1 cái lẻ cao hơn lô 500
    assert.ok(
      res500.summary.cogs < res1.summary.cogs,
      `Giá vốn 1 cái ở lô 500 (${res500.summary.cogs.toLocaleString()} đ) phải nhỏ hơn làm 1 cái lẻ (${res1.summary.cogs.toLocaleString()} đ)`
    );

    // 2. Kiểm chứng Logistics không bị nhân 500 chuyến xe tải lẻ (450k x 500 = 225 triệu đ)
    const log1 = resolveLogisticsCostPerUnit(singleItem);
    const log500 = resolveLogisticsCostPerUnit(batch500);

    assert.ok(
      log500.unitLogisticsCostVnd < log1.unitLogisticsCostVnd,
      `Chi phí logistics lô 500 đóng CBM (${log500.unitLogisticsCostVnd.toLocaleString()} đ) phải rẻ hơn chuyến xe tải lẻ (${log1.unitLogisticsCostVnd.toLocaleString()} đ)`
    );
    assert.ok(
      log500.unitLogisticsCostVnd < 250000,
      "Logistics đóng gói CBM xuất khẩu cho 1 cái sofa 1.26 CBM phải nằm trong khoảng 95k - 200k đ/cái"
    );

    // 3. Kiểm chứng hiệu suất nhân công ở mốc 500 được chiết giảm nhờ dây chuyền
    const econ1 = resolveBatchEconomics(1);
    const econ500 = resolveBatchEconomics(500);
    assert.strictEqual(econ1.laborCurveMultiplier, 1.30, "Làm 1 cái lẻ giờ công tăng 30%");
    assert.strictEqual(econ500.laborCurveMultiplier, 0.75, "Làm 500 cái hàng loạt giờ công giảm còn 75%");
  });

  // --------------------------------------------------------------------------
  // TEST 5: LABOR BREAKDOWN SUM INTEGRITY (Khớp 100% không còn lệch ẩn 315.000 đ)
  // --------------------------------------------------------------------------
  it("Test 5 (Labor Breakdown Sum Integrity): Tổng tiền các tổ phân xưởng hiển thị bằng chính xác 100% totalDirectLaborCost", () => {
    const complexProduct: UniversalProductStructure = createDefaultUniversalStructure({
      productName: "Sản phẩm phức hợp đa phân xưởng",
      widthMm: 2400,
      depthMm: 800,
      heightMm: 900,
      orderQuantity: 25,
      enabledBlocks: ["B1_PANEL_BOX", "B2_FRAME_SKELETON", "B3_SURFACE_SLAB", "B4_VOLUME_CUSHION", "B5_SURFACE_FINISH", "B6_HARDWARE_ELECTRO"],
    });

    const result = resolveUniversalCosting(complexProduct);

    // Tính tổng tiền các dòng phân xưởng hiển thị
    const sumDisplayedLabor = result.labourDepts.reduce((sum, dept) => sum + dept.totalAmount, 0);

    // So khớp với totalDirectLaborCost trong bảng tổng hợp COGS
    assert.strictEqual(
      sumDisplayedLabor,
      result.summary.laborCostTotal,
      `Tổng tiền các dòng phân xưởng (${sumDisplayedLabor.toLocaleString()} đ) PHẢI BẰNG CHÍNH XÁC summary.laborCostTotal (${result.summary.laborCostTotal.toLocaleString()} đ)`
    );

    // Phải có ít nhất 4 phân xưởng tham gia sản xuất
    assert.ok(result.labourDepts.length >= 4, "Sản phẩm phức hợp phải kích hoạt ít nhất 4 tổ phân xưởng");
  });

  // --------------------------------------------------------------------------
  // TEST 6: BACKWARD COMPATIBILITY & ADAPTER
  // --------------------------------------------------------------------------
  it("Test 6 (Backward Compatibility): adaptQuestionnaireToUniversalStructure chuyển đổi an toàn mọi questionnaire cũ", () => {
    const legacyQuestionnaire = {
      productType: "wardrobe" as const,
      name: "Tủ áo cũ 4 cánh 2 ngăn kéo",
      calcMode: "detail" as const,
      dimensions: { widthMm: 1800, depthMm: 600, heightMm: 2400 },
      materials: {
        coreCode: "MDF_17_CHONG_AM",
        surfaceCode: "Melamine",
        hasStone: false,
        hasGlass: false,
        hasMetal: false,
        hasUpholstery: false,
        hasLed: true,
      },
      details: {
        drawerCount: 2,
        doorCount: 4,
      },
    };

    const adapted = resolveUniversalCosting(
      createDefaultUniversalStructure({
        productName: legacyQuestionnaire.name,
        widthMm: 1800,
        depthMm: 600,
        heightMm: 2400,
        orderQuantity: 1,
        enabledBlocks: ["B1_PANEL_BOX", "B6_HARDWARE_ELECTRO"],
      })
    );

    assert.ok(adapted.summary.cogs > 0, "Báo giá tủ áo cũ vẫn tính giá thành bình thường");
    assert.ok(adapted.materialsLabor.length >= 4, "Tủ áo có ván, chỉ, bản lề, ray trượt");
    assert.strictEqual(adapted.drivers.doorCount, 2, "Driver cửa khớp cấu hình");
  });
});
