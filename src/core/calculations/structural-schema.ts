/**
 * UNIVERSAL COMPOSABLE STRUCTURAL SCHEMA
 * Mô hình dữ liệu Lắp ghép Kết cấu Vật lý Tổng quát cho MỌI dòng sản phẩm nội / ngoại thất.
 * Tuân thủ đặc tả audit_va_runbook_cai_tien_bao_gia_da_san_pham.md
 */

import type { CostingQuestionnaire, ProductArchetype } from "./parametric-types.ts";

export type StructuralBlockId =
  | "B1_PANEL_BOX"        // Thùng hộp, vách phẳng, đợt kệ, cánh mở/lùa
  | "B2_FRAME_SKELETON"   // Khung xương gỗ thịt, ván định hình khung, khung sắt/inox/nhôm
  | "B3_SURFACE_SLAB"     // Mặt đá, mặt kính, mặt gỗ nguyên tấm, tấm ốp trang trí
  | "B4_VOLUME_CUSHION"   // Đệm mút, hệ lò xo/đai thun, bọc da/vải/nỉ/mây
  | "B5_SURFACE_FINISH"   // Sơn PU, sơn 2K, lau dầu, sơn tĩnh điện, mạ PVD
  | "B6_HARDWARE_ELECTRO";// Phụ kiện kim khí, liên kết, đèn LED & nguồn

export type CompletionScope =
  | "FULL_TURNKEY"        // Xưởng cấp đủ vật tư & hoàn thiện 100%
  | "SEMI_FINISHED"       // Bán thành phẩm (Finish to Foam / Phôi mộc chưa sơn / Khung thô)
  | "CLIENT_MATERIAL_COM";// Khách cấp vật tư chính (COM), xưởng tính phụ liệu + nhân công

export type ExecutionSource =
  | "IN_HOUSE"            // Sản xuất tại xưởng (chịu OH Xưởng: 25% - 35%)
  | "SUBCONTRACT"         // Thuê gia công ngoài (chịu OH Thầu phụ: 10%)
  | "PASS_THROUGH";       // Mua đứt thương mại (0% OH)

export interface MaterialAllocationRow {
  id: string;
  materialCode: string;          // Mã vật tư từ thư viện xưởng hoặc catalog
  materialName: string;
  category: "BOARD" | "TIMBER_M3" | "METAL_LEN" | "STONE_M2" | "GLASS_M2" | "FOAM_M3" | "FABRIC_MD" | "FINISH_M2" | "HARDWARE_UNIT" | "CONSUMABLE";
  unit: "sheet" | "m2" | "m3" | "md" | "kg" | "unit" | "set";
  unitPriceVnd: number;
  baseWasteFactor: number;       // Hao hụt ở mốc chuẩn (tự động co giãn theo SL)
  allocationRatio: number;       // Tỷ trọng trong khối (VD: 0.6 cho ván khung, 0.4 cho gỗ thanh)
  thicknessOrSpecMm?: number;    // Độ dày ván/mút hoặc tiết diện thanh
  isExposedFinish?: boolean;     // Có cần sơn/hoàn thiện bề mặt lộ thiên không
}

export interface PanelBoxConfig {
  geometryMode: "SINGLE_PANEL_FACE" | "OPEN_SHELF_BOX" | "CLOSED_CABINET_BOX" | "BASE_NO_TOP";
  hasBackPanel: boolean;
  verticalDividers: number;
  horizontalShelves: number;
  swingDoors: number;            // Quyết định trực tiếp số bản lề
  slidingDoors: number;          // Quyết định trực tiếp bộ ray lùa
  drawers: number;               // Quyết định trực tiếp số bộ ray kéo
  edgeBandingRule: "ALL_EXPOSED_EDGES" | "FRONT_ONLY" | "MITER_45_NO_EDGE" | "NONE";
  materials: MaterialAllocationRow[];
  scope: CompletionScope;
  executionSource: ExecutionSource;
}

