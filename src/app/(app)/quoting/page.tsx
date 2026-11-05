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

  const [inputTab, setInputTab] = useState<"questionnaire" | "detailed_parts">("questionnaire");
  const [costingActiveTab, setCostingActiveTab] = useState<"summary" | "material_labor" | "labour" | "moq" | "similar">("summary");

  // Động cơ tính toán Costing V2 từ Bảng câu hỏi thông số
  const parametricCosting = useMemo<GeneratedCostingResult>(() => {
    return generateCostingFromQuestionnaire(questionnaire, materials, {
      profitRate: profitMargin >= 1 ? profitMargin - 1 : profitMargin,
      roundingStep,
    });
  }, [questionnaire, materials, profitMargin, roundingStep]);

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
    showToast("⚡ Đã tính toán Costing Sheet thành công từ Bảng câu hỏi thông số!", "success");
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
      showToast("⚡ Đã tự động nạp thành công bộ dữ liệu mẫu 48 chi tiết (Căn hộ 2PN). Bạn có thể xem ngay Bảng đặt vật tư (BOM) xưởng hoặc Báo giá A4 bên dưới!", "success");
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
    showToast(`⚡ Tự động nhận diện và bóc tách thành công ${parsedParts.length} chi tiết từ file Excel!`, "success");
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
    showToast("⚡ Đã nạp thành công bộ dữ liệu mẫu 48 tấm (Căn hộ 2PN)!");
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
      showToast(`⚠️ Đã lưu tạm trên máy, chưa lên Cloud: ${res.error}`, "info");
    } else {
      setSaveSuccess(true);
      showToast(
        "✅ Đã lưu dự án thành công lên Cloud!",
        "success"
      );
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const formatVND = (val: number) => (val || 0).toLocaleString("vi-VN") + " đ";

  if (!mounted) {
    return (
      <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
        <div className="w-8 h-8 mx-auto border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-600">Đang khởi tạo không gian bóc tách & phễu lọc...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans pb-16 relative">
      {/* Toast thông báo nổi bật */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 border text-xs font-semibold animate-in fade-in slide-in-from-top-3 duration-200 max-w-md ${
          toast.type === "success"
            ? "bg-white text-emerald-900 border-emerald-300 shadow-emerald-500/15"
            : toast.type === "error"
            ? "bg-white text-rose-900 border-rose-300 shadow-rose-500/15"
            : "bg-white text-amber-900 border-amber-300 shadow-amber-500/15"
        }`}>
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <span className="flex-1 leading-snug">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
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
        <div className="no-print bg-slate-900 text-slate-300 text-[11px] py-2 px-4 rounded-2xl font-mono border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              MÃ DỰ ÁN: {`PRJ-${editId.slice(0, 8).toUpperCase()}`}
            </span>
            <span className="text-slate-400">KHỔ VÁN: <strong className="text-white">1220 × 2440 MM</strong> (2.9768 M²)</span>
            <span className="text-slate-400">MẠCH CƯA CNC: <strong className="text-white">3.2 MM</strong></span>
            <span className="text-slate-400">HAO HỤT VÁN: <strong className="text-amber-400">+15% (1.15)</strong></span>
            <span className="text-slate-400">HAO HỤT CHỈ: <strong className="text-emerald-400">+8% (1.08)</strong></span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span className="text-emerald-400 flex items-center gap-1 font-sans font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> BẢO MẬT RLS XƯỞNG ĐỘC LẬP
            </span>
            <span className="font-mono">DUNG SAI: ±0.2MM</span>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* TEST MODE TRIAL NOTICE BANNER (Chỉ cho phép dùng thử ở chức năng test) */}
      {/* ================================================================== */}
      {!isAuthenticated && (
        <div className="no-print bg-amber-500/10 border border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-amber-950 text-xs sm:text-sm">
                  🧪 CHẾ ĐỘ DÙNG THỬ (TEST MODE)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300">
                  Chỉ kiểm thử bóc tách mẫu
                </span>
              </div>
              <p className="text-xs text-amber-900/90 mt-1 leading-relaxed max-w-2xl">
                Bạn đang trong phiên dùng thử nghiệm chức năng bóc tách với dữ liệu mẫu 48 tấm (Căn hộ 2PN). Để tải lên file Excel riêng của xưởng bạn, lưu dự án lên đám mây hoặc in báo giá chính thức có Logo xưởng, vui lòng đăng nhập qua Email hoặc Số điện thoại.
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
            className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>Đăng nhập Email / SĐT</span>
          </button>
        </div>
      )}

      {/* ================================================================== */}
      {/* THANH ĐIỀU KHIỂN DỰ ÁN & TIÊU ĐỀ (no-print)                         */}
      {/* ================================================================== */}
      <div className="no-print bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Không gian Báo Giá &amp; Chiết Tính Giá Vốn (Costing Sheet V2)</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Nhập tên công trình / dự án..."
                className="text-xl sm:text-2xl font-black text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:outline-none transition"
              />

              {/* Trạng thái dự án & Lệnh xưởng */}
              <div className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-xl text-xs">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Trạng thái:</span>
                <select
                  value={projectStatus}
                  onChange={(e) => {
                    const st = e.target.value as ProjectStatus;
                    setProjectStatus(st);
                    showToast(`Đã chuyển trạng thái dự án sang: "${st === "approved" ? "Khách duyệt chốt" : st === "in_production" ? "Lệnh sản xuất xưởng" : st === "quoted" ? "Đã gửi khách" : "Báo giá Nháp"}"`, "info");
                  }}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="draft">📝 Báo giá Nháp</option>
                  <option value="quoted">📨 Đã gửi khách</option>
                  <option value="approved">✅ Khách duyệt chốt</option>
                  <option value="in_production">🚀 Lệnh xưởng sản xuất</option>
                </select>
              </div>

              {projectStatus === "approved" && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đã duyệt hợp đồng</span>
                </span>
              )}

              {projectStatus === "in_production" && (
                <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[11px] flex items-center gap-1 shadow-xs animate-pulse">
                  <span>🚀 Đang chạy Lệnh Xưởng</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
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
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition shadow-sm shadow-amber-500/20 cursor-pointer"
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
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-500 block mb-1">Số điện thoại / Zalo:</label>
            <input
              type="text"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-500 flex items-center gap-1">
                <span>{WORKSHOP_TERMS.markup.label} & {WORKSHOP_TERMS.profitMargin.label}:</span>
                <HelpTooltip content={`${WORKSHOP_TERMS.markup.shortExplanation} ${WORKSHOP_TERMS.profitMargin.shortExplanation}`} label="Giải thích lãi trên vốn và biên lợi nhuận" />
              </label>
              <div className="text-right">
                <span className="font-bold text-amber-700 font-mono text-xs">
                  Lãi: {formatPercentVi(calculateMarkupPercent(profitMargin), true)} (x{profitMargin.toFixed(2)})
                </span>
                <span className="text-[11px] text-slate-500 font-mono ml-2">
                  • Biên LN: <strong className="text-emerald-700">{formatPercentVi(calculateProfitMarginPercent(profitMargin))}</strong>
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
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-2"
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Đang dùng cấu hình tùy chỉnh của xưởng</span>
              </span>
            )}

            {!advancedMode && activeCutlistFilterCount > 0 && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                <Filter className="w-3.5 h-3.5 text-sky-600" />
                <span>Đang lọc {activeCutlistFilterCount} tiêu chí</span>
                <button
                  type="button"
                  onClick={handleResetCutlistFilter}
                  className="text-sky-700 hover:text-sky-950 underline font-bold text-[11px]"
                >
                  Xóa lọc
                </button>
              </span>
            )}

            {isRevision && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                <Copy className="w-3.5 h-3.5 text-indigo-600" />
                <span>Phiên bản v{projectVersionNo}</span>
              </span>
            )}
          </div>

          {/* Nút bật/tắt Chế độ nâng cao (mặc định tắt, ghi nhớ trong localStorage) */}
          <button
            type="button"
            onClick={toggleAdvancedMode}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
              advancedMode
                ? "bg-slate-900 text-amber-400 border-slate-800 shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Chế độ nâng cao: {advancedMode ? "BẬT" : "TẮT"}</span>
          </button>
        </div>

        {/* 3-Step Navigation Bar */}
        <nav aria-label="Tiến trình làm việc" className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs">
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => goToStep(1)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition text-xs font-bold cursor-pointer ${
                currentStep === 1
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                currentStep === 1 ? "bg-white text-amber-600" : "bg-slate-200 text-slate-700"
              }`}>
                1
              </span>
              <span className="hidden sm:inline">1. Thông Số &amp; Bảng Câu Hỏi (Costing V2)</span>
              <span className="sm:hidden">1. Thông Số</span>
            </button>

            <button
              type="button"
              onClick={() => goToStep(2)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition text-xs font-bold cursor-pointer ${
                currentStep === 2
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                currentStep === 2 ? "bg-white text-amber-600" : "bg-slate-200 text-slate-700"
              }`}>
                2
              </span>
              <span className="hidden sm:inline">2. Costing Sheet &amp; Chiết Tính Giá Vốn</span>
              <span className="sm:hidden">2. Costing Sheet</span>
            </button>

            <button
              type="button"
              onClick={() => goToStep(3)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition text-xs font-bold cursor-pointer ${
                currentStep === 3
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                currentStep === 3 ? "bg-white text-amber-600" : "bg-slate-200 text-slate-700"
              }`}>
                3
              </span>
              <span className="hidden sm:inline">3. Báo Giá Thương Mại A4 &amp; Chia Sẻ</span>
              <span className="sm:hidden">3. Báo Giá A4</span>
            </button>
          </div>
        </nav>
      </div>

      {/* ================================================================== */}
      {/* BƯỚC 1: BẢNG CÂU HỎI THÔNG SỐ (COSTING V2) & CHECKLIST (no-print)   */}
      {/* ================================================================== */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Sub-tab switcher giữa Costing V2 và Nạp file */}
          <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInputTab("questionnaire")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  inputTab === "questionnaire"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>⚡ Báo giá thông số nhanh (Costing V2 - 30 giây)</span>
              </button>

              <button
                type="button"
                onClick={() => setInputTab("detailed_parts")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  inputTab === "detailed_parts"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>📁 Bảng chi tiết từng hạng mục / Nhập Excel</span>
              </button>
            </div>

            <div className="text-xs text-slate-500 hidden md:flex items-center gap-1.5 font-medium">
              {inputTab === "questionnaire" ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Không cần bản vẽ chi tiết — Tự động tính giá vốn đa tầng từ kích thước phủ bì
                </span>
              ) : (
                <span>Nhập danh sách phôi tấm hoặc dán trực tiếp từ Excel</span>
              )}
            </div>
          </div>

          {inputTab === "questionnaire" ? (
            /* ============================================================ */
            /* GIAO DIỆN BẢNG CÂU HỎI COSTING V2 (LUỒNG CHỦ LỰC)            */
            /* ============================================================ */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* CỘT TRÁI: 3 KHỐI NHẬP LIỆU THÔNG SỐ (8 CỘT) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* KHỐI 1: SẢN PHẨM & KÍCH THƯỚC PHỦ BÌ (* BẮT BUỘC) */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center">
                        1
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">
                        Sản phẩm &amp; Kích thước phủ bì (* Bắt buộc)
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      * Nhập đúng kích thước phủ bì
                    </span>
                  </div>

                  {/* Lựa chọn loại sản phẩm (Product Archetype) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      Loại sản phẩm đồ gỗ nội thất:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
                      {[
                        { type: "wardrobe", label: "Tủ áo", icon: "🚪", desc: "Kịch trần / lửng" },
                        { type: "kitchen_base", label: "Tủ bếp dưới", icon: "🍳", desc: "Thùng chậu / bếp" },
                        { type: "kitchen_upper", label: "Tủ bếp trên", icon: "🥣", desc: "Treo tường" },
                        { type: "bed", label: "Giường ngủ", icon: "🛏️", desc: "Ngăn kéo / nệm" },
                        { type: "table", label: "Bàn ăn / Bàn", icon: "🪑", desc: "Bàn làm việc" },
                        { type: "tv_shelf", label: "Kệ Tivi", icon: "📺", desc: "Tủ thấp trang trí" },
                        { type: "wall_panel", label: "Vách ốp tường", icon: "🧱", desc: "Lam sóng / phẳng" },
                        { type: "shoe_cabinet", label: "Tủ giày", icon: "👟", desc: "Cánh nghiêng / phẳng" },
                        { type: "vanity", label: "Tủ Lavabo", icon: "🪞", desc: "Chống nước" },
                        { type: "custom", label: "Tùy chỉnh", icon: "📦", desc: "Hạng mục tự do" },
                      ].map((item) => {
                        const isSelected = questionnaire.productType === item.type;
                        return (
                          <button
                            key={item.type}
                            type="button"
                            onClick={() =>
                              setQuestionnaire((prev) => ({
                                ...prev,
                                productType: item.type as ProductArchetype,
                                name: `${item.label} tiêu chuẩn`,
                              }))
                            }
                            className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                              isSelected
                                ? "bg-amber-50/80 border-amber-500 text-amber-950 font-bold shadow-2xs"
                                : "bg-slate-50/60 border-slate-200 hover:border-slate-300 text-slate-700"
                            }`}
                          >
                            <span className="text-lg block mb-1">{item.icon}</span>
                            <span className="font-bold block truncate">{item.label}</span>
                            <span className="text-[10px] text-slate-400 block truncate">{item.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

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
                            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
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
                            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
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
                            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
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
                          className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-900 transition font-mono cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* KHỐI 2: VẬT LIỆU & KẾT CẤU CHỦ LỰC (* BẮT BUỘC) */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center">
                        2
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">
                        Vật liệu &amp; Kết cấu chủ lực (* Bắt buộc)
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-400">5 câu hỏi Có / Không nhạy cảm giá</span>
                  </div>

                  {/* Cốt ván & Bề mặt */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Cốt ván thùng &amp; đợt:
                      </label>
                      <select
                        value={questionnaire.materials.coreCode}
                        onChange={(e) =>
                          setQuestionnaire((prev) => ({
                            ...prev,
                            materials: { ...prev.materials, coreCode: e.target.value },
                          }))
                        }
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                      >
                        <option value="MDF_17_CHONG_AM">MDF chống ẩm lõi xanh HMR 17mm</option>
                        <option value="PLYWOOD_17">Plywood kháng nước 17mm</option>
                        <option value="PVC_17">Ván nhựa PVC Picomat chống nước tuyệt đối</option>
                        <option value="NATURAL_WOOD">Gỗ tự nhiên sồi / tần bì ghép thanh</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Bề mặt cánh &amp; mặt tiền:
                      </label>
                      <select
                        value={questionnaire.materials.surfaceCode}
                        onChange={(e) =>
                          setQuestionnaire((prev) => ({
                            ...prev,
                            materials: { ...prev.materials, surfaceCode: e.target.value },
                          }))
                        }
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                      >
                        <option value="Melamine">Phủ Melamine 2 mặt chống trầy</option>
                        <option value="Son2K">Sơn bệt 2K cao cấp chống ố vàng</option>
                        <option value="Acrylic">Cánh phủ Acrylic bóng gương No Line</option>
                        <option value="Veneer">Phủ Veneer Sồi / Óc chó sơn PU mờ</option>
                      </select>
                    </div>
                  </div>

                  {/* 5 CÂU HỎI BẮT BUỘC CÓ / KHÔNG VỚI CẢNH BÁO NHẠY CẢM GIÁ */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold text-slate-800 block">
                      Các thành phần kết cấu đặc thù (Bắt buộc chọn Có/Không):
                    </label>

                    {/* Câu 1: Mặt đá (Nhạy cảm 35%) */}
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🪨</span>
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Có mặt đá / ốp đá? *</span>
                            <span className="text-[11px] text-amber-700 font-semibold block">
                              ⚠️ Chọn nhầm làm lệch giá ~30–35% (Đá gắn nhãn no OH 0%)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() =>
                              setQuestionnaire((prev) => ({
                                ...prev,
                                materials: { ...prev.materials, hasStone: false },
                              }))
                            }
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
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
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                              questionnaire.materials.hasStone
                                ? "bg-amber-500 text-white shadow-xs"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            Có
                          </button>
                        </div>
                      </div>

                      {questionnaire.materials.hasStone && (
                        <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-600 shrink-0">Loại đá áp dụng:</span>
                          <select
                            value={questionnaire.materials.stoneType || "vicostone"}
                            onChange={(e) =>
                              setQuestionnaire((prev) => ({
                                ...prev,
                                materials: { ...prev.materials, stoneType: e.target.value },
                              }))
                            }
                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-500 w-full"
                          >
                            <option value="vicostone">Đá Vicostone thạch anh nhân tạo cao cấp</option>
                            <option value="white_ceramic">Đá trắng sứ nhân tạo vân mây chống ố</option>
                            <option value="black_galaxy">Đá Granite Kim sa trung tự nhiên</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Câu 2: Kính / Cánh kính khung nhôm */}
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🪟</span>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Có kính / gương / cánh kính khung nhôm? *</span>
                          <span className="text-[11px] text-slate-500 block">Kính cường lực 5mm/8mm hoặc nhôm hệ Slim nội thất</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() =>
                            setQuestionnaire((prev) => ({
                              ...prev,
                              materials: { ...prev.materials, hasGlass: false },
                            }))
                          }
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
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
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                            questionnaire.materials.hasGlass
                              ? "bg-sky-600 text-white shadow-xs"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          Có
                        </button>
                      </div>
                    </div>

                    {/* Câu 3: Khung kim loại sắt sơn / inox */}
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">⚙️</span>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Có khung kim loại (sắt sơn / inox PVD)? *</span>
                          <span className="text-[11px] text-slate-500 block">Khung chân bàn, giá treo áo hoặc vách ngăn sắt nghệ thuật</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() =>
                            setQuestionnaire((prev) => ({
                              ...prev,
                              materials: { ...prev.materials, hasMetal: false },
                            }))
                          }
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
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
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                            questionnaire.materials.hasMetal
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          Có
                        </button>
                      </div>
                    </div>

                    {/* Câu 4: Bọc nệm / Da / Vải / Mây */}
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🛋️</span>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Có bọc nệm, da, vải hoặc đan mây? *</span>
                          <span className="text-[11px] text-slate-500 block">Đầu giường bọc da microfiber, cánh tủ mây mắt cáo</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() =>
                            setQuestionnaire((prev) => ({
                              ...prev,
                              materials: { ...prev.materials, hasUpholstery: false },
                            }))
                          }
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
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
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                            questionnaire.materials.hasUpholstery
                              ? "bg-amber-600 text-white shadow-xs"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          Có
                        </button>
                      </div>
                    </div>

                    {/* Câu 5: Đèn LED nội thất */}
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">💡</span>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Có hệ đèn LED nội thất / cảm biến? *</span>
                          <span className="text-[11px] text-slate-500 block">Máng nhôm có tai + dây LED 12V + nguồn tổ ong + cảm ứng vẫy tay</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() =>
                            setQuestionnaire((prev) => ({
                              ...prev,
                              materials: { ...prev.materials, hasLed: false },
                            }))
                          }
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
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
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                            questionnaire.materials.hasLed
                              ? "bg-amber-500 text-white shadow-xs"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          Có
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KHỐI 3: CHI TIẾT & GHI CHÚ ĐẶC BIỆT */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                        3
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">
                        Chi tiết phụ kiện &amp; Ghi chú (Tùy chọn)
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-400">Để trống để hệ thống tự ước tính</span>
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
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
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
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
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
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

              </div>

              {/* CỘT PHẢI: CHECKLIST 3 TRẠNG THÁI & ĐIỀU KHIỂN (4 CỘT - STICKY) */}
              <div className="lg:col-span-4 space-y-4 sticky top-4">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Checklist Kiểm Soát Thông Số</span>
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                      Costing V2
                    </span>
                  </div>

                  {/* Danh sách 3 trạng thái */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60 border border-emerald-200">
                      <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Loại sản phẩm:
                      </span>
                      <strong className="text-emerald-800 truncate max-w-[120px]">{questionnaire.productType}</strong>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60 border border-emerald-200">
                      <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Kích thước W×D×H:
                      </span>
                      <strong className="text-emerald-800 font-mono">
                        {questionnaire.dimensions.widthMm}×{questionnaire.dimensions.depthMm}×{questionnaire.dimensions.heightMm}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60 border border-emerald-200">
                      <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Cốt &amp; Bề mặt:
                      </span>
                      <strong className="text-emerald-800 truncate max-w-[130px]">
                        {questionnaire.materials.surfaceCode}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60 border border-emerald-200">
                      <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Kết cấu đặc thù:
                      </span>
                      <strong className="text-emerald-800">5/5 đã chọn</strong>
                    </div>

                    <div className={`flex items-center justify-between p-2 rounded-xl border ${
                      questionnaire.details?.drawerCount !== undefined && questionnaire.details?.doorCount !== undefined
                        ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                        : "bg-amber-50/60 border-amber-200 text-amber-900"
                    }`}>
                      <span className="font-semibold flex items-center gap-1.5">
                        {questionnaire.details?.drawerCount !== undefined && questionnaire.details?.doorCount !== undefined ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        Ngăn kéo &amp; Cánh:
                      </span>
                      <strong className="font-mono">
                        {questionnaire.details?.drawerCount ?? "Auto"} NK · {questionnaire.details?.doorCount ?? "Auto"} Cánh
                      </strong>
                    </div>
                  </div>

                  {/* Lựa chọn phương thức tính */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <label className="text-[11px] font-bold text-slate-600 block">Phương thức chiết tính:</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setQuestionnaire((prev) => ({ ...prev, calcMode: "detail" }))}
                        className={`p-2 rounded-xl border text-center transition font-bold cursor-pointer ${
                          questionnaire.calcMode === "detail"
                            ? "bg-amber-500 text-white border-amber-500 shadow-2xs"
                            : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
                        }`}
                      >
                        Bản Chi Tiết
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuestionnaire((prev) => ({ ...prev, calcMode: "quick" }))}
                        className={`p-2 rounded-xl border text-center transition font-bold cursor-pointer ${
                          questionnaire.calcMode === "quick"
                            ? "bg-amber-500 text-white border-amber-500 shadow-2xs"
                            : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
                        }`}
                      >
                        Ước Nhanh
                      </button>
                    </div>
                  </div>

                  {/* Khung xem trước giá & Độ tin cậy */}
                  <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Giá bán đề xuất:</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${parametricCosting.confidence.colorClass}`}>
                        {parametricCosting.confidence.stars} Sao · {parametricCosting.confidence.label}
                      </span>
                    </div>
                    <div className="text-xl font-black font-mono text-amber-400">
                      {formatVND(parametricCosting.summary.calculateSalesPrice)}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                      <span>Giá vốn COGS: <strong className="text-white font-mono">{formatVND(parametricCosting.summary.cogs)}</strong></span>
                      <span>Lợi nhuận: <strong className="text-emerald-400 font-mono">+{((profitMargin - 1) * 100).toFixed(0)}%</strong></span>
                    </div>
                  </div>

                  {/* Nút hành động chính */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCalculateFromQuestionnaire}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Calculator className="w-4 h-4" />
                      <span>⚡ Tính Toán Costing Sheet Ngay</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleResetQuestionnaire}
                        className="py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3 text-slate-400" />
                        <span>Làm Mới</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleSaveProject();
                          showToast("Đã lưu nháp thông số Bảng câu hỏi thành công!");
                        }}
                        className="py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Save className="w-3 h-3 text-amber-600" />
                        <span>Lưu Nháp</span>
                      </button>
                    </div>
                  </div>

                  {/* Khối gợi ý Dựng từ mẫu lịch sử */}
                  {similarItems.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        Dựng từ mẫu lịch sử gần nhất:
                      </span>
                      <div className="space-y-1.5">
                        {similarItems.slice(0, 2).map((item) => (
                          <div
                            key={item.id}
                            className="p-2 rounded-lg bg-slate-50 hover:bg-amber-50/50 border border-slate-200 flex items-center justify-between text-[11px] transition"
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
                              className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[10px] font-bold shrink-0 cursor-pointer"
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
          ) : (
            <div className="space-y-6">
              <div className="no-print bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-slate-900 text-sm">
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
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? "border-amber-500 bg-amber-50/70"
              : "border-slate-200 hover:border-amber-400 bg-slate-50/60 hover:bg-amber-50/20"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
            <Upload className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-900">
              Kéo thả file {WORKSHOP_TERMS.cutlist.labelWithOriginal} vào đây, hoặc <span className="text-amber-600 underline">bấm để chọn file</span>
            </p>
            <p className="text-xs text-slate-500">
              File .xlsx hoặc .csv chứa 8 cột: Hạng mục, Tên chi tiết, Dài, Rộng, Dày, Số lượng, Mã vật liệu, Dán cạnh
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowPresetModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition shadow-xs shadow-amber-500/20 cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>⚡ Kho Mẫu Tủ & Tự Sinh Tấm</span>
            </button>

            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition shadow-xs cursor-pointer"
            >
              <ClipboardPaste className="w-4 h-4 text-amber-600" />
              <span>📋 Dán từ Excel (Clipboard)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHandbookModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded-xl transition shadow-xs cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-sky-600" />
              <span>📖 Sổ Tay Quy Cách & Hao Hụt</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>📥 File Excel Mẫu (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* CẢNH BÁO MÃ VẬT TƯ LẠ CHƯA CÓ TRONG THƯ VIỆN ĐƠN GIÁ (no-print)    */}
      {/* ================================================================== */}
      {calcResult.missingPriceCodes && calcResult.missingPriceCodes.length > 0 && (
        <div className="no-print p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">
                ⚠️ Phát hiện {calcResult.missingPriceCodes.length} mã ván chưa có trong Thư viện đơn giá xưởng:{" "}
                <span className="font-mono text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-bold">
                  {calcResult.missingPriceCodes.join(", ")}
                </span>
              </p>
              <p className="text-[11px] text-amber-700">
                Hệ thống đang tạm áp đơn giá dự phòng 680.000 đ/tấm. Bạn có thể vào Thư viện Vật tư để khai báo giá xưởng chuẩn xác.
              </p>
            </div>
          </div>
          <Link
            href="/materials"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition shrink-0 shadow-xs"
          >
            <span>Khai báo giá xưởng</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ================================================================== */}
      {/* BƯỚC 2: BẢNG CHỈNH SỬA CHI TIẾT TẤM (CUTLIST PARTS) (no-print)      */}
      {/* ================================================================== */}
      <div className="no-print bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4">
        <div className="p-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
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
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
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
                className="pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 w-40 sm:w-52"
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
                    ? "bg-amber-500 text-white shadow-amber-500/20"
                    : showCutlistFilter
                    ? "bg-slate-900 text-white"
                    : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Phễu Lọc</span>
                {activeCutlistFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-white text-amber-700 font-mono text-[10px] flex items-center justify-center font-black">
                    {activeCutlistFilterCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setShowPresetModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition shadow-xs"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-amber-600" />
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
          <div className="bg-slate-50/90 border-b border-slate-200/80 p-3.5 space-y-3 animate-in fade-in duration-150">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 text-xs">
              {/* Lọc Hạng mục (Module) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <span>Hạng mục tủ:</span>
                </label>
                <select
                  value={cutlistModuleFilter}
                  onChange={(e) => setCutlistModuleFilter(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-amber-500 focus:outline-none"
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
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium focus:border-amber-500 focus:outline-none"
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
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium focus:border-amber-500 focus:outline-none"
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
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-amber-500 focus:outline-none"
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
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-amber-500 focus:outline-none"
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
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                    Từ khóa: &quot;{cutlistSearch}&quot;
                    <button type="button" onClick={() => setCutlistSearch("")} className="hover:text-amber-950">
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
                      className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold hover:bg-amber-100 transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Xóa toàn bộ bộ lọc</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredParts.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-amber-50/30 transition">
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
                      className="w-full p-1 bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-amber-500 text-xs font-medium"
                    />
                  </td>

                  {/* Tên tấm */}
                  <td className="p-1">
                    <input
                      type="text"
                      value={p.partName}
                      onChange={(e) => handleUpdatePart(p.id, { partName: e.target.value })}
                      className="w-full p-1 font-semibold text-slate-900 bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-amber-500 text-xs"
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
                      className="w-20 text-right font-mono p-1 bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-amber-500 text-xs font-bold"
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
                      className="w-20 text-right font-mono p-1 bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-amber-500 text-xs font-bold"
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
                      className="w-14 text-right font-mono p-1 bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-amber-500 text-xs font-bold text-slate-900"
                    />
                  </td>

                  {/* Mã vật liệu */}
                  <td className="p-1">
                    <select
                      value={p.materialCode}
                      onChange={(e) => handleUpdatePart(p.id, { materialCode: e.target.value })}
                      className="p-1 bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-amber-500 text-xs font-mono font-medium"
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
                            ? "bg-amber-100 text-amber-900 border-amber-300 shadow-2xs"
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
                            ? "bg-amber-100 text-amber-900 border-amber-300 shadow-2xs"
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
                            ? "bg-emerald-100 text-emerald-900 border-emerald-300 shadow-2xs"
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
                            ? "bg-emerald-100 text-emerald-900 border-emerald-300 shadow-2xs"
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
        <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500">
            Dự án hiện có <strong>{parts.length}</strong> chi tiết phôi ván trong danh sách.
          </span>
          <button
            type="button"
            onClick={() => goToStep(2)}
            disabled={parts.length === 0}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-40 cursor-pointer"
          >
            <span>Tiếp tục: Xem Báo Giá &amp; Chiết Tính Giá Vốn</span>
            <ArrowRight className="w-4 h-4" />
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
            <div className="no-print p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                  ✨
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Bạn vừa trải nghiệm tính toán tự động với mẫu 48 tấm!
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Hãy tải file Excel Mẫu Bảng Giá để nhập đơn giá riêng của xưởng bạn, hoặc đăng nhập để lưu trữ dự án lên Cloud.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => exportMaterialsTemplateExcel()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-600" />
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
                  ? "bg-amber-500 text-white shadow-xs"
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
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20"
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
                className="font-bold text-amber-600 underline font-mono"
              >
                {roundingStep === 0.5 ? "0.5 tấm" : "1.0 tấm"}
              </button>
            </span>
            <div className="h-3 w-px bg-slate-200" />
            <span>
              Giá vốn: <strong suppressHydrationWarning className="text-slate-900 font-mono">{formatVND(activeOutputTab === "costing_sheet" ? parametricCosting.summary.cogs : calcResult.totalBaseCost)}</strong>
            </span>
            <div className="h-3 w-px bg-slate-200" />
            <span>
              Báo khách: <strong suppressHydrationWarning className="text-amber-600 font-mono">{formatVND(activeOutputTab === "costing_sheet" ? parametricCosting.summary.calculateSalesPrice : calcResult.totalQuotePrice)}</strong>
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
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">GIÁ BÁN ĐỀ XUẤT</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    +{((profitMargin - 1) * 100).toFixed(0)}% LỢI NHUẬN
                  </span>
                </div>
                <div className="text-2xl font-black text-emerald-600 font-mono">
                  {formatVND(parametricCosting.summary.calculateSalesPrice)}
                </div>
                <p className="text-xs text-slate-500">Giá đề xuất gửi khách hàng (đã gồm chi phí + lợi nhuận mục tiêu)</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">GIÁ VỐN TOÀN DIỆN (COGS)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    12 NHÓM CHI PHÍ
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {formatVND(parametricCosting.summary.cogs)}
                </div>
                <p className="text-xs text-slate-500">Vật tư + Nhân công trực tiếp + Quản lý xưởng OH & thầu phụ</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">LỢI NHUẬN MỤC TIÊU</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    RÒNG DỰ TÍNH
                  </span>
                </div>
                <div className="text-2xl font-black text-amber-600 font-mono">
                  {formatVND(parametricCosting.summary.profitAmount)}
                </div>
                <p className="text-xs text-slate-500">Mức chênh lệch an toàn để đảm bảo dòng tiền & tái đầu tư xưởng</p>
              </div>
            </div>

            {/* Confidence Rating & Checklist Banner */}
            <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs ${
              parametricCosting.confidence.stars >= 4
                ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                : parametricCosting.confidence.stars === 3
                ? "bg-sky-50/60 border-sky-200 text-sky-950"
                : "bg-amber-50/60 border-amber-200 text-amber-950"
            }`}>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Độ tin cậy báo giá:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= parametricCosting.confidence.stars
                            ? "fill-amber-400 text-amber-500"
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
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-800 font-medium border border-amber-200">
                      • {r}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 font-medium border border-emerald-200">
                    ✓ {questionnaire.name} ({questionnaire.dimensions.widthMm} × {questionnaire.dimensions.depthMm} × {questionnaire.dimensions.heightMm} mm)
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 font-medium border border-emerald-200">
                    ✓ Cốt: {questionnaire.materials.coreCode} | {questionnaire.materials.surfaceCode}
                  </span>
                </div>
              </div>

              {/* Version & Export Button */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => exportCostingSheetExcel(projectName, projectVersionNo, clientName, parametricCosting)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
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
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Lưu ý hạng mục Đá:</strong> Không áp dụng Overhead xưởng (0% OH). Giá đá chiếm ~30-35% giá vốn và dao động mạnh theo nhà cung cấp — Nên chốt mã đá thực tế trước khi ký hợp đồng.
                </span>
              </div>
            )}

            {/* Sub-tabs Navigation */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
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
                    2. Bảng vật tư chi tiết ({parametricCosting.materialsLabor.length})
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
                    3. Nhân công ({parametricCosting.labourDepts.length} công đoạn)
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
                    4. Bậc thang MOQ ({Object.keys(parametricCosting.summary.moqPrices || {}).length} bậc)
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
                  Tổng COGS: <strong className="text-slate-900 font-bold">{formatVND(parametricCosting.summary.cogs)}</strong>
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
                        { label: "1. Đá tự nhiên / Nhân tạo (Stone)", desc: "Mặt đá Vicostone/Marble (0% OH Xưởng)", amount: parametricCosting.summary.stone, highlight: "0% OH" },
                        { label: "2. Bọc nệm / Da / Vải (Upholstery)", desc: "Mút xốp D40 + bọc da/nỉ cao cấp", amount: parametricCosting.summary.upholstery },
                        { label: "3. Khung kim loại gia công ngoài", desc: "Chân bàn, tay nắm kim loại ngoài (10% OH)", amount: parametricCosting.summary.metalFrameS },
                        { label: "4. Gia công ngoài / Thầu phụ", desc: "Cánh Acrylic bóng gương, gia công CNC ngoài (10% OH)", amount: parametricCosting.summary.subContract },
                        { label: "5. Gỗ & Ván công nghiệp", desc: "Cốt MDF/HDF chống ẩm thùng & cánh tủ", amount: parametricCosting.summary.wood },
                        { label: "6. Khung kim loại tự sản xuất", desc: "Khung sắt hộp xưởng tự cắt hàn sơn", amount: parametricCosting.summary.metalFrameP },
                        { label: "7. Kính / Cánh kính khung nhôm", desc: "Kính cường lực / khung nhôm định hình", amount: parametricCosting.summary.glass },
                        { label: "8. Hóa chất / Sơn / Dung môi", desc: "Sơn 2K, bả matit, keo dán chuyên dụng", amount: parametricCosting.summary.chemical },
                        { label: "9. Phụ kiện kim khí (Hardware)", desc: "Bản lề giảm chấn, ray âm, tay nắm, LED", amount: parametricCosting.summary.hardware },
                        { label: "10. Chỉ dán & Vật tư tiêu hao", desc: "Chỉ nẹp PVC, keo PUR, ốc vít cam", amount: parametricCosting.summary.consumables },
                        { label: "11. Đóng gói & Vận chuyển", desc: "Màng PE, xốp nổ bọc góc, xe tải giao hàng", amount: parametricCosting.summary.packingDelivery },
                        { label: "12. Tổng nhân công trực tiếp", desc: "Nhân công 4 bộ phận cắt, dán, ráp, lắp đặt", amount: parametricCosting.summary.laborCostTotal },
                      ].map((row, idx) => {
                        const pct = parametricCosting.summary.cogs > 0
                          ? ((row.amount / parametricCosting.summary.cogs) * 100).toFixed(1)
                          : "0.0";
                        return (
                          <tr key={idx} className="hover:bg-slate-50/60">
                            <td className="p-2.5 font-bold text-slate-800">{row.label}</td>
                            <td className="p-2.5 text-slate-500">
                              {row.desc}
                              {row.highlight && (
                                <span className="ml-2 px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
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
                      <tr className="bg-amber-50/40 font-semibold">
                        <td className="p-2.5 text-amber-900">+ OH Xưởng ({((parametricCosting.summary.ohWorkshopRate) * 100).toFixed(0)}%)</td>
                        <td className="p-2.5 text-amber-800 text-[11px]">Khấu hao máy CNC, nhà xưởng, điện 3 pha áp cho nhóm nội bộ</td>
                        <td className="p-2.5 text-right font-mono font-bold text-amber-900">{formatVND(parametricCosting.summary.ohWorkshopAmount)}</td>
                        <td className="p-2.5 text-right font-mono text-amber-800">{parametricCosting.summary.cogs > 0 ? ((parametricCosting.summary.ohWorkshopAmount / parametricCosting.summary.cogs) * 100).toFixed(1) : 0}%</td>
                      </tr>
                      <tr className="bg-sky-50/40 font-semibold">
                        <td className="p-2.5 text-sky-900">+ OH Thầu phụ ({((parametricCosting.summary.ohSubcontractRate) * 100).toFixed(0)}%)</td>
                        <td className="p-2.5 text-sky-800 text-[11px]">Quản lý & rủi ro lắp đặt thầu phụ</td>
                        <td className="p-2.5 text-right font-mono font-bold text-sky-900">{formatVND(parametricCosting.summary.ohSubcontractAmount)}</td>
                        <td className="p-2.5 text-right font-mono text-sky-800">{parametricCosting.summary.cogs > 0 ? ((parametricCosting.summary.ohSubcontractAmount / parametricCosting.summary.cogs) * 100).toFixed(1) : 0}%</td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300">
                      <tr>
                        <td colSpan={2} className="p-2.5 text-slate-900 uppercase">TỔNG GIÁ VỐN TOÀN DIỆN (COGS)</td>
                        <td className="p-2.5 text-right font-mono text-slate-900 text-sm">
                          {formatVND(parametricCosting.summary.cogs)}
                        </td>
                        <td className="p-2.5 text-right font-mono text-slate-900">100.0%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* Sub-tab 2: Material Labor Detail */}
              {costingActiveTab === "material_labor" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Khối</th>
                        <th className="p-2.5">Tên Chi Tiết / Vật Tư</th>
                        <th className="p-2.5">Quy Chuẩn Kỹ Thuật</th>
                        <th className="p-2.5 text-center">ĐVT</th>
                        <th className="p-2.5 text-right">Khối Lượng</th>
                        <th className="p-2.5 text-right">Đơn Giá (VNĐ)</th>
                        <th className="p-2.5 text-right">Hao Hụt</th>
                        <th className="p-2.5 text-right">Thành Tiền (VNĐ)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parametricCosting.materialsLabor.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/60">
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {row.block}
                            </span>
                          </td>
                          <td className="p-2.5 font-bold text-slate-800">{row.name}</td>
                          <td className="p-2.5 text-[11px] text-slate-500">{row.description}</td>
                          <td className="p-2.5 text-center text-slate-500">{row.unit}</td>
                          <td className="p-2.5 text-right font-mono font-semibold text-slate-800">
                            {row.qty.toLocaleString("vi-VN", { maximumFractionDigits: 2 })}
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-600">
                            {formatVND(row.unitPrice)}
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-500">
                            x{row.wasteFactor}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                            {formatVND(row.totalAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Sub-tab 3: Labour Departments */}
              {costingActiveTab === "labour" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Công Đoạn / Bộ Phận</th>
                        <th className="p-2.5">Mã Phân Xưởng</th>
                        <th className="p-2.5 text-right">Số Giờ Định Mức</th>
                        <th className="p-2.5 text-right">Đơn Giá / Giờ (VNĐ)</th>
                        <th className="p-2.5 text-right">Thành Tiền (VNĐ)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parametricCosting.labourDepts.map((d, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="p-2.5 font-bold text-slate-800">{d.name}</td>
                          <td className="p-2.5 text-slate-500 font-mono text-[11px]">{d.department}</td>
                          <td className="p-2.5 text-right font-mono font-semibold text-slate-800">
                            {d.hours.toFixed(1)} h
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-600">
                            {formatVND(d.hourlyRate)}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                            {formatVND(d.totalAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300">
                      <tr>
                        <td colSpan={4} className="p-2.5 text-slate-900 uppercase">TỔNG NHÂN CÔNG TRỰC TIẾP</td>
                        <td className="p-2.5 text-right font-mono text-slate-900 text-sm">
                          {formatVND(parametricCosting.summary.laborCostTotal)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* Sub-tab 4: MOQ Tiers */}
              {costingActiveTab === "moq" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Bậc Số Lượng (MOQ)</th>
                        <th className="p-2.5 text-right">Đơn Giá / Cái (VNĐ)</th>
                        <th className="p-2.5 text-right">Chiết Khấu Quy Mô</th>
                        <th className="p-2.5 text-right">Tổng Giá Trị Đơn Hàng (VNĐ)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Object.entries(parametricCosting.summary.moqPrices || {}).map(([qtyStr, unitPrice]) => {
                        const q = Number(qtyStr);
                        const basePrice = parametricCosting.summary.moqPrices[1] || parametricCosting.summary.calculateSalesPrice;
                        const discount = basePrice > 0 ? Math.round((1 - unitPrice / basePrice) * 100) : 0;
                        const total = q * unitPrice;
                        return (
                          <tr key={q} className="hover:bg-slate-50/60">
                            <td className="p-2.5 font-bold text-slate-800 flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                                {q}
                              </span>
                              <span>{q} sản phẩm</span>
                            </td>
                            <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                              {formatVND(unitPrice)}
                            </td>
                            <td className="p-2.5 text-right font-mono text-emerald-700 font-semibold">
                              {discount > 0 ? `-${discount}%` : "Chuẩn (0%)"}
                            </td>
                            <td className="p-2.5 text-right font-mono font-black text-amber-600">
                              {formatVND(total)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 hover:border-amber-400 transition"
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
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition cursor-pointer"
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
          <div className="no-print bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
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
                className="inline-flex items-center gap-2 px-5 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm shadow-emerald-600/20"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>📊 Xuất file Excel đặt hàng (.xlsx)</span>
              </button>
            </div>

            {/* Chi tiết Ván tấm */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>1. Danh sách ván tiêu chuẩn cần đặt mua (1220 x 2440 mm = 2.9768 m²)</span>
              </h4>
              <div className="rounded-xl border border-slate-200 overflow-x-auto text-xs">
                <table className="w-full text-left min-w-[620px]">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Mã ván & Tên chủng loại</th>
                      <th className="p-3 text-right">Diện tích Net (m²)</th>
                      <th className="p-3 text-right">Hệ số hao hụt</th>
                      <th className="p-3 text-right text-amber-700 font-bold">Số tấm cần mua</th>
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
                        <td className="p-3 text-right font-mono font-black text-amber-700 text-sm">
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
                  <span className="font-mono font-bold text-amber-700">
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
                <div className="text-[11px] text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 font-medium">
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
            <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-extrabold text-sm block">TỔNG GIÁ VỐN VẬT TƯ & NHÂN CÔNG:</span>
                <span className="text-slate-300 text-[11px]">Bao gồm đầy đủ 5 thành phần: Ván tấm, chỉ dán cạnh, phụ kiện, thợ gia công/lắp đặt và vật tư phụ/vận chuyển.</span>
              </div>
              <span className="text-2xl font-black text-amber-400 font-mono">
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
            <div className="no-print bg-amber-50 rounded-2xl border border-amber-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
              <div className="flex items-center gap-2 flex-wrap">
                <Sliders className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="flex items-center gap-1">
                  <strong>{WORKSHOP_TERMS.markup.label}:</strong> {formatPercentVi(calculateMarkupPercent(profitMargin), true)} (x{profitMargin.toFixed(2)})
                  <HelpTooltip content={WORKSHOP_TERMS.markup.shortExplanation} label="Giải thích lãi trên vốn" />
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <strong>{WORKSHOP_TERMS.profitMargin.label}:</strong> <span className="text-emerald-700 font-bold">{formatPercentVi(calculateProfitMarginPercent(profitMargin))}</span>
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
                  className="w-44 accent-amber-600"
                />
                <button
                  onClick={() => window.print()}
                  className="px-5 py-3 font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition shadow-sm shadow-amber-500/20 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>🖨️ In / Tải PDF Báo Giá A4</span>
                </button>
              </div>
            </div>

            {/* Khung tờ giấy Báo Giá A4 thực tế (.print-area) */}
            <div className="print-area bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-8 md:p-12 shadow-md space-y-6 text-xs max-w-4xl mx-auto">
              
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
                  <div className="hidden sm:flex w-16 h-16 rounded-full border-2 border-emerald-600 border-dashed flex-col items-center justify-center text-center p-1 text-[7px] font-black text-emerald-800 rotate-[-8deg] shadow-xs bg-emerald-50/50">
                    <span className="uppercase tracking-tight leading-tight">ĐÃ KIỂM DUYỆT</span>
                    <span className="text-emerald-700 font-mono text-[8px] font-extrabold">ISO GỖ CNC</span>
                    <span className="text-[6px] text-emerald-500">2026-PASS</span>
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
                <span className="text-2xl font-black text-amber-600 font-mono">
                  {formatVND(calcResult.totalQuotePrice)}
                </span>
              </div>

              {/* Điều khoản & Cam kết của xưởng chuẩn thương mại */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 font-bold uppercase text-[10px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
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
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition shadow-md shadow-amber-500/25 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>In / Xuất PDF Báo Giá A4 Ngay</span>
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Step 2 Footer Navigation Bar */}
      <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <button
          type="button"
          onClick={() => goToStep(1)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại sửa phôi ván (Bước 1)</span>
        </button>
        <button
          type="button"
          onClick={() => goToStep(3)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
        >
          <span>Tiếp tục: Xuất File &amp; In Ấn (Bước 3)</span>
          <ArrowRight className="w-4 h-4" />
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
      <div className="no-print bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                3
              </span>
              Trung Tâm Xuất File &amp; In Báo Giá A4
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Lựa chọn định dạng xuất phù hợp cho đại lý vật tư xưởng, máy cắt CNC hoặc gửi trực tiếp cho khách hàng.
            </p>
          </div>

          {/* Tóm tắt nhanh số liệu */}
          <div className="flex items-center gap-3 text-xs font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Tổng Ván:</span>
              <strong className="text-slate-900 font-bold">{calcResult.totalSheets} tấm</strong>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Báo Giá Khách:</span>
              <strong className="text-amber-600 font-bold">{formatVND(calcResult.totalQuotePrice)}</strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Xuất Excel BOM Xưởng */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-emerald-300 transition flex flex-col justify-between space-y-3 shadow-2xs">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
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
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
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
                  Bảng tổng hợp chi phí 12 danh mục, phân bổ OH đa tầng (Đá 0%, Xưởng 25-35%, Thầu phụ 10%), nhân công 8 công đoạn và bậc thang MOQ.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => exportCostingSheetExcel(projectName, projectVersionNo, clientName, parametricCosting)}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Tải Excel Costing Sheet</span>
            </button>
          </div>

          {/* Card 3: In / Xuất PDF Báo Giá A4 */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 hover:border-amber-300 transition flex flex-col justify-between space-y-3 shadow-2xs">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-amber-950">In Báo Giá Chuẩn A4 (.pdf)</h3>
                <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                  Bản báo giá trang trọng gửi khách hàng, gom nhóm thành phẩm, ẩn chi phí nội bộ và có sẵn điều khoản bảo hành.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handlePrintA4}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In / Lưu PDF A4 Ngay</span>
            </button>
          </div>

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
            className="inline-flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-bold cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Mở hộp thoại in / xuất PDF</span>
          </button>
        </div>

        {/* Khung tờ giấy Báo Giá A4 thực tế (.print-area) */}
        <div className="print-area bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-8 md:p-12 shadow-md space-y-6 text-xs max-w-4xl mx-auto">
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
              <div className="hidden sm:flex w-16 h-16 rounded-full border-2 border-emerald-600 border-dashed flex-col items-center justify-center text-center p-1 text-[7px] font-black text-emerald-800 rotate-[-8deg] shadow-xs bg-emerald-50/50">
                <span className="uppercase tracking-tight leading-tight">ĐÃ KIỂM DUYỆT</span>
                <span className="text-emerald-700 font-mono text-[8px] font-extrabold">ISO GỖ CNC</span>
                <span className="text-[6px] text-emerald-500">2026-PASS</span>
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
            <span className="text-2xl font-black text-amber-600 font-mono">
              {formatVND(calcResult.totalQuotePrice)}
            </span>
          </div>

          {/* Điều khoản & Cam kết của xưởng chuẩn thương mại */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
            <div className="flex items-center justify-between">
              <strong className="text-slate-900 font-bold uppercase text-[10px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
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
      </div>

      {/* Step 3 Footer Navigation Bar */}
      <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <button
          type="button"
          onClick={() => goToStep(2)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Xem Báo Giá &amp; BOM (Bước 2)</span>
        </button>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => goToStep(1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <span>Về Bước 1 (Sửa phôi)</span>
          </button>
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-indigo-600" />
            <span>Chia sẻ link</span>
          </button>
          <button
            type="button"
            onClick={handlePrintA4}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
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
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl max-w-lg w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Sparkles className="w-5 h-5 text-amber-500" />
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
                className="px-5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition"
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
