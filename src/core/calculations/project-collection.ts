/**
 * MODUN QUẢN LÝ DỰ ÁN & BỘ SƯU TẬP ĐA SẢN PHẨM (MULTI-PRODUCT PROJECT & COLLECTION ENGINE)
 * Cho phép một dự án (như Căn hộ 2PN Vinhomes, Biệt thự, Showroom) hoặc Bộ sưu tập
 * chứa nhiều sản phẩm độc lập (Tủ áo, Tủ bếp, Kệ TV, Giường, Tủ giày...),
 * tính toán giá vốn riêng cho từng món và tổng hợp toàn diện (Rollup KPI & BOM).
 */

import type {
  CostingQuestionnaire,
  MaterialLaborRow,
  LabourDeptRow,
  GeneratedCostingResult,
} from "./parametric-types.ts";
import {
  LABOR_PROCESSES,
  DEFAULT_MOQ_TIERS,
  type MoqConfigTier,
} from "../data/exportFurnitureCatalog.ts";
import { generateCostingFromQuestionnaire } from "./parametric-generator.ts";
import type { MaterialItem } from "../types/index.ts";

export interface ProjectProductItem {
  id: string;
  name: string;
  room: string;
  tag?: string;
  customProfitMargin?: number;
  qty: number;
  unit: string;
  archetypeId: string;
  questionnaire: CostingQuestionnaire;
  bomOverrides: Record<
    string,
    {
      qty?: number;
      unitPrice?: number;
      wasteFactor?: number;
      name?: string;
      unit?: string;
      description?: string;
      isOverridden?: boolean;
      isDeleted?: boolean;
    }
  >;
  extraBOMRows: MaterialLaborRow[];
  laborHourlyRate: number;
  laborViewMode: "compact" | "detailed";
  laborProcessOverrides: Record<string, { hours?: number; rate?: number }>;
  moqConfigTiers: MoqConfigTier[];
  complexityMultiplier: number;
  hardwareTier: "standard" | "mid" | "luxury";
  glassFrame: "slim_16" | "standard_20";
  glassColor: "smoke" | "tea" | "ultra_clear";
  stoneGrade: "artificial_white" | "black_galaxy" | "quartz";
  stoneEdge: "bevel_45" | "round_r" | "flat";
  ledSensor: "door" | "wave";
}

export interface ProjectCollectionTotals {
  totalItems: number; // Tổng số lượng món (sum of qty)
  totalProductsCount: number; // Số chủng loại sản phẩm trong dự án
  totalDirectLM: number; // Tổng chi phí vật tư & nhân công trực tiếp (VNĐ)
  totalOH: number; // Tổng chi phí quản lý xưởng OH & thầu phụ (VNĐ)
  totalCOGS: number; // Tổng giá vốn cả dự án (VNĐ)
  totalQuote: number; // Tổng tiền báo khách cả dự án (VNĐ)
  totalProfit: number; // Tổng lợi nhuận mục tiêu dự tính (VNĐ)
  profitMarginPercent: number; // Biên lợi nhuận % gộp
  totalSheetsEstimated: number; // Tổng số tấm ván quy đổi ước tính
  items: {
    productId: string;
    productName: string;
    room: string;
    qty: number;
    unit: string;
    dimensionsText: string;
    unitCost: number;
    totalCost: number;
    unitPrice: number;
    totalPrice: number;
    sheets: number;
  }[];
}

/**
 * Định dạng tiền tệ VNĐ tiện ích
 */
export function formatVND(val: number): string {
  return (val || 0).toLocaleString("vi-VN") + " đ";
}

/**
 * Tạo một sản phẩm mặc định trong dự án
 */