export interface FrameSkeletonConfig {
  geometryMode: "PERIMETER_4_LEGS" | "SPACE_FRAME_3D" | "RIBBED_STRUCTURAL_BOX";
  ribSpacingMm: 300 | 400 | 500 | 0; // 0 nếu không có đố giằng phụ
  formingBoardCoverageRatio: number; // 0 -> 1.0 (Tỷ lệ ván Plywood định hình khung)
  materials: MaterialAllocationRow[]; // Hỗ trợ đa vật liệu: Plywood + Beech + Poplar + Sắt...
  scope: CompletionScope;
  executionSource: ExecutionSource;
}

export interface SurfaceSlabConfig {
  geometryMode: "TOP_HORIZONTAL" | "FRONT_VERTICAL" | "WATERFALL_3_SIDES" | "CUSTOM_AREA";
  edgeProfile: "FLAT_POLISH" | "MITER_45_THICK" | "BULLNOSE_CNC";
  customAreaRatio?: number;
  materials: MaterialAllocationRow[];
  scope: CompletionScope;
  executionSource: ExecutionSource;
}

export interface VolumeCushionConfig {
  geometryMode: "FLAT_PAD_1D" | "L_SHAPE_SEAT_BACK" | "FULL_WRAP_360" | "SCULPTED_PLUMP_3D";
  foamFillRatioOrThickness: number;  // Độ dày m (nếu phẳng) hoặc tỷ lệ thể tích 0.20-0.55 (nếu khối 3D)
  suspensionSystem: "NONE" | "WEBBING_STRAP" | "SINUOUS_SPRING_WEBBING" | "POCKET_SPRING";
  seamAndDetailStyle: "PLAIN_SEAM" | "PIPING_WELT" | "DEEP_TUFTING";
  dacronWrapGram: 0 | 200 | 300;
  foamMaterials: MaterialAllocationRow[];  // Tách riêng lớp Mút (luôn tính khi bật B4)
  coverMaterials: MaterialAllocationRow[]; // Tách riêng lớp Vỏ bọc (ẩn tiền vải khi scope === 'SEMI_FINISHED' / Finish to Foam)
  scope: CompletionScope;
  executionSource: ExecutionSource;
}

export interface SurfaceFinishConfig {
  finishType: "NONE_RAW" | "MELAMINE_PRELAM" | "PU_WOOD_COATING" | "PAINT_2K" | "POWDER_COAT_METAL" | "PVD_PLATING";
  coverageMultiplier: number;  // 1.0 cho 1 mặt, 2.0 cho 2 mặt
  materials: MaterialAllocationRow[];
  executionSource: ExecutionSource;
}

export interface HardwareElectroConfig {
  hardwareTier: "STANDARD_DTC" | "MID_HAFELE" | "PREMIUM_BLUM";
  hasLedSystem: boolean;
  ledMetersCount?: number;
  customDiscreteItems: Array<{
    name: string;
    qtyPerProduct: number;
    unitPriceVnd: number;
  }>;
  executionSource: ExecutionSource;
}

export interface LogisticsConfig {
  mode: "AUTO_BY_QUANTITY" | "LOCAL_TRUCK_TRIP" | "INDUSTRIAL_CBM_PACKING";
  truckTripPriceVnd: number;   // Mặc định 450000
  truckCapacityCbm: number;    // Mặc định 8.0 m3
  cartonAndPePricePerCbmVnd: number; // Mặc định 95000 đ/CBM
}

export interface UniversalProductStructure {
  productName: string;
  tag?: string;
  room?: string;
  dimensionsMm: { width: number; depth: number; height: number };
  orderQuantity: number;         // Đồng bộ 2 chiều giữa Mục 1 và Tab MOQ
  targetMarginPercent: number;   // Lợi nhuận mục tiêu (VD: 35% hoặc 65% markup)
  currencyConfig: {
    displayMode: "VND_ONLY" | "USD_AND_VND";
    usdExchangeRate: number;     // Mặc định 25000
  };
  enabledBlocks: StructuralBlockId[];

