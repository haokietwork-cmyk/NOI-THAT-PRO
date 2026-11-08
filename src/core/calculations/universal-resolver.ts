/**
 * UNIVERSAL COMPOSABLE COSTING & BATCH SCALE ECONOMICS RESOLVER
 * Động cơ toán học bóc tách vật tư và tính giá vốn (COGS) đa kết cấu cho MỌI sản phẩm.
 * Tuân thủ nghiêm ngặt 8 điều khoản trong audit_va_runbook_cai_tien_bao_gia_da_san_pham.md
 */

import type {
  UniversalProductStructure,
  StructuralBlockId,
  MaterialAllocationRow,
} from "./structural-schema.ts";
import type {
  GeneratedCostingResult,
  MaterialLaborRow,
  LabourDeptRow,
  CostSummary,
  CostingQuestionnaire,
} from "./parametric-types.ts";

export interface BatchEconomicsContext {
  orderQuantity: number;
  wasteDecayMultiplier: number;  // Giảm hao hụt vật tư theo ln(Q)
  laborCurveMultiplier: number;  // Giảm giờ công do chuyên môn hóa dây chuyền
}

/**
 * 1. ĐỘNG CƠ KINH TẾ HỌC QUY MÔ LÔ (BATCH SCALE ECONOMICS)
 */
export function resolveBatchEconomics(orderQuantity: number): BatchEconomicsContext {
  const Q = Math.max(1, orderQuantity);

  // Hàm suy giảm hao hụt vật tư theo quy mô cắt Nesting: max(0.40, 1 - 0.12 * ln(Q))
  const wasteDecayMultiplier = Math.max(0.40, 1 - 0.12 * Math.log(Q));

  // Đường cong học tập và hiệu suất nhân công theo dây chuyền:
  let laborCurveMultiplier = 1.0;
  if (Q === 1) {
    laborCurveMultiplier = 1.30; // Làm hàng mẫu đơn chiếc, chỉnh cữ thủ công
  } else if (Q < 10) {
    laborCurveMultiplier = 1.10; // Lô nhỏ thử nghiệm
  } else if (Q < 50) {
    laborCurveMultiplier = 1.00; // Mốc tiêu chuẩn xưởng
  } else if (Q < 200) {
    laborCurveMultiplier = 0.85; // Bắt đầu chạy rập và cữ gá hàng loạt
  } else {
    laborCurveMultiplier = 0.75; // Dây chuyền chuyên môn hóa cao (200 - 500+ cái)
  }

  return {
    orderQuantity: Q,
    wasteDecayMultiplier,
    laborCurveMultiplier,
  };
}

/**
 * 2. ĐÓNG GÓI & VẬN CHUYỂN THÔNG MINH THEO CBM (FIX BUG-06)
 */
export function resolveLogisticsCostPerUnit(structure: UniversalProductStructure): {
  unitLogisticsCostVnd: number;
  unitCbm: number;
  description: string;
} {
  const w = (structure.dimensionsMm.width || 1200) / 1000;
  const d = (structure.dimensionsMm.depth || 600) / 1000;
  const h = (structure.dimensionsMm.height || 750) / 1000;
  const Q = Math.max(1, structure.orderQuantity || 1);
  const cfg = structure.logisticsConfig;

  // Thể tích đóng kiện bao phủ bì (hệ số đệm chèn 1.15)
  const unitCbm = Number((w * d * h * 1.15).toFixed(3));

  if (cfg.mode === "INDUSTRIAL_CBM_PACKING" || (cfg.mode === "AUTO_BY_QUANTITY" && Q > 10)) {
    // Đóng gói thùng Carton 5 lớp xuất khẩu + PE góc + Bốc xếp Container
    const cartonRate = cfg.cartonAndPePricePerCbmVnd || 95000;
    const handlingRate = 35000; // Phí bốc dỡ xếp hàng pallet/container trên mỗi m3
    const unitLogisticsCostVnd = Math.max(65000, Math.round(unitCbm * (cartonRate + handlingRate)));
    return {
      unitLogisticsCostVnd,
      unitCbm,
      description: `Đóng thùng Carton 5 lớp & màng PE xuất khẩu (${unitCbm} CBM/cái • Lô ${Q} cái)`,
    };
  }

  // Chế độ giao lẻ nội địa bằng xe tải (Q <= 10)
  const totalCbm = unitCbm * Q;
  const truckCap = cfg.truckCapacityCbm || 8.0;
  const trips = Math.max(1, Math.ceil(totalCbm / truckCap));
  const tripPrice = cfg.truckTripPriceVnd || 450000;
  const peWrap = 35000; // Màng xốp PE quấn lẻ

  const unitLogisticsCostVnd = Math.round((trips * tripPrice) / Q + peWrap);
  return {
    unitLogisticsCostVnd,
    unitCbm,
    description: `Vận chuyển xe tải nội thành (${trips} chuyến/${Q} cái, ${unitCbm} CBM/cái)`,
  };
}

/**
 * 3. BÓC TÁCH VẬT TƯ & ĐỊNH MỨC 6 KHỐI VẬT LÝ (UNIVERSAL COMPOSABLE ENGINE)
 */
