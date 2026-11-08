"use client";

import { useState, useRef, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import * as XLSX from "xlsx";
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Plus, 
  Trash2, 
  Printer, 
  Save, 
  CheckCircle2, 
  Sliders, 
  FileText, 
  Boxes, 
  RefreshCw,
  Building2,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Info,
  Layers,
  Sparkles,
  AlertTriangle,
  Copy,
  ShieldCheck,
  Lock,
  BookOpen,
  LayoutGrid,
  ClipboardPaste,
  Filter,
  Search,
  X,
  RotateCcw,
  Eye,
  Table,
  Share2,
  User,
  Star,
  Check,
  AlertCircle,
  HelpCircle,
  Calculator,
  DoorClosed,
  CookingPot,
  Bed,
  Tv,
  Grid,
  Archive,
  Bath,
  Box,
  FlaskConical,
  Wrench,
} from "lucide-react";
import { useAppStore, SEED_PARTS } from "@/core/store/useAppStore";
import { useAuth } from "@/core/store/useAuth";
import AuthModal from "@/core/components/AuthModal";
import TechnicalHandbookModal from "@/core/components/TechnicalHandbookModal";
import PresetLibraryModal from "@/core/components/PresetLibraryModal";
import ShareQuoteModal from "@/core/components/ShareQuoteModal";
import { CutlistPart, MaterialItem, SavedProject, ProjectStatus, DEFAULT_WORKSHOP_COST_CONFIG } from "@/core/types";
import { calculateProject, LEGAL_DISCLAIMER } from "@/core/calculations/engine";
import {
  calculateMarkupPercent,
  calculateProfitMarginPercent,
  formatPercentVi,
  resolveProjectProfitMargin,
  DEFAULT_NEW_PROFIT_MARGIN,
} from "@/core/calculations/profit-calculator";
import { WORKSHOP_TERMS } from "@/core/constants/terms";
import HelpTooltip from "@/core/components/HelpTooltip";
import {
  exportWorkshopBOMExcel,
  exportStandardCutlistExcel,
  exportMaterialsTemplateExcel,
  exportCostingSheetExcel,
} from "@/core/exporters/excel-exporter";
import { generateCostingFromQuestionnaire } from "@/core/calculations/parametric-generator";
import type {
  CostingQuestionnaire,
  ProductArchetype,
  GeneratedCostingResult,
  MaterialLaborRow,
  LabourDeptRow,
  CostSummary,
  ConfidenceStars,
  AdhocCostLine,
  OverheadTier,
} from "@/core/calculations/parametric-types";
import {
  evaluateConfidence as evaluateConfidenceHelper,
  calculateVersionDiff,
  getConfidenceBadgeStyle,
} from "@/core/calculations/confidence-and-diff";
import {
  scaleFromTemplate,
  findSimilarItems,
  type SimilarProjectItem,
} from "@/core/calculations/template-scaler";
import { trackFunnelEvent } from "@/core/monitoring/telemetry";
import ProductArchetypeSelector from "@/core/components/ProductArchetypeSelector";
import { PRODUCT_ARCHETYPES_CATALOG, type ProductArchetypeItem } from "@/core/data/productArchetypesCatalog";
import MaterialCatalogDrawer from "@/core/components/MaterialCatalogDrawer";
import {
  SAMPLE_MATERIALS_CATALOG,
  LABOR_PROCESSES,
  DEFAULT_MOQ_TIERS,
  DEFAULT_EXPORT_CONSTANTS,
  type ExportMaterialItem,
  type LaborProcessDefinition,
  type MoqConfigTier,
} from "@/core/data/exportFurnitureCatalog";

function formatVND(val: number): string {
  return (val || 0).toLocaleString("vi-VN") + " đ";
}

function QuotingWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isDemoParam = searchParams.get("demo") === "true";

  const { profile, materials, projects, saveProject } = useAppStore();
  const { user, isAuthenticated } = useAuth();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTitle, setAuthModalTitle] = useState("");
  const [authModalDesc, setAuthModalDesc] = useState("");

  // ==========================================================================
  // TIẾN TRÌNH 3 BƯỚC & CHẾ ĐỘ NÂNG CAO (STEPPER & ADVANCED MODE)
  // ==========================================================================
  type QuotingStep = 1 | 2 | 3;
  const [currentStep, setCurrentStep] = useState<QuotingStep>(1);
  const [advancedMode, setAdvancedMode] = useState<boolean>(false);
  const [projectVersionNo, setProjectVersionNo] = useState<number>(1);
  const [parentProjectId, setParentProjectId] = useState<string | undefined>(undefined);

  // Đọc cấu hình Chế độ nâng cao từ localStorage trong useEffect (tránh lỗi hydration)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("autocutlist_advanced_mode");
      if (saved === "true") setAdvancedMode(true);
    }
  }, []);

  const toggleAdvancedMode = () => {
    const next = !advancedMode;
    setAdvancedMode(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("autocutlist_advanced_mode", String(next));
    }
  };

  const [projectName, setProjectName] = useState("Dự án căn hộ 2PN Vinhomes");
  const [clientName, setClientName] = useState("Anh Tuấn");
  const [clientPhone, setClientPhone] = useState("0988 123 456");
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>("draft");
  const [parts, setParts] = useState<CutlistPart[]>(SEED_PARTS);
  const [profitMargin, setProfitMargin] = useState<number>(DEFAULT_NEW_PROFIT_MARGIN);
  const [roundingStep, setRoundingStep] = useState<0.5 | 1>(0.5);
  const [activeOutputTab, setActiveOutputTab] = useState<"costing_sheet" | "bom" | "quote">("costing_sheet");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [showHandbookModal, setShowHandbookModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // ==========================================================================
  // COSTING V2: BẢNG CÂU HỎI THÔNG SỐ (PARAMETRIC QUESTIONNAIRE)
  // ==========================================================================
  const [questionnaire, setQuestionnaire] = useState<CostingQuestionnaire>({
    productType: "wardrobe",
    name: "Tủ áo Master kịch trần",
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
      specialNotes: "Cánh phẳng soi chỉ, bản lề giảm chấn Inox 304, ray âm",
      moqTiers: [1, 5, 10, 20],
    },
  });

  const [selectedArchetypeId, setSelectedArchetypeId] = useState<string>("wardrobe_master");

  const handleArchetypeSelect = (item: ProductArchetypeItem) => {
    setSelectedArchetypeId(item.id);

    let baseArchetype: ProductArchetype = "custom";
    if (item.id.includes("wardrobe")) baseArchetype = "wardrobe";
    else if (item.id.includes("kitchen_base")) baseArchetype = "kitchen_base";
    else if (item.id.includes("kitchen_upper")) baseArchetype = "kitchen_upper";
    else if (item.id.includes("bed")) baseArchetype = "bed";
    else if (item.id.includes("table") || item.id.includes("desk")) baseArchetype = "table";
    else if (item.id.includes("tv_shelf")) baseArchetype = "tv_shelf";
    else if (item.id.includes("shoe_cabinet")) baseArchetype = "shoe_cabinet";
    else if (item.id.includes("vanity")) baseArchetype = "vanity";
    else if (item.id.includes("wall_panel")) baseArchetype = "wall_panel";

    setQuestionnaire((prev) => ({
      ...prev,
      productType: baseArchetype,
      name: item.name,
      dimensions: {
        ...prev.dimensions,
        widthMm: item.defaultDimensions.widthMm,
        depthMm: item.defaultDimensions.depthMm,
        heightMm: item.defaultDimensions.heightMm,
      },
      materials: {
        ...prev.materials,
        coreCode: item.defaultCoreCode || prev.materials.coreCode,
        surfaceCode: item.defaultSurfaceCode || prev.materials.surfaceCode,
        hasStone: item.defaultFlags.hasStone,
        stoneType: item.defaultFlags.stoneType || prev.materials.stoneType,
        hasGlass: item.defaultFlags.hasGlass,
        hasMetal: item.defaultFlags.hasMetal,
        hasUpholstery: item.defaultFlags.hasUpholstery,
        hasLed: item.defaultFlags.hasLed,
      },
    }));
  };

  useEffect(() => {
    const archetypeParam = searchParams.get("archetype");
    const wParam = searchParams.get("w");
    const dParam = searchParams.get("d");
    const hParam = searchParams.get("h");

    if (archetypeParam) {
      const match = PRODUCT_ARCHETYPES_CATALOG.find(
        (p) => p.id === archetypeParam || p.id.includes(archetypeParam)
      );
      if (match) {
        handleArchetypeSelect(match);
      }
    }
    if (wParam || dParam || hParam) {
      setQuestionnaire((prev) => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          widthMm: wParam ? Number(wParam) : prev.dimensions.widthMm,
          depthMm: dParam ? Number(dParam) : prev.dimensions.depthMm,
          heightMm: hParam ? Number(hParam) : prev.dimensions.heightMm,
        },
      }));
    }
  }, [searchParams]);

  const [inputTab, setInputTab] = useState<"questionnaire" | "detailed_parts">("questionnaire");
  const [costingActiveTab, setCostingActiveTab] = useState<"summary" | "material_labor" | "labour" | "moq" | "similar">("summary");

  const [isCustomCore, setIsCustomCore] = useState(false);
  const [isCustomSurface, setIsCustomSurface] = useState(false);

  // Quản lý trạng thái xác nhận các Giả định kỹ thuật (Assumptions Checklist)
  const [confirmedAssumptions, setConfirmedAssumptions] = useState<Record<string, boolean>>({});

  const toggleAssumption = (itemText: string) => {
    setConfirmedAssumptions((prev) => ({
      ...prev,
      [itemText]: !prev[itemText],
    }));
  };

  const handleConfirmAllAssumptions = () => {
    const next: Record<string, boolean> = {};
    (parametricCosting.assumptions || []).forEach((a) => {
      next[a] = true;
    });
    setConfirmedAssumptions(next);
    showToast("Đã xác nhận toàn bộ giả định kỹ thuật của sản phẩm!", "success");
  };

  const workshopBoardMaterials = useMemo(() => {
    return (materials || []).filter((m) => m.category === "board");
  }, [materials]);

  // Open Schema: Quản lý các dòng chi phí / vật tư tự do (Ad-hoc Lines - Quy tắc #14)
  const [showAdhocForm, setShowAdhocForm] = useState(false);
  const [newAdhocLine, setNewAdhocLine] = useState<Partial<AdhocCostLine>>({
    blockName: "CustomStructure",
    costGroupKey: "custom_group",
    overheadTierOverride: "workshop_full",
    description: "",
    unit: "m2",
    quantityOrExpression: 1,
    unitPrice: 150000,
    wasteRate: 0.1,
    saveToLibrary: false,
  });

  const handleAddAdhocLine = () => {
    if (!newAdhocLine.description?.trim()) {
      showToast("Vui lòng nhập tên/mô tả dòng vật tư mở rộng!", "error");
      return;
    }
    const adhocItem: AdhocCostLine = {
      lineId: `adhoc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      blockName: newAdhocLine.blockName || "CustomStructure",
      costGroupKey: newAdhocLine.costGroupKey || "custom_group",
      overheadTierOverride: (newAdhocLine.overheadTierOverride as OverheadTier) || "workshop_full",
      description: newAdhocLine.description.trim(),
      unit: newAdhocLine.unit || "m2",
      quantityOrExpression: newAdhocLine.quantityOrExpression ?? 1,
      unitPrice: Number(newAdhocLine.unitPrice) || 0,
      wasteRate: Number(newAdhocLine.wasteRate) || 0,
      saveToLibrary: Boolean(newAdhocLine.saveToLibrary),
    };
    setQuestionnaire((prev) => ({
      ...prev,
      adhocLines: [...(prev.adhocLines || []), adhocItem],
    }));
    setNewAdhocLine({
      blockName: "CustomStructure",
      costGroupKey: "custom_group",
      overheadTierOverride: "workshop_full",
      description: "",
      unit: "m2",
      quantityOrExpression: 1,
      unitPrice: 150000,
      wasteRate: 0.1,
      saveToLibrary: false,
    });
    setShowAdhocForm(false);
    showToast(`Đã thêm dòng mở rộng: ${adhocItem.description}!`, "success");
  };

  const handleRemoveAdhocLine = (lineId: string) => {
    setQuestionnaire((prev) => ({
      ...prev,
      adhocLines: (prev.adhocLines || []).filter((l) => l.lineId !== lineId),
    }));
    showToast("Đã xóa dòng chi phí tự do!");
  };

  // ==========================================================================
  // SMART EDITABLE BOM & OVERRIDES (BUG-01, BUG-04)
  // ==========================================================================
  const [bomOverrides, setBomOverrides] = useState<
    Record<
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
    >
  >({});
  const [extraBOMRows, setExtraBOMRows] = useState<MaterialLaborRow[]>([]);
  const [catalogDrawerOpen, setCatalogDrawerOpen] = useState(false);
  const [pickingTargetRowId, setPickingTargetRowId] = useState<string | null>(null);

  // ==========================================================================
  // 37 LABOR PROCESSES @ 105.000 đ/h & DUAL VIEW (BUG-02)
  // ==========================================================================
  const [laborHourlyRate, setLaborHourlyRate] = useState<number>(105_000);
  const [laborViewMode, setLaborViewMode] = useState<"compact" | "detailed">("compact");
  const [laborProcessOverrides, setLaborProcessOverrides] = useState<
    Record<string, { hours?: number; rate?: number }>
  >({});

  // ==========================================================================
  // DYNAMIC MOQ TIERS (BUG-03)
  // ==========================================================================
  const [moqConfigTiers, setMoqConfigTiers] = useState<MoqConfigTier[]>(DEFAULT_MOQ_TIERS);

  // ==========================================================================
  // SUB-CONFIGURATORS & COMPLEXITY MULTIPLIER (P1)
  // ==========================================================================
  const [complexityMultiplier, setComplexityMultiplier] = useState<number>(1.0);
  const [hardwareTier, setHardwareTier] = useState<"standard" | "mid" | "luxury">("standard");
  const [glassFrame, setGlassFrame] = useState<"slim_16" | "standard_20">("slim_16");
  const [glassColor, setGlassColor] = useState<"smoke" | "tea" | "ultra_clear">("smoke");
  const [stoneGrade, setStoneGrade] = useState<"artificial_white" | "black_galaxy" | "quartz">("artificial_white");
  const [stoneEdge, setStoneEdge] = useState<"bevel_45" | "round_r" | "flat">("bevel_45");
  const [ledSensor, setLedSensor] = useState<"door" | "wave">("door");

  // Động cơ tính toán Costing V2 từ Bảng câu hỏi thông số
  const parametricCosting = useMemo<GeneratedCostingResult>(() => {
    return generateCostingFromQuestionnaire(questionnaire, materials, {
      profitRate: profitMargin >= 1 ? profitMargin - 1 : profitMargin,
      roundingStep,
    });
  }, [questionnaire, materials, profitMargin, roundingStep]);

  // ==========================================================================
  // ACTIVE COSTING: BỘ TÍNH TOÁN HIỆU DỤNG LIÊN THÔNG OVERRIDES (ACTIVE ENGINE)
  // ==========================================================================
  const activeCosting = useMemo<GeneratedCostingResult>(() => {
    // 1. Tính toán BOM hiệu dụng (Effective BOM Rows)
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

    // 2. Tính toán 37 công đoạn nhân công thực tế (Effective Labor Processes)
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
        defaultHours = questionnaire.materials.surfaceCode === "Veneer" || questionnaire.materials.surfaceCode === "Sơn bệt 2K" ? 2.5 : 0;
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

    // Gom 5 bộ phận chính cho chế độ Rút gọn
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

    // 3. Tính toán 12 nhóm chi phí theo phân loại chuẩn
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

    // Phân bổ OH
    const workshopBasis = woodSum + chemicalSum + consumablesSum + hardwareSum + packingSum + laborCostTotal;
    const ohWorkshopRate = parametricCosting.summary.ohWorkshopRate || 0.25;
    const ohWorkshopAmount = Math.round(workshopBasis * ohWorkshopRate);

    const subcontractBasis = metalFrameSSum + uphSum + subContractSum + glassSum;
    const ohSubcontractRate = parametricCosting.summary.ohSubcontractRate || 0.10;
    const ohSubcontractAmount = Math.round(subcontractBasis * ohSubcontractRate);

    const totalOH = ohWorkshopAmount + ohSubcontractAmount;
    const cogs = totalDirectLM + totalOH;
    const effectiveProfitRate = profitMargin >= 1 ? profitMargin - 1 : profitMargin;
    const profitAmount = Math.round(cogs * effectiveProfitRate);
    const calculateSalesPrice = cogs + profitAmount;

    // Dự phòng rủi ro theo Mức độ
    const estLevel = questionnaire.estimationLevel || 2;
    const contingencyRate = estLevel === 1 ? 0.10 : estLevel === 4 ? 0.0 : 0.05;
    const contingencyAmount = Math.round(calculateSalesPrice * contingencyRate);
    const recommendedPrice = calculateSalesPrice + contingencyAmount;

    // Bảng giá MOQ động
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
  }, [
    parametricCosting,
    bomOverrides,
    extraBOMRows,
    laborProcessOverrides,
    laborHourlyRate,
    complexityMultiplier,
    moqConfigTiers,
    profitMargin,
    questionnaire.dimensions,
    questionnaire.materials.surfaceCode,
    questionnaire.details?.drawerCount,
    questionnaire.estimationLevel,
  ]);

  // Handlers for BOM Smart Grid
  const handleUpdateBOMRow = (id: string, patch: Partial<MaterialLaborRow>) => {
    setBomOverrides((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...patch,
        isOverridden: true,
      },
    }));
  };

  const handleResetBOMRow = (id: string) => {
    setBomOverrides((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    showToast("Đã khôi phục dòng vật tư về mặc định theo công thức!", "info");
  };

  const handleDeleteBOMRow = (id: string) => {
    if (id.startsWith("extra_")) {
      setExtraBOMRows((prev) => prev.filter((r) => r.id !== id));
    } else {
      setBomOverrides((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          isDeleted: true,
        },
      }));
    }
    showToast("Đã xóa dòng vật tư!", "info");
  };

  const handleDuplicateBOMRow = (row: MaterialLaborRow) => {
    const duplicated: MaterialLaborRow = {
      ...row,
      id: `extra_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: `${row.name} (Bản sao)`,
    };
    setExtraBOMRows((prev) => [...prev, duplicated]);
    showToast(`Đã nhân bản dòng ${row.name}!`, "success");
  };

  const handleSelectMaterialFromCatalog = (mat: ExportMaterialItem) => {
    if (pickingTargetRowId && pickingTargetRowId !== "NEW_ROW") {
      handleUpdateBOMRow(pickingTargetRowId, {
        name: mat.name,
        unit: mat.unit,
        unitPrice: mat.priceVND,
        wasteFactor: 1 + (mat.waste || 0),
        description: `Mã VT: ${mat.rmCode || "N/A"} • ${mat.category}${mat.subCategory ? ` / ${mat.subCategory}` : ""}`,
      });
      showToast(`Đã áp dụng vật tư: ${mat.name}!`, "success");
    } else {
      const newRow: MaterialLaborRow = {
        id: `extra_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        block: mat.category === "WOOD" || mat.category === "BOARD" || mat.category === "PLYWOOD" ? "Wood" : mat.category === "STONE" ? "Stone" : mat.category === "HARDWARE" ? "Hardware" : "Consumables",
        name: mat.name,
        description: `Mã VT: ${mat.rmCode || "N/A"} • ${mat.category}`,
        qty: 1,
        unit: mat.unit,
        unitPrice: mat.priceVND,
        wasteFactor: 1 + (mat.waste || 0),
        totalAmount: Math.round(1 * mat.priceVND * (1 + (mat.waste || 0))),
      };
      setExtraBOMRows((prev) => [...prev, newRow]);
      showToast(`Đã chèn vật tư mới: ${mat.name}!`, "success");
    }
    setPickingTargetRowId(null);
  };

  // Handlers for MOQ Tiers
  const handleAddMoqTier = () => {
    const nextMoq = (moqConfigTiers[moqConfigTiers.length - 1]?.moq || 20) + 10;
    setMoqConfigTiers((prev) => [
      ...prev,
      { moq: nextMoq, surchargePercent: 0 },
    ]);
  };

  const handleUpdateMoqTier = (index: number, patch: Partial<MoqConfigTier>) => {
    setMoqConfigTiers((prev) =>
      prev.map((t, idx) => (idx === index ? { ...t, ...patch } : t))
    );
  };

  const handleDeleteMoqTier = (index: number) => {
    if (moqConfigTiers.length <= 1) {
      showToast("Cần giữ ít nhất 1 bậc MOQ!", "error");
      return;
    }
    setMoqConfigTiers((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Handlers for 37 Labor Processes
  const handleUpdateLaborProcess = (code: string, patch: { hours?: number; rate?: number }) => {
    setLaborProcessOverrides((prev) => ({
      ...prev,
      [code]: {
        ...prev[code],
        ...patch,
      },
    }));
  };

  // Danh sách sản phẩm tương tự từ lịch sử dự án
  const similarHistoryItems: SimilarProjectItem[] = useMemo(() => {
    return projects
      .filter((p) => p.id !== editId && p.items && p.items.length > 0)
      .map((p) => ({
        id: p.id,
        projectCode: `QOT-${p.id.slice(0, 6).toUpperCase()}`,
        projectName: p.projectName,
        productName: p.projectName,
        archetype: questionnaire.productType,
        dimensions: {
          widthMm: 1800,
          depthMm: 600,
          heightMm: 2400,
        },
        totalLM: p.totalCost || 0,
        totalCost: p.totalCost || 0,
        createdAt: p.createdAt,
      }));
  }, [projects, editId, questionnaire.productType]);

  const similarItems = useMemo(() => {
    return findSimilarItems(
      questionnaire.productType,
      questionnaire.dimensions.widthMm,
      questionnaire.dimensions.depthMm,
      questionnaire.dimensions.heightMm,
      similarHistoryItems,
      5
    );
  }, [questionnaire, similarHistoryItems]);

  // Hành động dựng từ mẫu lịch sử
  const handleBuildFromTemplate = (template: SimilarProjectItem) => {
    try {
      scaleFromTemplate(template, questionnaire);
      showToast(`Đã dựng thành công từ mẫu ${template.projectCode} (${template.productName})!`);
      setCurrentStep(2);
    } catch (err: any) {
      showToast(err.message || "Lỗi dựng từ mẫu", "error");
    }
  };

  // Hành động tính toán từ questionnaire và chuyển sang Bước 2
  const handleCalculateFromQuestionnaire = () => {
    const generatedParts: CutlistPart[] = parametricCosting.materialsLabor
      .filter((m) => m.block === "Carcass" || m.block === "Fronts" || m.block === "BackPanel")
      .map((m, idx) => ({
        id: `ml_${idx}_${Date.now()}`,
        moduleName: questionnaire.name || "Hạng mục chính",
        partName: m.name,
        lengthMm: m.lengthMm || 800,
        widthMm: m.widthMm || 400,
        thicknessMm: m.thicknessMm || 17,
        qty: m.qty,
        materialCode: questionnaire.materials.coreCode || "MDF_17_CHONG_AM",
        edgeL1: true,
        edgeL2: true,
        edgeW1: false,
        edgeW2: false,
      }));

    if (generatedParts.length > 0) {
      setParts(generatedParts);
    }
    setCurrentStep(2);
    showToast("Đã phân tích chi phí và định mức thành công!", "success");
  };

  // Reset questionnaire parameters
  const handleResetQuestionnaire = () => {
    setQuestionnaire({
      productType: "wardrobe",
      name: "Tủ áo Master kịch trần",
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
        specialNotes: "Cánh phẳng soi chỉ, bản lề giảm chấn Inox 304, ray âm",
        moqTiers: [1, 5, 10, 20],
      },
    });
    showToast("Đã khôi phục thông số Bảng câu hỏi về mặc định chuẩn xưởng!");
  };

  // ==========================================================================
  // PHỄU LỌC CHI TIẾT TẤM (CUTLIST FILTER FUNNEL)
  // ==========================================================================
  const [showCutlistFilter, setShowCutlistFilter] = useState(false);
  const [cutlistSearch, setCutlistSearch] = useState("");
  const [cutlistModuleFilter, setCutlistModuleFilter] = useState("all");
  const [cutlistMaterialFilter, setCutlistMaterialFilter] = useState("all");
  const [cutlistThicknessFilter, setCutlistThicknessFilter] = useState("all");
  const [cutlistEdgeFilter, setCutlistEdgeFilter] = useState("all");
  const [cutlistSizeFilter, setCutlistSizeFilter] = useState("all");

  // Trích xuất các module/vật liệu/độ dày độc nhất để hiển thị trong phễu
  const uniqueModules = useMemo(() => {
    const set = new Set<string>();
    parts.forEach((p) => {
      if (p.moduleName && p.moduleName.trim()) set.add(p.moduleName.trim());
    });
    return Array.from(set);
  }, [parts]);

  const uniqueMaterials = useMemo(() => {
    const set = new Set<string>();
    parts.forEach((p) => {
      if (p.materialCode && p.materialCode.trim()) set.add(p.materialCode.trim());
    });
    return Array.from(set);
  }, [parts]);

  const uniqueThicknesses = useMemo(() => {
    const set = new Set<number>();
    parts.forEach((p) => {
      const thk = p.thicknessMm ?? p.thickness ?? 17;
      set.add(thk);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [parts]);

  // Bộ lọc phễu Cutlist
  const filteredParts = useMemo(() => {
    return parts.filter((p) => {
      // 1. Tìm kiếm từ khóa
      if (cutlistSearch.trim()) {
        const q = cutlistSearch.toLowerCase().trim();
        const matchSearch =
          p.partName.toLowerCase().includes(q) ||
          p.moduleName.toLowerCase().includes(q) ||
          p.materialCode.toLowerCase().includes(q);
        if (!matchSearch) return false;
      }

      // 2. Lọc theo Hạng mục (Module)
      if (cutlistModuleFilter !== "all" && p.moduleName !== cutlistModuleFilter) {
        return false;
      }

      // 3. Lọc theo Mã vật liệu
      if (cutlistMaterialFilter !== "all" && p.materialCode !== cutlistMaterialFilter) {
        return false;
      }

      // 4. Lọc theo Độ dày
      if (cutlistThicknessFilter !== "all") {
        const thk = p.thicknessMm ?? p.thickness ?? 17;
        if (thk !== Number(cutlistThicknessFilter)) return false;
      }

      // 5. Lọc theo Quy cách dán chỉ
      if (cutlistEdgeFilter !== "all") {
        const totalEdges = (p.edgeL1 ? 1 : 0) + (p.edgeL2 ? 1 : 0) + (p.edgeW1 ? 1 : 0) + (p.edgeW2 ? 1 : 0);
        if (cutlistEdgeFilter === "has_edge" && totalEdges === 0) return false;
        if (cutlistEdgeFilter === "no_edge" && totalEdges > 0) return false;
        if (cutlistEdgeFilter === "4_sides" && totalEdges !== 4) return false;
        if (cutlistEdgeFilter === "3_sides" && totalEdges !== 3) return false;
        if (cutlistEdgeFilter === "2_sides" && totalEdges !== 2) return false;
        if (cutlistEdgeFilter === "1_side" && totalEdges !== 1) return false;
      }

      // 6. Lọc theo Kích thước tấm
      if (cutlistSizeFilter !== "all") {
        const maxDim = Math.max(p.lengthMm ?? p.length ?? 0, p.widthMm ?? p.width ?? 0);
        if (cutlistSizeFilter === "large" && maxDim < 2000) return false;
        if (cutlistSizeFilter === "medium" && (maxDim < 800 || maxDim >= 2000)) return false;
        if (cutlistSizeFilter === "small" && maxDim >= 800) return false;
      }

      return true;
    });
  }, [parts, cutlistSearch, cutlistModuleFilter, cutlistMaterialFilter, cutlistThicknessFilter, cutlistEdgeFilter, cutlistSizeFilter]);

  // Đếm số lượng tiêu chí phễu lọc đang kích hoạt
  const activeCutlistFilterCount = useMemo(() => {
    let count = 0;
    if (cutlistSearch.trim()) count++;
    if (cutlistModuleFilter !== "all") count++;
    if (cutlistMaterialFilter !== "all") count++;
    if (cutlistThicknessFilter !== "all") count++;
    if (cutlistEdgeFilter !== "all") count++;
    if (cutlistSizeFilter !== "all") count++;
    return count;
  }, [cutlistSearch, cutlistModuleFilter, cutlistMaterialFilter, cutlistThicknessFilter, cutlistEdgeFilter, cutlistSizeFilter]);

  const handleResetCutlistFilter = () => {
    setCutlistSearch("");
    setCutlistModuleFilter("all");
    setCutlistMaterialFilter("all");
    setCutlistThicknessFilter("all");
    setCutlistEdgeFilter("all");
    setCutlistSizeFilter("all");
  };

  // Xử lý nạp mẫu nội thất
  const handleSelectPreset = (presetParts: Omit<CutlistPart, "id">[], mode: "replace" | "append", presetName: string) => {
    const preparedParts: CutlistPart[] = presetParts.map((p, idx) => ({
      ...p,
      id: `preset-${Date.now()}-${idx}`,
    }));

    if (mode === "replace") {
      setParts(preparedParts);
      setProjectName(presetName);
      showToast(`Đã nạp mới ${preparedParts.length} tấm cho [${presetName}]!`);
    } else {
      setParts((prev) => [...prev, ...preparedParts]);
      showToast(`Đã ghép thêm ${preparedParts.length} tấm từ [${presetName}] vào dự án!`);
    }
  };

  // Xử lý dán dữ liệu trực tiếp từ Excel (Clipboard)
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        showToast("Bộ nhớ tạm (Clipboard) trống! Hãy copy các ô từ Excel rồi dán lại.", "error");
        return;
      }

      const lines = text.trim().split(/\r?\n/);
      const newParts: CutlistPart[] = [];

      lines.forEach((line, idx) => {
        const cols = line.includes("\t") ? line.split("\t") : line.split(",");
        if (cols.length < 3) return;

        const col0 = cols[0]?.trim().toLowerCase() || "";
        if (col0.includes("hạng mục") || col0.includes("stt") || col0.includes("module") || col0.includes("tên")) {
          return;
        }

        const moduleName = cols[0]?.trim() || "Module bổ sung";
        const partName = cols[1]?.trim() || `Tấm ${idx + 1}`;
        const lengthMm = parseFloat(cols[2]?.replace(/[^0-9.]/g, "")) || 0;
        const widthMm = parseFloat(cols[3]?.replace(/[^0-9.]/g, "")) || 0;
        const thicknessMm = parseFloat(cols[4]?.replace(/[^0-9.]/g, "")) || 17;
        const qty = parseInt(cols[5]?.replace(/[^0-9]/g, ""), 10) || 1;
        const materialCode = cols[6]?.trim() || "MDF_17_CHONG_AM";
        const edgeText = (cols[7] || "").toLowerCase();

        if (lengthMm > 0 && widthMm > 0) {
          newParts.push({
            id: `paste-${Date.now()}-${idx}`,
            moduleName,
            partName,
            lengthMm,
            widthMm,
            thicknessMm,
            qty,
            materialCode,
            edgeL1: edgeText.includes("d1") || edgeText.includes("l1") || edgeText.includes("4"),
            edgeL2: edgeText.includes("d2") || edgeText.includes("l2") || edgeText.includes("4"),
            edgeW1: edgeText.includes("r1") || edgeText.includes("w1") || edgeText.includes("4"),
            edgeW2: edgeText.includes("r2") || edgeText.includes("w2") || edgeText.includes("4"),
          });
        }
      });

      if (newParts.length > 0) {
        setParts((prev) => [...prev, ...newParts]);
        showToast(`Đã nhận diện và nạp thành công ${newParts.length} tấm từ Excel Clipboard!`);
      } else {
        showToast("Không tìm thấy hàng dữ liệu kích thước hợp lệ trong clipboard!", "error");
      }
    } catch (err) {
      console.warn("Lỗi đọc clipboard:", err);
      showToast("Vui lòng cấp quyền truy cập Clipboard trên trình duyệt để dán nhanh!", "error");
    }
  };

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Trạng thái modal Ánh xạ cột (Column Mapping)
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [rawExcelRows, setRawExcelRows] = useState<any[]>([]);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState({
    moduleName: "",
    partName: "",
    length: "",
    width: "",
    thickness: "",
    qty: "",
    materialCode: "",
    edges: "",
  });

  // File upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tự động nạp dữ liệu mẫu nếu có param ?demo=true từ Landing Page
  useEffect(() => {
    if (isDemoParam) {
      setParts(SEED_PARTS);
      setProjectName("Căn hộ 2PN Vinhomes Smart City");
      setClientName("Anh Tuấn");
      setClientPhone("0988 123 456");
      showToast("Đã nạp thành công bộ dữ liệu mẫu 48 chi tiết (Căn hộ 2PN).", "success");
    }
  }, [isDemoParam]);

  // Load existing project if id is passed
  useEffect(() => {
    if (editId) {
      const found = projects.find((p) => p.id === editId);
      if (found) {
        setProjectName(found.projectName);
        setClientName(found.clientName);
        setClientPhone(found.clientPhone || "");
        setParts(found.items);
        setProfitMargin(resolveProjectProfitMargin(found.profitMargin));
        if (found.roundingStep) setRoundingStep(found.roundingStep);
        setProjectVersionNo(found.versionNo ?? found.version ?? 1);
        setParentProjectId(found.parentProjectId);
        setProjectStatus(found.status || "draft");
        if (found.items && found.items.length > 0) {
          setCurrentStep(2);
        }
      }
    }
  }, [editId, projects]);

  // Kiểm tra dự án có phải là bản revision v2+ hay không (dựa trên versionNo hoặc parentProjectId, KHÔNG kiểm tra tên chuỗi)
  const isRevision = useMemo(() => {
    return (projectVersionNo > 1) || Boolean(parentProjectId);
  }, [projectVersionNo, parentProjectId]);

  // Kiểm tra dự án có bị khóa theo trạng thái hợp đồng hay không
  const isLockedContract = useMemo(() => {
    return projectStatus === "approved" || projectStatus === "in_production" || projectStatus === "finalized" || projectStatus === "ordered";
  }, [projectStatus]);

  // Hiển thị tính năng nâng cao nếu BẬT chế độ nâng cao HOẶC dự án là bản v2+/đã khóa hợp đồng
  const showAdvancedFeatures = advancedMode || isRevision || isLockedContract;

  // Điều hướng các bước trong luồng làm việc và cập nhật URL query param
  const goToStep = (step: QuotingStep) => {
    setCurrentStep(step);
    if (step === 2) {
      trackFunnelEvent("quote_calculated", {
        partCount: parts.length,
        sheetCount: calcResult.totalSheets,
        isCustomConfig: isCustomCostConfig,
        step: 2,
      });
    }
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("step", String(step));
      window.history.pushState(null, "", url.toString());
    }
  };

  // Đồng bộ với URL khi tải trang hoặc khi người dùng bấm Back/Forward của trình duyệt
  useEffect(() => {
    const s = searchParams?.get("step");
    if (s === "1" || s === "2" || s === "3") {
      setCurrentStep(Number(s) as QuotingStep);
    }
    const handlePopState = () => {
      const sp = new URLSearchParams(window.location.search);
      const stepVal = sp.get("step");
      if (stepVal === "1" || stepVal === "2" || stepVal === "3") {
        setCurrentStep(Number(stepVal) as QuotingStep);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [searchParams]);

  // Xuất file Excel BOM Xưởng
  const handleExportWorkshopBOM = () => {
    trackFunnelEvent("bom_exported_excel", { format: "xlsx", sheetCount: calcResult.totalSheets, step: 3 });
    exportWorkshopBOMExcel(
      projectName,
      calcResult.boards,
      calcResult.edges,
      calcResult.laborCost,
      calcResult.totalBaseCost,
      profile.costConfig
    );
    showToast("Đã xuất file Excel BOM xưởng thành công!");
  };

  // Xuất file Cutlist Tấm Ván CNC
  const handleExportProjectCutlist = () => {
    trackFunnelEvent("cutlist_imported", { partCount: parts.length, format: "xlsx" });
    const cutlistItems = parts.map((p) => ({
      moduleName: p.moduleName,
      partName: p.partName,
      lengthMm: p.lengthMm,
      widthMm: p.widthMm,
      thicknessMm: p.thicknessMm,
      qty: p.qty,
      materialCode: p.materialCode,
      edgeL1: p.edgeL1,
      edgeL2: p.edgeL2,
      edgeW1: p.edgeW1,
      edgeW2: p.edgeW2,
    }));
    exportStandardCutlistExcel(projectName, cutlistItems);
    showToast("Đã xuất file Cutlist chuẩn máy CNC thành công!");
  };

  // Mở hộp thoại in báo giá A4
  const handlePrintA4 = () => {
    trackFunnelEvent("quote_exported_a4", { format: "pdf", step: 3 });
    setActiveOutputTab("quote");
    goToStep(2);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // Kiểm tra xưởng có đang dùng cấu hình chi phí tùy chỉnh khác mặc định hay không
  const isCustomCostConfig = useMemo(() => {
    const currentCfg = profile.costConfig;
    if (!currentCfg) return false;
    return (
      currentCfg.suppliesRatePerSheet !== DEFAULT_WORKSHOP_COST_CONFIG.suppliesRatePerSheet ||
      currentCfg.laborRatePerSheet !== DEFAULT_WORKSHOP_COST_CONFIG.laborRatePerSheet ||
      currentCfg.hingesPerSheet !== DEFAULT_WORKSHOP_COST_CONFIG.hingesPerSheet ||
      currentCfg.slidesPerSheet !== DEFAULT_WORKSHOP_COST_CONFIG.slidesPerSheet ||
      (currentCfg.glueRatePerMd ?? 0) !== (DEFAULT_WORKSHOP_COST_CONFIG.glueRatePerMd ?? 0) ||
      (currentCfg.glueUnitPrice ?? 0) !== (DEFAULT_WORKSHOP_COST_CONFIG.glueUnitPrice ?? 0)
    );
  }, [profile.costConfig]);

  // Ưu tiên snapshot giá tại ngày tạo để bảo toàn lịch sử dự án cũ
  const activeMaterials = useMemo(() => {
    if (editId) {
      const found = projects.find((p) => p.id === editId);
      if (found?.materialsSnapshot && found.materialsSnapshot.length > 0) {
        return found.materialsSnapshot;
      }
      if (found?.materialSnapshots && found.materialSnapshots.length > 0) {
        return found.materialSnapshots;
      }
    }
    return materials;
  }, [editId, projects, materials]);

  // Available board materials for dropdown
  const boardMaterials = activeMaterials.filter((m) => m.category === "board");

  // Real-time calculation engine result
  const calcResult = useMemo(() => {
    return calculateProject(parts, activeMaterials, {
      profitMargin,
      roundingStep,
      costConfig: profile.costConfig,
    });
  }, [parts, activeMaterials, profitMargin, roundingStep, profile.costConfig]);

  // ==========================================================================
  // THUẬT TOÁN NHẬN DIỆN CỘT THÔNG MINH (SMART AUTO-MAPPING)
  // Chuẩn hóa chuỗi không dấu và so khớp từ khóa chuyên ngành mộc
  // ==========================================================================
  const normalizeHeader = (str: string): string => {
    return String(str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  };

  const SYNONYMS = {
    moduleName: ["hangmuc", "module", "tu", "phong", "sanpham", "khuvuc", "item", "vitri"],
    partName: ["tenchitiet", "tentam", "part", "chitiet", "ten", "quycach", "description", "name"],
    length: ["dai", "chieudai", "length", "l", "cao", "height", "h", "daimm"],
    width: ["rong", "chieurong", "width", "w", "sau", "depth", "b", "r", "rongmm"],
    thickness: ["day", "doday", "thickness", "thk", "t", "daymm"],
    qty: ["soluong", "sl", "qty", "quantity", "so"],
    materialCode: ["mavatlieu", "vatlieu", "material", "loaigo", "loaivan", "mavan", "go", "chatlieu"],
    edges: ["dancanh", "chidan", "danchi", "edge", "edges", "chi", "nep", "canhdan"],
  };

  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<Record<string, any>>(ws);

        if (data.length === 0) {
          showToast("File Excel không có dòng dữ liệu nào!", "error");
          return;
        }

        const headers = Object.keys(data[0] || {});
        setExcelHeaders(headers);
        setRawExcelRows(data);

        // Tự động dò tìm cột tốt nhất theo từ khóa
        const autoMap = {
          moduleName: headers.find((h) => SYNONYMS.moduleName.some((syn) => normalizeHeader(h).includes(syn))) || "",
          partName: headers.find((h) => SYNONYMS.partName.some((syn) => normalizeHeader(h).includes(syn))) || "",
          length: headers.find((h) => SYNONYMS.length.some((syn) => normalizeHeader(h).includes(syn))) || "",
          width: headers.find((h) => SYNONYMS.width.some((syn) => normalizeHeader(h).includes(syn))) || "",
          thickness: headers.find((h) => SYNONYMS.thickness.some((syn) => normalizeHeader(h).includes(syn))) || "",
          qty: headers.find((h) => SYNONYMS.qty.some((syn) => normalizeHeader(h).includes(syn))) || "",
          materialCode: headers.find((h) => SYNONYMS.materialCode.some((syn) => normalizeHeader(h).includes(syn))) || "",
          edges: headers.find((h) => SYNONYMS.edges.some((syn) => normalizeHeader(h).includes(syn))) || "",
        };

        setColumnMapping(autoMap);

        // Nếu đã nhận diện được tối thiểu 2 cột quan trọng nhất: Dài và Rộng
        if (autoMap.length && autoMap.width) {
          applyMappingAndImport(data, autoMap);
        } else {
          // Nếu cấu trúc quá lạ, mở Modal cho người dùng chọn nhanh cột
          setShowMappingModal(true);
        }
      } catch (err) {
        console.error("Lỗi đọc file Excel:", err);
        showToast("Lỗi đọc file Excel. Vui lòng kiểm tra lại định dạng file!", "error");
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Áp dụng gán cột và nạp danh sách chi tiết
  const applyMappingAndImport = (rows: any[], mapping: typeof columnMapping) => {
    const parsedParts: CutlistPart[] = rows.map((row, idx) => {
      const moduleName = mapping.moduleName ? row[mapping.moduleName] : "Hạng mục chung";
      const partName = mapping.partName ? row[mapping.partName] : `Chi tiết ${idx + 1}`;
      const length = Number(mapping.length ? row[mapping.length] : 600);
      const width = Number(mapping.width ? row[mapping.width] : 400);
      const thickness = Number(mapping.thickness ? row[mapping.thickness] : 17);
      const qty = Number(mapping.qty ? row[mapping.qty] : 1);
      const materialCode = mapping.materialCode
        ? row[mapping.materialCode]
        : thickness <= 6
        ? "MDF_6_HAU"
        : "MDF_17_CHONG_AM";

      const edgeStr = String(mapping.edges ? row[mapping.edges] : "").toUpperCase();
      const edgeL1 = edgeStr.includes("D1") || edgeStr.includes("L1") || edgeStr.includes("4C") || edgeStr.includes("4 CẠNH");
      const edgeL2 = edgeStr.includes("D2") || edgeStr.includes("L2") || edgeStr.includes("4C") || edgeStr.includes("4 CẠNH");
      const edgeW1 = edgeStr.includes("R1") || edgeStr.includes("W1") || edgeStr.includes("4C") || edgeStr.includes("4 CẠNH");
      const edgeW2 = edgeStr.includes("R2") || edgeStr.includes("W2") || edgeStr.includes("4C") || edgeStr.includes("4 CẠNH");

      const partLength = isNaN(length) || length <= 0 ? 600 : length;
      const partWidth = isNaN(width) || width <= 0 ? 400 : width;
      const partThickness = isNaN(thickness) || thickness <= 0 ? 17 : thickness;

      return {
        id: `part-${Date.now()}-${idx}`,
        moduleName: String(moduleName || "Hạng mục chung"),
        partName: String(partName || `Chi tiết ${idx + 1}`),
        lengthMm: partLength,
        widthMm: partWidth,
        thicknessMm: partThickness,
        length: partLength,
        width: partWidth,
        thickness: partThickness,
        qty: isNaN(qty) || qty <= 0 ? 1 : qty,
        materialCode: String(materialCode || "MDF_17_CHONG_AM"),
        edgeL1,
        edgeL2,
        edgeW1,
        edgeW2,
        grainDirection: "along_length",
      };
    });

    setParts(parsedParts);
    trackFunnelEvent("cutlist_imported", { partCount: parsedParts.length, step: 1 });
    setShowMappingModal(false);
    showToast(`Đã nhận diện và bóc tách thành công ${parsedParts.length} chi tiết từ file Excel!`, "success");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!isAuthenticated) {
      setAuthModalTitle("Yêu cầu Đăng nhập để Tải File Excel Riêng");
      setAuthModalDesc("Chức năng dùng thử chỉ hỗ trợ kiểm thử bộ dữ liệu mẫu 48 tấm. Vui lòng đăng nhập qua Email hoặc Số điện thoại để nạp file Excel riêng của xưởng bạn.");
      setShowAuthModal(true);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file) parseExcelFile(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isAuthenticated) {
      setAuthModalTitle("Yêu cầu Đăng nhập để Tải File Excel Riêng");
      setAuthModalDesc("Chức năng dùng thử chỉ hỗ trợ kiểm thử bộ dữ liệu mẫu 48 tấm. Vui lòng đăng nhập qua Email hoặc Số điện thoại để nạp file Excel riêng của xưởng bạn.");
      setShowAuthModal(true);
      return;
    }
    const file = e.dataTransfer.files?.[0];
    if (file) parseExcelFile(file);
  };

  // Nạp dữ liệu mẫu
  const handleLoadSeed = () => {
    setParts(SEED_PARTS);
    setProjectName("Căn hộ 2PN Vinhomes Smart City");
    setClientName("Anh Tuấn");
    setClientPhone("0988 123 456");
    trackFunnelEvent("demo_started", { partCount: SEED_PARTS.length, step: 1 });
    showToast("Đã nạp thành công bộ dữ liệu mẫu 48 chi tiết (Căn hộ 2PN)!");
  };

  // Tải file Excel mẫu chuẩn 8 cột
  const handleDownloadTemplate = () => {
    const legacyItems = parts.map((p) => ({
      moduleName: p.moduleName,
      partName: p.partName,
      lengthMm: p.lengthMm ?? p.length ?? 0,
      widthMm: p.widthMm ?? p.width ?? 0,
      thicknessMm: p.thicknessMm ?? p.thickness ?? 17,
      qty: p.qty,
      materialCode: p.materialCode,
      edges: { l1: p.edgeL1, l2: p.edgeL2, w1: p.edgeW1, w2: p.edgeW2 },
    }));
    exportStandardCutlistExcel("Mau_Cutlist_Chuan_WebNoiThat", legacyItems);
    showToast("Đã tạo và tải xuống file Excel mẫu chuẩn 8 cột!");
  };

  // Thêm tấm chi tiết mới
  const handleAddPart = () => {
    const newPart: CutlistPart = {
      id: `part-${Date.now()}`,
      moduleName: parts[parts.length - 1]?.moduleName || "Tủ áo Master",
      partName: "Chi tiết mới",
      lengthMm: 800,
      widthMm: 500,
      thicknessMm: 17,
      length: 800,
      width: 500,
      thickness: 17,
      qty: 1,
      materialCode: boardMaterials[0]?.code || "MDF_17_CHONG_AM",
      edgeL1: true,
      edgeL2: false,
      edgeW1: false,
      edgeW2: false,
      grainDirection: "along_length",
    };
    setParts([...parts, newPart]);
  };

  // Cập nhật tấm chi tiết
  const handleUpdatePart = (id: string, patch: Partial<CutlistPart>) => {
    setParts(parts.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  // Xóa tấm
  const handleDeletePart = (id: string) => {
    setParts(parts.filter((p) => p.id !== id));
  };

  // Tạo phiên bản báo giá mới (Revision v2, v3...)
  const handleCreateRevision = () => {
    if (!isAuthenticated) {
      setAuthModalTitle("Yêu cầu Đăng nhập để Tạo Bản v2");
      setAuthModalDesc("Vui lòng đăng nhập qua Email hoặc Số điện thoại để tạo và lưu trữ độc lập các phiên bản đàm phán hợp đồng (v1, v2, v3...).");
      setShowAuthModal(true);
      return;
    }
    const nextVer = (projectVersionNo || 1) + 1;
    setProjectVersionNo(nextVer);
    setParentProjectId(editId || undefined);
    setProjectName(`${projectName.replace(/\s*\(v\d+\)$/, "")} (v${nextVer})`);
    setProjectStatus("draft");
    router.replace("/quoting?step=1"); // Tách id khỏi URL để khi lưu sẽ tạo dự án độc lập, kế thừa 100% profitMargin từ v1
    showToast(`Đã tạo phiên bản báo giá mới v${nextVer}. Bạn có thể tinh chỉnh giá hoặc danh sách tấm mà không ảnh hưởng bản cũ!`, "info");
  };

  // Lưu dự án vào Store
  const handleSaveProject = async () => {
    if (!isAuthenticated) {
      setAuthModalTitle("Yêu cầu Đăng nhập để Lưu Dự Án");
      setAuthModalDesc("Chức năng dùng thử chỉ cho phép xem trước bảng tính tạm thời. Vui lòng đăng nhập qua Email hoặc Số điện thoại để lưu dự án lên đám mây và bảo vệ đơn giá theo xưởng của bạn.");
      setShowAuthModal(true);
      return;
    }
    const projectId = editId || `proj-${Date.now()}`;
    const projectToSave: SavedProject = {
      id: projectId,
      projectName,
      clientName,
      clientPhone,
      createdAt: new Date().toISOString(),
      status: projectStatus,
      items: parts,
      materialsSnapshot: materials,
      materialSnapshots: materials,
      profitMargin,
      roundingStep,
      totalCost: calcResult.totalBaseCost,
      totalQuote: calcResult.totalQuotePrice,
      calcVersion: 1,
      versionNo: projectVersionNo,
      parentProjectId: parentProjectId,
      costConfigSnapshot: profile.costConfig || DEFAULT_WORKSHOP_COST_CONFIG,
    };

    const res = await saveProject(projectToSave);
    trackFunnelEvent("project_saved", { isCustomConfig: isCustomCostConfig, versionNo: projectVersionNo });
    if (res?.error) {
      showToast(`Đã lưu tạm trên máy, chưa đồng bộ Cloud: ${res.error}`, "info");
    } else {
      setSaveSuccess(true);
      showToast(
        "Đã lưu dự án thành công lên hệ thống!",
        "success"
      );
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  if (!mounted) {
    return (
      <div className="p-12 text-center space-y-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
        <div className="w-8 h-8 mx-auto border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-600">Đang khởi tạo không gian báo giá &amp; phễu lọc...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans pb-16 relative">
      {/* Toast thông báo nổi bật */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 border text-xs font-semibold animate-in fade-in slide-in-from-top-3 duration-200 max-w-md ${
          toast.type === "success"
            ? "bg-zinc-900 text-white border-zinc-800 shadow-xl"
            : toast.type === "error"
            ? "bg-zinc-900 text-rose-300 border-rose-900 shadow-xl"
            : "bg-zinc-900 text-white border-zinc-800 shadow-xl"
        }`}>
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-zinc-400 shrink-0" />
          )}
          <span className="flex-1 leading-snug">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            ✕
          </button>
        </div>
      )}

      {/* ================================================================== */}
      {/* TECHNICAL TELEMETRY RIBBON (DẢI ĐỊNH MỨC KỸ THUẬT XƯỞNG)           */}
      {/* Chỉ xuất hiện khi người dùng đã đăng nhập và đang mở một dự án cụ thể đã lưu */}
      {/* ================================================================== */}
      {isAuthenticated && editId && (
        <div className="no-print bg-slate-900 text-slate-300 text-[11px] py-2 px-4 rounded-lg font-mono border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1.5 text-zinc-200 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              MÃ DỰ ÁN: {`PRJ-${editId.slice(0, 8).toUpperCase()}`}
            </span>
            <span className="text-slate-400">ĐỊNH MỨC: <strong className="text-white">ĐA DÒNG HÀNG &amp; VẬT TƯ MỞ</strong></span>
            <span className="text-slate-400">PHƯƠNG PHÁP: <strong className="text-white">CHIẾT TÍNH ĐA TẦNG W×D×H</strong></span>
            <span className="text-slate-400">KIỂM ĐỊNH: <strong className="text-zinc-200">SAI SỐ &lt; 1%</strong></span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span className="text-zinc-200 flex items-center gap-1 font-sans font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" /> BẢO MẬT RLS XƯỞNG ĐỘC LẬP
            </span>
            <span className="font-mono">DUNG SAI: ±0.2MM</span>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* TEST MODE TRIAL NOTICE BANNER (Chỉ cho phép dùng thử ở chức năng test) */}
      {/* ================================================================== */}
      {!isAuthenticated && (
        <div className="no-print bg-zinc-900 text-white border border-zinc-800 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-zinc-800 text-white flex items-center justify-center shrink-0 shadow-xs border border-zinc-700">
              <FlaskConical className="w-4 h-4 text-zinc-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs sm:text-sm">
                  CHẾ ĐỘ TRẢI NGHIỆM DỰ TOÁN
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
                  Dữ liệu mẫu tham khảo
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed max-w-2xl">
                Bạn đang trong phiên trải nghiệm với dữ liệu mẫu 48 chi tiết (Căn hộ 2PN). Để lưu dự án lên đám mây, tùy biến đơn giá xưởng hoặc xuất bản in báo giá chính thức, vui lòng đăng nhập qua Email hoặc Số điện thoại.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setAuthModalTitle("Đăng nhập tài khoản Xưởng");
              setAuthModalDesc("Đăng nhập qua Email hoặc Số điện thoại để mở khóa toàn bộ quyền lưu dự án, tải file Excel riêng và quản lý Thư viện giá xưởng.");
              setShowAuthModal(true);
            }}
            className="shrink-0 px-4 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-zinc-100 text-zinc-900 transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Đăng nhập tài khoản</span>
          </button>
        </div>
      )}

      {/* ================================================================== */}
      {/* THANH ĐIỀU KHIỂN DỰ ÁN & TIÊU ĐỀ (no-print)                         */}
      {/* ================================================================== */}
      <div className="no-print bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-900" />
              <span>Không gian Báo Giá &amp; Dự Toán Chi Phí</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Nhập tên công trình / dự án..."
                className="text-xl sm:text-2xl font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-none transition"
              />

              {/* Trạng thái dự án & Lệnh xưởng */}
              <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Trạng thái:</span>
                <select
                  value={projectStatus}
                  onChange={(e) => {
                    const st = e.target.value as ProjectStatus;
                    setProjectStatus(st);
                    showToast(`Đã chuyển trạng thái dự án sang: "${st === "approved" ? "Khách duyệt chốt" : st === "in_production" ? "Lệnh sản xuất xưởng" : st === "quoted" ? "Đã gửi khách" : "Báo giá Nháp"}"`, "info");
                  }}
                  className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="draft">Bản nháp</option>
                  <option value="quoted">Đã gửi khách</option>
                  <option value="approved">Khách duyệt chốt</option>
                  <option value="in_production">Lệnh sản xuất xưởng</option>
                </select>
              </div>

              {projectStatus === "approved" && (
                <span className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-900 font-semibold text-[11px] flex items-center gap-1 border border-zinc-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-900" />
                  <span>Đã duyệt hợp đồng</span>
                </span>
              )}

              {projectStatus === "in_production" && (
                <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-800 font-semibold text-[11px] flex items-center gap-1 border border-indigo-200">
                  <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Đang chạy Lệnh Xưởng</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {saveSuccess && (
              <span className="text-xs font-semibold text-zinc-900 bg-zinc-100 px-3 py-1.5 rounded-xl border border-zinc-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã lưu vào danh sách dự án!</span>
              </span>
            )}

            {showAdvancedFeatures && (
              <button
                type="button"
                onClick={handleCreateRevision}
                title="Nhân bản để tạo bản báo giá v2 sau đàm phán"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Tạo bản v2</span>
              </button>
            )}

            <button
              onClick={handleSaveProject}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu dự án</span>
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition cursor-pointer"
              title="Chia sẻ link báo giá an toàn cho khách hàng"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">Chia sẻ link</span>
            </button>

            <button
              onClick={handlePrintA4}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-zinc-900 hover:bg-black rounded-xl transition shadow-sm border border-zinc-800 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Báo Giá A4</span>
            </button>
          </div>
        </div>

        {/* Thông tin khách hàng & Markup Slider */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="font-semibold text-slate-500 block mb-1">Tên khách hàng / Chủ nhà:</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-zinc-900"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-500 block mb-1">Số điện thoại / Zalo:</label>
            <input
              type="text"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-zinc-900"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-500 flex items-center gap-1">
                <span>{WORKSHOP_TERMS.markup.label} & {WORKSHOP_TERMS.profitMargin.label}:</span>
                <HelpTooltip content={`${WORKSHOP_TERMS.markup.shortExplanation} ${WORKSHOP_TERMS.profitMargin.shortExplanation}`} label="Giải thích lãi trên vốn và biên lợi nhuận" />
              </label>
              <div className="text-right">
                <span className="font-bold text-zinc-900 font-mono text-xs">
                  Lãi: {formatPercentVi(calculateMarkupPercent(profitMargin), true)} (x{profitMargin.toFixed(2)})
                </span>
                <span className="text-[11px] text-slate-500 font-mono ml-2">
                  • Biên LN: <strong className="text-zinc-900">{formatPercentVi(calculateProfitMarginPercent(profitMargin))}</strong>
                </span>
              </div>
            </div>
            <input
              type="range"
              min={1.1}
              max={2.0}
              step={0.05}
              value={profitMargin}
              onChange={(e) => setProfitMargin(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-zinc-900 mt-2"
            />
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* THANH ĐIỀU HƯỚNG 3 BƯỚC (STEPPER) & CHẾ ĐỘ NÂNG CAO (no-print)      */}
      {/* ================================================================== */}
      <div className="no-print space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div className="flex flex-wrap items-center gap-2">
            {isCustomCostConfig && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-900 border border-zinc-200 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-zinc-700" />
                <span>Đang dùng cấu hình tùy chỉnh của xưởng</span>
              </span>
            )}

            {!advancedMode && activeCutlistFilterCount > 0 && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                <Filter className="w-3.5 h-3.5 text-slate-600" />
                <span>Đang lọc {activeCutlistFilterCount} tiêu chí</span>
                <button
                  type="button"
                  onClick={handleResetCutlistFilter}
                  className="text-slate-900 hover:underline font-bold text-[11px]"
                >
                  Xóa lọc
                </button>
              </span>
            )}

            {isRevision && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>Phiên bản v{projectVersionNo}</span>
              </span>
            )}
          </div>

          {/* Nút bật/tắt Chế độ nâng cao (mặc định tắt, ghi nhớ trong localStorage) */}
          <button
            type="button"
            onClick={toggleAdvancedMode}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition border cursor-pointer ${
              advancedMode
                ? "bg-zinc-900 text-white border-zinc-800 shadow-xs"
                : "bg-white text-zinc-700 hover:bg-zinc-50 border-zinc-200"
            }`}
            title="Bật để mở khóa 37 công đoạn nhân công và phân tầng Overhead chuyên sâu"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Chế độ nâng cao (Advanced Mode): <strong className={advancedMode ? "text-white" : "text-zinc-900"}>{advancedMode ? "BẬT" : "TẮT"}</strong></span>
          </button>
        </div>

        {/* 3-Step Navigation Bar */}
        <nav aria-label="Tiến trình làm việc" className="bg-white rounded-lg border border-slate-200 p-1.5 shadow-xs">
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => goToStep(1)}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md transition text-xs font-semibold cursor-pointer ${
                currentStep === 1
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                currentStep === 1 ? "bg-white text-slate-900" : "bg-slate-200 text-slate-700"
              }`}>
                1
              </span>
              <span className="hidden sm:inline">1. Quy Cách &amp; Kích Thước Sản Phẩm</span>
              <span className="sm:hidden">1. Quy Cách</span>
            </button>

            <button
              type="button"
              onClick={() => goToStep(2)}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md transition text-xs font-semibold cursor-pointer ${
                currentStep === 2
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                currentStep === 2 ? "bg-white text-slate-900" : "bg-slate-200 text-slate-700"
              }`}>
                2
              </span>
              <span className="hidden sm:inline">2. Bảng Phân Tích Giá Vốn &amp; Chi Phí</span>
              <span className="sm:hidden">2. Phân Tích Giá</span>
            </button>

            <button
              type="button"
              onClick={() => goToStep(3)}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md transition text-xs font-semibold cursor-pointer ${
                currentStep === 3
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                currentStep === 3 ? "bg-white text-slate-900" : "bg-slate-200 text-slate-700"
              }`}>
                3
              </span>
              <span className="hidden sm:inline">3. Báo Giá Khách Hàng &amp; In A4</span>
              <span className="sm:hidden">3. Báo Giá A4</span>
            </button>
          </div>
        </nav>
      </div>

      {/* ================================================================== */}
      {/* BƯỚC 1: BẢNG CÂU HỎI THÔNG SỐ & CHECKLIST (no-print)                */}
      {/* ================================================================== */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Sub-tab switcher giữa Báo giá thông số và Nạp file */}
          <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setInputTab("questionnaire")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-2 cursor-pointer ${
                  inputTab === "questionnaire"
                    ? "bg-slate-900 text-white shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Báo giá thông số quy cách</span>
              </button>

              <button
                type="button"
                onClick={() => setInputTab("detailed_parts")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-2 cursor-pointer ${
                  inputTab === "detailed_parts"
                    ? "bg-slate-900 text-white shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Bảng chi tiết hạng mục / Nhập Excel</span>
              </button>
            </div>

            <div className="text-xs text-slate-500 hidden md:flex items-center gap-1.5 font-normal">
              {inputTab === "questionnaire" ? (
                <span>Tự động chiết tính giá vốn đa tầng từ kích thước phủ bì W × D × H</span>
              ) : (
                <span>Nhập danh sách phôi tấm hoặc dán trực tiếp từ bảng tính Excel</span>
              )}
            </div>
          </div>

          {inputTab === "questionnaire" ? (
            /* ============================================================ */
            /* GIAO DIỆN BẢNG CÂU HỎI THÔNG SỐ QUY CÁCH                     */
            /* ============================================================ */
            <div className="space-y-6">
              
              {/* THANG ĐO 4 MỨC ĐỘ BÁO GIÁ (4-TIER ESTIMATION RESOLUTION LADDER) */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 text-white">
                        THANG ĐỘ PHÂN GIẢI
                      </span>
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                        4 Mức Độ Chiết Tính &amp; Bảo Vệ Lợi Nhuận
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Không ép nhập từng chi tiết khi chỉ có ảnh chụp. Dừng ở mức nào tùy nhu cầu độ chính xác.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                    <span>Đang áp dụng:</span>
                    <strong className="text-zinc-900 font-bold bg-zinc-100 px-2.5 py-0.5 rounded border border-zinc-200">
                      Mức {questionnaire.estimationLevel || 2}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {[
                    {
                      level: 1,
                      title: "Mức 1: Giá khoảng KT bao",
                      badge: "±15% dao động",
                      contingency: "+10% Dự phòng rủi ro",
                      desc: "Báo nhanh trong 30s khi khách gửi ảnh Zalo. Chỉ cần W×D×H.",
                    },
                    {
                      level: 2,
                      title: "Mức 2: Sinh BOM giả định",
                      badge: "Khuyến nghị xưởng",
                      contingency: "+5% Dự phòng rủi ro",
                      desc: "Tự dựng danh sách chi tiết & hiện giả định kỹ thuật sát bên giá.",
                    },
                    {
                      level: 3,
                      title: "Mức 3: Lấy từ mẫu cũ tương tự",
                      badge: "Kho lịch sử",
                      contingency: "+5% Dự phòng rủi ro",
                      desc: "Scale co giãn kích thước & định mức từ dự án xưởng từng làm.",
                    },
                    {
                      level: 4,
                      title: "Mức 4: BOM chi tiết CAD",
                      badge: "Chốt đơn 100%",
                      contingency: "0% Dự phòng (Chuẩn CNC)",
                      desc: "Bóc tách đầy đủ từng tấm từ AutoCAD/SketchUp hoặc bảng phôi.",
                    },
                  ].map((tier) => {
                    const isSelected = (questionnaire.estimationLevel || 2) === tier.level;
                    return (
                      <button
                        key={tier.level}
                        type="button"
                        onClick={() => {
                          if (tier.level === 4) {
                            setInputTab("detailed_parts");
                            setQuestionnaire((prev) => ({ ...prev, estimationLevel: 4 }));
                          } else if (tier.level === 3) {
                            setInputTab("questionnaire");
                            setCostingActiveTab("similar");
                            setQuestionnaire((prev) => ({ ...prev, estimationLevel: 3 }));
                          } else {
                            setInputTab("questionnaire");
                            setQuestionnaire((prev) => ({ ...prev, estimationLevel: tier.level as any }));
                          }
                        }}
                        className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 relative ${
                          isSelected
                            ? "bg-zinc-900 text-white border-zinc-900 shadow-sm ring-1 ring-zinc-900"
                            : "bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-300 shadow-2xs text-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            isSelected ? "bg-zinc-800 text-white" : "bg-slate-200 text-slate-700"
                          }`}>
                            MỨC {tier.level}
                          </span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border truncate ${
                            isSelected ? "bg-zinc-800 text-zinc-300 border-zinc-700" : "bg-white text-slate-600 border-slate-200"
                          }`}>
                            {tier.badge}
                          </span>
                        </div>

                        <div>
                          <div className={`text-xs font-bold leading-tight ${isSelected ? "text-white" : "text-slate-900"}`}>
                            {tier.title}
                          </div>
                          <p className={`text-[11px] mt-1 leading-snug line-clamp-2 ${isSelected ? "text-zinc-300" : "text-slate-500"}`}>
                            {tier.desc}
                          </p>
                        </div>

                        <div className={`pt-1.5 border-t text-[10px] font-mono flex items-center justify-between w-full ${
                          isSelected ? "border-zinc-800 text-zinc-400" : "border-slate-200/80 text-slate-500"
                        }`}>
                          <span>{tier.contingency}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* CỘT TRÁI: 4 KHỐI NHẬP LIỆU THÔNG SỐ (8 CỘT) */}
              <div className="lg:col-span-8 space-y-5">
                
                {/* KHỐI 1: SẢN PHẨM & KÍCH THƯỚC PHỦ BÌ (* BẮT BUỘC) */}
                <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-900 text-white font-bold text-[11px] flex items-center justify-center">
                        1
                      </span>
                      <h3 className="font-semibold text-slate-900 text-xs tracking-tight">
                        Sản phẩm &amp; Kích thước phủ bì (* Bắt buộc)
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Quy cách phủ bì tổng thể (mm)
                    </span>
                  </div>

                  {/* Lựa chọn loại sản phẩm nội thất đa dòng hàng & tìm kiếm thông minh */}
                  <ProductArchetypeSelector
                    selectedArchetypeId={selectedArchetypeId}
                    onSelectArchetype={handleArchetypeSelect}
                    onCustomTextChange={(text) => {
                      if (text.trim()) {
                        setQuestionnaire((prev) => ({ ...prev, name: text }));
                      }
                    }}
                  />

                  {/* Kích thước phủ bì Rộng × Sâu × Cao */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span>Kích thước phủ bì tổng thể:</span>
                        <HelpTooltip content="Nhập quy cách phủ bì (Rộng x Sâu x Cao). Lệch 10% kích thước làm lệch khoảng 14% giá thành." label="Kích thước phủ bì" />
                      </label>
                      <span className="text-[11px] font-mono text-slate-500">Đơn vị: mm</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 block mb-1">Rộng (W - Ngang):</span>
                        <div className="relative">
                          <input
                            type="number"
                            min={100}
                            step={10}
                            value={questionnaire.dimensions.widthMm}
                            onChange={(e) =>
                              setQuestionnaire((prev) => ({
                                ...prev,
                                dimensions: { ...prev.dimensions, widthMm: Number(e.target.value) },
                              }))
                            }
                            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-900 focus:outline-none focus:border-zinc-900"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-mono">mm</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 block mb-1">Sâu (D - Chiều sâu):</span>
                        <div className="relative">
                          <input
                            type="number"
                            min={50}
                            step={10}
                            value={questionnaire.dimensions.depthMm}
                            onChange={(e) =>
                              setQuestionnaire((prev) => ({
                                ...prev,
                                dimensions: { ...prev.dimensions, depthMm: Number(e.target.value) },
                              }))
                            }
                            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-900 focus:outline-none focus:border-zinc-900"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-mono">mm</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 block mb-1">Cao (H - Chiều cao):</span>
                        <div className="relative">
                          <input
                            type="number"
                            min={100}
                            step={10}
                            value={questionnaire.dimensions.heightMm}
                            onChange={(e) =>
                              setQuestionnaire((prev) => ({
                                ...prev,
                                dimensions: { ...prev.dimensions, heightMm: Number(e.target.value) },
                              }))
                            }
                            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-900 focus:outline-none focus:border-zinc-900"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-mono">mm</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick dimension presets */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                      <span className="text-slate-400">Gợi ý kích thước:</span>
                      {[
                        { label: "1.6m × 0.6m × 2.4m", w: 1600, d: 600, h: 2400 },
                        { label: "1.8m × 0.6m × 2.6m", w: 1800, d: 600, h: 2600 },
                        { label: "2.2m × 0.6m × 2.8m", w: 2200, d: 600, h: 2800 },
                        { label: "Bếp dưới 2.4m × 0.6m × 0.81m", w: 2400, d: 600, h: 810 },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            setQuestionnaire((prev) => ({
                              ...prev,
                              dimensions: { ...prev.dimensions, widthMm: preset.w, depthMm: preset.d, heightMm: preset.h },
                            }))
                          }
                          className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-zinc-100 text-slate-600 hover:text-zinc-900 transition font-mono cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* KHỐI 2: VẬT LIỆU & KẾT CẤU CHỦ LỰC (* BẮT BUỘC) */}
                <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-900 text-white font-bold text-[11px] flex items-center justify-center">
                        2
                      </span>
                      <h3 className="font-semibold text-slate-900 text-xs tracking-tight">
                        Vật liệu &amp; Kết cấu chủ lực (* Bắt buộc)
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-500">Đa dạng dòng hàng &amp; vật liệu mở</span>
                  </div>

                  {/* Cốt ván & Bề mặt */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700 block">
                          Cốt vật liệu thùng &amp; đợt:
                        </label>
                        <span className="text-[10px] text-slate-500 font-mono">Đa ngành</span>
                      </div>
                      <select
                        value={isCustomCore ? "CUSTOM" : questionnaire.materials.coreCode}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "CUSTOM") {
                            setIsCustomCore(true);
                          } else {
                            setIsCustomCore(false);
                            setQuestionnaire((prev) => ({
                              ...prev,
                              materials: { ...prev.materials, coreCode: val },
                            }));
                          }
                        }}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                      >
                        <optgroup label="Gỗ Công Nghiệp Hiện Đại">
                          <option value="MDF_17_CHONG_AM">MDF chống ẩm lõi xanh HMR 17mm</option>
                          <option value="MDF_6_HAU">MDF hậu 6mm chống ẩm</option>
                          <option value="MDF_17_JUMBO">MDF khổ lớn Jumbo 1830×2440×17mm</option>
                          <option value="HDF_BLACK_17">HDF siêu chống ẩm Black HDF 17mm</option>
                          <option value="MFC_18_CHONG_AM">MFC lõi xanh kháng ẩm 18mm</option>
                          <option value="PLYWOOD_17">Plywood Birch / Bạch Dương kháng nước 17mm</option>
                        </optgroup>
                        <optgroup label="Ván Nhựa Cao Cấp Chịu Nước 100%">
                          <option value="PVC_17">Ván nhựa PVC Picomat đặc chịu nước 100%</option>
                          <option value="WPB_17_CHIU_NUOC">Tấm nhựa WPB An Cường chịu nước tuyệt đối</option>
                        </optgroup>
                        <optgroup label="Gỗ Tự Nhiên &amp; Ghép Thanh">
                          <option value="OAK_NATURAL">Gỗ tự nhiên Sồi Mỹ (Oak) xẻ sấy</option>
                          <option value="WALNUT_NATURAL">Gỗ Óc Chó (Walnut) Bắc Mỹ vân Nu</option>
                          <option value="RUBBER_FINGER_18">Gỗ Cao Su ghép thanh loại A 18mm</option>
                          <option value="ASH_NATURAL">Gỗ Tần Bì (Ash) tự nhiên</option>
                        </optgroup>
                        <optgroup label="Khung Kim Loại &amp; Nhôm Kính">
                          <option value="SLIM_ALU_FRAME">Khung nhôm hệ Slim định hình Anodized</option>
                          <option value="STEEL_FRAME">Khung sắt hộp sơn tĩnh điện / Inox 304</option>
                        </optgroup>
                        {workshopBoardMaterials.length > 0 && (
                          <optgroup label="Từ Thư Viện Đơn Giá Của Xưởng">
                            {workshopBoardMaterials.map((mat) => (
                              <option key={mat.id} value={mat.code}>
                                {mat.name} ({mat.unitPrice.toLocaleString("vi-VN")} đ/{mat.unit})
                              </option>
                            ))}
                          </optgroup>
                        )}
                        <optgroup label="Tùy Chọn Khác">
                          <option value="CUSTOM">Tự nhập mã/tên vật tư tùy chỉnh...</option>
                        </optgroup>
                      </select>

                      {isCustomCore && (
                        <div className="mt-2">
                          <input
                            type="text"
                            placeholder="Nhập mã hoặc tên vật liệu cốt..."
                            value={questionnaire.materials.coreCode}
                            onChange={(e) =>
                              setQuestionnaire((prev) => ({
                                ...prev,
                                materials: { ...prev.materials, coreCode: e.target.value },
                              }))
                            }
                            className="w-full p-2 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700 block">
                          Bề mặt cánh &amp; mặt tiền:
                        </label>
                        <span className="text-[10px] text-slate-500 font-mono">Hoàn thiện</span>
                      </div>
                      <select
                        value={isCustomSurface ? "CUSTOM" : questionnaire.materials.surfaceCode}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "CUSTOM") {
                            setIsCustomSurface(true);
                          } else {
                            setIsCustomSurface(false);
                            setQuestionnaire((prev) => ({
                              ...prev,
                              materials: { ...prev.materials, surfaceCode: val },
                            }));
                          }
                        }}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                      >
                        <optgroup label="Bề Mặt Gỗ Công Nghiệp">
                          <option value="Melamine">Phủ Melamine 2 mặt chống trầy</option>
                          <option value="Acrylic">Cánh phủ Acrylic bóng gương No Line</option>
                          <option value="Laminate">Phủ Laminate Kingdom / Formica chống trầy</option>
                          <option value="Son2K">Sơn bệt men mờ 2K chống ố vàng</option>
                        </optgroup>
                        <optgroup label="Cánh Kính Khung Nhôm Slim">
                          <option value="CanhKinh_Tra">Cánh Kính Khung Nhôm Slim - Kính Trà 5mm</option>
                          <option value="CanhKinh_Khoi">Cánh Kính Khung Nhôm Slim - Kính Xám Khói</option>
                          <option value="CanhKinh_Fluted">Cánh Kính Khung Nhôm Slim - Kính Sọc Fluted</option>
                          <option value="CanhKinh_Trong">Cánh Kính Khung Nhôm Slim - Kính Siêu Trong</option>
                        </optgroup>
                        <optgroup label="Gỗ Tự Nhiên &amp; Mộc Mạc">
                          <option value="Veneer">Phủ Veneer Sồi / Óc chó sơn PU mờ</option>
                          <option value="SonInchem">Sơn PU Inchem 5 lớp cao cấp tiêu chuẩn Mỹ</option>
                          <option value="LauDau_Rubio">Hoàn thiện lau dầu dưỡng gỗ mộc cao cấp</option>
                          <option value="CanhLongMay">Cánh khung gỗ lồng mây mắt cáo tự nhiên</option>
                        </optgroup>
                        <optgroup label="Bọc Da &amp; Bọc Nệm">
                          <option value="BocDa_Microfiber">Bọc Da Bò Nhân Tạo Microfiber cao cấp</option>
                          <option value="BocVai_Ni">Bọc Vải Nỉ Nhung Tuyết / Vải Bố Hàn Quốc</option>
                        </optgroup>
                        <optgroup label="Tân Cổ Điển Soi Pano">
                          <option value="Pano_CNC">Cánh phay Pano CNC sơn 2K tân cổ điển</option>
                        </optgroup>
                        <optgroup label="Tùy Chọn Khác">
                          <option value="CUSTOM">Tự nhập bề mặt / hoàn thiện tùy chỉnh...</option>
                        </optgroup>
                      </select>

                      {isCustomSurface && (
                        <div className="mt-2">
                          <input
                            type="text"
                            placeholder="Nhập tên hoặc quy cách bề mặt hoàn thiện..."
                            value={questionnaire.materials.surfaceCode}
                            onChange={(e) =>
                              setQuestionnaire((prev) => ({
                                ...prev,
                                materials: { ...prev.materials, surfaceCode: e.target.value },
                              }))
                            }
                            className="w-full p-2 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 5 CÂU HỎI THÀNH PHẦN KẾT CẤU ĐẶC THÙ */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Thành phần kết cấu &amp; vật liệu phụ trợ:
                    </label>

                    {/* Câu 1: Mặt đá */}
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-medium text-slate-900 block">Mặt đá tự nhiên / nhân tạo (0% OH)</span>
                          <span className="text-[11px] text-slate-500 block">
                            Đá Vicostone, Granite hoặc sứ nung kết (Mua đứt, không tính OH xưởng)
                          </span>
                        </div>

                        <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-slate-200">
                          <button
                            type="button"
                            onClick={() =>
                              setQuestionnaire((prev) => ({
                                ...prev,
                                materials: { ...prev.materials, hasStone: false },
                              }))
                            }
                            className={`px-3 py-1 text-xs font-medium rounded transition cursor-pointer ${
                              !questionnaire.materials.hasStone
                                ? "bg-slate-900 text-white"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            Không
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setQuestionnaire((prev) => ({
                                ...prev,
                                materials: { ...prev.materials, hasStone: true },
                              }))
                            }
                            className={`px-3 py-1 text-xs font-medium rounded transition cursor-pointer ${
                              questionnaire.materials.hasStone
                                ? "bg-slate-900 text-white shadow-xs"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            Có
                          </button>
                        </div>
                      </div>

                      {questionnaire.materials.hasStone && (
                        <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 mt-2 space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="text-[11px] font-bold text-zinc-700 block mb-1">Chủng loại đá:</label>
                              <select
                                value={questionnaire.materials.stoneType || "vicostone"}
                                onChange={(e) =>
                                  setQuestionnaire((prev) => ({
                                    ...prev,
                                    materials: { ...prev.materials, stoneType: e.target.value },
                                  }))
                                }
                                className="w-full p-1.5 bg-white border border-zinc-300 rounded text-xs font-sans"
                              >
                                <option value="vicostone">Đá Vicostone thạch anh nhân tạo cao cấp</option>
                                <option value="white_ceramic">Đá trắng sứ nhân tạo vân mây chống ố</option>
                                <option value="black_galaxy">Đá Granite Kim sa trung tự nhiên</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-zinc-700 block mb-1">Gia công cạnh mòi:</label>
                              <select
                                value={stoneEdge}
                                onChange={(e) => setStoneEdge(e.target.value as any)}
                                className="w-full p-1.5 bg-white border border-zinc-300 rounded text-xs font-sans"
                              >
                                <option value="bevel_45">Vát mòi 45° ghép liền khối (sang trọng)</option>
                                <option value="round_r">Bo tròn R5 cạnh đá</option>
                                <option value="flat">Mài vát mép thẳng tiêu chuẩn</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Câu 2: Kính / Cánh kính khung nhôm */}
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-medium text-slate-900 block">Kính cường lực / cánh kính khung nhôm</span>
                          <span className="text-[11px] text-slate-500 block">Kính 5mm/8mm hoặc nhôm hệ Slim nội thất</span>
                        </div>

                        <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-slate-200">
                          <button
                            type="button"
                            onClick={() =>
                              setQuestionnaire((prev) => ({
                                ...prev,
                                materials: { ...prev.materials, hasGlass: false },
                              }))
                            }
                            className={`px-3 py-1 text-xs font-medium rounded transition cursor-pointer ${
                              !questionnaire.materials.hasGlass
                                ? "bg-slate-900 text-white"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            Không
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setQuestionnaire((prev) => ({
                                ...prev,
                                materials: { ...prev.materials, hasGlass: true },
                              }))
                            }
                            className={`px-3 py-1 text-xs font-medium rounded transition cursor-pointer ${
                              questionnaire.materials.hasGlass
                                ? "bg-slate-900 text-white shadow-xs"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            Có
                          </button>
                        </div>
                      </div>

                      {questionnaire.materials.hasGlass && (
                        <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 mt-2 space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="text-[11px] font-bold text-zinc-700 block mb-1">Khung nhôm định hình:</label>
                              <select
                                value={glassFrame}
                                onChange={(e) => setGlassFrame(e.target.value as any)}
                                className="w-full p-1.5 bg-white border border-zinc-300 rounded text-xs font-sans"
                              >
                                <option value="slim_16">Nhôm Anode Slim 16mm (Hàn góc siêu mỏng)</option>
                                <option value="standard_20">Nhôm hệ 20mm tiêu chuẩn</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-zinc-700 block mb-1">Quy cách kính:</label>
                              <select
                                value={glassColor}
                                onChange={(e) => setGlassColor(e.target.value as any)}
                                className="w-full p-1.5 bg-white border border-zinc-300 rounded text-xs font-sans"
                              >
                                <option value="smoke">Kính tôi nhiệt 5mm màu xám khói</option>
                                <option value="tea">Kính tôi nhiệt 5mm màu trà</option>
                                <option value="ultra_clear">Kính siêu trong 8mm tôi nhiệt</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Câu 3: Khung kim loại sắt sơn / inox */}
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-medium text-slate-900 block">Khung kim loại (sắt sơn tĩnh điện / inox PVD)</span>
                        <span className="text-[11px] text-slate-500 block">Chân bàn làm việc, giá treo quần áo hoặc vách ngăn</span>
                      </div>

                      <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-slate-200">
                        <button
                          type="button"
                          onClick={() =>
                            setQuestionnaire((prev) => ({
                              ...prev,
                              materials: { ...prev.materials, hasMetal: false },
                            }))
                          }
                          className={`px-3 py-1 text-xs font-medium rounded transition cursor-pointer ${
                            !questionnaire.materials.hasMetal
                              ? "bg-slate-900 text-white"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          Không
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setQuestionnaire((prev) => ({
                              ...prev,
                              materials: { ...prev.materials, hasMetal: true },
                            }))
                          }
                          className={`px-3 py-1 text-xs font-medium rounded transition cursor-pointer ${
                            questionnaire.materials.hasMetal
                              ? "bg-slate-900 text-white shadow-xs"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          Có
                        </button>
                      </div>
                    </div>

                    {/* Câu 4: Bọc nệm / Da / Vải / Mây */}
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-medium text-slate-900 block">Bọc nệm, da, nỉ hoặc mây mắt cáo</span>
                        <span className="text-[11px] text-slate-500 block">Đầu giường bọc da microfiber, cánh tủ đan mây</span>
                      </div>

                      <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-slate-200">
                        <button
                          type="button"
                          onClick={() =>
                            setQuestionnaire((prev) => ({
                              ...prev,
                              materials: { ...prev.materials, hasUpholstery: false },
                            }))
                          }
                          className={`px-3 py-1 text-xs font-medium rounded transition cursor-pointer ${
                            !questionnaire.materials.hasUpholstery
                              ? "bg-slate-900 text-white"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          Không
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setQuestionnaire((prev) => ({
                              ...prev,
                              materials: { ...prev.materials, hasUpholstery: true },
                            }))
                          }
                          className={`px-3 py-1 text-xs font-medium rounded transition cursor-pointer ${
                            questionnaire.materials.hasUpholstery
                              ? "bg-slate-900 text-white shadow-xs"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          Có
                        </button>
                      </div>
                    </div>

                    {/* Câu 5: Đèn LED nội thất */}
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-medium text-slate-900 block">Hệ đèn LED nội thất &amp; cảm biến</span>
                          <span className="text-[11px] text-slate-500 block">Máng nhôm định hình, dây LED 12V, bộ nguồn và cảm ứng</span>
                        </div>

                        <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-slate-200">
                          <button
                            type="button"
                            onClick={() =>
                              setQuestionnaire((prev) => ({
                                ...prev,
                                materials: { ...prev.materials, hasLed: false },
                              }))
                            }
                            className={`px-3 py-1 text-xs font-medium rounded transition cursor-pointer ${
                              !questionnaire.materials.hasLed
                                ? "bg-slate-900 text-white"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            Không
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setQuestionnaire((prev) => ({
                                ...prev,
                                materials: { ...prev.materials, hasLed: true },
                              }))
                            }
                            className={`px-3 py-1 text-xs font-medium rounded transition cursor-pointer ${
                              questionnaire.materials.hasLed
                                ? "bg-slate-900 text-white shadow-xs"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            Có
                          </button>
                        </div>
                      </div>

                      {questionnaire.materials.hasLed && (
                        <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 mt-2 space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="text-[11px] font-bold text-zinc-700 block mb-1">Cảm biến đóng ngắt:</label>
                              <select
                                value={ledSensor}
                                onChange={(e) => setLedSensor(e.target.value as any)}
                                className="w-full p-1.5 bg-white border border-zinc-300 rounded text-xs font-sans"
                              >
                                <option value="door">Cảm biến đóng mở cánh (tự sáng khi mở tủ)</option>
                                <option value="wave">Cảm biến vẫy tay không chạm</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-zinc-700 block mb-1">Bộ nguồn hạ áp:</label>
                              <div className="p-1.5 bg-white border border-zinc-200 rounded text-xs text-zinc-700 font-mono">
                                Nguồn đũa 12V 60W nhôm tản nhiệt
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sub-configurator: Phân khúc phụ kiện & Độ khó gia công */}
                    <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="text-xs font-bold text-zinc-900 block mb-1">
                            Phân khúc phụ kiện kim khí (Hardware Tier):
                          </label>
                          <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-md border border-zinc-200">
                            {[
                              { id: "standard", label: "Tiêu chuẩn (DTC)" },
                              { id: "mid", label: "Trung cấp (Hafele)" },
                              { id: "luxury", label: "Cao cấp (Blum Áo)" },
                            ].map((tier) => (
                              <button
                                key={tier.id}
                                type="button"
                                onClick={() => setHardwareTier(tier.id as any)}
                                className={`py-1 text-[11px] font-bold rounded transition cursor-pointer text-center ${
                                  hardwareTier === tier.id
                                    ? "bg-zinc-900 text-white shadow-xs"
                                    : "text-zinc-600 hover:text-zinc-900"
                                }`}
                              >
                                {tier.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-zinc-900 block mb-1">
                            Hệ số độ khó gia công (Complexity Multiplier):
                          </label>
                          <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-md border border-zinc-200">
                            {[
                              { mult: 1.0, label: "1.0x Tiêu chuẩn", desc: "Cắt thẳng nẹp PVC" },
                              { mult: 1.25, label: "1.25x Tinh xảo", desc: "Vát mòi 45°, LED âm" },
                              { mult: 1.5, label: "1.50x May đo XK", desc: "Uốn cong, sơn 2K" },
                            ].map((item) => (
                              <button
                                key={item.mult}
                                type="button"
                                onClick={() => setComplexityMultiplier(item.mult)}
                                className={`py-1 text-[11px] font-bold rounded transition cursor-pointer text-center ${
                                  complexityMultiplier === item.mult
                                    ? "bg-zinc-900 text-white shadow-xs"
                                    : "text-zinc-600 hover:text-zinc-900"
                                }`}
                                title={item.desc}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KHỐI 3: CHI TIẾT & GHI CHÚ ĐẶC BIỆT */}
                <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-900 text-white font-bold text-[11px] flex items-center justify-center">
                        3
                      </span>
                      <h3 className="font-semibold text-slate-900 text-xs tracking-tight">
                        Chi tiết phụ kiện &amp; Ghi chú (Tùy chọn)
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-500">Để trống để hệ thống tự ước tính</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Số ngăn kéo (Hộc kéo ray trượt):
                      </label>
                      <input
                        type="number"
                        min={0}
                        placeholder="Để trống -> Tự nội suy theo kích thước"
                        value={questionnaire.details?.drawerCount ?? ""}
                        onChange={(e) => {
                          const val = e.target.value === "" ? undefined : Number(e.target.value);
                          setQuestionnaire((prev) => ({
                            ...prev,
                            details: { ...prev.details, drawerCount: val },
                          }));
                        }}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-zinc-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Số cánh cửa (Bản lề &amp; tay nắm):
                      </label>
                      <input
                        type="number"
                        min={0}
                        placeholder="Để trống -> Tự nội suy theo kích thước"
                        value={questionnaire.details?.doorCount ?? ""}
                        onChange={(e) => {
                          const val = e.target.value === "" ? undefined : Number(e.target.value);
                          setQuestionnaire((prev) => ({
                            ...prev,
                            details: { ...prev.details, doorCount: val },
                          }));
                        }}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-zinc-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Yêu cầu gia công &amp; Hoàn thiện đặc biệt:
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Cắt mòi vát 45 độ, ray âm nhấn mở, tay nắm âm nhôm..."
                      value={questionnaire.details?.specialNotes ?? ""}
                      onChange={(e) =>
                        setQuestionnaire((prev) => ({
                          ...prev,
                          details: { ...prev.details, specialNotes: e.target.value },
                        }))
                      }
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>

                {/* KHỐI 4: HẠNG MỤC PHỤ TRỢ & CHI PHÍ ĐẶC THÙ */}
                <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-zinc-900 text-white font-black text-xs flex items-center justify-center">
                        4
                      </span>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <span>Hạng mục phụ trợ &amp; Chi phí đặc thù</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-900 border border-zinc-200 font-semibold">
                            Tùy biến kết cấu
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Thêm bất kỳ vật tư, phụ kiện phụ trợ hoặc công đoạn đặc thù (Mây tre, Đá/kính, Sơn hiệu ứng, Ray điện từ...)
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAdhocForm(!showAdhocForm)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-black rounded-lg transition shadow-xs cursor-pointer border border-zinc-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm chi phí phát sinh</span>
                    </button>
                  </div>

                  {/* Danh sách các dòng Ad-hoc hiện có */}
                  {questionnaire.adhocLines && questionnaire.adhocLines.length > 0 ? (
                    <div className="space-y-2">
                      {questionnaire.adhocLines.map((line) => (
                        <div
                          key={line.lineId}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{line.description}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-semibold">
                                {line.blockName}
                              </span>
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded border bg-zinc-100 text-zinc-800 border-zinc-200">
                                {line.overheadTierOverride === "exempt_no_oh"
                                  ? "Miễn OH (0%)"
                                  : line.overheadTierOverride === "subcon_light"
                                  ? "OH Thầu phụ (10%)"
                                  : "OH Xưởng (25%)"}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              SL: <strong>{String(line.quantityOrExpression)}</strong> {line.unit} · Đơn giá: <strong>{formatVND(line.unitPrice)}</strong> · Hao hụt: +{((line.wasteRate || 0) * 100).toFixed(0)}%
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAdhocLine(line.lineId)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Xóa dòng này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 text-xs text-slate-500">
                      Chưa có dòng chi phí phát sinh. Bấm <strong className="text-zinc-900 font-semibold">[Thêm chi phí phát sinh]</strong> nếu sản phẩm có kết cấu hoặc phụ kiện nằm ngoài mẫu chuẩn.
                    </div>
                  )}

                  {/* Form thêm Ad-hoc Line mới */}
                  {showAdhocForm && (
                    <div className="p-4 rounded-xl border border-zinc-300 bg-zinc-50/50 space-y-3 animate-in fade-in duration-150 text-xs">
                      <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                        <span>Nhập thông số vật liệu / chi phí tự do mới:</span>
                        <button
                          type="button"
                          onClick={() => setShowAdhocForm(false)}
                          className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                        >
                          ✕ Đóng
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Tên vật liệu / Công đoạn (*):
                          </label>
                          <input
                            type="text"
                            placeholder="VD: Mây mắt cáo tự nhiên đan cánh..."
                            value={newAdhocLine.description || ""}
                            onChange={(e) => setNewAdhocLine({ ...newAdhocLine, description: e.target.value })}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-zinc-900 font-medium"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Khối hiển thị (Block):
                          </label>
                          <select
                            value={newAdhocLine.blockName || "CustomStructure"}
                            onChange={(e) => setNewAdhocLine({ ...newAdhocLine, blockName: e.target.value })}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-zinc-900 font-medium"
                          >
                            <option value="CustomStructure">CustomStructure (Kết cấu mở rộng)</option>
                            <option value="Carcass">Carcass (Thùng tủ)</option>
                            <option value="Fronts">Fronts (Cánh tủ &amp; Mặt tiền)</option>
                            <option value="Hardware">Hardware (Phụ kiện)</option>
                            <option value="Finishing">Finishing (Sơn / Hoàn thiện)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Nhóm chi phí (Cost Group Key):
                          </label>
                          <input
                            type="text"
                            placeholder="VD: rattan, smart_led, cnc_stone..."
                            value={newAdhocLine.costGroupKey || "custom_group"}
                            onChange={(e) => setNewAdhocLine({ ...newAdhocLine, costGroupKey: e.target.value })}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-zinc-900"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Mức tính chi phí chung (Overhead Tier):
                          </label>
                          <select
                            value={newAdhocLine.overheadTierOverride || "workshop_full"}
                            onChange={(e) => setNewAdhocLine({ ...newAdhocLine, overheadTierOverride: e.target.value as OverheadTier })}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-zinc-900"
                          >
                            <option value="workshop_full">workshop_full — Chịu OH Xưởng (25–35%)</option>
                            <option value="subcon_light">subcon_light — Chịu OH Thầu phụ (5–10%)</option>
                            <option value="exempt_no_oh">exempt_no_oh — Miễn OH (0% - Giá trị cao)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            ĐVT &amp; Số lượng / Biểu thức:
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="ĐVT: m2, md, tấm, bộ..."
                              value={newAdhocLine.unit || "m2"}
                              onChange={(e) => setNewAdhocLine({ ...newAdhocLine, unit: e.target.value })}
                              className="p-2 bg-white border border-slate-200 rounded-lg text-xs text-center"
                            />
                            <input
                              type="text"
                              placeholder="SL hoặc FACE_AREA*0.5"
                              value={newAdhocLine.quantityOrExpression ?? 1}
                              onChange={(e) => {
                                const val = e.target.value;
                                const num = Number(val);
                                setNewAdhocLine({
                                  ...newAdhocLine,
                                  quantityOrExpression: isNaN(num) || val.trim() === "" ? val : num,
                                });
                              }}
                              className="p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-right"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Đơn giá (VNĐ) &amp; Hao hụt (%):
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              min={0}
                              step={5000}
                              placeholder="Đơn giá VNĐ"
                              value={newAdhocLine.unitPrice || 0}
                              onChange={(e) => setNewAdhocLine({ ...newAdhocLine, unitPrice: Number(e.target.value) })}
                              className="p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-right"
                            />
                            <input
                              type="number"
                              min={0}
                              max={1}
                              step={0.05}
                              placeholder="0.1 = 10%"
                              value={newAdhocLine.wasteRate ?? 0.1}
                              onChange={(e) => setNewAdhocLine({ ...newAdhocLine, wasteRate: Number(e.target.value) })}
                              className="p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-right"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-600">
                          <input
                            type="checkbox"
                            checked={Boolean(newAdhocLine.saveToLibrary)}
                            onChange={(e) => setNewAdhocLine({ ...newAdhocLine, saveToLibrary: e.target.checked })}
                            className="rounded text-zinc-900 focus:ring-zinc-900"
                          />
                          <span>Lưu vật tư mới này vào Thư viện đơn giá xưởng</span>
                        </label>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowAdhocForm(false)}
                            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold cursor-pointer"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={handleAddAdhocLine}
                            className="px-4 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg font-bold shadow-xs cursor-pointer border border-zinc-800"
                          >
                            Xác nhận thêm
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* CỘT PHẢI: KIỂM SOÁT ĐỘ PHÂN GIẢI & GIẢ ĐỊNH KỸ THUẬT (4 CỘT - STICKY) */}
              <div className="lg:col-span-4 space-y-4 sticky top-4">
                <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 text-xs tracking-tight flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-zinc-900" />
                      <span>Dự Toán &amp; Giả Định Kỹ Thuật</span>
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 font-semibold border border-zinc-200">
                      Mức {questionnaire.estimationLevel || 2}
                    </span>
                  </div>

                  {/* Khung Giá Bán & Độ Tin Cậy (Dark Carbon Box) */}
                  <div className="p-4 rounded-lg bg-slate-900 text-white space-y-3">
                    {questionnaire.estimationLevel === 1 ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Khoảng giá dự toán sơ bộ:</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                            ±15% Dao động
                          </span>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
                          {formatVND(activeCosting.priceRange?.min || 0)} <span className="text-slate-500 font-normal text-sm">~</span> {formatVND(activeCosting.priceRange?.max || 0)}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Phản hồi nhanh trong 30s khi khách gửi ảnh Zalo
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Giá bán đề xuất:</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
                            {activeCosting.confidence.stars} Sao · {activeCosting.confidence.label}
                          </span>
                        </div>
                        <div className="text-2xl font-extrabold font-mono text-white tracking-tight">
                          {formatVND(activeCosting.summary.calculateSalesPrice)}
                        </div>
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 flex flex-col gap-1 pt-2 border-t border-slate-800 font-mono">
                      <div className="flex items-center justify-between">
                        <span>Giá vốn xưởng (COGS):</span>
                        <strong className="text-white font-mono">{formatVND(activeCosting.summary.cogs)}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Dự phòng rủi ro kỹ thuật:</span>
                        <span className="text-zinc-300 font-mono">
                          +{Math.round((activeCosting.contingencyRate || 0) * 100)}% ({formatVND(activeCosting.contingencyAmount || 0)})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Lợi nhuận mục tiêu:</span>
                        <span className="text-zinc-300 font-mono">+{((profitMargin - 1) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Danh sách 3 trạng thái tóm tắt quy cách */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-200">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-zinc-900" />
                        Sản phẩm:
                      </span>
                      <strong className="text-slate-900 truncate max-w-[130px] font-medium">{questionnaire.name || questionnaire.productType}</strong>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-200">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-zinc-900" />
                        Phủ bì W×D×H:
                      </span>
                      <strong className="text-slate-900 font-mono">
                        {questionnaire.dimensions.widthMm}×{questionnaire.dimensions.depthMm}×{questionnaire.dimensions.heightMm}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-200">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-zinc-900" />
                        Vật liệu &amp; Cốt:
                      </span>
                      <strong className="text-slate-900 truncate max-w-[130px]">
                        {questionnaire.materials.surfaceCode || questionnaire.materials.coreCode}
                      </strong>
                    </div>
                  </div>

                  {/* DANH SÁCH GIẢ ĐỊNH KỸ THUẬT (ASSUMPTIONS CHECKLIST) */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Giả Định Kỹ Thuật:</span>
                        <HelpTooltip content="Các chi tiết ngầm định tự sinh khi khách chưa có bản vẽ. Tích chọn để xác nhận chốt với khách." label="Giả định kỹ thuật" />
                      </label>
                      <span className="text-[10px] font-mono text-slate-500">
                        {(parametricCosting.assumptions || []).filter((a) => confirmedAssumptions[a]).length}/{(parametricCosting.assumptions || []).length} đã chốt
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
                      {(parametricCosting.assumptions || []).map((asm, idx) => {
                        const isConfirmed = !!confirmedAssumptions[asm];
                        return (
                          <div
                            key={idx}
                            onClick={() => toggleAssumption(asm)}
                            className={`p-2 rounded-lg border text-xs transition cursor-pointer flex items-start gap-2 ${
                              isConfirmed
                                ? "bg-zinc-50 border-zinc-300 text-zinc-900"
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isConfirmed}
                              onChange={() => {}}
                              className="mt-0.5 rounded border-slate-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                            />
                            <span className={`text-[11px] leading-tight ${isConfirmed ? "font-medium text-slate-900" : "text-slate-600"}`}>
                              {asm}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {(parametricCosting.assumptions || []).length > 0 && 
                     (parametricCosting.assumptions || []).filter((a) => confirmedAssumptions[a]).length < (parametricCosting.assumptions || []).length && (
                      <button
                        type="button"
                        onClick={handleConfirmAllAssumptions}
                        className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded transition text-center cursor-pointer"
                      >
                        Xác nhận toàn bộ giả định này
                      </button>
                    )}
                  </div>

                  {/* Nút hành động chính & Khóa hợp đồng */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleCalculateFromQuestionnaire}
                      className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition shadow-xs flex items-center justify-center gap-2 cursor-pointer border border-zinc-800"
                    >
                      <Calculator className="w-4 h-4 text-white" />
                      <span>{questionnaire.estimationLevel === 1 ? "Xem Phân Tích Khoảng Giá" : "Tính Toán Chi Phí & Sinh BOM"}</span>
                    </button>

                    {/* Cảnh báo khóa hợp đồng khi ở Mức 1 */}
                    {questionnaire.estimationLevel === 1 && (
                      <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-700 space-y-1.5">
                        <div className="flex items-center gap-1 font-semibold text-zinc-900">
                          <AlertCircle className="w-3.5 h-3.5 text-zinc-900" />
                          <span>Chưa thể xuất hợp đồng ở Mức 1</span>
                        </div>
                        <p className="leading-snug text-slate-600">
                          Mức 1 chỉ dùng để trả lời khách nhanh qua điện thoại/Zalo. Vui lòng chuyển sang Mức 2 để sinh BOM giả định hoặc Mức 4 để chốt giá chính thức.
                        </p>
                        <button
                          type="button"
                          onClick={() => setQuestionnaire((prev) => ({ ...prev, estimationLevel: 2 }))}
                          className="w-full py-1 px-2 bg-zinc-900 text-white rounded text-[10px] font-semibold hover:bg-black transition cursor-pointer"
                        >
                          Chuyển sang Mức 2 (Sinh BOM giả định)
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleResetQuestionnaire}
                        className="py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                        <span>Làm Mới</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleSaveProject();
                          showToast("Đã lưu nháp thông số sản phẩm thành công!");
                        }}
                        className="py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5 text-zinc-700" />
                        <span>Lưu Nháp</span>
                      </button>
                    </div>
                  </div>

                  {/* Khối gợi ý Dựng từ mẫu lịch sử */}
                  {similarItems.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-zinc-700" />
                        Dựng từ mẫu lịch sử gần nhất:
                      </span>
                      <div className="space-y-1.5">
                        {similarItems.slice(0, 2).map((item) => (
                          <div
                            key={item.id}
                            className="p-2 rounded-lg bg-slate-50 hover:bg-zinc-100/80 border border-slate-200 flex items-center justify-between text-[11px] transition"
                          >
                            <div className="truncate mr-2">
                              <span className="font-bold text-slate-800 block truncate">{item.productName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {item.dimensions.widthMm}×{item.dimensions.depthMm}×{item.dimensions.heightMm}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleBuildFromTemplate(item)}
                              className="px-2 py-1 bg-zinc-900 hover:bg-black text-white rounded text-[10px] font-semibold shrink-0 cursor-pointer"
                            >
                              Dựng mẫu này
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          ) : (
            <div className="space-y-6">
              {/* THANH ĐỐI CHIẾU CHÊNH LỆCH GIÁ DELTA VERSION TRACKING (BUG-05) */}
              <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-zinc-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                      Δ
                    </span>
                    <div>
                      <h3 className="font-bold text-xs text-zinc-900">
                        Đối Chiếu Chênh Lệch Giá: Mức 2 (BOM Giả Định) vs Mức 4 (BOM Chi Tiết CAD)
                      </h3>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Kế thừa 100% phụ kiện, đá, kính, LED &amp; nhân công đã chọn ở Mức 2 — Thay thế chính xác khối lượng ván và hạ dự phòng rủi ro từ +5% về 0%.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setInputTab("questionnaire");
                      setQuestionnaire((prev) => ({ ...prev, estimationLevel: 2 }));
                    }}
                    className="text-xs font-bold text-zinc-700 hover:text-zinc-900 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition whitespace-nowrap self-start sm:self-auto cursor-pointer"
                  >
                    ← Quay lại Mức 2
                  </button>
                </div>

                {(() => {
                  const priceLevel2 = activeCosting.summary.calculateSalesPrice;
                  const priceLevel4 = calcResult.totalQuotePrice;
                  const delta = priceLevel4 - priceLevel2;
                  const pct = priceLevel2 > 0 ? ((delta / priceLevel2) * 100).toFixed(1) : "0.0";
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                        <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">
                          Mức 2: Giá Theo Mẫu (+5% Dự Phòng)
                        </span>
                        <div className="text-base font-extrabold font-mono text-zinc-800 mt-1">
                          {formatVND(priceLevel2)}
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">BOM giả định ước tính nhanh</span>
                      </div>

                      <div className="p-3 rounded-lg bg-zinc-900 text-white border border-zinc-800">
                        <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">
                          Mức 4: Giá BOM CAD (0% Dự Phòng)
                        </span>
                        <div className="text-base font-extrabold font-mono text-white mt-1">
                          {formatVND(priceLevel4)}
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">Chuẩn phôi CNC {calcResult.totalSheets} tấm ván</span>
                      </div>

                      <div className={`p-3 rounded-lg border ${
                        delta < 0 ? "bg-emerald-50/50 border-emerald-200 text-emerald-950" : "bg-amber-50/50 border-amber-200 text-amber-950"
                      }`}>
                        <span className="text-[10px] font-mono uppercase text-zinc-500 block font-bold">
                          Chênh Lệch Thực Tế (Δ)
                        </span>
                        <div className="text-base font-extrabold font-mono mt-1">
                          {delta > 0 ? `+${formatVND(delta)}` : formatVND(delta)}
                        </div>
                        <span className="text-[10px] font-mono font-bold">
                          {delta < 0 ? `Tiết kiệm ${Math.abs(Number(pct))}% so với giá dự phòng` : `Tăng ${pct}% do diện tích chi tiết`}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="no-print bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-slate-900 text-white font-bold text-[11px] flex items-center justify-center">
                  1
                </span>
                <h3 className="font-semibold text-slate-900 text-xs tracking-tight">
                  Đầu vào: Kéo thả file Excel hoặc nạp mẫu
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Hỗ trợ file từ SketchUp, AutoCAD, Aspire (.xlsx, .csv)
              </span>
            </div>

        {/* Dropzone container */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? "border-zinc-900 bg-zinc-100"
              : "border-slate-200 hover:border-zinc-900 bg-slate-50/60 hover:bg-zinc-100/30"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />
          <div className="w-10 h-10 rounded-lg bg-zinc-900 text-white flex items-center justify-center shadow-xs">
            <Upload className="w-5 h-5 text-white" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-900">
              Kéo thả file {WORKSHOP_TERMS.cutlist.labelWithOriginal} vào đây, hoặc <span className="text-zinc-900 underline font-semibold">bấm để chọn file</span>
            </p>
            <p className="text-xs text-slate-500">
              File .xlsx hoặc .csv chứa 8 cột: Hạng mục, Tên chi tiết, Dài, Rộng, Dày, Số lượng, Mã vật liệu, Dán cạnh
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowPresetModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-lg transition shadow-xs cursor-pointer border border-zinc-800"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-zinc-400" />
              <span>Kho Mẫu Cấu Kiện Mẫu</span>
            </button>

            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition shadow-xs cursor-pointer"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-slate-500" />
              <span>Dán từ Excel (Clipboard)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHandbookModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition shadow-xs cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Sổ Tay Quy Cách &amp; Hao Hụt</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-zinc-700" />
              <span>Tải File Excel Mẫu (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* CẢNH BÁO MÃ VẬT TƯ LẠ CHƯA CÓ TRONG THƯ VIỆN ĐƠN GIÁ (no-print)    */}
      {/* ================================================================== */}
      {calcResult.missingPriceCodes && calcResult.missingPriceCodes.length > 0 && (
        <div className="no-print p-4 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-zinc-900 shrink-0" />
            <div>
              <p className="font-semibold">
                Phát hiện {calcResult.missingPriceCodes.length} mã ván chưa có trong Thư viện đơn giá xưởng:{" "}
                <span className="font-mono text-zinc-900 bg-white px-1.5 py-0.5 rounded font-bold border border-zinc-200">
                  {calcResult.missingPriceCodes.join(", ")}
                </span>
              </p>
              <p className="text-[11px] text-zinc-600">
                Hệ thống đang tạm áp đơn giá dự phòng 680.000 đ/tấm. Bạn có thể vào Thư viện Vật tư để khai báo giá xưởng chuẩn xác.
              </p>
            </div>
          </div>
          <Link
            href="/materials"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-black text-white font-semibold rounded-lg text-xs transition shrink-0 shadow-xs"
          >
            <span>Khai báo giá xưởng</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ================================================================== */}
      {/* BƯỚC 2: BẢNG CHỈNH SỬA CHI TIẾT TẤM (CUTLIST PARTS) (no-print)      */}
      {/* ================================================================== */}
      <div className="no-print bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden space-y-4">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">
              2
            </span>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span>{WORKSHOP_TERMS.cutlist.labelWithOriginal}</span>
                <HelpTooltip content={WORKSHOP_TERMS.cutlist.shortExplanation} label="Giải thích danh sách tấm" />
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                filteredParts.length !== parts.length
                  ? "bg-zinc-100 text-zinc-900 border border-zinc-300"
                  : "bg-slate-100 text-slate-700"
              }`}>
                {filteredParts.length !== parts.length
                  ? `${filteredParts.length} / ${parts.length} tấm`
                  : `${parts.length} tấm`}
              </span>
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Ô tìm kiếm nhanh */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm chi tiết, module, mã ván..."
                value={cutlistSearch}
                onChange={(e) => setCutlistSearch(e.target.value)}
                className="pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 w-40 sm:w-52"
              />
              {cutlistSearch && (
                <button
                  type="button"
                  onClick={() => setCutlistSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Nút bật tắt Phễu Lọc (Hiển thị khi Chế độ nâng cao BẬT hoặc khi đang lọc) */}
            {(advancedMode || activeCutlistFilterCount > 0) && (
              <button
                type="button"
                onClick={() => setShowCutlistFilter(!showCutlistFilter)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition shadow-xs cursor-pointer ${
                  activeCutlistFilterCount > 0
                    ? "bg-zinc-900 text-white shadow-xs"
                    : showCutlistFilter
                    ? "bg-slate-900 text-white"
                    : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Phễu Lọc</span>
                {activeCutlistFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-white text-zinc-900 font-mono text-[10px] flex items-center justify-center font-black">
                    {activeCutlistFilterCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setShowPresetModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-zinc-900 bg-zinc-100 hover:bg-zinc-100 border border-zinc-200 rounded-xl transition shadow-xs"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-zinc-900" />
              <span className="hidden sm:inline">Kho Mẫu Tủ</span>
            </button>

            <button
              onClick={handlePasteFromClipboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition shadow-xs"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Dán Excel</span>
            </button>

            <button
              onClick={handleAddPart}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm dòng</span>
            </button>
          </div>
        </div>

        {/* Khối Phễu Lọc Mở Rộng (Advanced Filter Funnel) */}
        {(showCutlistFilter || activeCutlistFilterCount > 0) && (
          <div className="bg-slate-50/90 border-b border-slate-200 p-3.5 space-y-3 animate-in fade-in duration-150">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 text-xs">
              {/* Lọc Hạng mục (Module) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <span>Hạng mục tủ:</span>
                </label>
                <select
                  value={cutlistModuleFilter}
                  onChange={(e) => setCutlistModuleFilter(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-zinc-900 focus:outline-none"
                >
                  <option value="all">-- Tất cả module ({uniqueModules.length}) --</option>
                  {uniqueModules.map((m) => (
                    <option key={m} value={m}>
                      {m} ({parts.filter((p) => p.moduleName === m).length})
                    </option>
                  ))}
                </select>
              </div>

              {/* Lọc Mã Vật Liệu */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <span>Mã vật liệu:</span>
                </label>
                <select
                  value={cutlistMaterialFilter}
                  onChange={(e) => setCutlistMaterialFilter(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium focus:border-zinc-900 focus:outline-none"
                >
                  <option value="all">-- Tất cả vật liệu ({uniqueMaterials.length}) --</option>
                  {uniqueMaterials.map((mat) => (
                    <option key={mat} value={mat}>
                      {mat} ({parts.filter((p) => p.materialCode === mat).length})
                    </option>
                  ))}
                </select>
              </div>

              {/* Lọc Độ Dày */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <span>Độ dày phôi:</span>
                </label>
                <select
                  value={cutlistThicknessFilter}
                  onChange={(e) => setCutlistThicknessFilter(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium focus:border-zinc-900 focus:outline-none"
                >
                  <option value="all">-- Tất cả độ dày --</option>
                  {uniqueThicknesses.map((thk) => (
                    <option key={thk} value={thk}>
                      {thk} mm ({parts.filter((p) => (p.thicknessMm ?? p.thickness ?? 17) === thk).length})
                    </option>
                  ))}
                </select>
              </div>

              {/* Lọc Dán Chỉ */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <span>Quy cách dán chỉ:</span>
                </label>
                <select
                  value={cutlistEdgeFilter}
                  onChange={(e) => setCutlistEdgeFilter(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-zinc-900 focus:outline-none"
                >
                  <option value="all">-- Tất cả dán chỉ --</option>
                  <option value="has_edge">Có dán chỉ (≥ 1 cạnh)</option>
                  <option value="4_sides">Dán đủ 4 cạnh (Cánh/Mặt bàn)</option>
                  <option value="3_sides">Dán 3 cạnh</option>
                  <option value="2_sides">Dán 2 cạnh</option>
                  <option value="1_side">Dán 1 cạnh</option>
                  <option value="no_edge">Không dán chỉ (Ván hậu/đáy âm)</option>
                </select>
              </div>

              {/* Lọc Kích thước */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <span>Kích thước tấm:</span>
                </label>
                <select
                  value={cutlistSizeFilter}
                  onChange={(e) => setCutlistSizeFilter(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-zinc-900 focus:outline-none"
                >
                  <option value="all">-- Tất cả kích thước --</option>
                  <option value="large">Tấm lớn kịch trần (&gt; 2.0m)</option>
                  <option value="medium">Tấm tiêu chuẩn (0.8m - 2.0m)</option>
                  <option value="small">Tấm nhỏ / Hộc kéo (&lt; 0.8m)</option>
                </select>
              </div>
            </div>

            {/* Thanh tiêu chí đang lọc & nút Reset */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-500 font-medium">Bộ lọc đang áp dụng:</span>
                {activeCutlistFilterCount === 0 && (
                  <span className="text-slate-400 italic">Chưa áp dụng phễu lọc nào</span>
                )}
                {cutlistSearch && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-900 font-semibold">
                    Từ khóa: &quot;{cutlistSearch}&quot;
                    <button type="button" onClick={() => setCutlistSearch("")} className="hover:text-zinc-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {cutlistModuleFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-semibold">
                    Module: {cutlistModuleFilter}
                    <button type="button" onClick={() => setCutlistModuleFilter("all")} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {cutlistMaterialFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-semibold font-mono">
                    Vật liệu: {cutlistMaterialFilter}
                    <button type="button" onClick={() => setCutlistMaterialFilter("all")} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {cutlistThicknessFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-semibold font-mono">
                    Độ dày: {cutlistThicknessFilter}mm
                    <button type="button" onClick={() => setCutlistThicknessFilter("all")} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {cutlistEdgeFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-semibold">
                    Chỉ dán: {cutlistEdgeFilter}
                    <button type="button" onClick={() => setCutlistEdgeFilter("all")} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {cutlistSizeFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-semibold">
                    Kích thước: {cutlistSizeFilter}
                    <button type="button" onClick={() => setCutlistSizeFilter("all")} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-600">
                  Hiển thị <strong>{filteredParts.length}</strong> / <strong>{parts.length}</strong> tấm
                </span>
                {activeCutlistFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetCutlistFilter}
                    className="inline-flex items-center gap-1 px-2 py-1 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition font-semibold"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Đặt lại</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bảng nhập chi tiết tấm */}
        <div className="overflow-x-auto max-h-[420px] p-2">
          <table className="w-full text-left text-xs border-collapse min-w-[720px]">
            <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200 z-10">
              <tr>
                <th className="p-2.5 w-10 text-center">STT</th>
                <th className="p-2.5">
                  <span className="inline-flex items-center gap-1">
                    <span>{WORKSHOP_TERMS.module.label}</span>
                    <HelpTooltip content={WORKSHOP_TERMS.module.shortExplanation} label="Giải thích hạng mục tủ" />
                  </span>
                </th>
                <th className="p-2.5">Tên Tấm Chi Tiết</th>
                <th className="p-2.5 text-right w-20">Dài (mm)</th>
                <th className="p-2.5 text-right w-20">Rộng (mm)</th>
                <th className="p-2.5 text-right w-16">Dày</th>
                <th className="p-2.5 text-right w-14">SL</th>
                <th className="p-2.5">Mã Vật Liệu</th>
                <th className="p-2.5 text-center w-36">Dán Chỉ (D1-D2-R1-R2)</th>
                <th className="p-2.5 text-center w-10">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500 space-y-2">
                    <Filter className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-semibold text-slate-700">Không có tấm chi tiết nào khớp với phễu lọc hiện tại.</p>
                    <button
                      type="button"
                      onClick={handleResetCutlistFilter}
                      className="px-3 py-1.5 bg-zinc-100 text-zinc-900 border border-zinc-200 rounded-lg text-xs font-bold hover:bg-zinc-100 transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Xóa toàn bộ bộ lọc</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredParts.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-zinc-100/30 transition">
                    {/* STT */}
                    <td className="p-2 text-center text-slate-400 font-mono text-[11px]" title={`Tấm #${parts.findIndex(x => x.id === p.id) + 1} trong cutlist`}>
                      {idx + 1}
                    </td>
                  
                  {/* Hạng mục */}
                  <td className="p-1">
                    <input
                      type="text"
                      value={p.moduleName}
                      onChange={(e) => handleUpdatePart(p.id, { moduleName: e.target.value })}
                      className="w-full p-1 bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-zinc-900 text-xs font-medium"
                    />
                  </td>

                  {/* Tên tấm */}
                  <td className="p-1">
                    <input
                      type="text"
                      value={p.partName}
                      onChange={(e) => handleUpdatePart(p.id, { partName: e.target.value })}
                      className="w-full p-1 font-semibold text-slate-900 bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-zinc-900 text-xs"
                    />
                  </td>

                  {/* Dài */}
                  <td className="p-1 text-right">
                    <input
                      type="number"
                      value={p.lengthMm ?? p.length ?? 0}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        handleUpdatePart(p.id, { lengthMm: val, length: val });
                      }}
                      className="w-20 text-right font-mono p-1 bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-zinc-900 text-xs font-bold"
                    />
                  </td>

                  {/* Rộng */}
                  <td className="p-1 text-right">
                    <input
                      type="number"
                      value={p.widthMm ?? p.width ?? 0}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        handleUpdatePart(p.id, { widthMm: val, width: val });
                      }}
                      className="w-20 text-right font-mono p-1 bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-zinc-900 text-xs font-bold"
                    />
                  </td>

                  {/* Dày */}
                  <td className="p-1 text-right">
                    <span className="font-mono text-slate-500 font-bold">{p.thicknessMm ?? p.thickness ?? 17}</span>
                  </td>

                  {/* Số lượng */}
                  <td className="p-1 text-right">
                    <input
                      type="number"
                      min={1}
                      value={p.qty}
                      onChange={(e) => handleUpdatePart(p.id, { qty: Math.max(1, Number(e.target.value)) })}
                      className="w-14 text-right font-mono p-1 bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-zinc-900 text-xs font-bold text-slate-900"
                    />
                  </td>

                  {/* Mã vật liệu */}
                  <td className="p-1">
                    <select
                      value={p.materialCode}
                      onChange={(e) => handleUpdatePart(p.id, { materialCode: e.target.value })}
                      className="p-1 bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-zinc-900 text-xs font-mono font-medium"
                    >
                      {boardMaterials.map((m) => (
                        <option key={m.code} value={m.code}>
                          {m.code} ({m.name})
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* 4 Cạnh dán chỉ D1-D2-R1-R2 với chỉ báo hình chữ nhật kỹ thuật */}
                  <td className="p-1">
                    <div className="flex items-center justify-center gap-1 font-mono text-[10px]">
                      <button
                        type="button"
                        onClick={() => handleUpdatePart(p.id, { edgeL1: !p.edgeL1 })}
                        className={`px-1.5 py-0.5 rounded border transition font-bold ${
                          p.edgeL1
                            ? "bg-zinc-100 text-zinc-900 border-zinc-300 shadow-2xs"
                            : "bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-700"
                        }`}
                        title="Dài 1 (Cạnh trên) - Bấm để bật/tắt dán chỉ"
                      >
                        D1
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdatePart(p.id, { edgeL2: !p.edgeL2 })}
                        className={`px-1.5 py-0.5 rounded border transition font-bold ${
                          p.edgeL2
                            ? "bg-zinc-100 text-zinc-900 border-zinc-300 shadow-2xs"
                            : "bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-700"
                        }`}
                        title="Dài 2 (Cạnh dưới) - Bấm để bật/tắt dán chỉ"
                      >
                        D2
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdatePart(p.id, { edgeW1: !p.edgeW1 })}
                        className={`px-1.5 py-0.5 rounded border transition font-bold ${
                          p.edgeW1
                            ? "bg-zinc-100 text-zinc-900 border-zinc-300 shadow-2xs"
                            : "bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-700"
                        }`}
                        title="Rộng 1 (Cạnh trái) - Bấm để bật/tắt dán chỉ"
                      >
                        R1
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdatePart(p.id, { edgeW2: !p.edgeW2 })}
                        className={`px-1.5 py-0.5 rounded border transition font-bold ${
                          p.edgeW2
                            ? "bg-zinc-100 text-zinc-900 border-zinc-300 shadow-2xs"
                            : "bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-700"
                        }`}
                        title="Rộng 2 (Cạnh phải) - Bấm để bật/tắt dán chỉ"
                      >
                        R2
                      </button>
                    </div>
                  </td>

                  {/* Xóa dòng */}
                  <td className="p-1 text-center">
                    <button
                      onClick={() => handleDeletePart(p.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 transition"
                      title="Xóa tấm này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>

        {/* Step 1 Footer Action Bar */}
        <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500">
            Dự án hiện có <strong>{parts.length}</strong> chi tiết phôi ván trong danh sách.
          </span>
          <button
            type="button"
            onClick={() => goToStep(2)}
            disabled={parts.length === 0}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition shadow-xs disabled:opacity-40 cursor-pointer"
          >
            <span>Tiếp tục: Xem Báo Giá &amp; Chiết Tính Giá Vốn</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
          )}
        </div>
      )}

      {/* ================================================================== */}
      {/* BƯỚC 2: KHU VỰC KẾT QUẢ: 2 TAB CHÍNH (XƯỞNG VS KHÁCH HÀNG)         */}
      {/* ================================================================== */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Banner Onboarding H5: Gợi ý sau lần demo đầu tiên */}
          {!isAuthenticated && (
            <div className="no-print p-4 rounded-lg bg-zinc-100 border border-zinc-200 text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-xs">
                    Bạn vừa trải nghiệm tính toán tự động với mẫu 48 chi tiết cấu kiện!
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Hãy tùy chỉnh đơn giá xưởng hoặc đăng nhập để lưu trữ dự án lên hệ thống quản trị xưởng.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => exportMaterialsTemplateExcel()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-900" />
                  <span>Tải Excel Mẫu Bảng Giá</span>
                </button>

                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-xs cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Đăng Nhập Ngay</span>
                </Link>
              </div>
            </div>
          )}

          <div className="space-y-4">
        
        {/* Tab switcher giữa các góc nhìn (no-print) */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveOutputTab("costing_sheet")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeOutputTab === "costing_sheet"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Costing Sheet V2 (Chiết Tính Giá Vốn)</span>
            </button>

            <button
              onClick={() => setActiveOutputTab("bom")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeOutputTab === "bom"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>BOM Đặt Vật Tư Xưởng</span>
            </button>

            <button
              onClick={() => setActiveOutputTab("quote")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeOutputTab === "quote"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Báo Giá Khách Hàng (Chuẩn In A4)</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-3">
            <span>
              Quy tắc làm tròn:{" "}
              <button
                onClick={() => setRoundingStep(roundingStep === 0.5 ? 1 : 0.5)}
                className="font-bold text-slate-900 underline font-mono"
              >
                {roundingStep === 0.5 ? "0.5 tấm" : "1.0 tấm"}
              </button>
            </span>
            <div className="h-3 w-px bg-slate-200" />
            <span>
              Giá vốn: <strong suppressHydrationWarning className="text-slate-900 font-mono">{formatVND(activeOutputTab === "costing_sheet" ? activeCosting.summary.cogs : calcResult.totalBaseCost)}</strong>
            </span>
            <div className="h-3 w-px bg-slate-200" />
            <span>
              Báo khách: <strong suppressHydrationWarning className="text-slate-900 font-mono">{formatVND(activeOutputTab === "costing_sheet" ? activeCosting.summary.calculateSalesPrice : calcResult.totalQuotePrice)}</strong>
            </span>
          </div>
        </div>

        {/* ================================================================ */}
        {/* TAB 0: COSTING SHEET V2: CHIẾT TÍNH GIÁ VỐN & ĐỘ TIN CẬY (no-print)*/}
        {/* ================================================================ */}
        {activeOutputTab === "costing_sheet" && (
          <div className="no-print space-y-6">
            {/* 3 KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">GIÁ BÁN ĐỀ XUẤT</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    +{((profitMargin - 1) * 100).toFixed(0)}% LỢI NHUẬN
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-900 font-mono">
                  {formatVND(activeCosting.summary.calculateSalesPrice)}
                </div>
                <p className="text-xs text-slate-500">Giá đề xuất gửi khách hàng (đã gồm chi phí + lợi nhuận mục tiêu)</p>
              </div>

              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">GIÁ VỐN TOÀN DIỆN (COGS)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    12 NHÓM CHI PHÍ
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-900 font-mono">
                  {formatVND(activeCosting.summary.cogs)}
                </div>
                <p className="text-xs text-slate-500">Vật tư + 37 công đoạn nhân công + Quản lý xưởng OH &amp; thầu phụ</p>
              </div>

              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">LỢI NHUẬN MỤC TIÊU</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    RÒNG DỰ TÍNH
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-900 font-mono">
                  {formatVND(activeCosting.summary.profitAmount)}
                </div>
                <p className="text-xs text-slate-500">Mức chênh lệch an toàn để đảm bảo dòng tiền &amp; tái đầu tư xưởng</p>
              </div>
            </div>

            {/* Confidence Rating & Checklist Banner */}
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs text-slate-900">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Độ tin cậy báo giá:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= parametricCosting.confidence.stars
                            ? "fill-zinc-800 text-zinc-900"
                            : "text-slate-200 fill-slate-100"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold font-mono">
                    ({parametricCosting.confidence.stars}/5 Sao - {parametricCosting.confidence.label})
                  </span>
                </div>
                <p className="text-xs text-slate-600">{parametricCosting.confidence.recommendation}</p>

                {/* Reasons & Checklist Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                  {parametricCosting.confidence.reasons.map((r, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-white text-slate-700 font-medium border border-slate-200">
                      • {r}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded-md bg-white text-slate-700 font-medium border border-slate-200">
                    ✓ {questionnaire.name} ({questionnaire.dimensions.widthMm} × {questionnaire.dimensions.depthMm} × {questionnaire.dimensions.heightMm} mm)
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white text-slate-700 font-medium border border-slate-200">
                    ✓ Cốt: {questionnaire.materials.coreCode} | {questionnaire.materials.surfaceCode}
                  </span>
                </div>
              </div>

              {/* Version & Export Button */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => exportCostingSheetExcel(projectName, projectVersionNo, clientName, parametricCosting)}
                  className="px-3.5 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer border border-zinc-800"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất Excel Costing Sheet</span>
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Báo Giá A4</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Stone Warning */}
            {questionnaire.materials.hasStone && (
              <div className="p-3.5 rounded-xl bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-zinc-900 shrink-0" />
                <span>
                  <strong>Lưu ý hạng mục Đá:</strong> Không áp dụng Overhead xưởng (0% OH). Giá đá chiếm ~30-35% giá vốn và dao động mạnh theo nhà cung cấp — Nên chốt mã đá thực tế trước khi ký hợp đồng.
                </span>
              </div>
            )}

            {/* Sub-tabs Navigation */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                  <button
                    type="button"
                    onClick={() => setCostingActiveTab("summary")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                      costingActiveTab === "summary"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    1. Tổng hợp COGS (12 Nhóm)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCostingActiveTab("material_labor")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                      costingActiveTab === "material_labor"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    2. Bảng vật tư chi tiết ({activeCosting.materialsLabor.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCostingActiveTab("labour")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                      costingActiveTab === "labour"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    3. Nhân công ({laborViewMode === "compact" ? "5 Phân xưởng" : "37 Công đoạn"})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCostingActiveTab("moq")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                      costingActiveTab === "moq"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    4. Bậc thang MOQ ({moqConfigTiers.length} bậc)
                  </button>
                  {similarItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCostingActiveTab("similar")}
                      className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                        costingActiveTab === "similar"
                          ? "bg-slate-900 text-white"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      5. Sản phẩm tương tự ({similarItems.length})
                    </button>
                  )}
                </div>

                <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                  Tổng COGS: <strong className="text-slate-900 font-bold">{formatVND(activeCosting.summary.cogs)}</strong>
                </span>
              </div>

              {/* Sub-tab 1: Summary 12 Nhóm */}
              {costingActiveTab === "summary" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Nhóm Chi Phí</th>
                        <th className="p-2.5">Mô Tả & Cơ Chế Phân Bổ</th>
                        <th className="p-2.5 text-right">Chi Phí (VNĐ)</th>
                        <th className="p-2.5 text-right">Tỷ Trọng %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { label: "1. Đá tự nhiên / Nhân tạo (Stone)", desc: "Mặt đá Vicostone/Marble (0% OH Xưởng)", amount: activeCosting.summary.stone, highlight: "0% OH" },
                        { label: "2. Bọc nệm / Da / Vải (Upholstery)", desc: "Mút xốp D40 + bọc da/nỉ cao cấp", amount: activeCosting.summary.upholstery },
                        { label: "3. Khung kim loại gia công ngoài", desc: "Chân bàn, tay nắm kim loại ngoài (10% OH)", amount: activeCosting.summary.metalFrameS },
                        { label: "4. Gia công ngoài / Thầu phụ", desc: "Cánh Acrylic bóng gương, gia công CNC ngoài (10% OH)", amount: activeCosting.summary.subContract },
                        { label: "5. Gỗ & Ván công nghiệp", desc: "Cốt MDF/HDF chống ẩm thùng & cánh tủ", amount: activeCosting.summary.wood },
                        { label: "6. Khung kim loại tự sản xuất", desc: "Khung sắt hộp xưởng tự cắt hàn sơn", amount: activeCosting.summary.metalFrameP },
                        { label: "7. Kính / Cánh kính khung nhôm", desc: "Kính cường lực / khung nhôm định hình", amount: activeCosting.summary.glass },
                        { label: "8. Hóa chất / Sơn / Dung môi", desc: "Sơn 2K, bả matit, keo dán chuyên dụng", amount: activeCosting.summary.chemical },
                        { label: "9. Phụ kiện kim khí (Hardware)", desc: "Bản lề giảm chấn, ray âm, tay nắm, LED", amount: activeCosting.summary.hardware },
                        { label: "10. Chỉ dán & Vật tư tiêu hao", desc: "Chỉ nẹp PVC, keo PUR, ốc vít cam", amount: activeCosting.summary.consumables },
                        { label: "11. Đóng gói & Vận chuyển", desc: "Màng PE, xốp nổ bọc góc, xe tải giao hàng", amount: activeCosting.summary.packingDelivery },
                        { label: "12. Tổng nhân công trực tiếp", desc: "Nhân công 37 công đoạn thực tế tại xưởng", amount: activeCosting.summary.laborCostTotal },
                      ].map((row, idx) => {
                        const pct = activeCosting.summary.cogs > 0
                          ? ((row.amount / activeCosting.summary.cogs) * 100).toFixed(1)
                          : "0.0";
                        return (
                          <tr key={idx} className="hover:bg-slate-50/60">
                            <td className="p-2.5 font-bold text-slate-800">{row.label}</td>
                            <td className="p-2.5 text-slate-500">
                              {row.desc}
                              {row.highlight && (
                                <span className="ml-2 px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-900 text-[10px] font-bold">
                                  {row.highlight}
                                </span>
                              )}
                            </td>
                            <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                              {formatVND(row.amount)}
                            </td>
                            <td className="p-2.5 text-right font-mono text-slate-500">
                              {pct}%
                            </td>
                          </tr>
                        );
                      })}
                      {activeCosting.summary.customGroups &&
                        Object.entries(activeCosting.summary.customGroups).map(([groupKey, amount], idx) => {
                          const pct = activeCosting.summary.cogs > 0
                            ? ((amount / activeCosting.summary.cogs) * 100).toFixed(1)
                            : "0.0";
                          return (
                            <tr key={`cg_${idx}`} className="hover:bg-slate-50/60 bg-zinc-50">
                              <td className="p-2.5 font-bold text-zinc-900 flex items-center gap-1.5">
                                <span>{groupKey}</span>
                                <span className="px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-900 text-[9px] font-mono font-semibold border border-zinc-200">Chi phí phụ trợ</span>
                              </td>
                              <td className="p-2.5 text-slate-500 text-[11px]">
                                Nhóm chi phí phụ trợ &amp; kết cấu đặc thù
                              </td>
                              <td className="p-2.5 text-right font-mono font-bold text-zinc-900">
                                {formatVND(amount)}
                              </td>
                              <td className="p-2.5 text-right font-mono text-zinc-900">
                                {pct}%
                              </td>
                            </tr>
                          );
                        })}
                      <tr className="bg-zinc-100 font-semibold">
                        <td className="p-2.5 text-zinc-900">+ OH Xưởng ({((activeCosting.summary.ohWorkshopRate) * 100).toFixed(0)}%)</td>
                        <td className="p-2.5 text-zinc-900 text-[11px]">Khấu hao máy CNC, nhà xưởng, điện 3 pha áp cho nhóm nội bộ</td>
                        <td className="p-2.5 text-right font-mono font-bold text-zinc-900">{formatVND(activeCosting.summary.ohWorkshopAmount)}</td>
                        <td className="p-2.5 text-right font-mono text-zinc-900">{activeCosting.summary.cogs > 0 ? ((activeCosting.summary.ohWorkshopAmount / activeCosting.summary.cogs) * 100).toFixed(1) : 0}%</td>
                      </tr>
                      <tr className="bg-sky-50/40 font-semibold">
                        <td className="p-2.5 text-sky-900">+ OH Thầu phụ ({((activeCosting.summary.ohSubcontractRate) * 100).toFixed(0)}%)</td>
                        <td className="p-2.5 text-sky-800 text-[11px]">Quản lý & rủi ro lắp đặt thầu phụ</td>
                        <td className="p-2.5 text-right font-mono font-bold text-sky-900">{formatVND(activeCosting.summary.ohSubcontractAmount)}</td>
                        <td className="p-2.5 text-right font-mono text-sky-800">{activeCosting.summary.cogs > 0 ? ((activeCosting.summary.ohSubcontractAmount / activeCosting.summary.cogs) * 100).toFixed(1) : 0}%</td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300">
                      <tr>
                        <td colSpan={2} className="p-2.5 text-slate-900 uppercase">TỔNG GIÁ VỐN TOÀN DIỆN (COGS)</td>
                        <td className="p-2.5 text-right font-mono text-slate-900 text-sm">
                          {formatVND(activeCosting.summary.cogs)}
                        </td>
                        <td className="p-2.5 text-right font-mono text-slate-900">100.0%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* Sub-tab 2: Material Labor Detail (Smart Editable Grid) */}
              {costingActiveTab === "material_labor" && (
                <div className="overflow-x-auto space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900">Bảng BOM Thông Minh:</span>
                      <span className="text-zinc-600">
                        Cho phép click sửa trực tiếp Số lượng, Đơn giá, % Hao hụt hoặc đổi mã vật tư từ kho 612 mã Sheet1.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPickingTargetRowId("NEW_ROW");
                        setCatalogDrawerOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-zinc-900 hover:bg-black rounded-lg transition shadow-xs cursor-pointer"
                    >
                      <Boxes className="w-3.5 h-3.5" />
                      <span>+ Thêm vật tư từ kho 612 mã</span>
                    </button>
                  </div>

                  <table className="w-full text-xs text-left border border-zinc-200 rounded-lg">
                    <thead className="bg-zinc-50 text-zinc-700 border-b border-zinc-200 font-semibold">
                      <tr>
                        <th className="p-2.5">Khối</th>
                        <th className="p-2.5 min-w-[220px]">Tên Chi Tiết / Vật Tư</th>
                        <th className="p-2.5 min-w-[150px]">Quy Chuẩn Kỹ Thuật</th>
                        <th className="p-2.5 text-center w-16">ĐVT</th>
                        <th className="p-2.5 text-right w-24">Khối Lượng</th>
                        <th className="p-2.5 text-right w-28">Đơn Giá (VNĐ)</th>
                        <th className="p-2.5 text-right w-20">Hao Hụt</th>
                        <th className="p-2.5 text-right w-28">Thành Tiền (VNĐ)</th>
                        <th className="p-2.5 text-center w-20">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {activeCosting.materialsLabor.map((row: any) => {
                        const isOvr = !!row.isOverridden;
                        return (
                          <tr key={row.id} className={`hover:bg-zinc-50/70 transition ${isOvr ? "bg-amber-50/30" : ""}`}>
                            <td className="p-2.5 align-middle">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
                                {row.block}
                              </span>
                            </td>

                            <td className="p-2.5 align-middle">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={row.name}
                                    onChange={(e) => handleUpdateBOMRow(row.id, { name: e.target.value })}
                                    className="font-bold text-zinc-900 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-zinc-300 focus:border-zinc-900 rounded px-1.5 py-0.5 text-xs w-full transition"
                                  />
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPickingTargetRowId(row.id);
                                      setCatalogDrawerOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-1.5 py-0.5 rounded font-mono transition cursor-pointer"
                                    title="Tra cứu 612 mã vật tư Sheet1 để thay thế"
                                  >
                                    <Boxes className="w-2.5 h-2.5" />
                                    <span>Đổi từ 612 mã</span>
                                  </button>

                                  {isOvr && (
                                    <>
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                        Đã sửa thủ công
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleResetBOMRow(row.id)}
                                        className="text-[10px] text-zinc-500 hover:text-zinc-900 flex items-center gap-0.5 hover:underline"
                                        title="Khôi phục mặc định ban đầu"
                                      >
                                        <RotateCcw className="w-2.5 h-2.5" />
                                        <span>↺ Mặc định</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="p-2.5 align-middle">
                              <input
                                type="text"
                                value={row.description || ""}
                                onChange={(e) => handleUpdateBOMRow(row.id, { description: e.target.value })}
                                className="text-[11px] text-zinc-500 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-zinc-300 focus:border-zinc-900 rounded px-1 py-0.5 w-full transition"
                              />
                            </td>

                            <td className="p-2.5 text-center align-middle">
                              <input
                                type="text"
                                value={row.unit}
                                onChange={(e) => handleUpdateBOMRow(row.id, { unit: e.target.value })}
                                className="text-center text-zinc-600 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-zinc-300 focus:border-zinc-900 rounded px-1 py-0.5 w-12 font-mono text-xs transition"
                              />
                            </td>

                            <td className="p-2.5 text-right align-middle">
                              <input
                                type="number"
                                step="any"
                                value={row.qty}
                                onChange={(e) => handleUpdateBOMRow(row.id, { qty: Math.max(0, parseFloat(e.target.value) || 0) })}
                                className="text-right font-mono font-bold text-zinc-900 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-zinc-300 focus:border-zinc-900 rounded px-1.5 py-0.5 w-20 text-xs transition"
                              />
                            </td>

                            <td className="p-2.5 text-right align-middle">
                              <input
                                type="number"
                                step="1000"
                                value={row.unitPrice}
                                onChange={(e) => handleUpdateBOMRow(row.id, { unitPrice: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                                className="text-right font-mono text-zinc-700 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-zinc-300 focus:border-zinc-900 rounded px-1.5 py-0.5 w-24 text-xs transition"
                              />
                            </td>

                            <td className="p-2.5 text-right align-middle">
                              <input
                                type="number"
                                step="0.01"
                                min="1"
                                max="3"
                                value={row.wasteFactor}
                                onChange={(e) => handleUpdateBOMRow(row.id, { wasteFactor: Math.max(1, parseFloat(e.target.value) || 1) })}
                                className="text-right font-mono text-zinc-500 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-zinc-300 focus:border-zinc-900 rounded px-1 py-0.5 w-16 text-xs transition"
                              />
                            </td>

                            <td className="p-2.5 text-right font-mono font-bold text-zinc-900 align-middle">
                              {formatVND(row.totalAmount)}
                            </td>

                            <td className="p-2.5 text-center align-middle">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDuplicateBOMRow(row)}
                                  className="p-1 rounded text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition cursor-pointer"
                                  title="Nhân bản dòng này"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBOMRow(row.id)}
                                  className="p-1 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                  title="Xóa dòng này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-zinc-600 font-mono">
                      Tổng {activeCosting.materialsLabor.length} dòng định mức (
                      {activeCosting.materialsLabor.filter((r: any) => r.isOverridden).length} dòng đã tinh chỉnh thủ công)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPickingTargetRowId("NEW_ROW");
                          setCatalogDrawerOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-900 bg-white hover:bg-zinc-50 border border-zinc-300 rounded-lg transition shadow-2xs cursor-pointer"
                      >
                        <Boxes className="w-3.5 h-3.5" />
                        <span>+ Tra cứu 612 mã Sheet1</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStep(1);
                          setShowAdhocForm(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-900 bg-zinc-200 hover:bg-zinc-300 border border-zinc-300 rounded-lg transition shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Thêm chi phí phát sinh</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 3: Labour Departments (37 Processes @ 105.000 đ/h with Dual View) */}
              {costingActiveTab === "labour" && (
                <div className="space-y-3">
                  {/* Action Bar for Labor Tab */}
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900">Đơn giá nhân công xưởng:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="5000"
                          value={laborHourlyRate}
                          onChange={(e) => setLaborHourlyRate(Math.max(10_000, parseInt(e.target.value, 10) || 105_000))}
                          className="w-24 px-2 py-1 text-xs font-mono font-bold text-zinc-900 bg-white border border-zinc-300 rounded focus:border-zinc-900 text-right"
                        />
                        <span className="text-zinc-500 font-mono text-[11px]">đ/giờ (4.2 USD/h)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-zinc-200/60 p-0.5 rounded-lg border border-zinc-300">
                      <button
                        type="button"
                        onClick={() => setLaborViewMode("compact")}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                          laborViewMode === "compact"
                            ? "bg-zinc-900 text-white shadow-2xs"
                            : "text-zinc-600 hover:text-zinc-900"
                        }`}
                      >
                        Chế độ Rút gọn (5 Phân xưởng)
                      </button>
                      <button
                        type="button"
                        onClick={() => setLaborViewMode("detailed")}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                          laborViewMode === "detailed"
                            ? "bg-zinc-900 text-white shadow-2xs"
                            : "text-zinc-600 hover:text-zinc-900"
                        }`}
                      >
                        Chế độ Chi tiết (37 Công đoạn)
                      </button>
                    </div>
                  </div>

                  {laborViewMode === "compact" ? (
                    <div className="overflow-x-auto border border-zinc-200 rounded-lg">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-zinc-50 text-zinc-700 border-b border-zinc-200 font-semibold">
                          <tr>
                            <th className="p-2.5">Phân Xưởng / Công Đoạn Chính</th>
                            <th className="p-2.5">Mã Nhóm</th>
                            <th className="p-2.5 text-right">Tổng Giờ Định Mức</th>
                            <th className="p-2.5 text-right">Đơn Giá / Giờ</th>
                            <th className="p-2.5 text-right">Thành Tiền (VNĐ)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {activeCosting.labourDepts.map((d, idx) => (
                            <tr key={idx} className="hover:bg-zinc-50/60 transition">
                              <td className="p-2.5 font-bold text-zinc-900">{d.name}</td>
                              <td className="p-2.5 text-zinc-500 font-mono text-[11px]">{d.department}</td>
                              <td className="p-2.5 text-right font-mono font-bold text-zinc-900">
                                {d.hours.toFixed(1)} h
                              </td>
                              <td className="p-2.5 text-right font-mono text-zinc-600">
                                {formatVND(d.hourlyRate)}
                              </td>
                              <td className="p-2.5 text-right font-mono font-bold text-zinc-900">
                                {formatVND(d.totalAmount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-zinc-100 font-bold border-t-2 border-zinc-300">
                          <tr>
                            <td colSpan={4} className="p-2.5 text-zinc-900 uppercase">TỔNG NHÂN CÔNG TRỰC TIẾP</td>
                            <td className="p-2.5 text-right font-mono text-zinc-900 text-sm">
                              {formatVND(activeCosting.summary.laborCostTotal)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-zinc-200 rounded-lg max-h-[500px]">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-zinc-50 text-zinc-700 border-b border-zinc-200 font-semibold sticky top-0 z-10 shadow-2xs">
                          <tr>
                            <th className="p-2 text-center w-10">STT</th>
                            <th className="p-2 w-16">Nhóm</th>
                            <th className="p-2 w-20">Mã CĐ</th>
                            <th className="p-2">Tên Công Đoạn (Tiếng Việt)</th>
                            <th className="p-2 text-zinc-400">Tên Tiếng Anh</th>
                            <th className="p-2 text-right w-24">Số Giờ (h)</th>
                            <th className="p-2 text-right w-28">Đơn Giá / h</th>
                            <th className="p-2 text-right w-28">Thành Tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {LABOR_PROCESSES.map((proc) => {
                            const ovr = laborProcessOverrides[proc.code];
                            const defaultHours = proc.code === "CNC" ? 1.5 : proc.code === "ASS" ? 2.5 : proc.code === "PACK" ? 1.0 : 0;
                            const hours = ovr?.hours !== undefined ? ovr.hours : defaultHours;
                            const rate = ovr?.rate !== undefined ? ovr.rate : laborHourlyRate;
                            const amount = Math.round(hours * rate);
                            return (
                              <tr key={proc.code} className={`hover:bg-zinc-50/70 transition ${hours > 0 ? "bg-zinc-50/40" : ""}`}>
                                <td className="p-2 text-center font-mono text-zinc-400 text-[11px]">{proc.stt}</td>
                                <td className="p-2 font-mono text-[10px] font-bold text-zinc-600">{proc.group}</td>
                                <td className="p-2 font-mono font-bold text-zinc-900 text-[11px]">{proc.code}</td>
                                <td className="p-2 font-semibold text-zinc-900">{proc.nameVi}</td>
                                <td className="p-2 text-zinc-400 text-[11px]">{proc.nameEn}</td>
                                <td className="p-2 text-right">
                                  <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={hours}
                                    onChange={(e) => handleUpdateLaborProcess(proc.code, { hours: Math.max(0, parseFloat(e.target.value) || 0) })}
                                    className="w-16 px-1.5 py-0.5 text-right font-mono font-bold text-zinc-900 bg-white border border-zinc-200 rounded focus:border-zinc-900 text-xs"
                                  />
                                </td>
                                <td className="p-2 text-right">
                                  <input
                                    type="number"
                                    step="5000"
                                    value={rate}
                                    onChange={(e) => handleUpdateLaborProcess(proc.code, { rate: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                                    className="w-20 px-1 py-0.5 text-right font-mono text-zinc-700 bg-white border border-zinc-200 rounded focus:border-zinc-900 text-xs"
                                  />
                                </td>
                                <td className="p-2 text-right font-mono font-bold text-zinc-900">
                                  {formatVND(amount)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-zinc-100 font-bold border-t-2 border-zinc-300 sticky bottom-0 z-10">
                          <tr>
                            <td colSpan={7} className="p-2.5 text-zinc-900 uppercase">TỔNG 37 CÔNG ĐOẠN NHÂN CÔNG</td>
                            <td className="p-2.5 text-right font-mono text-zinc-900 text-sm">
                              {formatVND(activeCosting.summary.laborCostTotal)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tab 4: MOQ Tiers (Dynamic Editable MOQ Matrix) */}
              {costingActiveTab === "moq" && (
                <div className="space-y-3">
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-zinc-900">Bảng bậc thang MOQ linh hoạt:</span>
                      <p className="text-zinc-500 text-[11px] mt-0.5">
                        Tự do thêm bậc, tùy chỉnh số lượng đặt hàng và tỷ lệ phụ phí (+120% cữ máy mẫu lẻ → 0% sản xuất lô).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddMoqTier}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-zinc-900 hover:bg-black rounded-lg transition shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Thêm bậc MOQ</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-zinc-200 rounded-lg">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-zinc-50 text-zinc-700 border-b border-zinc-200 font-semibold">
                        <tr>
                          <th className="p-2.5 w-36">Bậc Số Lượng (MOQ)</th>
                          <th className="p-2.5 w-36 text-right">Phụ Phí / Chiết Khấu</th>
                          <th className="p-2.5 text-right">Đơn Giá / Cái (VNĐ)</th>
                          <th className="p-2.5 text-right">Tổng Giá Trị Đơn Hàng (VNĐ)</th>
                          <th className="p-2.5 text-center w-16">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {moqConfigTiers.map((tier, idx) => {
                          const unitPrice = activeCosting.summary.moqPrices[tier.moq] || activeCosting.summary.calculateSalesPrice;
                          const total = tier.moq * unitPrice;
                          return (
                            <tr key={idx} className="hover:bg-zinc-50/60 transition">
                              <td className="p-2.5 font-bold text-zinc-900">
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min="1"
                                    value={tier.moq}
                                    onChange={(e) => handleUpdateMoqTier(idx, { moq: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                                    className="w-16 px-1.5 py-0.5 text-center font-mono font-bold text-zinc-900 bg-white border border-zinc-300 rounded text-xs"
                                  />
                                  <span className="text-zinc-600 text-xs">sản phẩm</span>
                                </div>
                              </td>

                              <td className="p-2.5 text-right font-mono">
                                <div className="flex items-center justify-end gap-1">
                                  <input
                                    type="number"
                                    value={tier.surchargePercent}
                                    onChange={(e) => handleUpdateMoqTier(idx, { surchargePercent: parseFloat(e.target.value) || 0 })}
                                    className="w-16 px-1.5 py-0.5 text-right font-mono font-bold text-zinc-900 bg-white border border-zinc-300 rounded text-xs"
                                  />
                                  <span className="text-zinc-500">%</span>
                                </div>
                              </td>

                              <td className="p-2.5 text-right font-mono font-bold text-zinc-900">
                                {formatVND(unitPrice)}
                              </td>

                              <td className="p-2.5 text-right font-mono font-black text-zinc-900">
                                {formatVND(total)}
                              </td>

                              <td className="p-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMoqTier(idx)}
                                  className="p-1 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                  title="Xóa bậc này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sub-tab 5: Similar Items */}
              {costingActiveTab === "similar" && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Hệ thống tự động tìm kiếm các sản phẩm cùng chủng loại và quy cách tương tự trong lịch sử dự án để đối chiếu giá:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {similarItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 hover:border-zinc-400 transition"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold text-slate-400">{item.projectCode}</span>
                          <h4 className="font-bold text-slate-900 text-xs">{item.productName}</h4>
                          <span className="text-[11px] font-mono text-slate-500">
                            {item.dimensions.widthMm} × {item.dimensions.depthMm} × {item.dimensions.heightMm} mm
                          </span>
                          <div className="text-xs font-mono font-bold text-slate-800">
                            Giá vốn: {formatVND(item.totalCost)}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleBuildFromTemplate(item)}
                          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-900 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                        >
                          Dựng mẫu này
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 1: BẢNG TỔNG HỢP VẬT TƯ (XƯỞNG) (no-print)                    */}
        {/* ================================================================ */}
        {activeOutputTab === "bom" && (
          <div className="no-print bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-900 border border-zinc-200 mb-1">
                  <span>{WORKSHOP_TERMS.bom.labelWithOriginal} - Nội bộ xưởng</span>
                  <HelpTooltip content={WORKSHOP_TERMS.bom.shortExplanation} label="Giải thích bảng đặt vật tư" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  {WORKSHOP_TERMS.bom.label} & Tính Giá Vốn Xưởng
                </h3>
                <p className="text-xs text-slate-500">
                  Tự động quy đổi ra số tấm ván chuẩn 1220x2440mm (đã cộng 15% hao hụt), tính mét dài chỉ dán cạnh và chi phí nhân công.
                </p>
              </div>

              <button
                onClick={() => {
                  exportWorkshopBOMExcel(
                    projectName,
                    calcResult.boards,
                    calcResult.edges,
                    calcResult.laborCost,
                    calcResult.totalBaseCost,
                    profile.costConfig
                  );
                  showToast("Đã xuất file Excel đặt ván nội bộ thành công!");
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-900 rounded-lg transition shadow-xs cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Xuất file Excel đặt hàng (.xlsx)</span>
              </button>
            </div>

            {/* Chi tiết Ván tấm */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-zinc-900" />
                <span>1. Danh sách ván tiêu chuẩn cần đặt mua (1220 x 2440 mm = 2.9768 m²)</span>
              </h4>
              <div className="rounded-xl border border-slate-200 overflow-x-auto text-xs">
                <table className="w-full text-left min-w-[620px]">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Mã ván & Tên chủng loại</th>
                      <th className="p-3 text-right">Diện tích Net (m²)</th>
                      <th className="p-3 text-right">Hệ số hao hụt</th>
                      <th className="p-3 text-right text-zinc-900 font-bold">Số tấm cần mua</th>
                      <th className="p-3 text-right">Đơn giá / tấm</th>
                      <th className="p-3 text-right">Thành tiền (VNĐ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {calcResult.boards.map((b) => (
                      <tr key={b.materialCode} className="hover:bg-slate-50/70">
                        <td className="p-3">
                          <span className="font-mono font-bold text-slate-900 block">{b.materialCode}</span>
                          <span className="text-[11px] text-slate-500">{b.materialName}</span>
                        </td>
                        <td className="p-3 text-right font-mono text-slate-600">{b.netAreaM2} m²</td>
                        <td className="p-3 text-right font-mono text-slate-500">+{Math.round((b.wasteFactor - 1) * 100)}% ({b.wasteFactor})</td>
                        <td className="p-3 text-right font-mono font-black text-zinc-900 text-sm">
                          {b.sheetsToBuy} tấm
                        </td>
                        <td className="p-3 text-right font-mono">{formatVND(b.unitPrice)}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">{formatVND(b.totalCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chi tiết Chỉ dán cạnh, Phụ kiện, Nhân công & Vật tư phụ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* 2. Chỉ dán cạnh */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">2. Chỉ dán cạnh PVC</span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mét dài (+8% hao hụt):</span>
                  <span className="font-mono font-bold text-slate-800">{calcResult.totalEdgeLengthMd} md</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số cuộn gợi ý (100m/cuộn):</span>
                  <span className="font-mono font-bold text-zinc-900">
                    {Math.ceil(calcResult.totalEdgeLengthMd / 100)} cuộn
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold">
                  <span>Tiền chỉ dán:</span>
                  <span className="font-mono text-slate-900">
                    {formatVND(calcResult.edges.reduce((sum, e) => sum + e.totalCost, 0))}
                  </span>
                </div>
              </div>

              {/* 3. Phụ kiện ước tính */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 block">3. Phụ kiện kim khí (Hệ 32mm)</span>
                  <HelpTooltip
                    content={`Ước tính theo cấu hình xưởng (${profile.costConfig?.hingesPerSheet ?? 2.0} bản lề/tấm, ${profile.costConfig?.slidesPerSheet ?? 0.35} bộ ray/tấm). Bạn có thể chỉnh lại tỷ lệ này trong trang Cài Đặt Hồ Sơ Xưởng.`}
                    label="Giải thích định mức phụ kiện xưởng"
                  />
                </div>
                <div className="text-[11px] text-zinc-900 bg-zinc-100 px-2 py-1 rounded-lg border border-zinc-200 font-medium">
                  Ước tính theo cấu hình xưởng ({profile.costConfig?.hingesPerSheet ?? 2.0} bản lề/tấm, {profile.costConfig?.slidesPerSheet ?? 0.35} bộ ray/tấm)
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bản lề Inox 304 giảm chấn:</span>
                  <span className="font-mono font-bold text-slate-800">~{Math.max(4, Math.round(calcResult.totalSheets * (profile.costConfig?.hingesPerSheet ?? 2.0)))} cái</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ray bi / ray âm 450mm:</span>
                  <span className="font-mono font-bold text-slate-800">~{Math.max(1, Math.round(calcResult.totalSheets * (profile.costConfig?.slidesPerSheet ?? 0.35)))} bộ</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold">
                  <span>Tiền phụ kiện:</span>
                  <span className="font-mono text-slate-900">{formatVND(calcResult.hardwareCost)}</span>
                </div>
              </div>

              {/* 4. Nhân công gia công & lắp đặt */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">4. Nhân công xưởng & Thợ lắp</span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Khối lượng cắt dán & gia công:</span>
                  <span className="font-mono font-bold text-slate-800">{calcResult.totalSheets} tấm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Đơn giá thợ xưởng:</span>
                  <span className="font-mono font-bold text-slate-800">120.000 đ/tấm</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold">
                  <span>Tiền nhân công:</span>
                  <span className="font-mono text-slate-900">{formatVND(calcResult.laborCost)}</span>
                </div>
              </div>

              {/* 5. Vật tư phụ & Vận chuyển */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">5. Vật tư phụ & Vận chuyển</span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Keo hạt dán cạnh EVA/PUR:</span>
                  <span className="font-mono text-slate-700">Theo số tấm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vít liên kết, màng PE:</span>
                  <span className="font-mono text-slate-700">Bọc bảo vệ hàng</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold">
                  <span>Tiền vật tư phụ:</span>
                  <span className="font-mono text-slate-900">{formatVND(calcResult.suppliesCost)}</span>
                </div>
              </div>

            </div>

            {/* Tóm tắt tổng giá vốn xưởng */}
            <div className="p-5 rounded-lg bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-extrabold text-sm block">TỔNG GIÁ VỐN VẬT TƯ &amp; NHÂN CÔNG:</span>
                <span className="text-slate-300 text-[11px]">Bao gồm đầy đủ 5 thành phần: Ván tấm, chỉ dán cạnh, phụ kiện, thợ gia công/lắp đặt và vật tư phụ/vận chuyển.</span>
              </div>
              <span className="text-2xl font-black text-zinc-300 font-mono">
                {formatVND(calcResult.totalBaseCost)}
              </span>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 2: BÁO GIÁ KHÁCH HÀNG (CHUẨN IN A4)                           */}
        {/* ================================================================ */}
        {activeOutputTab === "quote" && (
          <div className="space-y-4">
            
            {/* Thanh điều khiển Lãi & Biên lợi nhuận nhanh (no-print) */}
            <div className="no-print bg-zinc-100 rounded-lg border border-zinc-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-900">
              <div className="flex items-center gap-2 flex-wrap">
                <Sliders className="w-4 h-4 text-zinc-900 shrink-0" />
                <span className="flex items-center gap-1">
                  <strong>{WORKSHOP_TERMS.markup.label}:</strong> {formatPercentVi(calculateMarkupPercent(profitMargin), true)} (x{profitMargin.toFixed(2)})
                  <HelpTooltip content={WORKSHOP_TERMS.markup.shortExplanation} label="Giải thích lãi trên vốn" />
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <strong>{WORKSHOP_TERMS.profitMargin.label}:</strong> <span className="text-zinc-900 font-bold">{formatPercentVi(calculateProfitMarginPercent(profitMargin))}</span>
                  <HelpTooltip content={WORKSHOP_TERMS.profitMargin.shortExplanation} label="Giải thích biên lợi nhuận" />
                </span>
                <span className="text-slate-500 font-mono">(Lãi gộp: +{formatVND(calcResult.estimatedProfit)})</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1.1}
                  max={2.0}
                  step={0.05}
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(Number(e.target.value))}
                  className="w-44 accent-zinc-900"
                />
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 font-semibold text-xs text-white bg-slate-900 hover:bg-slate-800 rounded-md transition shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-zinc-300" />
                  <span>In / Tải PDF Báo Giá A4</span>
                </button>
              </div>
            </div>

            {/* Khung tờ giấy Báo Giá A4 thực tế (.print-area) */}
            <div className="print-area bg-white rounded-lg border border-slate-200 p-4 sm:p-8 md:p-12 shadow-md space-y-6 text-xs max-w-4xl mx-auto">
              
              {/* Header Tờ Báo Giá A4 */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-slate-800">
                <div className="space-y-1.5 max-w-md">
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    {profile.name || "XƯỞNG SẢN XUẤT NỘI THẤT HOÀNG GIA"}
                  </h2>
                  <p className="text-slate-600 text-xs">
                    Hotline / Zalo: <strong className="text-slate-900">{profile.phone || "0912 345 678"}</strong>
                  </p>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Địa chỉ: {profile.address || "Cụm Công Nghiệp Chàng Sơn, Thạch Thất, Hà Nội"}
                  </p>
                  {profile.bankName && (
                    <p className="text-slate-500 text-[11px]">
                      Tài khoản: <strong className="text-slate-800">{profile.accountNumber}</strong> ({profile.bankName} - {profile.accountName})
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex w-16 h-16 rounded-full border-2 border-zinc-700 border-dashed flex-col items-center justify-center text-center p-1 text-[7px] font-black text-zinc-900 rotate-[-8deg] shadow-xs bg-zinc-100">
                    <span className="uppercase tracking-tight leading-tight">ĐÃ KIỂM DUYỆT</span>
                    <span className="text-zinc-900 font-mono text-[8px] font-extrabold">ISO GỖ CNC</span>
                    <span className="text-[6px] text-zinc-400">2026-PASS</span>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="inline-block text-xs font-black px-3.5 py-1 rounded-md bg-slate-900 text-white tracking-widest uppercase">
                      BÁO GIÁ THI CÔNG
                    </span>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Số HĐ: <strong className="text-slate-800">HĐNT-2026-VN{editId ? editId.slice(0, 4).toUpperCase() : "889"}</strong>
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono" suppressHydrationWarning>
                      Ngày lập: {new Date().toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Thông tin dự án & Khách hàng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">CÔNG TRÌNH / DỰ ÁN:</span>
                  <strong className="text-slate-900 text-sm font-bold">{projectName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">KHÁCH HÀNG:</span>
                  <strong className="text-slate-900 text-sm font-bold">
                    {clientName} {clientPhone ? `(${clientPhone})` : ""}
                  </strong>
                </div>
              </div>

              {/* Bảng hạng mục báo giá gom theo Module */}
              <div className="space-y-2 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs min-w-[500px]">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-y border-slate-300">
                    <tr>
                      <th className="p-3 w-12 text-center">STT</th>
                      <th className="p-3">Hạng Mục Thành Phẩm</th>
                      <th className="p-3">Quy Cách & Chi Tiết Cấu Thành</th>
                      <th className="p-3 text-right">Số Tấm</th>
                      <th className="p-3 text-right">Thành Tiền (VNĐ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {calcResult.moduleQuotes.map((m, idx) => (
                      <tr key={m.moduleName}>
                        <td className="p-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-900">{m.moduleName}</td>
                        <td className="p-3 text-slate-600 text-[11px]">
                          {m.description || "Gỗ MDF chống ẩm phủ Melamine, dán cạnh chỉ PVC đồng màu, phụ kiện bản lề giảm chấn"}
                        </td>
                        <td className="p-3 text-right font-mono text-slate-500">{m.partCount}</td>
                        <td className="p-3 text-right font-mono font-black text-slate-900 text-sm">
                          {formatVND(m.quotePrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tổng cộng thanh toán */}
              <div className="pt-4 border-t-2 border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                <div>
                  <span className="font-black text-slate-900 text-sm block">TỔNG CỘNG THANH TOÁN:</span>
                  <span className="text-slate-500 text-[11px]">Đã bao gồm chi phí gia công, vận chuyển và lắp đặt hoàn thiện.</span>
                </div>
                <span className="text-2xl font-black text-zinc-900 font-mono">
                  {formatVND(calcResult.totalQuotePrice)}
                </span>
              </div>

              {/* Điều khoản & Cam kết của xưởng chuẩn thương mại */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 font-bold uppercase text-[10px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-900" />
                    ĐIỀU KHOẢN & TIÊU CHUẨN KỸ THUẬT BẢO HÀNH:
                  </strong>
                  <span className="font-mono text-[10px] text-slate-400">TIÊU CHUẨN XƯỞNG CNC</span>
                </div>
                <ul className="space-y-1 list-disc list-inside text-slate-600 text-[10px] leading-relaxed">
                  <li><strong>Quy cách vật tư:</strong> 100% cốt ván MDF chống ẩm lõi xanh HMR V313 đạt tiêu chuẩn phát thải E1/E2. Dán cạnh chỉ PVC đồng màu bằng keo hạt PUR chống nước cạnh.</li>
                  <li><strong>Thời gian thi công:</strong> Hoàn thiện gia công và lắp đặt trong 07 – 10 ngày làm việc kể từ ngày thống nhất mẫu ván.</li>
                  <li><strong>Chính sách bảo hành:</strong> Bảo hành 24 tháng đối với kết cấu gỗ công nghiệp, 12 tháng đối với phụ kiện kim khí (ray trượt, bản lề).</li>
                  <li><strong>Tiến độ thanh toán:</strong> Đợt 1 tạm ứng 50% khi duyệt mẫu ván & ký hợp đồng; Đợt 2 thanh toán 50% sau khi nghiệm thu bàn giao hoàn thiện.</li>
                </ul>
              </div>

              {/* Ghi chú miễn trừ pháp lý theo Hiến Pháp GEMINI.md 5.4 */}
              <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400 italic">
                {LEGAL_DISCLAIMER}
              </div>

              {/* Chữ ký 2 bên */}
              <div className="pt-8 grid grid-cols-2 text-center text-xs">
                <div>
                  <strong className="block text-slate-900 font-bold uppercase">ĐẠI DIỆN KHÁCH HÀNG</strong>
                  <span className="text-slate-400 text-[10px]">(Ký & ghi rõ họ tên)</span>
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold uppercase">ĐẠI DIỆN XƯỞNG SẢN XUẤT</strong>
                  <span className="text-slate-400 text-[10px]">(Ký & đóng dấu)</span>
                </div>
              </div>

            </div>

            {/* Nút in ở cuối trang (no-print) */}
            <div className="no-print flex justify-center pt-2">
              <button
                type="button"
                onClick={handlePrintA4}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-900 rounded-xl transition shadow-md shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>In / Xuất PDF Báo Giá A4 Ngay</span>
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Step 2 Footer Navigation Bar */}
      <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-lg border border-slate-200 shadow-2xs">
        <button
          type="button"
          onClick={() => goToStep(1)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại sửa phôi ván (Bước 1)</span>
        </button>
        <button
          type="button"
          onClick={() => goToStep(3)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition shadow-xs cursor-pointer"
        >
          <span>Tiếp tục: Xuất File &amp; In Ấn (Bước 3)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )}

  {/* ================================================================== */}
  {/* BƯỚC 3: TRUNG TÂM XUẤT FILE & IN ẤN (ACTION HUB & A4 LIVE PREVIEW)  */}
  {/* ================================================================== */}
  {currentStep === 3 && (
    <div className="space-y-6">
      {/* Action Hub: 4 Thẻ Hành Động Chính (Web-Twin Pure White Cards) */}
      <div className="no-print bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-5">
        
        {/* CẢNH BÁO CỔNG KHÓA HỢP ĐỒNG (BUG-06) */}
        {(() => {
          const unconfirmed = (activeCosting.assumptions || []).filter((a) => !confirmedAssumptions[a]);
          if (unconfirmed.length === 0) return null;
          return (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <span className="font-bold text-amber-950">
                    Chưa đủ điều kiện ký Hợp đồng thi công chính thức:
                  </span>{" "}
                  <span className="text-amber-900">
                    Còn {unconfirmed.length} giả định kỹ thuật ở Mức 2 chưa được xác nhận. Vui lòng xác nhận hoặc xuất bản Báo Giá Sơ Bộ.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleConfirmAllAssumptions}
                className="px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-lg transition whitespace-nowrap self-start sm:self-auto cursor-pointer"
              >
                ✓ Xác nhận tất cả giả định ngay
              </button>
            </div>
          );
        })()}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xs font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-slate-900 text-white font-bold text-[11px] flex items-center justify-center">
                3
              </span>
              Trung Tâm Xuất File &amp; In Báo Giá A4
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Lựa chọn định dạng xuất phù hợp cho đại lý vật tư xưởng, máy cắt CNC hoặc gửi trực tiếp cho khách hàng.
            </p>
          </div>

          {/* Tóm tắt nhanh số liệu */}
          <div className="flex items-center gap-3 text-xs font-mono bg-slate-50 p-2.5 rounded-md border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Tổng Ván:</span>
              <strong className="text-slate-900 font-bold">{calcResult.totalSheets} tấm</strong>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Báo Giá Khách:</span>
              <strong className="text-zinc-900 font-bold">{formatVND(calcResult.totalQuotePrice)}</strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Xuất Excel BOM Xưởng */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-zinc-400 transition flex flex-col justify-between space-y-3 shadow-2xs">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">BOM Vật Tư Xưởng (.xlsx)</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Bóc tách chi tiết từng tấm ván cần mua, mét dài chỉ PVC, phụ kiện liên kết và nhân công để gửi đại lý vật liệu.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleExportWorkshopBOM}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-900 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Tải Excel BOM Xưởng</span>
            </button>
          </div>

          {/* Card 2: Xuất Excel Costing Sheet V2 Chiết Tính Giá Vốn */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-sky-300 transition flex flex-col justify-between space-y-3 shadow-2xs">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Costing Sheet V2 (.xlsx)</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Bảng tổng hợp chi phí 12 danh mục, phân bổ OH đa tầng (Đá 0%, Xưởng 25-35%, Thầu phụ 10%), 37 công đoạn nhân công và bậc thang MOQ.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => exportCostingSheetExcel(projectName, projectVersionNo, clientName, activeCosting)}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Tải Excel Costing Sheet</span>
            </button>
          </div>

          {/* Card 3: In / Xuất PDF Báo Giá A4 & Ký Hợp Đồng (BUG-06) */}
          {(() => {
            const unconfirmedCount = (activeCosting.assumptions || []).filter((a) => !confirmedAssumptions[a]).length;
            const isContractLocked = unconfirmedCount > 0;
            return (
              <div className="p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-400 transition flex flex-col justify-between space-y-3 shadow-2xs">
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900">In Báo Giá A4 &amp; Hợp Đồng</h3>
                    <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
                      Báo giá trang trọng gửi khách hàng hoặc xuất hợp đồng thi công chính thức.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handlePrintA4}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Xuất Báo Giá Sơ Bộ (A4)</span>
                  </button>

                  <button
                    type="button"
                    disabled={isContractLocked}
                    onClick={() => {
                      if (!isContractLocked) {
                        handlePrintA4();
                        showToast("Đang chuẩn bị bản Hợp đồng thi công chính thức!", "success");
                      }
                    }}
                    className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition border ${
                      isContractLocked
                        ? "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 cursor-pointer shadow-xs"
                    }`}
                    title={isContractLocked ? `Còn ${unconfirmedCount} giả định kỹ thuật chưa xác nhận` : "Đã đủ điều kiện ký hợp đồng chính thức"}
                  >
                    {isContractLocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Khóa Hợp Đồng ({unconfirmedCount})</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Ký Hợp Đồng Thi Công</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Card 4: Chia Sẻ Báo Giá An Toàn (Secure Link) */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 hover:border-indigo-300 transition flex flex-col justify-between space-y-3 shadow-2xs">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-indigo-950">Chia Sẻ Link Báo Giá</h3>
                <p className="text-[11px] text-indigo-800 mt-1 leading-relaxed">
                  Tạo link bảo mật gửi trực tiếp qua Zalo/Email cho khách xem trên điện thoại, che 100% giá vốn nội bộ.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Tạo Link Chia Sẻ</span>
            </button>
          </div>

          {/* Card 5: Lưu Dự Án Đám Mây */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400 transition flex flex-col justify-between space-y-3 shadow-2xs">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Save className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Lưu Dự Án Lịch Sử</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Lưu trữ đám mây xưởng, chụp bảo toàn đơn giá ngày tạo (Snapshot Pricing) và hỗ trợ quản lý vòng đời dự án.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSaveProject}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Vào Kho Dự Án</span>
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Live Preview of A4 Sheet (no-print preview wrapper, print-area when printing) */}
      <div className="space-y-3">
        <div className="no-print flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4 text-slate-500" />
            Xem trước Báo giá chuẩn A4 gửi khách
          </span>
          <button
            type="button"
            onClick={handlePrintA4}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-900 hover:text-zinc-900 font-bold cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Mở hộp thoại in / xuất PDF</span>
          </button>
        </div>

        {/* Khung tờ giấy Báo Giá A4 thực tế (.print-area) */}
        <div className="print-area bg-white rounded-lg border border-slate-200 p-4 sm:p-8 md:p-12 shadow-md space-y-6 text-xs max-w-4xl mx-auto">
          {/* Header Tờ Báo Giá A4 */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-slate-800">
            <div className="space-y-1.5 max-w-md">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                {profile.name || "XƯỞNG SẢN XUẤT NỘI THẤT HOÀNG GIA"}
              </h2>
              <p className="text-slate-600 text-xs">
                Hotline / Zalo: <strong className="text-slate-900">{profile.phone || "0912 345 678"}</strong>
              </p>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Địa chỉ: {profile.address || "Cụm Công Nghiệp Chàng Sơn, Thạch Thất, Hà Nội"}
              </p>
              {profile.bankName && (
                <p className="text-slate-500 text-[11px]">
                  Tài khoản: <strong className="text-slate-800">{profile.accountNumber}</strong> ({profile.bankName} - {profile.accountName})
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex w-16 h-16 rounded-full border-2 border-zinc-700 border-dashed flex-col items-center justify-center text-center p-1 text-[7px] font-black text-zinc-900 rotate-[-8deg] shadow-xs bg-zinc-100">
                <span className="uppercase tracking-tight leading-tight">ĐÃ KIỂM DUYỆT</span>
                <span className="text-zinc-900 font-mono text-[8px] font-extrabold">ISO GỖ CNC</span>
                <span className="text-[6px] text-zinc-400">2026-PASS</span>
              </div>

              <div className="text-right space-y-1">
                <span className="inline-block text-xs font-black px-3.5 py-1 rounded-md bg-slate-900 text-white tracking-widest uppercase">
                  BÁO GIÁ THI CÔNG
                </span>
                <p className="text-[11px] text-slate-500 font-mono">
                  Số HĐ: <strong className="text-slate-800">HĐNT-2026-VN{editId ? editId.slice(0, 4).toUpperCase() : "889"}</strong>
                </p>
                <p className="text-[10px] text-slate-400 font-mono" suppressHydrationWarning>
                  Ngày lập: {new Date().toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin dự án & Khách hàng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 rounded-md bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-bold">CÔNG TRÌNH / DỰ ÁN:</span>
              <strong className="text-slate-900 text-sm font-bold">{projectName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold">KHÁCH HÀNG:</span>
              <strong className="text-slate-900 text-sm font-bold">
                {clientName} {clientPhone ? `(${clientPhone})` : ""}
              </strong>
            </div>
          </div>

          {/* Bảng hạng mục báo giá gom theo Module */}
          <div className="space-y-2 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[500px]">
              <thead className="bg-slate-100 text-slate-700 font-bold border-y border-slate-300">
                <tr>
                  <th className="p-3 w-12 text-center">STT</th>
                  <th className="p-3">Hạng Mục Thành Phẩm</th>
                  <th className="p-3">Quy Cách & Chi Tiết Cấu Thành</th>
                  <th className="p-3 text-right">Số Tấm</th>
                  <th className="p-3 text-right">Thành Tiền (VNĐ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {calcResult.moduleQuotes.map((m, idx) => (
                  <tr key={m.moduleName}>
                    <td className="p-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900">{m.moduleName}</td>
                    <td className="p-3 text-slate-600 text-[11px]">
                      {m.description || "Gỗ MDF chống ẩm phủ Melamine, dán cạnh chỉ PVC đồng màu, phụ kiện bản lề giảm chấn"}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-500">{m.partCount}</td>
                    <td className="p-3 text-right font-mono font-black text-slate-900 text-sm">
                      {formatVND(m.quotePrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tổng cộng thanh toán */}
          <div className="pt-4 border-t-2 border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
            <div>
              <span className="font-black text-slate-900 text-sm block">TỔNG CỘNG THANH TOÁN:</span>
              <span className="text-slate-500 text-[11px]">Đã bao gồm chi phí gia công, vận chuyển và lắp đặt hoàn thiện.</span>
            </div>
            <span className="text-2xl font-black text-zinc-900 font-mono">
              {formatVND(calcResult.totalQuotePrice)}
            </span>
          </div>

          {/* Điều khoản & Cam kết của xưởng chuẩn thương mại */}
          <div className="p-4 rounded-md bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
            <div className="flex items-center justify-between">
              <strong className="text-slate-900 font-bold uppercase text-[10px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-zinc-900" />
                ĐIỀU KHOẢN &amp; TIÊU CHUẨN KỸ THUẬT BẢO HÀNH:
              </strong>
              <span className="font-mono text-[10px] text-slate-400">TIÊU CHUẨN XƯỞNG CNC</span>
            </div>
            <ul className="space-y-1 list-disc list-inside text-slate-600 text-[10px] leading-relaxed">
              <li><strong>Quy cách vật tư:</strong> 100% cốt ván đạt chuẩn chất lượng, bề mặt sắc nét, dán cạnh chỉ đồng màu bằng keo PUR chống ẩm.</li>
              <li><strong>Thời gian thi công:</strong> Hoàn thiện gia công và lắp đặt trong 07 – 10 ngày làm việc kể từ ngày thống nhất mẫu.</li>
              <li><strong>Chính sách bảo hành:</strong> Bảo hành 24 tháng đối với kết cấu nội thất, 12 tháng đối với phụ kiện kim khí.</li>
              <li><strong>Tiến độ thanh toán:</strong> Đợt 1 tạm ứng 50% khi duyệt mẫu &amp; ký hợp đồng; Đợt 2 thanh toán 50% sau khi nghiệm thu bàn giao hoàn thiện.</li>
            </ul>
          </div>

          {/* Ghi chú miễn trừ pháp lý theo Hiến Pháp GEMINI.md 5.4 */}
          <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400 italic">
            {LEGAL_DISCLAIMER}
          </div>

          {/* Chữ ký 2 bên */}
          <div className="pt-8 grid grid-cols-2 text-center text-xs">
            <div>
              <strong className="block text-slate-900 font-bold uppercase">ĐẠI DIỆN KHÁCH HÀNG</strong>
              <span className="text-slate-400 text-[10px]">(Ký &amp; ghi rõ họ tên)</span>
            </div>
            <div>
              <strong className="block text-slate-900 font-bold uppercase">ĐẠI DIỆN XƯỞNG SẢN XUẤT</strong>
              <span className="text-slate-400 text-[10px]">(Ký &amp; đóng dấu)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3 Footer Navigation Bar */}
      <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-lg border border-slate-200 shadow-2xs">
        <button
          type="button"
          onClick={() => goToStep(2)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại Xem Báo Giá &amp; BOM (Bước 2)</span>
        </button>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => goToStep(1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold rounded-md transition cursor-pointer"
          >
            <span>Về Bước 1 (Sửa thông số)</span>
          </button>
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-md transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Chia sẻ link</span>
          </button>
          <button
            type="button"
            onClick={handlePrintA4}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In Báo Giá A4 Ngay</span>
          </button>
        </div>
      </div>
    </div>
  )}

      {/* ================================================================== */}
      {/* MODAL ÁNH XẠ CỘT THÔNG MINH (SMART COLUMN MAPPING MODAL)           */}
      {/* ================================================================== */}
      {showMappingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xl max-w-lg w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Sparkles className="w-5 h-5 text-zinc-900" />
                <h3>Ánh Xạ Cột Excel Tự Động (Smart Mapping)</h3>
              </div>
              <button
                onClick={() => setShowMappingModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Hệ thống đã nhận diện được các cột trong file Excel của bạn. Vui lòng kiểm tra lại để bóc tách kích thước chuẩn xác 100%:
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Chiều Dài (mm) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={columnMapping.length}
                  onChange={(e) => setColumnMapping({ ...columnMapping, length: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                >
                  <option value="">-- Chọn cột dài --</option>
                  {excelHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Chiều Rộng (mm) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={columnMapping.width}
                  onChange={(e) => setColumnMapping({ ...columnMapping, width: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                >
                  <option value="">-- Chọn cột rộng --</option>
                  {excelHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Số Lượng</label>
                <select
                  value={columnMapping.qty}
                  onChange={(e) => setColumnMapping({ ...columnMapping, qty: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                >
                  <option value="">-- Mặc định: 1 tấm --</option>
                  {excelHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Độ Dày (mm)</label>
                <select
                  value={columnMapping.thickness}
                  onChange={(e) => setColumnMapping({ ...columnMapping, thickness: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                >
                  <option value="">-- Mặc định: 17mm --</option>
                  {excelHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên Chi Tiết / Tấm</label>
                <select
                  value={columnMapping.partName}
                  onChange={(e) => setColumnMapping({ ...columnMapping, partName: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                >
                  <option value="">-- Tự động đặt tên --</option>
                  {excelHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Hạng Mục Tủ / Phòng</label>
                <select
                  value={columnMapping.moduleName}
                  onChange={(e) => setColumnMapping({ ...columnMapping, moduleName: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                >
                  <option value="">-- Hạng mục chung --</option>
                  {excelHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mã Vật Liệu / Gỗ</label>
                <select
                  value={columnMapping.materialCode}
                  onChange={(e) => setColumnMapping({ ...columnMapping, materialCode: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                >
                  <option value="">-- Tự động áp mã ván --</option>
                  {excelHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Cạnh Dán Chỉ</label>
                <select
                  value={columnMapping.edges}
                  onChange={(e) => setColumnMapping({ ...columnMapping, edges: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                >
                  <option value="">-- Mặc định không dán --</option>
                  {excelHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowMappingModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => applyMappingAndImport(rawExcelRows, columnMapping)}
                className="px-5 py-2 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-900 rounded-xl shadow-xs transition"
              >
                Xác nhận & Nạp dữ liệu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal Yêu cầu đăng nhập */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title={authModalTitle || "Đăng nhập tài khoản Xưởng"}
        description={authModalDesc || "Đăng nhập qua Email hoặc Số điện thoại để mở khóa toàn bộ quyền lưu dự án và tính năng quản trị xưởng."}
      />

      {/* Modal Kho Mẫu Tủ & Tự Sinh Tấm */}
      <PresetLibraryModal
        isOpen={showPresetModal}
        onClose={() => setShowPresetModal(false)}
        onSelectPreset={handleSelectPreset}
      />

      {/* Modal Sổ Tay Quy Cách & Công Cụ Tính Toán Nhanh */}
      <TechnicalHandbookModal
        isOpen={showHandbookModal}
        onClose={() => setShowHandbookModal(false)}
      />

      {/* Modal Chia Sẻ Báo Giá An Toàn (Secure Link) */}
      <ShareQuoteModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        projectId={editId || undefined}
        projectName={projectName}
        isAuthenticated={isAuthenticated}
        onPromptLogin={() => {
          setAuthModalTitle("Đăng nhập để chia sẻ báo giá");
          setAuthModalDesc("Vui lòng đăng nhập tài khoản xưởng để tạo liên kết bảo mật cho khách hàng.");
          setShowAuthModal(true);
        }}
        onSaveProjectFirst={handleSaveProject}
      />

      {/* Drawer Tra cứu 612 mã vật tư Sheet1 (BUG-04) */}
      <MaterialCatalogDrawer
        isOpen={catalogDrawerOpen}
        onClose={() => {
          setCatalogDrawerOpen(false);
          setPickingTargetRowId(null);
        }}
        onSelect={handleSelectMaterialFromCatalog}
        title={pickingTargetRowId === "NEW_ROW" ? "Chọn vật tư mới từ danh mục 612 mã chuẩn xưởng" : "Thay thế vật tư từ danh mục 612 mã Sheet1"}
      />

    </div>
  );
}

export default function QuotingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Đang tải không gian bóc tách...</div>}>
      <QuotingWorkspace />
    </Suspense>
  );
}