  // Cấu hình chi tiết từng khối
  panelBoxConfig?: PanelBoxConfig;
  frameSkeletonConfig?: FrameSkeletonConfig;
  surfaceSlabConfig?: SurfaceSlabConfig;
  volumeCushionConfig?: VolumeCushionConfig;
  surfaceFinishConfig?: SurfaceFinishConfig;
  hardwareElectroConfig?: HardwareElectroConfig;
  logisticsConfig: LogisticsConfig;
}

/**
 * Danh mục nhãn và icon mô tả 6 Khối cấu tạo vật lý
 */
export const STRUCTURAL_BLOCK_DEFINITIONS: Record<
  StructuralBlockId,
  {
    name: string;
    shortDesc: string;
    unitText: string;
    typicalItems: string;
  }
> = {
  B1_PANEL_BOX: {
    name: "Thùng hộp, Vách tấm & Cánh",
    shortDesc: "Ván phẳng công nghiệp, chu vi dán cạnh PVC, cánh mở, hộc kéo",
    unitText: "m² / tấm ván tiêu chuẩn",
    typicalItems: "Tủ áo, tủ bếp, kệ tivi, vách ngăn phẳng, hộc tủ",
  },
  B2_FRAME_SKELETON: {
    name: "Khung xương, Chân đỡ & Thanh giằng",
    shortDesc: "Gỗ thịt phôi thanh, ván định hình khung, khung sắt/inox",
    unitText: "m³ gỗ phôi / md thanh / m² ván khung",
    typicalItems: "Khung sofa, chân bàn ghế, khung sắt kệ, khung giường",
  },
  B3_SURFACE_SLAB: {
    name: "Mặt phẳng, Ốp bề mặt & Kính/Đá",
    shortDesc: "Đá Vicostone/Granite, kính cường lực, mặt gỗ tấm nguyên khối",
    unitText: "m² mặt tiếp xúc + md viền mài",
    typicalItems: "Mặt bàn đá, mặt bếp, vách thác đổ, cánh kính khung slim",
  },
  B4_VOLUME_CUSHION: {
    name: "Khối Đệm mút, Đàn hồi & Bọc phủ",
    shortDesc: "Khối mút D40/D25, lò xo/đai thun đáy, bọc da microfiber/vải/mây",
    unitText: "m³ mút + md vải khổ 1.4m + md may",
    typicalItems: "Đệm ghế ăn, sofa khối, đầu giường bọc da, nệm rời",
  },
  B5_SURFACE_FINISH: {
    name: "Hoàn thiện Sơn, Phủ & Xử lý bề mặt",
    shortDesc: "Sơn PU 5 lớp, sơn 2K men mờ, lau dầu dưỡng gỗ, sơn tĩnh điện",
    unitText: "m² diện tích bề mặt lộ thiên",
    typicalItems: "Gỗ tự nhiên sơn PU, cánh sơn 2K, khung sắt sơn tĩnh điện",
  },
  B6_HARDWARE_ELECTRO: {
    name: "Phụ kiện Cơ khí, Liên kết & Đèn/Điện",
    shortDesc: "Bản lề giảm chấn, ray âm, tay nắm, đai thun, LED âm tủ",
    unitText: "Cái / bộ / md LED",
    typicalItems: "Bản lề, ray bi, đèn LED cảm ứng, chân tăng chỉnh",
  },
};

/**
 * Khởi tạo cấu trúc tổng quát mặc định cho một sản phẩm mới
 */