export function resolveUniversalCosting(
  structure: UniversalProductStructure,
  customMaterialsCatalog?: any[]
): GeneratedCostingResult {
  const w = (structure.dimensionsMm.width || 1200) / 1000;
  const d = (structure.dimensionsMm.depth || 600) / 1000;
  const h = (structure.dimensionsMm.height || 750) / 1000;
  const Q = Math.max(1, structure.orderQuantity || 1);

  const batchEcon = resolveBatchEconomics(Q);
  const enabled = new Set<StructuralBlockId>(structure.enabledBlocks);

  const materialsLabor: MaterialLaborRow[] = [];
  const labourDepts: LabourDeptRow[] = [];

  const hourlyLaborRate = 105000; // Đơn giá giờ công thợ mộc chuẩn

  // Chi phí trực tiếp phân theo 12 nhóm COGS
  let woodCost = 0;
  let stoneCost = 0;
  let glassCost = 0;
  let metalCost = 0;
  let upholsteryCost = 0;
  let chemicalCost = 0;
  let hardwareCost = 0;
  let consumablesCost = 0;
  let subContractCost = 0;

  // Bóc tách giờ công theo 6 tổ xưởng
  let cncHours = 0;
  let framingHours = 0;
  let stoneGlassHours = 0;
  let foamHours = 0;
  let upholsterySewingHours = 0;
  let sandingSprayHours = 0;
  let assemblyInspectHours = 0;

  // Overhead tracking theo nguồn thực hiện
  let inHouseDirectCost = 0;
  let subcontractDirectCost = 0;

  // --------------------------------------------------------------------------
  // KHỐI 1: B1_PANEL_BOX (THÙNG HỘP, VÁCH TẤM & CÁNH VÁN CÔNG NGHIỆP)
  // --------------------------------------------------------------------------
  if (enabled.has("B1_PANEL_BOX") && structure.panelBoxConfig) {
    const pCfg = structure.panelBoxConfig;
    const isSemi = pCfg.scope === "SEMI_FINISHED";

    // 1. Tính diện tích các mảng ván (m2)
    let shellAreaM2 = 0;
    if (pCfg.geometryMode === "SINGLE_PANEL_FACE") {
      shellAreaM2 = w * h;
    } else if (pCfg.geometryMode === "OPEN_SHELF_BOX") {
      shellAreaM2 = 2 * (w * d) + 2 * (d * h) + (pCfg.hasBackPanel ? w * h : 0);
    } else if (pCfg.geometryMode === "BASE_NO_TOP") {
      shellAreaM2 = w * d + 2 * (d * h) + (pCfg.hasBackPanel ? w * h : 0);
    } else {
      // CLOSED_CABINET_BOX
      shellAreaM2 = 2 * (w * d) + 2 * (d * h) + (pCfg.hasBackPanel ? w * h : 0);
    }

    const internalAreaM2 = (pCfg.verticalDividers || 0) * (d * h) + (pCfg.horizontalShelves || 0) * (w * d);
    const doorsAreaM2 = (pCfg.swingDoors > 0 || pCfg.slidingDoors > 0 || pCfg.drawers > 0) ? (w * h * 0.95) : 0;
    const totalPanelNetAreaM2 = shellAreaM2 + internalAreaM2 + doorsAreaM2;

    // Chu vi dán cạnh PVC (md)
    let edgeMeters = 0;
    if (pCfg.edgeBandingRule === "ALL_EXPOSED_EDGES") {
      edgeMeters = 2 * (w + h) * Math.max(1, pCfg.swingDoors + pCfg.slidingDoors) +
        (w + 2 * d) * (pCfg.horizontalShelves + 2) +
        2 * h * (pCfg.verticalDividers + 2);
    } else if (pCfg.edgeBandingRule === "FRONT_ONLY") {
      edgeMeters = 2 * (w + h) + (pCfg.horizontalShelves + 2) * w;
    }

    // Phân bổ danh mục ván
    const boardMats = pCfg.materials.length > 0 ? pCfg.materials : [
      {
        id: "mat_board_def",
        materialCode: "MDF_17_CHONG_AM",
        materialName: "Ván MDF chống ẩm 17mm",
        category: "BOARD" as const,
        unit: "sheet" as const,
        unitPriceVnd: 780000,
        baseWasteFactor: 1.15,
        allocationRatio: 1.0,
      },
    ];

    boardMats.forEach((mat) => {
      const allocatedNetM2 = totalPanelNetAreaM2 * (mat.allocationRatio || 1.0);
      const effWaste = 1 + (mat.baseWasteFactor - 1) * batchEcon.wasteDecayMultiplier;
      const sheetsCount = Math.max(0.5, Math.ceil((allocatedNetM2 * effWaste / 2.9768) * 2) / 2);
      const lineCost = Math.round(sheetsCount * mat.unitPriceVnd);

      materialsLabor.push({
        id: `b1_panel_${mat.id}`,
        block: "Carcass",
        name: mat.materialName,
        description: `Quy cách ván hộp (${allocatedNetM2.toFixed(2)}m² Net • Hao hụt Nesting ${(effWaste - 1) * 100 | 0}%)`,
        qty: sheetsCount,
        unit: "tấm",
        unitPrice: mat.unitPriceVnd,
        wasteFactor: Number(effWaste.toFixed(2)),
        totalAmount: lineCost,
      });

      woodCost += lineCost;
      if (pCfg.executionSource === "SUBCONTRACT") subcontractDirectCost += lineCost;
      else inHouseDirectCost += lineCost;
    });

    // Chỉ dán cạnh PVC
    if (edgeMeters > 0) {
      const edgeWaste = 1 + 0.08 * batchEcon.wasteDecayMultiplier;
      const grossEdge = Number((edgeMeters * edgeWaste).toFixed(1));
      const edgePrice = 3800; // VNĐ/md chỉ PVC 1mm
      const edgeAmount = Math.round(grossEdge * edgePrice);

      materialsLabor.push({
        id: "b1_pvc_edge",
        block: "Consumables",
        name: "Chỉ nẹp dán cạnh PVC nhiệt đồng màu",
        description: `Dán cạnh nẹp nhiệt chống ẩm (${edgeMeters.toFixed(1)}md Net)`,
        qty: grossEdge,
        unit: "md",
        unitPrice: edgePrice,
        wasteFactor: Number(edgeWaste.toFixed(2)),
        totalAmount: edgeAmount,
      });

      consumablesCost += edgeAmount;
      inHouseDirectCost += edgeAmount;
    }

    // Bản lề cánh tủ (chỉ sinh khi swingDoors > 0)
    if (pCfg.swingDoors > 0) {
      const hingesPerDoor = h >= 2.2 ? 5 : h >= 1.6 ? 4 : h >= 1.0 ? 3 : 2;
      const totalHinges = pCfg.swingDoors * hingesPerDoor;
      const hingePrice = 45000; // Bản lề giảm chấn Inox
      const hingeAmount = totalHinges * hingePrice;

      materialsLabor.push({
        id: "b1_hinges",
        block: "Hardware",
        name: "Bản lề bật giảm chấn Inox 304",
        description: `Trang bị cho ${pCfg.swingDoors} cánh mở (${hingesPerDoor} cái/cánh)`,
        qty: totalHinges,
        unit: "cái",
        unitPrice: hingePrice,
        wasteFactor: 1.0,
        totalAmount: hingeAmount,
      });

      hardwareCost += hingeAmount;
      inHouseDirectCost += hingeAmount;
    }

    // Ray kéo ngăn kéo (chỉ sinh khi drawers > 0)
    if (pCfg.drawers > 0) {
      const slidePrice = 165000;
      const slideAmount = pCfg.drawers * slidePrice;

      materialsLabor.push({
        id: "b1_slides",
        block: "Hardware",
        name: "Ray trượt bi 3 tầng giảm chấn (450mm)",
        description: `Trang bị cho ${pCfg.drawers} ngăn kéo hộc tủ`,
        qty: pCfg.drawers,
        unit: "bộ",
        unitPrice: slidePrice,
        wasteFactor: 1.0,
        totalAmount: slideAmount,
      });

      hardwareCost += slideAmount;
      inHouseDirectCost += slideAmount;
    }

    // Giờ công CNC & Dán nẹp
    cncHours += Number(((totalPanelNetAreaM2 * 0.45 + edgeMeters * 0.02) * batchEcon.laborCurveMultiplier).toFixed(1));
    assemblyInspectHours += Number(((totalPanelNetAreaM2 * 0.5 + pCfg.drawers * 0.3) * batchEcon.laborCurveMultiplier).toFixed(1));
  }

  // --------------------------------------------------------------------------
  // KHỐI 2: B2_FRAME_SKELETON (KHUNG XƯƠNG GỖ THỊT, VÁN KHUNG & CHÂN KIM LOẠI)
  // --------------------------------------------------------------------------
  if (enabled.has("B2_FRAME_SKELETON") && structure.frameSkeletonConfig) {
    const fCfg = structure.frameSkeletonConfig;

    // 1. Chiều dài thanh chịu lực chính (md)
    let mainLinearMeters = 0;
    if (fCfg.geometryMode === "PERIMETER_4_LEGS") {
      mainLinearMeters = 2 * (w + d) + 4 * h;
    } else if (fCfg.geometryMode === "SPACE_FRAME_3D") {
      mainLinearMeters = 4 * (w + d) + 4 * h;
    } else {
      // RIBBED_STRUCTURAL_BOX
      mainLinearMeters = 4 * (w + d) + 6 * h;
    }

    // Đố giằng phụ (ribs)
    const spacing = (fCfg.ribSpacingMm || 400) / 1000;
    let subRibMeters = 0;
    if (spacing > 0) {
      const numRibs = Math.ceil(w / spacing) + 1;
      subRibMeters = numRibs * d;
    }

    const totalLinearMeters = mainLinearMeters + subRibMeters;

    // Tiết diện thanh gỗ chuẩn: 50mm x 50mm = 0.0025 m2
    const baseTimberVolumeM3 = Number((totalLinearMeters * 0.0025).toFixed(3));

    // Diện tích ván định hình khung xương (Plywood form board)
    const baseFormingBoardAreaM2 = Number(((w * d + 2 * (w * h + d * h)) * (fCfg.formingBoardCoverageRatio || 0.5)).toFixed(2));

    // Duyệt qua đa vật liệu phối hợp trong khung (Plywood + Beech + Poplar...)
    const frameMats = fCfg.materials.length > 0 ? fCfg.materials : [
      {
        id: "mat_frame_def",
        materialCode: "TIMBER_ASH_OAK",
        materialName: "Gỗ Sồi xẻ sấy làm khung chịu lực",
        category: "TIMBER_M3" as const,
        unit: "m3" as const,
        unitPriceVnd: 18500000,
        baseWasteFactor: 1.45,
        allocationRatio: 1.0,
      },
    ];

    frameMats.forEach((mat) => {
      const ratio = mat.allocationRatio || 1.0;
      const effWaste = 1 + (mat.baseWasteFactor - 1) * batchEcon.wasteDecayMultiplier;

      if (mat.category === "TIMBER_M3") {
        const allocatedVol = Number((baseTimberVolumeM3 * ratio).toFixed(3));
        const grossVol = Number((allocatedVol * effWaste).toFixed(3));
        const lineCost = Math.round(grossVol * mat.unitPriceVnd);

        materialsLabor.push({
          id: `b2_timber_${mat.id}`,
          block: "Wood",
          name: mat.materialName,
          description: `Khung xương chịu lực (${totalLinearMeters.toFixed(1)}md • Hao hụt ${(effWaste - 1) * 100 | 0}%)`,
          qty: grossVol,
          unit: "m3",
          unitPrice: mat.unitPriceVnd,
          wasteFactor: Number(effWaste.toFixed(2)),
          totalAmount: lineCost,
        });

        woodCost += lineCost;
      } else if (mat.category === "BOARD") {
        // Ván định hình khung (Plywood)
        const allocatedM2 = Number((baseFormingBoardAreaM2 * ratio).toFixed(2));
        const grossSheets = Math.max(0.5, Math.ceil((allocatedM2 * effWaste / 2.9768) * 2) / 2);
        const lineCost = Math.round(grossSheets * mat.unitPriceVnd);

        materialsLabor.push({
          id: `b2_board_${mat.id}`,
          block: "Wood",
          name: mat.materialName,
          description: `Ván Plywood định hình kết cấu khung (${allocatedM2.toFixed(2)}m² Net)`,
          qty: grossSheets,
          unit: "tấm",
          unitPrice: mat.unitPriceVnd,
          wasteFactor: Number(effWaste.toFixed(2)),
          totalAmount: lineCost,
        });

        woodCost += lineCost;
      } else if (mat.category === "METAL_LEN") {
        // Khung sắt hộp / Inox
        const grossMeters = Number((totalLinearMeters * ratio * effWaste).toFixed(1));
        const lineCost = Math.round(grossMeters * mat.unitPriceVnd);

        materialsLabor.push({
          id: `b2_metal_${mat.id}`,
          block: "Metal",
          name: mat.materialName,
          description: `Khung kim loại hộp chịu lực (${grossMeters}md)`,
          qty: grossMeters,
          unit: "md",
          unitPrice: mat.unitPriceVnd,
          wasteFactor: Number(effWaste.toFixed(2)),
          totalAmount: lineCost,
        });

        metalCost += lineCost;
      }

      if (fCfg.executionSource === "SUBCONTRACT") subcontractDirectCost += (materialsLabor[materialsLabor.length - 1]?.totalAmount || 0);
      else inHouseDirectCost += (materialsLabor[materialsLabor.length - 1]?.totalAmount || 0);
    });

    framingHours += Number(((totalLinearMeters * 0.35 + baseFormingBoardAreaM2 * 0.4) * batchEcon.laborCurveMultiplier).toFixed(1));
  }

  // --------------------------------------------------------------------------
  // KHỐI 3: B3_SURFACE_SLAB (MẶT ĐÁ, KÍNH & TẤM MẶT LỚN)
  // --------------------------------------------------------------------------
  if (enabled.has("B3_SURFACE_SLAB") && structure.surfaceSlabConfig) {
    const sCfg = structure.surfaceSlabConfig;

    let slabAreaM2 = 0;
    let edgeMiterMeters = 0;

    if (sCfg.geometryMode === "TOP_HORIZONTAL") {
      slabAreaM2 = w * d;
      edgeMiterMeters = 2 * (w + d);
    } else if (sCfg.geometryMode === "FRONT_VERTICAL") {
      slabAreaM2 = w * h;
      edgeMiterMeters = 2 * (w + h);
    } else if (sCfg.geometryMode === "WATERFALL_3_SIDES") {
      slabAreaM2 = w * d + 2 * (d * h);
      edgeMiterMeters = 2 * w + 4 * d + 4 * h;
    } else {
      slabAreaM2 = (w * d) * (sCfg.customAreaRatio || 1.0);
      edgeMiterMeters = 2 * (w + d);
    }

    const slabMats = sCfg.materials.length > 0 ? sCfg.materials : [
      {
        id: "mat_stone_def",
        materialCode: "VICOSTONE_QUARTZ",
        materialName: "Đá Vicostone thạch anh nhân tạo",
        category: "STONE_M2" as const,
        unit: "m2" as const,
        unitPriceVnd: 2200000,
        baseWasteFactor: 1.10,
        allocationRatio: 1.0,
      },
    ];

    slabMats.forEach((mat) => {
      const effWaste = 1 + (mat.baseWasteFactor - 1) * batchEcon.wasteDecayMultiplier;
      const grossArea = Number((slabAreaM2 * (mat.allocationRatio || 1.0) * effWaste).toFixed(2));
      const lineCost = Math.round(grossArea * mat.unitPriceVnd);

      materialsLabor.push({
        id: `b3_slab_${mat.id}`,
        block: mat.category === "GLASS_M2" ? "Glass" : "Stone",
        name: mat.materialName,
        description: `Gia công tấm mặt (${slabAreaM2.toFixed(2)}m² Net • Bo/vát ${sCfg.edgeProfile})`,
        qty: grossArea,
        unit: "m2",
        unitPrice: mat.unitPriceVnd,
        wasteFactor: Number(effWaste.toFixed(2)),
        totalAmount: lineCost,
      });

      if (mat.category === "GLASS_M2") glassCost += lineCost;
      else stoneCost += lineCost;

      if (sCfg.executionSource === "SUBCONTRACT") subcontractDirectCost += lineCost;
      else inHouseDirectCost += lineCost;
    });

    stoneGlassHours += Number(((slabAreaM2 * 0.8 + edgeMiterMeters * 0.15) * batchEcon.laborCurveMultiplier).toFixed(1));
  }

  // --------------------------------------------------------------------------
  // KHỐI 4: B4_VOLUME_CUSHION (ĐỆM MÚT, HỆ ĐÀN HỒI & BỌC DA / VẢI)
  // --------------------------------------------------------------------------
  if (enabled.has("B4_VOLUME_CUSHION") && structure.volumeCushionConfig) {
    const cCfg = structure.volumeCushionConfig;
    const isFinishToFoam = cCfg.scope === "SEMI_FINISHED";
    const isCustomerFabric = cCfg.scope === "CLIENT_MATERIAL_COM";

    // 1. Thể tích mút xốp (m3)
    let foamVolumeM3 = 0;
    if (cCfg.geometryMode === "FLAT_PAD_1D") {
      foamVolumeM3 = w * d * (cCfg.foamFillRatioOrThickness || 0.10);
    } else if (cCfg.geometryMode === "L_SHAPE_SEAT_BACK") {
      foamVolumeM3 = (w * d + w * h) * (cCfg.foamFillRatioOrThickness || 0.15);
    } else {
      // 3D khối tròn / Sofa trùm khối
      const fillRatio = Math.min(0.60, Math.max(0.20, cCfg.foamFillRatioOrThickness || 0.35));
      foamVolumeM3 = (w * d * h) * fillRatio;
    }
    foamVolumeM3 = Number(foamVolumeM3.toFixed(3));

    // Định mức mút xốp
    const foamMats = cCfg.foamMaterials.length > 0 ? cCfg.foamMaterials : [
      {
        id: "mat_foam_def",
        materialCode: "FOAM_D40",
        materialName: "Mút xốp D40 nguyên khối đàn hồi cao",
        category: "FOAM_M3" as const,
        unit: "m3" as const,
        unitPriceVnd: 3800000,
        baseWasteFactor: 1.12,
        allocationRatio: 1.0,
      },
    ];

    foamMats.forEach((mat) => {
      const effWaste = 1 + (mat.baseWasteFactor - 1) * batchEcon.wasteDecayMultiplier;
      const grossFoam = Number((foamVolumeM3 * (mat.allocationRatio || 1.0) * effWaste).toFixed(3));
      const lineCost = Math.round(grossFoam * mat.unitPriceVnd);

      materialsLabor.push({
        id: `b4_foam_${mat.id}`,
        block: "Upholstery",
        name: mat.materialName,
        description: `Cắt dán mút tạo phom đệm (${foamVolumeM3}m³ Net)`,
        qty: grossFoam,
        unit: "m3",
        unitPrice: mat.unitPriceVnd,
        wasteFactor: Number(effWaste.toFixed(2)),
        totalAmount: lineCost,
      });

      upholsteryCost += lineCost;
      inHouseDirectCost += lineCost;
    });

    // 2. Hệ đàn hồi đáy (lò xo hoặc đai thun)
    if (cCfg.suspensionSystem !== "NONE") {
      const strapsCount = Math.ceil(w / 0.12) * 2;
      const strapAmount = strapsCount * 18000;
      materialsLabor.push({
        id: "b4_suspension",
        block: "Hardware",
        name: `Hệ đàn hồi đáy khung (${cCfg.suspensionSystem === "SINUOUS_SPRING_WEBBING" ? "Lò xo zic-zac & Đai thun" : "Đai thun đan dệt chịu lực"})`,
        description: `Gia cố đáy chịu lực ngồi (${strapsCount} dải/sợi)`,
        qty: strapsCount,
        unit: "sợi",
        unitPrice: 18000,
        wasteFactor: 1.0,
        totalAmount: strapAmount,
      });
      hardwareCost += strapAmount;
      inHouseDirectCost += strapAmount;
    }

    // 3. Vải / Da bọc ngoài
    // Diện tích phủ bọc = [W*D + 2(W*H + D*H)] * 1.25
    const coverAreaM2 = Number(((w * d + 2 * (w * h + d * h)) * 1.25).toFixed(2));
    const rawFabricMeters = Number((coverAreaM2 / 1.4).toFixed(1)); // Khổ vải cuộn 1.4m

    const coverMats = cCfg.coverMaterials.length > 0 ? cCfg.coverMaterials : [
      {
        id: "mat_cover_def",
        materialCode: "FABRIC_MICROFIBER",
        materialName: "Vải da Microfiber cao cấp kháng trầy",
        category: "FABRIC_MD" as const,
        unit: "md" as const,
        unitPriceVnd: 280000,
        baseWasteFactor: 1.18,
        allocationRatio: 1.0,
      },
    ];

    coverMats.forEach((mat) => {
      const effWaste = 1 + (mat.baseWasteFactor - 1) * batchEcon.wasteDecayMultiplier;
      const grossFabricMeters = Number((rawFabricMeters * (mat.allocationRatio || 1.0) * effWaste).toFixed(1));

      if (isFinishToFoam) {
        // Finish to Foam: Ẩn tiền mua vải bọc ngoài = 0 đ
        materialsLabor.push({
          id: `b4_cover_${mat.id}`,
          block: "Upholstery",
          name: `${mat.materialName} (Chế độ Finish to Foam)`,
          description: "Không bao gồm vải da bọc hoàn thiện ngoài theo yêu cầu đơn hàng",
          qty: 0,
          unit: "md",
          unitPrice: 0,
          wasteFactor: 1.0,
          totalAmount: 0,
        });
      } else if (isCustomerFabric) {
        // Customer Supplied (COM): Đơn giá = 0, nhưng giữ nguyên định mức để khách cấp
        materialsLabor.push({
          id: `b4_cover_${mat.id}`,
          block: "Upholstery",
          name: `${mat.materialName} (Khách hàng tự cấp vật tư - COM)`,
          description: `Định mức khách cần cấp xưởng: ${grossFabricMeters}md/cái (Tổng cả lô: ${(grossFabricMeters * Q).toFixed(1)}md)`,
          qty: grossFabricMeters,
          unit: "md",
          unitPrice: 0,
          wasteFactor: Number(effWaste.toFixed(2)),
          totalAmount: 0,
        });
      } else {
        // Full Turnkey: Tính tiền mua vải đầy đủ
        const lineCost = Math.round(grossFabricMeters * mat.unitPriceVnd);
        materialsLabor.push({
          id: `b4_cover_${mat.id}`,
          block: "Upholstery",
          name: mat.materialName,
          description: `Vỏ bọc may đo viền mí (${coverAreaM2}m² diện tích bọc)`,
          qty: grossFabricMeters,
          unit: "md",
          unitPrice: mat.unitPriceVnd,
          wasteFactor: Number(effWaste.toFixed(2)),
          totalAmount: lineCost,
        });

        upholsteryCost += lineCost;
        if (cCfg.executionSource === "SUBCONTRACT") subcontractDirectCost += lineCost;
        else inHouseDirectCost += lineCost;
      }
    });

    // Giờ công cắt dán mút
    foamHours += Number((foamVolumeM3 * 4.5 * batchEcon.laborCurveMultiplier).toFixed(1));

    // Giờ công cắt may & bọc nệm (chỉ tắt khi Finish to Foam)
    if (!isFinishToFoam) {
      upholsterySewingHours += Number((coverAreaM2 * 1.4 * batchEcon.laborCurveMultiplier).toFixed(1));
    }
  }

  // --------------------------------------------------------------------------
  // KHỐI 5: B5_SURFACE_FINISH (SƠN PU, 2K & XỬ LÝ BỀ MẶT)
  // --------------------------------------------------------------------------
  if (enabled.has("B5_SURFACE_FINISH") && structure.surfaceFinishConfig) {
    const fCfg = structure.surfaceFinishConfig;
    if (fCfg.finishType !== "NONE_RAW" && fCfg.finishType !== "MELAMINE_PRELAM") {
      const finishAreaM2 = Number(((w * d + 2 * (w * h + d * h)) * (fCfg.coverageMultiplier || 1.0)).toFixed(2));
      const finishPrice = fCfg.finishType === "PAINT_2K" ? 380000 : 280000;
      const finishCost = Math.round(finishAreaM2 * finishPrice);

      materialsLabor.push({
        id: "b5_coating",
        block: "Chemical",
        name: `Hóa chất hoàn thiện bề mặt (${fCfg.finishType})`,
        description: `Sơn lót & hoàn thiện bóng mờ (${finishAreaM2}m² diện tích lộ thiên)`,
        qty: finishAreaM2,
        unit: "m2",
        unitPrice: finishPrice,
        wasteFactor: 1.05,
        totalAmount: finishCost,
      });

      chemicalCost += finishCost;
      if (fCfg.executionSource === "SUBCONTRACT") subcontractDirectCost += finishCost;
      else inHouseDirectCost += finishCost;

      sandingSprayHours += Number((finishAreaM2 * 0.9 * batchEcon.laborCurveMultiplier).toFixed(1));
    }
  }

  // --------------------------------------------------------------------------
  // KHỐI 6: B6_HARDWARE_ELECTRO (PHỤ KIỆN RỜI & ĐÈN LED NỘI THẤT)
  // --------------------------------------------------------------------------
  if (enabled.has("B6_HARDWARE_ELECTRO") && structure.hardwareElectroConfig) {
    const hCfg = structure.hardwareElectroConfig;

    if (hCfg.hasLedSystem) {
      const ledLength = hCfg.ledMetersCount || Number((w * 3).toFixed(1));
      const ledPricePerMd = 120000;
      const ledCost = Math.round(ledLength * ledPricePerMd + 280000); // 280k nguồn 12V

      materialsLabor.push({
        id: "b6_led_system",
        block: "Hardware",
        name: "Hệ đèn LED âm thanh nhôm có tai + Nguồn 12V cảm biến",
        description: `Lắp đặt dây LED âm rãnh (${ledLength}md)`,
        qty: 1,
        unit: "hệ",
        unitPrice: ledCost,
        wasteFactor: 1.0,
        totalAmount: ledCost,
      });

      hardwareCost += ledCost;
      inHouseDirectCost += ledCost;
    }

    if (hCfg.customDiscreteItems && hCfg.customDiscreteItems.length > 0) {
      hCfg.customDiscreteItems.forEach((item, idx) => {
        const itemAmount = Math.round(item.qtyPerProduct * item.unitPriceVnd);
        materialsLabor.push({
          id: `b6_custom_hw_${idx}`,
          block: "Hardware",
          name: item.name,
          description: `Phụ kiện kim khí đặc thù (${item.qtyPerProduct} cái/bộ)`,
          qty: item.qtyPerProduct,
          unit: "cái",
          unitPrice: item.unitPriceVnd,
          wasteFactor: 1.0,
          totalAmount: itemAmount,
        });
        hardwareCost += itemAmount;
        inHouseDirectCost += itemAmount;
      });
    }
  }

  // --------------------------------------------------------------------------
  // ĐÓNG GÓI & VẬN CHUYỂN LOGISTICS
  // --------------------------------------------------------------------------
  const logistics = resolveLogisticsCostPerUnit(structure);
  materialsLabor.push({
    id: "logistics_unit",
    block: "PackingDelivery",
    name: "Chi phí đóng gói bảo vệ & Vận chuyển giao hàng",
    description: logistics.description,
    qty: 1,
    unit: "kiện",
    unitPrice: logistics.unitLogisticsCostVnd,
    wasteFactor: 1.0,
    totalAmount: logistics.unitLogisticsCostVnd,
  });
  inHouseDirectCost += logistics.unitLogisticsCostVnd;

  // --------------------------------------------------------------------------
  // BẢNG PHÂN XƯỞNG NHÂN CÔNG & TOÁN HỌC KHỚP 100% (FIX BUG-07)
  // --------------------------------------------------------------------------
  // Chỉ tạo các dòng phân xưởng thực sự có giờ công > 0
  if (cncHours > 0) {
    const cost = Math.round(cncHours * hourlyLaborRate);
    labourDepts.push({
      department: "cnc_cutting",
      name: "Tổ Cắt CNC & Dán nẹp nẹp nhiệt",
      hours: cncHours,
      hourlyRate: hourlyLaborRate,
      totalAmount: cost,
    });
  }

  if (framingHours > 0) {
    const cost = Math.round(framingHours * hourlyLaborRate);
    labourDepts.push({
      department: "assembly",
      name: "Tổ Mộc pha phôi gỗ thịt & Dựng khung xương",
      hours: framingHours,
      hourlyRate: hourlyLaborRate,
      totalAmount: cost,
    });
  }

  if (stoneGlassHours > 0) {
    const cost = Math.round(stoneGlassHours * hourlyLaborRate);
    labourDepts.push({
      department: "cnc_cutting",
      name: "Tổ Gia công cắt mài Đá & Cánh kính",
      hours: stoneGlassHours,
      hourlyRate: hourlyLaborRate,
      totalAmount: cost,
    });
  }

  if (foamHours > 0) {
    const cost = Math.round(foamHours * hourlyLaborRate);
    labourDepts.push({
      department: "assembly",
      name: "Tổ Cắt & Dán mút tạo phom đệm",
      hours: foamHours,
      hourlyRate: hourlyLaborRate,
      totalAmount: cost,
    });
  }

  if (upholsterySewingHours > 0) {
    const cost = Math.round(upholsterySewingHours * hourlyLaborRate);
    labourDepts.push({
      department: "assembly",
      name: "Tổ Cắt may da/vải & Bọc nệm hoàn thiện",
      hours: upholsterySewingHours,
      hourlyRate: hourlyLaborRate,
      totalAmount: cost,
    });
  }

  if (sandingSprayHours > 0) {
    const cost = Math.round(sandingSprayHours * hourlyLaborRate);
    labourDepts.push({
      department: "sanding_spray",
      name: "Tổ Chà nhám lót & Phun sơn bóng mờ 2K/PU",
      hours: sandingSprayHours,
      hourlyRate: hourlyLaborRate,
      totalAmount: cost,
    });
  }

  // Khâu hoàn thiện lắp ráp & KCS (luôn cần ít nhất 0.5 - 1.5 giờ)
  const finalInspectHours = Math.max(0.5, Number((assemblyInspectHours + 0.5).toFixed(1)));
  const finalInspectCost = Math.round(finalInspectHours * hourlyLaborRate);
  labourDepts.push({
    department: "packing_install",
    name: "Tổ Lắp ráp phụ kiện, KCS & Đóng gói hoàn thiện",
    hours: finalInspectHours,
    hourlyRate: hourlyLaborRate,
    totalAmount: finalInspectCost,
  });

  // Bất biến: Tổng tiền nhân công trực tiếp
  const laborCostTotal = labourDepts.reduce((sum, r) => sum + r.totalAmount, 0);
  inHouseDirectCost += laborCostTotal;

  // --------------------------------------------------------------------------
  // TỔNG HỢP GIÁ VỐN (COGS) & OVERHEAD PHÂN TẦNG
  // --------------------------------------------------------------------------
  const totalDirectLM =
    woodCost +
    stoneCost +
    glassCost +
    metalCost +
    upholsteryCost +
    chemicalCost +
    hardwareCost +
    consumablesCost +
    subContractCost +
    logistics.unitLogisticsCostVnd +
    laborCostTotal;

  // Overhead theo nguồn thực tế (Workshop OH mặc định 25%, Subcontract OH 10%)
  const ohWorkshopRate = 0.25;
  const ohSubcontractRate = 0.10;

  const ohWorkshopAmount = Math.round(inHouseDirectCost * ohWorkshopRate);
  const ohSubcontractAmount = Math.round(subcontractDirectCost * ohSubcontractRate);
  const totalOH = ohWorkshopAmount + ohSubcontractAmount;

  const cogs = totalDirectLM + totalOH;

  const profitRate = (structure.targetMarginPercent || 35) / 100;
  const profitAmount = Math.round(cogs * profitRate);
  const calculateSalesPrice = cogs + profitAmount;

  // Bảng giá MOQ các bậc số lượng [1, 2, 5, 10, 20, 50, 100, 200, 500]
  const moqPrices: Record<number, number> = {};
  [1, 2, 5, 10, 20, 50, 100, 200, 500].forEach((moq) => {
    if (moq === Q) {
      moqPrices[moq] = calculateSalesPrice;
    } else {
      // Tính toán nhanh đơn giá cho từng bậc MOQ khác
      const moqStructure: UniversalProductStructure = {
        ...structure,
        orderQuantity: moq,
      };
      const econ = resolveBatchEconomics(moq);
      const log = resolveLogisticsCostPerUnit(moqStructure);
      // Áp dụng tỷ lệ co giãn giá vốn theo kinh tế học quy mô
      const scaleFactor = (econ.laborCurveMultiplier / batchEcon.laborCurveMultiplier) * 0.4 +
                          (econ.wasteDecayMultiplier / batchEcon.wasteDecayMultiplier) * 0.4 +
                          (log.unitLogisticsCostVnd / Math.max(1, logistics.unitLogisticsCostVnd)) * 0.2;
      const moqCogs = Math.round(cogs * Math.min(1.4, Math.max(0.65, scaleFactor)));
      moqPrices[moq] = Math.round(moqCogs * (1 + profitRate));
    }
  });

  const summary: CostSummary = {
    stone: stoneCost,
    upholstery: upholsteryCost,
    metalFrameS: metalCost,
    subContract: subContractCost,
    wood: woodCost,
    metalFrameP: 0,
    glass: glassCost,
    chemical: chemicalCost,
    hardware: hardwareCost,
    consumables: consumablesCost,
    packingDelivery: logistics.unitLogisticsCostVnd,
    laborCostTotal,
    totalDirectLM,
    ohWorkshopRate,
    ohWorkshopAmount,
    ohSubcontractRate,
    ohSubcontractAmount,
    totalOH,
    cogs,
    profitRate,
    profitAmount,
    calculateSalesPrice,
    moqPrices,
  };

  // Tạo questionnaire tương thích ngược
  const questionnaire: CostingQuestionnaire = {
    productType: (enabled.has("B1_PANEL_BOX") ? "wardrobe" : "custom") as any,
    name: structure.productName,
    dimensions: {
      widthMm: structure.dimensionsMm.width,
      depthMm: structure.dimensionsMm.depth,
      heightMm: structure.dimensionsMm.height,
    },
    materials: {
      coreCode: structure.panelBoxConfig?.materials[0]?.materialCode || "MDF_17_CHONG_AM",
      surfaceCode: structure.surfaceFinishConfig?.finishType || "Melamine",
      hasStone: enabled.has("B3_SURFACE_SLAB"),
      hasGlass: enabled.has("B3_SURFACE_SLAB"),
      hasMetal: enabled.has("B2_FRAME_SKELETON") && structure.frameSkeletonConfig?.materials.some(m => m.category === "METAL_LEN") || false,
      hasUpholstery: enabled.has("B4_VOLUME_CUSHION"),
      hasLed: structure.hardwareElectroConfig?.hasLedSystem || false,
    },
    details: {
      drawerCount: structure.panelBoxConfig?.drawers || 0,
      doorCount: structure.panelBoxConfig?.swingDoors || 0,
      moqTiers: [1, 2, 5, 10, 20, 50, 100, 200, 500],
    },
    calcMode: "detail",
    estimationLevel: 4,
  };

  return {
    questionnaire,
    summary,
    materialsLabor,
    labourDepts,
    confidence: {
      stars: 5,
      label: "Rất sát",
      colorClass: "bg-emerald-600 text-white",
      reasons: ["Bóc tách vật lý đa mô-đun", "Kinh tế học quy mô theo số lượng lô"],
      recommendation: "Báo giá sẵn sàng ký hợp đồng hoặc xuất xưởng",
    },
    contingencyRate: 0.05,
    contingencyAmount: Math.round(calculateSalesPrice * 0.05),
    priceRange: {
      min: Math.round(calculateSalesPrice * 0.95),
      max: Math.round(calculateSalesPrice * 1.05),
      formatted: `${calculateSalesPrice.toLocaleString("vi-VN")} đ`,
    },
    drivers: {
      boardAreaNetM2: enabled.has("B1_PANEL_BOX") ? Number((materialsLabor.filter(m => m.block === "Carcass").reduce((sum, r) => sum + (r.qty * 2.9768 / r.wasteFactor), 0)).toFixed(2)) : 0,
      boardAreaGrossM2: enabled.has("B1_PANEL_BOX") ? Number((materialsLabor.filter(m => m.block === "Carcass").reduce((sum, r) => sum + r.qty * 2.9768, 0)).toFixed(2)) : 0,
      sheetsCount: enabled.has("B1_PANEL_BOX") ? materialsLabor.filter(m => m.block === "Carcass").reduce((sum, r) => sum + r.qty, 0) : 0,
      edgeLengthMd: enabled.has("B1_PANEL_BOX") ? (materialsLabor.find(m => m.id === "b1_pvc_edge")?.qty || 0) : 0,
      drawerCount: structure.panelBoxConfig?.drawers || 0,
      doorCount: structure.panelBoxConfig?.swingDoors || 0,
    },
  };
}
