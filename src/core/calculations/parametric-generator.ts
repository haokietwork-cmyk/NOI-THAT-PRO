/**
 * BỘ SINH ĐỊNH MỨC THÔNG SỐ (PARAMETRIC GENERATOR)
 * Triển khai theo thiết kế thiet_ke_kien_truc_costing_sheet_v2.md
 * Quy đổi từ Bảng câu hỏi thông số (Costing V2) sang Bảng Costing Sheet chi tiết và Cost Summary
 * Hoàn toàn không phụ thuộc vào file Cutlist từng tấm phôi!
 */

import type {
  CostingQuestionnaire,
  GeneratedCostingResult,
  CostSummary,
  MaterialLaborRow,
  LabourDeptRow,
  ConfidenceRating,
  ProductArchetype,
} from "./parametric-types.ts";
import type { MaterialItem } from "../types/index.ts";
import { STANDARD_BOARD } from "./board-calculator.ts";

export interface GeneratorOptions {
  workshopOhRate?: number;     // Tỷ lệ OH Xưởng (mặc định 25% = 0.25)
  subcontractOhRate?: number;  // Tỷ lệ OH Thầu phụ / Gia công ngoài (mặc định 10% = 0.10)
  profitRate?: number;         // Tỷ lệ lợi nhuận mục tiêu (mặc định 20% = 0.20)
  hourlyLaborRate?: number;    // Đơn giá giờ công thợ (mặc định 60.000 đ/giờ)
  roundingStep?: 0.5 | 1;      // Bước làm tròn số tấm ván (0.5 hoặc 1.0)
}

/**
 * Tra cứu đơn giá vật tư từ thư viện hoặc dùng giá tham khảo an toàn
 */
function findMaterialPrice(
  materials: MaterialItem[],
  codeOrPattern: string,
  defaultPrice: number
): { unitPrice: number; wasteFactor: number; name: string; code: string } {
  const clean = codeOrPattern.toLowerCase();
  const found = materials.find(
    (m) => m.code.toLowerCase() === clean || m.code.toLowerCase().includes(clean) || m.name.toLowerCase().includes(clean)
  );
  if (found && found.unitPrice > 0) {
    return {
      unitPrice: found.unitPrice,
      wasteFactor: found.wasteFactor || 1.0,
      name: found.name,
      code: found.code,
    };
  }
  return {
    unitPrice: defaultPrice,
    wasteFactor: clean.includes("mdf") ? 1.15 : clean.includes("edge") || clean.includes("chi") ? 1.08 : 1.0,
    name: codeOrPattern,
    code: codeOrPattern,
  };
}

/**
 * Động cơ chính: Sinh định mức và bảng chiết tính giá vốn từ Bảng câu hỏi Costing V2
 */