export function createDefaultUniversalStructure(params?: {
  productName?: string;
  tag?: string;
  room?: string;
  widthMm?: number;
  depthMm?: number;
  heightMm?: number;
  orderQuantity?: number;
  targetMarginPercent?: number;
  enabledBlocks?: StructuralBlockId[];
}): UniversalProductStructure {
  const width = params?.widthMm || 1200;
  const depth = params?.depthMm || 600;
  const height = params?.heightMm || 750;
  const orderQuantity = Math.max(1, params?.orderQuantity || 1);
  const enabledBlocks = params?.enabledBlocks || ["B1_PANEL_BOX", "B6_HARDWARE_ELECTRO"];

  return {
    productName: params?.productName || "Sản phẩm mới",
    tag: params?.tag || "Nội thất",
    room: params?.room || "Không gian chung",
    dimensionsMm: { width, depth, height },
    orderQuantity,
    targetMarginPercent: params?.targetMarginPercent || 35,
    currencyConfig: {
      displayMode: "VND_ONLY",
      usdExchangeRate: 25000,
    },
    enabledBlocks,

    panelBoxConfig: {
      geometryMode: "CLOSED_CABINET_BOX",
      hasBackPanel: true,
      verticalDividers: 1,
      horizontalShelves: 2,
      swingDoors: 2,
      slidingDoors: 0,
      drawers: 2,
      edgeBandingRule: "ALL_EXPOSED_EDGES",
      materials: [
        {
          id: "mat_board_default",
          materialCode: "MDF_17_CHONG_AM",
          materialName: "Ván MDF chống ẩm 17mm",
          category: "BOARD",
          unit: "sheet",
          unitPriceVnd: 780000,
          baseWasteFactor: 1.15,
          allocationRatio: 1.0,
          thicknessOrSpecMm: 17,
          isExposedFinish: false,
        },
      ],
      scope: "FULL_TURNKEY",
      executionSource: "IN_HOUSE",
    },

    frameSkeletonConfig: {
      geometryMode: "PERIMETER_4_LEGS",
      ribSpacingMm: 400,
      formingBoardCoverageRatio: 0.5,
      materials: [
        {
          id: "mat_timber_default",
          materialCode: "TIMBER_ASH_OAK",
          materialName: "Gỗ Sồi / Ash xẻ sấy",
          category: "TIMBER_M3",
          unit: "m3",
          unitPriceVnd: 18500000,
          baseWasteFactor: 1.45,
          allocationRatio: 1.0,
          isExposedFinish: true,
        },
      ],
      scope: "FULL_TURNKEY",
      executionSource: "IN_HOUSE",
    },

    surfaceSlabConfig: {
      geometryMode: "TOP_HORIZONTAL",
      edgeProfile: "FLAT_POLISH",
      customAreaRatio: 1.0,
      materials: [
        {
          id: "mat_stone_default",
          materialCode: "VICOSTONE_QUARTZ",
          materialName: "Đá Vicostone thạch anh nhân tạo",
          category: "STONE_M2",
          unit: "m2",
          unitPriceVnd: 2200000,
          baseWasteFactor: 1.10,
          allocationRatio: 1.0,
          isExposedFinish: false,
        },
      ],
      scope: "FULL_TURNKEY",
      executionSource: "SUBCONTRACT",
    },

    volumeCushionConfig: {
      geometryMode: "L_SHAPE_SEAT_BACK",
      foamFillRatioOrThickness: 0.35,
      suspensionSystem: "WEBBING_STRAP",
      seamAndDetailStyle: "PLAIN_SEAM",
      dacronWrapGram: 200,
      foamMaterials: [
        {
          id: "mat_foam_d40",
          materialCode: "FOAM_D40_HIGH_RESILIENT",
          materialName: "Mút xốp D40 nguyên khối đàn hồi cao",
          category: "FOAM_M3",
          unit: "m3",
          unitPriceVnd: 3800000,
          baseWasteFactor: 1.12,
          allocationRatio: 1.0,
        },
      ],
      coverMaterials: [
        {
          id: "mat_fabric_microfiber",
          materialCode: "FABRIC_MICROFIBER_PREMIUM",
          materialName: "Vải da Microfiber cao cấp kháng trầy",
          category: "FABRIC_MD",
          unit: "md",
          unitPriceVnd: 280000,
          baseWasteFactor: 1.18,
          allocationRatio: 1.0,
        },
      ],
      scope: "FULL_TURNKEY",
      executionSource: "IN_HOUSE",
    },

    surfaceFinishConfig: {
      finishType: "PU_WOOD_COATING",
      coverageMultiplier: 1.0,
      materials: [
        {
          id: "mat_finish_pu",
          materialCode: "FINISH_PU_5_LAYERS",
          materialName: "Sơn PU 5 lớp cao cấp bóng mờ",
          category: "FINISH_M2",
          unit: "m2",
          unitPriceVnd: 280000,
          baseWasteFactor: 1.10,
          allocationRatio: 1.0,
        },
      ],
      executionSource: "IN_HOUSE",
    },

    hardwareElectroConfig: {
      hardwareTier: "STANDARD_DTC",
      hasLedSystem: false,
      ledMetersCount: 0,
      customDiscreteItems: [],
      executionSource: "PASS_THROUGH",
    },

    logisticsConfig: {
      mode: "AUTO_BY_QUANTITY",
      truckTripPriceVnd: 450000,
      truckCapacityCbm: 8.0,
      cartonAndPePricePerCbmVnd: 95000,
    },
  };
}