export function createProjectProduct(params: {
  id?: string;
  name: string;
  room?: string;
  tag?: string;
  customProfitMargin?: number;
  archetypeId?: string;
  qty?: number;
  unit?: string;
  dimensions?: { widthMm: number; depthMm: number; heightMm: number };
  materials?: {
    coreCode?: string;
    surfaceCode?: string;
    backPanelCode?: string;
    hasStone?: boolean;
    stoneType?: string;
    hasGlass?: boolean;
    hasMetal?: boolean;
    hasUpholstery?: boolean;
    hasLed?: boolean;
  };
  details?: {
    drawerCount?: number;
    doorCount?: number;
    specialNotes?: string;
  };
}): ProjectProductItem {
  const id = params.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const widthMm = params.dimensions?.widthMm || 1800;
  const depthMm = params.dimensions?.depthMm || 600;
  const heightMm = params.dimensions?.heightMm || 2400;

  return {
    id,
    name: params.name,
    room: params.room || "Không gian chung",
    tag: params.tag,
    customProfitMargin: params.customProfitMargin,
    qty: Math.max(1, params.qty || 1),
    unit: params.unit || "Cái",
    archetypeId: params.archetypeId || "custom",
    questionnaire: {
      productType: (params.archetypeId?.includes("wardrobe")
        ? "wardrobe"
        : params.archetypeId?.includes("kitchen_base")
        ? "kitchen_base"
        : params.archetypeId?.includes("kitchen_upper")
        ? "kitchen_upper"
        : params.archetypeId?.includes("shoe")
        ? "shoe_cabinet"
        : params.archetypeId?.includes("vanity")
        ? "vanity"
        : params.archetypeId?.includes("tv")
        ? "tv_shelf"
        : "custom") as any,
      name: params.name,
      calcMode: "detail",
      dimensions: {
        widthMm,
        depthMm,
        heightMm,
        unit: "mm",
      },
      materials: {
        coreCode: params.materials?.coreCode || "MDF_17_CHONG_AM",
        surfaceCode: params.materials?.surfaceCode || "Melamine",
        backPanelCode: params.materials?.backPanelCode || "MDF_6_HAU",
        hasStone: !!params.materials?.hasStone,
        stoneType: params.materials?.stoneType || "vicostone",
        hasGlass: !!params.materials?.hasGlass,
        hasMetal: !!params.materials?.hasMetal,
        hasUpholstery: !!params.materials?.hasUpholstery,
        hasLed: !!params.materials?.hasLed,
      },
      details: {
        drawerCount: params.details?.drawerCount ?? 2,
        doorCount: params.details?.doorCount ?? 2,
        specialNotes: params.details?.specialNotes || "",
        moqTiers: [1, 5, 10, 20],
      },
    },
    bomOverrides: {},
    extraBOMRows: [],
    laborHourlyRate: 105_000,
    laborViewMode: "compact",
    laborProcessOverrides: {},
    moqConfigTiers: DEFAULT_MOQ_TIERS,
    complexityMultiplier: 1.0,
    hardwareTier: "standard",
    glassFrame: "slim_16",
    glassColor: "smoke",
    stoneGrade: "artificial_white",
    stoneEdge: "bevel_45",
    ledSensor: "door",
  };
}

/**
 * Nhân bản 1 sản phẩm có sẵn trong dự án (ví dụ: tạo tủ áo phòng ngủ 2 từ tủ áo Master)
 */
export function duplicateProjectProduct(
  source: ProjectProductItem,
  newName?: string,
  newRoom?: string
): ProjectProductItem {
  const newId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    ...JSON.parse(JSON.stringify(source)),
    id: newId,
    name: newName || `${source.name} (Bản sao)`,
    room: newRoom || source.room,
  };
}

/**
 * Tạo một sản phẩm mới hoàn toàn trống, không gò bó mẫu có sẵn
 */