export function generateCostingFromQuestionnaire(
  q: CostingQuestionnaire,
  materials: MaterialItem[] = [],
  options: GeneratorOptions = {}
): GeneratedCostingResult {
  const ohWorkshopRate = options.workshopOhRate ?? 0.25;
  const ohSubcontractRate = options.subcontractOhRate ?? 0.10;
  const profitRate = options.profitRate ?? 0.20;
  const hourlyLaborRate = options.hourlyLaborRate ?? 60_000;
  const roundingStep = options.roundingStep ?? 0.5;

  // 1. Quy đổi kích thước mm sang mét (m)
  const wMm = Math.max(q.dimensions.widthMm || 0, 100);
  const dMm = Math.max(q.dimensions.depthMm || 0, 50);
  const hMm = Math.max(q.dimensions.heightMm || 0, 100);

  const W = wMm / 1000;
  const D = dMm / 1000;
  const H = hMm / 1000;

  // 2. Nội suy số cánh cửa (Nc) và số ngăn kéo (Nk)
  let doorCount = q.details?.doorCount;
  if (doorCount === undefined || doorCount === null || doorCount < 0) {
    switch (q.productType) {
      case "wardrobe":
        doorCount = Math.max(1, Math.ceil(W / 0.5));
        break;
      case "kitchen_base":
      case "kitchen_upper":
        doorCount = Math.max(1, Math.ceil(W / 0.45));
        break;
      case "shoe_cabinet":
        doorCount = Math.max(1, Math.ceil(W / 0.4));
        break;
      case "vanity":
        doorCount = Math.max(1, Math.ceil(W / 0.4));
        break;
      case "tv_shelf":
        doorCount = Math.max(0, Math.floor(W / 0.6));
        break;
      default:
        doorCount = 0;
    }
  }

  let drawerCount = q.details?.drawerCount;
  if (drawerCount === undefined || drawerCount === null || drawerCount < 0) {
    switch (q.productType) {
      case "wardrobe":
        drawerCount = 2; // Mặc định 2 ngăn kéo trong tủ áo
        break;
      case "kitchen_base":
        drawerCount = 3; // 3 ngăn kéo tủ bếp
        break;
      case "table":
        drawerCount = 2; // 2 hộc bàn
        break;
      case "tv_shelf":
        drawerCount = 2; // 2 hộc kéo kệ tivi
        break;
      case "shoe_cabinet":
        drawerCount = 1; // 1 hộc kéo trên
        break;
      default:
        drawerCount = 0;
    }
  }

  const materialsLabor: MaterialLaborRow[] = [];
  const labourDepts: LabourDeptRow[] = [];

  // ==========================================================================
  // KHỐI 1: KHUNG THÙNG & ĐỢT GỖ (CARCASS / WOOD)
  // ==========================================================================
  let carcassAreaNetM2 = 0;
  const corePriceInfo = findMaterialPrice(materials, q.materials.coreCode || "MDF_17_CHONG_AM", 680_000);

  switch (q.productType) {
    case "wardrobe": {
      // 2 hồi đứng ngoài + vách ngăn giữa: D * H * (2 + floor(W / 0.9))
      const verticalPanels = D * H * (2 + Math.floor(W / 0.9));
      // Đáy + Nóc + Đợt ngang: W * D * (2 + floor(H / 0.55))
      const horizontalPanels = W * D * (2 + Math.floor(H / 0.55));
      // Hộc ngăn kéo: Nk * 2 * (Wnk + Dnk) * 0.18
      const drawerBoxes = drawerCount * 2 * (0.45 + 0.45) * 0.18;
      carcassAreaNetM2 = verticalPanels + horizontalPanels + drawerBoxes;
      break;
    }
    case "kitchen_base": {
      const verticalPanels = D * H * (2 + Math.floor(W / 0.8));
      const horizontalPanels = W * D * (1 + Math.floor(H / 0.4)) + W * 0.1 * 2; // Đáy + đợt + giằng nóc
      const drawerBoxes = drawerCount * 2 * (0.4 + 0.45) * 0.18;
      carcassAreaNetM2 = verticalPanels + horizontalPanels + drawerBoxes;
      break;
    }
    case "kitchen_upper": {
      const verticalPanels = D * H * (2 + Math.floor(W / 0.8));
      const horizontalPanels = W * D * (2 + Math.floor(H / 0.35)); // Đáy + nóc + 1-2 đợt
      carcassAreaNetM2 = verticalPanels + horizontalPanels;
      break;
    }
    case "bed": {
      const bedPlatform = W * D; // Mặt dát giường
      const sideRails = D * 0.35 * 2; // 2 thành giường
      const headBoard = W * 0.95; // Đầu giường
      const footBoard = W * 0.35; // Đuôi giường
      const drawerBoxes = drawerCount * 2 * (0.7 + 0.5) * 0.22;
      carcassAreaNetM2 = bedPlatform + sideRails + headBoard + footBoard + drawerBoxes;
      break;
    }
    case "table": {
      const tableTop = W * D * 1.5; // Mặt bàn (thường dày gấp rưỡi hoặc chập viền)
      const legs = q.materials.hasMetal ? 0 : D * H * 2; // Nếu có chân sắt thì không tốn ván chân
      const apron = W * 0.12 * 2; // Yếm bàn
      const drawerBoxes = drawerCount * 2 * (0.35 + 0.45) * 0.15;
      carcassAreaNetM2 = tableTop + legs + apron + drawerBoxes;
      break;
    }
    case "tv_shelf": {
      const verticalPanels = D * H * (2 + Math.floor(W / 0.6));
      const horizontalPanels = W * D * 2;
      const drawerBoxes = drawerCount * 2 * (0.4 + 0.35) * 0.15;
      carcassAreaNetM2 = verticalPanels + horizontalPanels + drawerBoxes;
      break;
    }
    case "wall_panel": {
      carcassAreaNetM2 = W * H * 1.25; // 1 lớp mặt + khung xương giằng phía sau
      break;
    }
    case "shoe_cabinet": {
      const verticalPanels = D * H * 2;
      const horizontalPanels = W * D * (2 + Math.floor(H / 0.25)); // Các đợt để giày
      const drawerBoxes = drawerCount * 2 * (0.35 + 0.35) * 0.15;
      carcassAreaNetM2 = verticalPanels + horizontalPanels + drawerBoxes;
      break;
    }
    case "vanity": {
      const verticalPanels = D * H * 2;
      const horizontalPanels = W * D * 2;
      carcassAreaNetM2 = verticalPanels + horizontalPanels;
      break;
    }
    default: {
      carcassAreaNetM2 = 2 * (W * D + W * H + D * H) * 0.7;
    }
  }

  // Quy đổi số tấm chuẩn 1220x2440 (2.9768 m2) kèm hao hụt 15%
  const carcassGrossM2 = carcassAreaNetM2 * 1.15;
  const rawSheets = carcassGrossM2 / STANDARD_BOARD.AREA_M2;
  const sheetsCount = Math.max(
    roundingStep,
    Math.ceil(rawSheets / roundingStep) * roundingStep
  );
  const carcassWoodCost = Math.round(sheetsCount * corePriceInfo.unitPrice);

  materialsLabor.push({
    id: "mat-carcass-wood",
    block: "Wood",
    name: `Ván thùng & đợt: ${corePriceInfo.name}`,
    description: `Khổ 1220×2440mm (Quy đổi từ ${carcassAreaNetM2.toFixed(2)}m² net + 15% hao hụt)`,
    thicknessMm: 17,
    qty: sheetsCount,
    unit: "tấm",
    unitPrice: corePriceInfo.unitPrice,
    wasteFactor: 1.15,
    totalAmount: carcassWoodCost,
  });

  // ==========================================================================
  // KHỐI 2: CÁNH TỦ & BỀ MẶT MẶT TIỀN (FRONTS)
  // ==========================================================================
  let frontsAreaNetM2 = 0;
  let facadeRatio = 0;

  switch (q.productType) {
    case "wardrobe":
      facadeRatio = 1.0;
      break;
    case "kitchen_base":
      facadeRatio = 0.9;
      break;
    case "kitchen_upper":
      facadeRatio = 0.95;
      break;
    case "shoe_cabinet":
      facadeRatio = 0.9;
      break;
    case "vanity":
      facadeRatio = 0.8;
      break;
    case "tv_shelf":
      facadeRatio = 0.45;
      break;
    default:
      facadeRatio = 0;
  }

  frontsAreaNetM2 = W * H * facadeRatio;

  // Nếu chọn có cánh kính thì 85% diện tích mặt tiền là kính khung nhôm
  let glassAreaM2 = 0;
  let glassAluminumMd = 0;
  let woodFrontsAreaM2 = frontsAreaNetM2;

  if (q.materials.hasGlass && frontsAreaNetM2 > 0) {
    glassAreaM2 = frontsAreaNetM2 * 0.85;
    woodFrontsAreaM2 = frontsAreaNetM2 * 0.15; // Chỉ còn viền hoặc hồi hở
    glassAluminumMd = (W + H) * 2 * Math.max(1, doorCount) * 1.05; // Khung nhôm hệ cánh kính
  }

  let frontsWoodCost = 0;
  let subConAcrylicCost = 0;
  let paintChemicalCost = 0;

  if (woodFrontsAreaM2 > 0) {
    const frontsSheets = Math.ceil((woodFrontsAreaM2 * 1.15) / STANDARD_BOARD.AREA_M2 / roundingStep) * roundingStep;
    const isAcrylic = q.materials.surfaceCode?.toLowerCase().includes("acrylic");
    const isPaint2K = q.materials.surfaceCode?.toLowerCase().includes("son") || q.materials.surfaceCode?.toLowerCase().includes("2k");
    const isVeneer = q.materials.surfaceCode?.toLowerCase().includes("veneer");

    if (isAcrylic) {
      // Cánh Acrylic bóng gương noline tính vào nhóm SubContract (gia công ngoài chuyên dụng)
      subConAcrylicCost = Math.round(woodFrontsAreaM2 * 1_250_000);
      materialsLabor.push({
        id: "mat-fronts-acrylic",
        block: "SubContract",
        name: "Cánh Acrylic bóng gương noline (Gia công CNC chuyên dụng)",
        description: `Gia công noline cạnh theo kích thước mặt cánh (${woodFrontsAreaM2.toFixed(2)}m²)`,
        qty: Number(woodFrontsAreaM2.toFixed(2)),
        unit: "m²",
        unitPrice: 1_250_000,
        wasteFactor: 1.05,
        totalAmount: subConAcrylicCost,
      });
    } else if (isPaint2K || isVeneer) {
      // Ván cốt MDF sơn + tiền sơn hóa chất
      frontsWoodCost = Math.round(frontsSheets * corePriceInfo.unitPrice);
      paintChemicalCost = Math.round(woodFrontsAreaM2 * 380_000);
      materialsLabor.push({
        id: "mat-fronts-wood",
        block: "Wood",
        name: `Ván phôi cánh: ${corePriceInfo.name}`,
        description: `Cốt ván để hoàn thiện sơn/veneer (${frontsSheets} tấm)`,
        thicknessMm: 17,
        qty: frontsSheets,
        unit: "tấm",
        unitPrice: corePriceInfo.unitPrice,
        wasteFactor: 1.15,
        totalAmount: frontsWoodCost,
      });
      materialsLabor.push({
        id: "mat-fronts-paint",
        block: "Chemical",
        name: isVeneer ? "Lạng Veneer tự nhiên & Sơn PU lót/phủ bóng" : "Hệ sơn 2K Men bóng / Mờ chống ố vàng",
        description: `Hoàn thiện bề mặt cánh (${woodFrontsAreaM2.toFixed(2)}m²)`,
        qty: Number(woodFrontsAreaM2.toFixed(2)),
        unit: "m²",
        unitPrice: 380_000,
        wasteFactor: 1.10,
        totalAmount: paintChemicalCost,
      });
    } else {
      // Melamine tiêu chuẩn
      frontsWoodCost = Math.round(frontsSheets * corePriceInfo.unitPrice);
      materialsLabor.push({
        id: "mat-fronts-wood",
        block: "Wood",
        name: `Ván cánh phủ Melamine: ${corePriceInfo.name}`,
        description: `Gia công cắt dán nẹp Melamine đồng màu (${frontsSheets} tấm)`,
        thicknessMm: 17,
        qty: frontsSheets,
        unit: "tấm",
        unitPrice: corePriceInfo.unitPrice,
        wasteFactor: 1.15,
        totalAmount: frontsWoodCost,
      });
    }
  }

  // ==========================================================================
  // KHỐI 3: VÁN HẬU (BACK PANEL)
  // ==========================================================================
  let backWoodCost = 0;
  const hasBackPanel = ["wardrobe", "kitchen_upper", "shoe_cabinet", "tv_shelf"].includes(q.productType);

  if (hasBackPanel) {
    const backNetM2 = W * H;
    const backPriceInfo = findMaterialPrice(materials, q.materials.backPanelCode || "MDF_6_HAU", 360_000);
    const backGrossM2 = backNetM2 * 1.10;
    const backSheets = Math.max(
      roundingStep,
      Math.ceil((backGrossM2 / STANDARD_BOARD.AREA_M2) / roundingStep) * roundingStep
    );
    backWoodCost = Math.round(backSheets * backPriceInfo.unitPrice);

    materialsLabor.push({
      id: "mat-back-panel",
      block: "Wood",
      name: `Ván hậu: ${backPriceInfo.name}`,
      description: `Ván hậu soi rãnh/bắn đinh (${backNetM2.toFixed(2)}m² net)`,
      thicknessMm: 6,
      qty: backSheets,
      unit: "tấm",
      unitPrice: backPriceInfo.unitPrice,
      wasteFactor: 1.10,
      totalAmount: backWoodCost,
    });
  }

  // ==========================================================================
  // KHỐI 4: CHỈ DÁN CẠNH & TIÊU HAO (CONSUMABLES / EDGE)
  // ==========================================================================
  const edgeLengthNetMd = (W + D + H) * 12 + drawerCount * 4 * 0.45;
  const edgePriceInfo = findMaterialPrice(materials, "CHI_DAN_CANH", 3_500);
  const edgeGrossMd = Number((edgeLengthNetMd * 1.08).toFixed(1));
  const edgeCost = Math.round(edgeGrossMd * edgePriceInfo.unitPrice);

  materialsLabor.push({
    id: "mat-edge-banding",
    block: "Consumables",
    name: `Chỉ dán cạnh PVC: ${edgePriceInfo.name}`,
    description: `Dán cạnh tự động keo nhiệt PUR (+8% hao hụt)`,
    qty: edgeGrossMd,
    unit: "md",
    unitPrice: edgePriceInfo.unitPrice,
    wasteFactor: 1.08,
    totalAmount: edgeCost,
  });

  // Vật tư phụ tiêu hao: keo hạt PUR, vít cam chốt liên kết, màng PE bọc hàng
  const suppliesCost = Math.round(sheetsCount * 18_000 + drawerCount * 12_000);
  materialsLabor.push({
    id: "mat-supplies",
    block: "Consumables",
    name: "Vật tư tiêu hao xưởng (Ốc cam chốt, ke góc, keo PUR, màng PE)",
    description: "Định mức phụ trợ gia công đóng gói hoàn thiện",
    qty: 1,
    unit: "gói",
    unitPrice: suppliesCost,
    wasteFactor: 1.0,
    totalAmount: suppliesCost,
  });

  // ==========================================================================
  // KHỐI 5: MẶT ĐÁ (STONE - ĐÁNH DẤU no OH 0%)
  // ==========================================================================
  let stoneCost = 0;
  if (q.materials.hasStone) {
    const stoneAreaM2 = Number((W * (D + 0.05)).toFixed(2));
    const stonePrice = 1_450_000; // Giá trung bình đá nhân tạo chống ố/kim sa
    stoneCost = Math.round(stoneAreaM2 * stonePrice);

    materialsLabor.push({
      id: "mat-stone",
      block: "Stone",
      name: `Mặt đá thi công: ${q.materials.stoneType || "Đá nhân tạo chống thấm"} [no OH]`,
      description: `Gia công phay vát mép, khoét chậu/bếp (${stoneAreaM2}m²)`,
      qty: stoneAreaM2,
      unit: "m²",
      unitPrice: stonePrice,
      wasteFactor: 1.0,
      totalAmount: stoneCost,
    });
  }

  // ==========================================================================
  // KHỐI 6: KÍNH / GƯƠNG / CÁNH KÍNH (GLASS)
  // ==========================================================================
  let glassCost = 0;
  if (q.materials.hasGlass) {
    const effectiveGlassM2 = glassAreaM2 > 0 ? glassAreaM2 : Number((W * H * 0.8).toFixed(2));
    const glassPrice = 850_000; // Kính cường lực 5mm/8mm màu trà hoặc khói
    const glassAmount = Math.round(effectiveGlassM2 * glassPrice);
    
    // Nhôm hệ cánh kính
    const aluminumLengthMd = glassAluminumMd > 0 ? glassAluminumMd : Number(((W + H) * 2 * Math.max(1, doorCount)).toFixed(1));
    const aluminumPrice = 140_000;
    const aluminumAmount = Math.round(aluminumLengthMd * aluminumPrice);

    glassCost = glassAmount + aluminumAmount;

    materialsLabor.push({
      id: "mat-glass-panel",
      block: "Glass",
      name: "Kính cường lực an toàn (Màu xám khói / Trà)",
      description: `Kính cường lực tôi nhiệt mài cạnh (${effectiveGlassM2}m²)`,
      qty: effectiveGlassM2,
      unit: "m²",
      unitPrice: glassPrice,
      wasteFactor: 1.05,
      totalAmount: glassAmount,
    });

    materialsLabor.push({
      id: "mat-glass-aluminum",
      block: "Glass",
      name: "Thanh nhôm hệ định hình cánh kính nội thất cao cấp",
      description: `Khung nhôm sơn anode xước mờ (+5% cắt mòi)`,
      qty: aluminumLengthMd,
      unit: "md",
      unitPrice: aluminumPrice,
      wasteFactor: 1.05,
      totalAmount: aluminumAmount,
    });
  }

  // ==========================================================================
  // KHỐI 7: KHUNG KIM LOẠI (METAL FRAME - GIA CÔNG NGOÀI)
  // ==========================================================================
  let metalCost = 0;
  if (q.materials.hasMetal) {
    let metalMd = 0;
    if (q.productType === "table") {
      metalMd = (W + D) * 2 + H * 4; // Khung chân bàn
    } else {
      metalMd = (W + H) * 2; // Khung giằng hoặc đợt kim loại
    }
    metalMd = Number(Math.max(metalMd, 4).toFixed(1));
    const metalPrice = 185_000; // Đơn giá sắt hộp / inox sơn tĩnh điện hoàn thiện
    metalCost = Math.round(metalMd * metalPrice);

    materialsLabor.push({
      id: "mat-metal-frame",
      block: "MetalFrame-S",
      name: "Khung chân kim loại sơn tĩnh điện / Inox mạ PVD (Gia công ngoài)",
      description: `Hàn liên kết mài nhẵn, sơn tĩnh điện chống rỉ (${metalMd}md)`,
      qty: metalMd,
      unit: "md",
      unitPrice: metalPrice,
      wasteFactor: 1.05,
      totalAmount: metalCost,
    });
  }

  // ==========================================================================
  // KHỐI 8: BỌC NỆM / DA / VẢI (UPHOLSTERY)
  // ==========================================================================
  let upholsteryCost = 0;
  if (q.materials.hasUpholstery) {
    const uphM2 = Number(Math.max(W * 0.8, 1.2).toFixed(2));
    const uphPrice = 750_000; // Mút D40 + vải nỉ/da microfiber
    upholsteryCost = Math.round(uphM2 * uphPrice);

    materialsLabor.push({
      id: "mat-upholstery",
      block: "Upholstery",
      name: "Bọc nệm mút D40 kháng lún + Vải nỉ / Da công nghiệp Microfiber",
      description: `May đo bọc thủ công kỹ thuật xưởng (${uphM2}m²)`,
      qty: uphM2,
      unit: "m²",
      unitPrice: uphPrice,
      wasteFactor: 1.05,
      totalAmount: upholsteryCost,
    });
  }

  // ==========================================================================
  // KHỐI 9: PHỤ KIỆN KIM KHÍ (HARDWARE: BẢN LỀ, RAY, TAY NẮM, LED)
  // ==========================================================================
  const hingesPerDoor = H > 2.2 ? 5 : H > 1.8 ? 4 : 3;
  const totalHinges = doorCount * hingesPerDoor;
  const hingePrice = 45_000; // Bản lề inox 304 giảm chấn
  const hingeCost = totalHinges * hingePrice;

  if (totalHinges > 0) {
    materialsLabor.push({
      id: "mat-hinges",
      block: "Hardware",
      name: "Bản lề Inox 304 giảm chấn thủy lực",
      description: `Định mức ${hingesPerDoor} bản lề/cánh (${doorCount} cánh)`,
      qty: totalHinges,
      unit: "cái",
      unitPrice: hingePrice,
      wasteFactor: 1.0,
      totalAmount: hingeCost,
    });
  }

  const slidePrice = 165_000; // Ray bi 3 tầng / ray âm giảm chấn
  const slideCost = drawerCount * slidePrice;
  if (drawerCount > 0) {
    materialsLabor.push({
      id: "mat-slides",
      block: "Hardware",
      name: "Ray trượt bi 3 tầng giảm chấn (450mm)",
      description: `Trang bị cho ${drawerCount} ngăn kéo hộc tủ`,
      qty: drawerCount,
      unit: "bộ",
      unitPrice: slidePrice,
      wasteFactor: 1.0,
      totalAmount: slideCost,
    });
  }

  let ledCost = 0;
  if (q.materials.hasLed) {
    const ledLengthMd = Number((W * 3).toFixed(1)); // Khoảng 3 tầng đèn LED
    const ledPricePerMd = 120_000; // Thanh nhôm có tai + LED dây 12V 120 chip
    const powerAdapterCost = 280_000; // Nguồn đũa 12V + cảm biến vẫy tay
    ledCost = Math.round(ledLengthMd * ledPricePerMd + powerAdapterCost);

    materialsLabor.push({
      id: "mat-led",
      block: "Hardware",
      name: "Hệ đèn LED nội thất (Thanh nhôm cánh có tai + Nguồn 12V + Cảm biến)",
      description: `Lắp âm rãnh hồi tủ (${ledLengthMd}md)`,
      qty: 1,
      unit: "hệ",
      unitPrice: ledCost,
      wasteFactor: 1.0,
      totalAmount: ledCost,
    });
  }

  const hardwareCost = hingeCost + slideCost + ledCost;

  // Đóng gói & Vận chuyển
  const packingDeliveryCost = 450_000;
  materialsLabor.push({
    id: "mat-delivery",
    block: "PackingDelivery",
    name: "Chi phí bốc xếp, đóng gói chống trầy & Vận chuyển nội thành",
    description: "Vận chuyển xe tải chuyên dụng phạm vi xưởng",
    qty: 1,
    unit: "chuyến",
    unitPrice: packingDeliveryCost,
    wasteFactor: 1.0,
    totalAmount: packingDeliveryCost,
  });

  // ==========================================================================
  // KHỐI 10: NHÂN CÔNG TRỰC TIẾP THEO BỘ PHẬN (LABOUR DEPT)
  // ==========================================================================
  const totalSheetsToCut = sheetsCount + (hasBackPanel ? 1 : 0);
  
  // 1. Pha phôi & CNC
  const cncHours = Number((totalSheetsToCut * 0.45).toFixed(1));
  const cncCost = Math.round(cncHours * hourlyLaborRate);
  labourDepts.push({
    department: "cnc_cutting",
    name: "Pha phôi & Cắt phay CNC",
    hours: cncHours,
    hourlyRate: hourlyLaborRate,
    totalAmount: cncCost,
  });

  // 2. Dán cạnh & Lắp ráp (ASS)
  const assHours = Number((totalSheetsToCut * 0.75 + drawerCount * 0.4).toFixed(1));
  const assCost = Math.round(assHours * hourlyLaborRate);
  labourDepts.push({
    department: "assembly",
    name: "Dán cạnh nẹp nhiệt & Lắp ráp kết cấu (ASS)",
    hours: assHours,
    hourlyRate: hourlyLaborRate,
    totalAmount: assCost,
  });

  // 3. Sơn & Hoàn thiện (Sand & Spray)
  let sprayHours = 0;
  if (paintChemicalCost > 0) {
    sprayHours = Number((woodFrontsAreaM2 * 1.8).toFixed(1));
  }
  const sprayCost = Math.round(sprayHours * hourlyLaborRate);
  if (sprayHours > 0) {
    labourDepts.push({
      department: "sanding_spray",
      name: "Chà nhám lót & Phun sơn hoàn thiện 2K",
      hours: sprayHours,
      hourlyRate: hourlyLaborRate,
      totalAmount: sprayCost,
    });
  }

  // 4. Đóng gói & Lắp đặt tại công trình
  const installHours = Number((totalSheetsToCut * 0.5 + 2.0).toFixed(1));
  const installCost = Math.round(installHours * hourlyLaborRate);
  labourDepts.push({
    department: "packing_install",
    name: "Đóng gói bọc hàng & Lắp đặt công trình",
    hours: installHours,
    hourlyRate: hourlyLaborRate,
    totalAmount: installCost,
  });

  const laborCostTotal = cncCost + assCost + sprayCost + installCost;

  // ==========================================================================
  // BẢNG TỔNG HỢP CHI PHÍ — COST SUMMARY (THEO CHUẨN PTC)
  // ==========================================================================
  const woodTotal = carcassWoodCost + frontsWoodCost + backWoodCost;
  const consumablesTotal = edgeCost + suppliesCost;

  const totalDirectLM =
    stoneCost +
    upholsteryCost +
    metalCost +
    subConAcrylicCost +
    woodTotal +
    0 + // metalFrameP
    glassCost +
    paintChemicalCost +
    hardwareCost +
    consumablesTotal +
    packingDeliveryCost +
    laborCostTotal;

  // OH Xưởng (áp cho nhóm làm tại xưởng: Gỗ + Sơn + Tiêu hao + Nhân công)
  const workshopBasis = woodTotal + paintChemicalCost + consumablesTotal + laborCostTotal;
  const ohWorkshopAmount = Math.round(workshopBasis * ohWorkshopRate);

  // OH Gia công ngoài (áp cho nhóm thầu phụ: Khung sắt + Bọc nệm + Acrylic + Kính)
  const subcontractBasis = metalCost + upholsteryCost + subConAcrylicCost + glassCost;
  const ohSubcontractAmount = Math.round(subcontractBasis * ohSubcontractRate);

  // Đá: 0% OH (no OH)
  const totalOH = ohWorkshopAmount + ohSubcontractAmount;
  const cogs = totalDirectLM + totalOH;
  const profitAmount = Math.round(cogs * profitRate);
  const calculateSalesPrice = cogs + profitAmount;

  // Bảng MOQ
  const moqPrices: Record<number, number> = {
    1: calculateSalesPrice,
    5: Math.round(calculateSalesPrice * 0.95),   // Giảm 5% cho 5 chiếc
    10: Math.round(calculateSalesPrice * 0.92),  // Giảm 8% cho 10 chiếc
    20: Math.round(calculateSalesPrice * 0.88),  // Giảm 12% cho 20 chiếc
  };

  const summary: CostSummary = {
    stone: stoneCost,
    upholstery: upholsteryCost,
    metalFrameS: metalCost,
    subContract: subConAcrylicCost,
    wood: woodTotal,
    metalFrameP: 0,
    glass: glassCost,
    chemical: paintChemicalCost,
    hardware: hardwareCost,
    consumables: consumablesTotal,
    packingDelivery: packingDeliveryCost,
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

  // ==========================================================================
  // THANG ĐO ĐỘ TIN CẬY (CONFIDENCE STARS: 1 - 5 SAO)
  // ==========================================================================
  const confidence = evaluateConfidence(q, summary);

  return {
    questionnaire: q,
    summary,
    materialsLabor,
    labourDepts,
    confidence,
    drivers: {
      boardAreaNetM2: Number((carcassAreaNetM2 + woodFrontsAreaM2).toFixed(2)),
      boardAreaGrossM2: Number(((carcassAreaNetM2 + woodFrontsAreaM2) * 1.15).toFixed(2)),
      sheetsCount,
      edgeLengthMd: edgeGrossMd,
      drawerCount,
      doorCount,
    },
  };
}

/**
 * Đánh giá điểm độ tin cậy 1–5 sao của báo giá vừa tính
 */
function evaluateConfidence(q: CostingQuestionnaire, s: CostSummary): ConfidenceRating {
  const reasons: string[] = [];
  let stars: 1 | 2 | 3 | 4 | 5 = 5;

  // 1. Kiểm tra đơn giá các nhóm được chọn Có
  if (q.materials.hasStone && s.stone === 0) {
    stars = 1;
    reasons.push("Có chọn Mặt đá nhưng chi phí đá đang bằng 0");
  }
  if (q.materials.hasGlass && s.glass === 0) {
    stars = 1;
    reasons.push("Có chọn Kính/Cánh kính nhưng chi phí kính đang bằng 0");
  }

  if (stars > 1) {
    // Nếu chọn ước nhanh
    if (q.calcMode === "quick") {
      stars = Math.min(stars, 3) as 1 | 2 | 3 | 4 | 5;
      reasons.push("Đang tính ở chế độ Ước nhanh (Costing Sheet ước tính)");
    }

    // Nếu để trống ngăn kéo hoặc cánh
    if (q.details?.drawerCount === undefined || q.details?.doorCount === undefined) {
      if (stars > 3) stars = 4;
      reasons.push("Số cánh hoặc ngăn kéo đang tự động nội suy theo tỷ lệ phủ bì");
    }

    // Kích thước phi tiêu chuẩn (vd tủ áo cao > 3m hoặc nhỏ bất thường)
    if (q.dimensions.heightMm > 3200 || q.dimensions.widthMm > 5000) {
      stars = Math.min(stars, 2) as 1 | 2 | 3 | 4 | 5;
      reasons.push("Kích thước công trình vượt khổ tiêu chuẩn (cần kiểm tra kết cấu chịu lực)");
    }
  }

  let label: ConfidenceRating["label"] = "Rất sát";
  let colorClass = "text-emerald-700 bg-emerald-50 border-emerald-200";
  let recommendation = "Có thể áp dụng ngay để chốt hợp đồng thương mại với khách hàng.";

  if (stars === 4) {
    label = "Sát";
    colorClass = "text-sky-700 bg-sky-50 border-sky-200";
    recommendation = "Độ chính xác cao; phù hợp để gửi báo giá chính thức cho khách.";
  } else if (stars === 3) {
    label = "Tham khảo";
    colorClass = "text-amber-700 bg-amber-50 border-amber-200";
    recommendation = "Phù hợp để báo giá sơ bộ; nên kiểm tra lại số ngăn kéo/phụ kiện trước khi ký.";
  } else if (stars === 2) {
    label = "Chỉ để định hướng";
    colorClass = "text-orange-700 bg-orange-50 border-orange-200";
    recommendation = "Nên kiểm tra lại định mức chi tiết hoặc cập nhật đơn giá vật tư.";
  } else if (stars === 1) {
    label = "Không tin cậy";
    colorClass = "text-rose-700 bg-rose-50 border-rose-200";
    recommendation = "Thiếu đơn giá cho vật liệu đã chọn — giá hiện tại chưa phản ánh đủ chi phí.";
  }

  return {
    stars,
    label,
    colorClass,
    reasons,
    recommendation,
  };
}