/**
 * Chuyển đổi hai chiều an toàn từ CostingQuestionnaire sang UniversalProductStructure
 */
export function adaptQuestionnaireToUniversalStructure(
  q: CostingQuestionnaire,
  orderQuantity: number = 1
): UniversalProductStructure {
  const width = q.dimensions?.widthMm || 1200;
  const depth = q.dimensions?.depthMm || 600;
  const height = q.dimensions?.heightMm || 750;

  const enabledBlocks: StructuralBlockId[] = [];

  // Xác định các khối cần bật dựa trên thông số questionnaire
  const isCustomOrNoBox = q.productType === "custom" && !q.name.toLowerCase().includes("tủ");
  const isTable = q.productType === "table" || q.name.toLowerCase().includes("bàn");
  const isBed = q.productType === "bed" || q.name.toLowerCase().includes("giường");

  if (!isCustomOrNoBox) {
    enabledBlocks.push("B1_PANEL_BOX");
  }

  if (isTable || isBed || q.materials?.hasMetal) {
    enabledBlocks.push("B2_FRAME_SKELETON");
  }

  if (q.materials?.hasStone || q.materials?.hasGlass) {
    enabledBlocks.push("B3_SURFACE_SLAB");
  }

  if (q.materials?.hasUpholstery) {
    enabledBlocks.push("B4_VOLUME_CUSHION");
  }

  if (q.materials?.surfaceCode?.toLowerCase().includes("son") || q.materials?.surfaceCode?.toLowerCase().includes("pu") || q.materials?.surfaceCode?.toLowerCase().includes("2k")) {
    enabledBlocks.push("B5_SURFACE_FINISH");
  }

  if (enabledBlocks.includes("B1_PANEL_BOX") || q.materials?.hasLed) {
    enabledBlocks.push("B6_HARDWARE_ELECTRO");
  }

  if (enabledBlocks.length === 0) {
    enabledBlocks.push("B2_FRAME_SKELETON");
  }

  const structure = createDefaultUniversalStructure({
    productName: q.name || "Sản phẩm",
    widthMm: width,
    depthMm: depth,
    heightMm: height,
    orderQuantity,
    enabledBlocks,
  });

  if (structure.panelBoxConfig) {
    structure.panelBoxConfig.drawers = q.details?.drawerCount ?? 0;
    structure.panelBoxConfig.swingDoors = q.details?.doorCount ?? 0;
  }

  return structure;
}