export function createBlankProduct(params?: {
  id?: string;
  name?: string;
  tag?: string;
  room?: string;
  qty?: number;
  unit?: string;
  widthMm?: number;
  depthMm?: number;
  heightMm?: number;
  customProfitMargin?: number;
}): ProjectProductItem {
  return createProjectProduct({
    id: params?.id,
    name: params?.name || "Sản phẩm mới",
    room: params?.room || "Không gian chung",
    tag: params?.tag || "Sản phẩm",
    qty: params?.qty || 1,
    unit: params?.unit || "Cái",
    dimensions: {
      widthMm: params?.widthMm || 1200,
      depthMm: params?.depthMm || 600,
      heightMm: params?.heightMm || 750,
    },
    archetypeId: "custom",
    customProfitMargin: params?.customProfitMargin,
    details: {
      drawerCount: 0,
      doorCount: 0,
      specialNotes: "",
    },
  });
}

/**
 * Danh sách sản phẩm khởi tạo chuẩn mẫu cho Dự Án Căn Hộ 2PN Vinhomes
 */
export const DEFAULT_SAMPLE_PROJECT_PRODUCTS: ProjectProductItem[] = [
  createProjectProduct({
    id: "prod-vinhomes-01",
    name: "Tủ Áo Master Kịch Trần",
    room: "Phòng ngủ Master",
    archetypeId: "wardrobe_master",
    qty: 1,
    unit: "Cái",
    dimensions: { widthMm: 1800, depthMm: 600, heightMm: 2400 },
    materials: {
      coreCode: "MDF_17_CHONG_AM",
      surfaceCode: "Melamine",
      backPanelCode: "MDF_6_HAU",
      hasStone: false,
      hasGlass: false,
      hasMetal: false,
      hasUpholstery: false,
      hasLed: true,
    },
    details: {
      doorCount: 4,
      drawerCount: 2,
      specialNotes: "Tủ kịch trần 4 cánh mở, tay nắm âm, 2 hộc kéo ray bi 3 tầng",
    },
  }),
  createProjectProduct({
    id: "prod-vinhomes-02",
    name: "Tủ Giày Kịch Trần & Kệ Trang Trí",
    room: "Sảnh vào",
    archetypeId: "shoe_cabinet_tall",
    qty: 1,
    unit: "Cái",
    dimensions: { widthMm: 1200, depthMm: 350, heightMm: 2400 },
    materials: {
      coreCode: "MDF_17_CHONG_AM",
      surfaceCode: "Melamine",
      backPanelCode: "MDF_6_HAU",
      hasStone: false,
      hasGlass: false,
      hasMetal: false,
      hasUpholstery: false,
      hasLed: true,
    },
    details: {
      doorCount: 2,
      drawerCount: 1,
      specialNotes: "Hộc trống sảnh để giày dép đi trong nhà, hộc để chìa khóa có đèn LED cảm ứng",
    },
  }),
  createProjectProduct({
    id: "prod-vinhomes-03",
    name: "Hệ Tủ Bếp Dưới Chịu Ẩm",
    room: "Phòng bếp",
    archetypeId: "kitchen_base_l",
    qty: 1,
    unit: "Bộ",
    dimensions: { widthMm: 3000, depthMm: 600, heightMm: 850 },
    materials: {
      coreCode: "MDF_17_CHONG_AM",
      surfaceCode: "Melamine",
      backPanelCode: "MDF_6_HAU",
      hasStone: true,
      stoneType: "vicostone",
      hasGlass: false,
      hasMetal: false,
      hasUpholstery: false,
      hasLed: false,
    },
    details: {
      doorCount: 4,
      drawerCount: 3,
      specialNotes: "Khoang chậu rửa + khoang bếp nấu, ray trượt âm giảm chấn, mặt đá Vicostone bo mòi 45°",
    },
  }),
];

/**
 * Động cơ tính toán chi tiết giá vốn & giá bán cho MỘT sản phẩm cụ thể
 */
export function computeSingleProductCosting(
  prod: ProjectProductItem,
  materials: MaterialItem[],
  profitMargin: number,
  roundingStep: 0.5 | 1
): GeneratedCostingResult {
  // 1. Tính toán parametric costing cơ sở từ questionnaire
  const parametricCosting = generateCostingFromQuestionnaire(prod.questionnaire, materials, {
    profitRate: profitMargin >= 1 ? profitMargin - 1 : profitMargin,
    roundingStep,
  });

  const bomOverrides = prod.bomOverrides || {};
  const extraBOMRows = prod.extraBOMRows || [];
  const laborProcessOverrides = prod.laborProcessOverrides || {};
  const laborHourlyRate = prod.laborHourlyRate || 105_000;
  const complexityMultiplier = prod.complexityMultiplier || 1.0;
  const moqConfigTiers = prod.moqConfigTiers || DEFAULT_MOQ_TIERS;
  const questionnaire = prod.questionnaire;

  // Lập danh sách BOM hiệu dụng
  const baseRows = parametricCosting.materialsLabor || [];
  const mappedBaseRows = baseRows
    .filter((row) => !bomOverrides[row.id]?.isDeleted)
    .map((row) => {
      const ovr = bomOverrides[row.id];
      const qty = ovr?.qty !== undefined ? ovr.qty : row.qty;
      const unitPrice = ovr?.unitPrice !== undefined ? ovr.unitPrice : row.unitPrice;
      const wasteFactor = ovr?.wasteFactor !== undefined ? ovr.wasteFactor : row.wasteFactor;
      const name = ovr?.name || row.name;
      const unit = ovr?.unit || row.unit;
      const description = ovr?.description || row.description;
      const totalAmount = Math.round(qty * unitPrice * wasteFactor);
      const isOverridden = !!ovr?.isOverridden;

      return {
        ...row,
        name,
        unit,
        description,
        qty,
        unitPrice,
        wasteFactor,
        totalAmount,
        isOverridden,
        originalAutoValue: {
          qty: row.qty,
          unitPrice: row.unitPrice,
          wasteFactor: row.wasteFactor,
        },
      } as MaterialLaborRow & {
        isOverridden?: boolean;
        originalAutoValue?: { qty: number; unitPrice: number; wasteFactor: number };
      };
    });

  const allBOMRows = [...mappedBaseRows, ...extraBOMRows];

  // 2. Tính toán 37 công đoạn nhân công
  const w = (questionnaire.dimensions.widthMm || 1800) / 1000;
  const h = (questionnaire.dimensions.heightMm || 2400) / 1000;
  const sheets = Math.max(1, Math.ceil((w * h * 2.5 * 1.15) / 2.9768));
  const drawers = questionnaire.details?.drawerCount || 2;

  const computedLaborProcesses = LABOR_PROCESSES.map((proc) => {
    let defaultHours = 0;
    if (proc.code === "CNC" || proc.code === "CNC-MDF") {
      defaultHours = Number((sheets * 0.45 * complexityMultiplier).toFixed(1));
    } else if (proc.code === "ASSE" || proc.code === "SUB") {
      defaultHours = Number(((sheets * 0.75 + drawers * 0.4) * complexityMultiplier).toFixed(1));
    } else if (proc.code === "SAND") {
      defaultHours = complexityMultiplier > 1.0 ? 1.5 : 0.8;
    } else if (proc.code === "SPR") {
      defaultHours =
        questionnaire.materials.surfaceCode === "Veneer" ||
        questionnaire.materials.surfaceCode === "Sơn bệt 2K"
          ? 2.5
          : 0;
    } else if (proc.code === "PAK") {
      defaultHours = 1.0;
    } else if (proc.code === "FITTING") {
      defaultHours = Number((drawers * 0.2 + 0.5).toFixed(1));
    } else if (proc.code === "UPH" && questionnaire.materials.hasUpholstery) {
      defaultHours = 3.0;
    }

    const ovr = laborProcessOverrides[proc.code];
    const hours = ovr?.hours !== undefined ? ovr.hours : defaultHours;
    const rate = ovr?.rate !== undefined ? ovr.rate : laborHourlyRate;
    const totalAmount = Math.round(hours * rate);

    return {
      ...proc,
      hours,
      rate,
      totalAmount,
    };
  });

  const laborCostTotal = computedLaborProcesses.reduce((sum, p) => sum + p.totalAmount, 0);

  // Gom 5 phân xưởng
  const deptHours: Record<string, { name: string; hours: number; total: number }> = {
    carcass: { name: "Pha phôi, Cắt CNC & Dán nẹp", hours: 0, total: 0 },
    finishing: { name: "Chà nhám, Phun sơn lót & Phủ 2K", hours: 0, total: 0 },
    upholstery: { name: "Bọc nệm mút, May đo vải da", hours: 0, total: 0 },
    fitting: { name: "Lắp ráp phụ kiện, Đèn LED & Kính", hours: 0, total: 0 },
    packing: { name: "Đóng gói bọc PE & Lắp đặt công trình", hours: 0, total: 0 },
  };

  computedLaborProcesses.forEach((p) => {
    if (p.code === "CNC" || p.code === "CNC-MDF" || p.group === "RAW" || p.group === "MAC" || p.group === "MDF") {
      deptHours.carcass.hours += p.hours;
      deptHours.carcass.total += p.totalAmount;
    } else if (p.group === "SAS" || p.group === "SPD" || p.code === "SAND" || p.code === "SPR" || p.group === "CMF" || p.group === "FIN") {
      deptHours.finishing.hours += p.hours;
      deptHours.finishing.total += p.totalAmount;
    } else if (p.group === "UPH" || p.code === "LEA") {
      deptHours.upholstery.hours += p.hours;
      deptHours.upholstery.total += p.totalAmount;
    } else if (p.group === "ASSE" || p.group === "FTD" || p.code === "ASSE" || p.code === "FITTING" || p.group === "SUB" || p.group === "DED" || p.group === "DEG") {
      deptHours.fitting.hours += p.hours;
      deptHours.fitting.total += p.totalAmount;
    } else {
      deptHours.packing.hours += p.hours;
      deptHours.packing.total += p.totalAmount;
    }
  });

  const effectiveLabourDepts: LabourDeptRow[] = [
    {
      department: "cnc_cutting",
      name: deptHours.carcass.name,
      hours: Number(deptHours.carcass.hours.toFixed(1)),
      hourlyRate: laborHourlyRate,
      totalAmount: deptHours.carcass.total,
    },
    {
      department: "sanding_spray",
      name: deptHours.finishing.name,
      hours: Number(deptHours.finishing.hours.toFixed(1)),
      hourlyRate: laborHourlyRate,
      totalAmount: deptHours.finishing.total,
    },
    {
      department: "assembly",
      name: deptHours.fitting.name,
      hours: Number(deptHours.fitting.hours.toFixed(1)),
      hourlyRate: laborHourlyRate,
      totalAmount: deptHours.fitting.total,
    },
    {
      department: "packing_install",
      name: deptHours.packing.name,
      hours: Number(deptHours.packing.hours.toFixed(1)),
      hourlyRate: laborHourlyRate,
      totalAmount: deptHours.packing.total,
    },
  ];

  // 3. Gom 12 nhóm chi phí
  let stoneSum = 0;
  let uphSum = 0;
  let metalFrameSSum = 0;
  let subContractSum = 0;
  let woodSum = 0;
  let metalFramePSum = 0;
  let glassSum = 0;
  let chemicalSum = 0;
  let hardwareSum = 0;
  let consumablesSum = 0;
  let packingSum = 0;

  allBOMRows.forEach((row) => {
    const b = (row.block || "").toLowerCase();
    if (b.includes("stone")) stoneSum += row.totalAmount;
    else if (b.includes("upholstery")) uphSum += row.totalAmount;
    else if (b.includes("metal")) metalFrameSSum += row.totalAmount;
    else if (b.includes("subcon") || b.includes("acrylic")) subContractSum += row.totalAmount;
    else if (b.includes("wood") || b.includes("carcass") || b.includes("fronts") || b.includes("backpanel")) woodSum += row.totalAmount;
    else if (b.includes("glass")) glassSum += row.totalAmount;
    else if (b.includes("chemical") || b.includes("paint")) chemicalSum += row.totalAmount;
    else if (b.includes("hardware") || b.includes("hinge") || b.includes("slide") || b.includes("led")) hardwareSum += row.totalAmount;
    else if (b.includes("consumable") || b.includes("edge") || b.includes("supplies")) consumablesSum += row.totalAmount;
    else if (b.includes("packing") || b.includes("delivery")) packingSum += row.totalAmount;
    else woodSum += row.totalAmount;
  });

  const totalDirectLM =
    stoneSum +
    uphSum +
    metalFrameSSum +
    subContractSum +
    woodSum +
    metalFramePSum +
    glassSum +
    chemicalSum +
    hardwareSum +
    consumablesSum +
    packingSum +
    laborCostTotal;

  const workshopBasis = woodSum + chemicalSum + consumablesSum + hardwareSum + packingSum + laborCostTotal;
  const ohWorkshopRate = parametricCosting.summary.ohWorkshopRate || 0.25;
  const ohWorkshopAmount = Math.round(workshopBasis * ohWorkshopRate);

  const subcontractBasis = metalFrameSSum + uphSum + subContractSum + glassSum;
  const ohSubcontractRate = parametricCosting.summary.ohSubcontractRate || 0.10;
  const ohSubcontractAmount = Math.round(subcontractBasis * ohSubcontractRate);

  const totalOH = ohWorkshopAmount + ohSubcontractAmount;
  const cogs = totalDirectLM + totalOH;
  const effectiveMargin =
    prod.customProfitMargin !== undefined && prod.customProfitMargin > 0
      ? prod.customProfitMargin
      : profitMargin;
  const effectiveProfitRate = effectiveMargin >= 1 ? effectiveMargin - 1 : effectiveMargin;
  const profitAmount = Math.round(cogs * effectiveProfitRate);
  const calculateSalesPrice = cogs + profitAmount;

  const estLevel = questionnaire.estimationLevel || 2;
  const contingencyRate = estLevel === 1 ? 0.10 : estLevel === 4 ? 0.0 : 0.05;
  const contingencyAmount = Math.round(calculateSalesPrice * contingencyRate);
  const recommendedPrice = calculateSalesPrice + contingencyAmount;

  const moqPrices: Record<number, number> = {};
  moqConfigTiers.forEach((tier) => {
    const baseForSurcharge = Math.max(0, calculateSalesPrice - stoneSum);
    const unitPrice = Math.round(baseForSurcharge * (1 + (tier.surchargePercent || 0) / 100) + stoneSum);
    moqPrices[tier.moq] = unitPrice;
  });

  return {
    ...parametricCosting,
    materialsLabor: allBOMRows,
    labourDepts: effectiveLabourDepts,
    contingencyRate,
    contingencyAmount,
    priceRange: {
      min: Math.round(recommendedPrice * 0.9),
      max: Math.round(recommendedPrice * 1.15),
      formatted: `${formatVND(Math.round(recommendedPrice * 0.9))} ~ ${formatVND(Math.round(recommendedPrice * 1.15))}`,
    },
    summary: {
      ...parametricCosting.summary,
      stone: stoneSum,
      upholstery: uphSum,
      metalFrameS: metalFrameSSum,
      subContract: subContractSum,
      wood: woodSum,
      metalFrameP: metalFramePSum,
      glass: glassSum,
      chemical: chemicalSum,
      hardware: hardwareSum,
      consumables: consumablesSum,
      packingDelivery: packingSum,
      laborCostTotal,
      totalDirectLM,
      ohWorkshopAmount,
      ohSubcontractAmount,
      totalOH,
      cogs,
      profitAmount,
      calculateSalesPrice,
      moqPrices,
    },
  };
}

/**
 * Tính toán tổng hợp KPI toàn bộ dự án / bộ sưu tập
 */
export function calculateProjectCollectionTotals(
  products: ProjectProductItem[],
  productCostings: Record<string, GeneratedCostingResult>
): ProjectCollectionTotals {
  let totalItems = 0;
  let totalDirectLM = 0;
  let totalOH = 0;
  let totalCOGS = 0;
  let totalQuote = 0;
  let totalSheetsEstimated = 0;

  const items = products.map((prod) => {
    const qty = Math.max(1, prod.qty || 1);
    const costing = productCostings[prod.id];
    const unitCost = costing?.summary?.cogs || 0;
    const unitPrice = costing?.summary?.calculateSalesPrice || 0;
    const directLM = costing?.summary?.totalDirectLM || 0;
    const oh = costing?.summary?.totalOH || 0;

    const w = (prod.questionnaire.dimensions.widthMm || 1800) / 1000;
    const h = (prod.questionnaire.dimensions.heightMm || 2400) / 1000;
    const productSheets = Math.max(1, Math.ceil((w * h * 2.5 * 1.15) / 2.9768));

    totalItems += qty;
    totalDirectLM += directLM * qty;
    totalOH += oh * qty;
    totalCOGS += unitCost * qty;
    totalQuote += unitPrice * qty;
    totalSheetsEstimated += productSheets * qty;

    const dimensionsText = `${prod.questionnaire.dimensions.widthMm} × ${prod.questionnaire.dimensions.depthMm} × ${prod.questionnaire.dimensions.heightMm} mm`;

    return {
      productId: prod.id,
      productName: prod.name,
      room: prod.room,
      qty,
      unit: prod.unit,
      dimensionsText,
      unitCost,
      totalCost: unitCost * qty,
      unitPrice,
      totalPrice: unitPrice * qty,
      sheets: productSheets * qty,
    };
  });

  const totalProfit = Math.max(0, totalQuote - totalCOGS);
  const profitMarginPercent = totalQuote > 0 ? Number(((totalProfit / totalQuote) * 100).toFixed(1)) : 0;

  return {
    totalItems,
    totalProductsCount: products.length,
    totalDirectLM,
    totalOH,
    totalCOGS,
    totalQuote,
    totalProfit,
    profitMarginPercent,
    totalSheetsEstimated,
    items,
  };
}

/**
 * Gom và cuộn (Roll-up) toàn bộ vật tư của tất cả sản phẩm trong dự án để xuất đặt hàng xưởng
 */
export function generateProjectRolledUpBOM(
  products: ProjectProductItem[],
  productCostings: Record<string, GeneratedCostingResult>
): MaterialLaborRow[] {
  const rolledUpMap = new Map<string, MaterialLaborRow>();

  products.forEach((prod) => {
    const qtyMultiplier = Math.max(1, prod.qty || 1);
    const costing = productCostings[prod.id];
    const rows = costing?.materialsLabor || [];

    rows.forEach((row) => {
      // Key gom nhóm dựa trên Tên vật tư + ĐVT + Khối
      const groupKey = `${row.block}__${row.name}__${row.unit}`.toLowerCase();
      const existing = rolledUpMap.get(groupKey);

      if (existing) {
        existing.qty += Number((row.qty * qtyMultiplier).toFixed(2));
        existing.totalAmount += Math.round(row.totalAmount * qtyMultiplier);
      } else {
        rolledUpMap.set(groupKey, {
          ...row,
          id: `rollup_${groupKey}`,
          qty: Number((row.qty * qtyMultiplier).toFixed(2)),
          totalAmount: Math.round(row.totalAmount * qtyMultiplier),
          description: `Gom từ các hạng mục: ${prod.name}`,
        });
      }
    });
  });

  return Array.from(rolledUpMap.values());
}
