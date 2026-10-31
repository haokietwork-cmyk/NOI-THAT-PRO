"use client";

import { useState, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Boxes, 
  RotateCcw,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Globe,
  Palette,
  BookOpen,
  Filter
} from "lucide-react";
import { useAppStore } from "@/core/store/useAppStore";
import { MaterialCategory, MaterialItem } from "@/core/types";
import TechnicalHandbookModal from "@/core/components/TechnicalHandbookModal";
import { WORKSHOP_TERMS } from "@/core/constants/terms";
import HelpTooltip from "@/core/components/HelpTooltip";

export default function MaterialsPage() {
  const { materials, addMaterial, updateMaterial, deleteMaterial, resetToDefaults } = useAppStore();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // ==========================================================================
  // PHỄU LỌC NÂNG CAO VẬT TƯ (MATERIALS ADVANCED FILTER FUNNEL)
  // ==========================================================================
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [filterThickness, setFilterThickness] = useState<string>("all");
  const [filterDimension, setFilterDimension] = useState<string>("all");
  const [filterPriceRange, setFilterPriceRange] = useState<string>("all");
  const [filterWaste, setFilterWaste] = useState<string>("all");
  const [filterBrandName, setFilterBrandName] = useState<string>("all");
  
  // Inline quick editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editWaste, setEditWaste] = useState<number>(1.15);

  // Modal Thêm / Sửa chi tiết
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [showModal, setShowModal] = useState(false);
  const [showSpecHandbook, setShowSpecHandbook] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MaterialItem | null>(null);

  // Form states
  const [formCategory, setFormCategory] = useState<MaterialCategory>("board");
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formBrand, setFormBrand] = useState("An Cường");
  const [formSurface, setFormSurface] = useState("Melamine 2 mặt");
  const [formCoreStandard, setFormCoreStandard] = useState("HMR V313 E1");
  const [formUnit, setFormUnit] = useState("tấm");
  const [formLength, setFormLength] = useState<number>(2440);
  const [formWidth, setFormWidth] = useState<number>(1220);
  const [formThickness, setFormThickness] = useState<number>(17);
  const [formPrice, setFormPrice] = useState<number>(680_000);
  const [formWaste, setFormWaste] = useState<number>(1.15);
  const [formNote, setFormNote] = useState("");
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Mở modal thêm mới
  const openCreateModal = () => {
    setModalMode("create");
    setSelectedItem(null);
    setFormCategory("board");
    setFormCode("");
    setFormName("");
    setFormBrand("An Cường");
    setFormSurface("Melamine 2 mặt");
    setFormCoreStandard("HMR V313 E1");
    setFormUnit("tấm");
    setFormLength(2440);
    setFormWidth(1220);
    setFormThickness(17);
    setFormPrice(680_000);
    setFormWaste(1.15);
    setFormNote("");
    setShowModal(true);
  };

  // Mở modal sửa chi tiết
  const openEditModal = (item: MaterialItem) => {
    setModalMode("edit");
    setSelectedItem(item);
    setFormCategory(item.category);
    setFormCode(item.code);
    setFormName(item.name);
    setFormBrand(item.brand || "An Cường");
    setFormSurface(item.surface || "");
    setFormCoreStandard(item.coreStandard || "");
    setFormUnit(item.unit);
    setFormLength(item.standardLengthMm ?? item.standardLength ?? 2440);
    setFormWidth(item.standardWidthMm ?? item.standardWidth ?? 1220);
    setFormThickness(item.thicknessMm ?? item.thickness ?? 17);
    setFormPrice(item.unitPrice);
    setFormWaste(item.wasteFactor);
    setFormNote(item.note || "");
    setShowModal(true);
  };

  // Bắt đầu sửa nhanh inline
  const startInlineEdit = (item: MaterialItem) => {
    setEditingId(item.id);
    setEditPrice(item.unitPrice);
    setEditWaste(item.wasteFactor);
  };

  // Lưu sửa nhanh inline
  const saveInlineEdit = async (id: string) => {
    await updateMaterial(id, {
      unitPrice: Number(editPrice),
      wasteFactor: Number(editWaste),
    });
    setEditingId(null);
    showToast("Đã cập nhật đơn giá & hao hụt!");
  };

  const cancelInlineEdit = () => {
    setEditingId(null);
  };

  // Submit Modal (Thêm mới hoặc Cập nhật)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formName.trim()) {
      alert("Vui lòng nhập Mã vật tư và Tên vật tư!");
      return;
    }

    const payload = {
      category: formCategory,
      code: formCode.trim().toUpperCase(),
      name: formName.trim(),
      brand: formBrand.trim() || undefined,
      surface: formSurface.trim() || undefined,
      coreStandard: formCoreStandard.trim() || undefined,
      unit: formUnit.trim(),
      standardLengthMm: formCategory === "board" ? Number(formLength) : undefined,
      standardWidthMm: formCategory === "board" ? Number(formWidth) : undefined,
      thicknessMm: formCategory === "board" ? Number(formThickness) : undefined,
      standardLength: formCategory === "board" ? Number(formLength) : undefined,
      standardWidth: formCategory === "board" ? Number(formWidth) : undefined,
      thickness: formCategory === "board" ? Number(formThickness) : undefined,
      unitPrice: Number(formPrice),
      wasteFactor: Number(formWaste),
      note: formNote.trim(),
    };

    if (modalMode === "create") {
      await addMaterial(payload);
      showToast(`Đã thêm vật tư mới [${payload.code}]!`);
    } else if (selectedItem) {
      await updateMaterial(selectedItem.id, payload);
      showToast(`Đã cập nhật thông tin [${payload.code}]!`);
    }

    setShowModal(false);
  };

  // Xóa vật tư
  const handleDelete = async (item: MaterialItem) => {
    if (confirm(`Bạn có chắc chắn muốn xóa vật tư "${item.name}" khỏi thư viện?`)) {
      await deleteMaterial(item.id);
      showToast(`Đã xóa vật tư [${item.code}]!`);
    }
  };

  // Trích xuất danh sách thương hiệu độc nhất
  const uniqueBrands = useMemo(() => {
    const set = new Set<string>();
    materials.forEach((m) => {
      if (m.brand && m.brand.trim()) set.add(m.brand.trim());
    });
    return Array.from(set);
  }, [materials]);

  // Lọc dữ liệu theo Phễu lọc đa tiêu chí
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      // 1. Tab danh mục chính
      const matchTab = activeTab === "all" || m.category === activeTab;
      if (!matchTab) return false;

      const brandLower = (m.brand || "").toLowerCase();
      const nameLower = m.name.toLowerCase();

      // 2. Phân nhóm kỹ thuật nhanh
      let matchBrandGroup = true;
      if (brandFilter === "moisture_proof") {
        matchBrandGroup = !!(m.coreStandard?.includes("V313") || nameLower.includes("kháng ẩm") || nameLower.includes("chống ẩm") || nameLower.includes("chống nước") || nameLower.includes("wpb"));
      } else if (brandFilter === "surface_finishing") {
        matchBrandGroup = m.category === "edge" || !!(m.surface?.toLowerCase().includes("melamine") || m.surface?.toLowerCase().includes("acrylic") || nameLower.includes("chỉ") || nameLower.includes("nẹp"));
      } else if (brandFilter === "hardware_system") {
        matchBrandGroup = m.category === "hardware" || nameLower.includes("bản lề") || nameLower.includes("ray") || nameLower.includes("phụ kiện");
      }
      if (!matchBrandGroup) return false;

      // 3. Lọc theo Thương hiệu / Hãng
      if (filterBrandName !== "all" && m.brand !== filterBrandName) {
        return false;
      }

      // 4. Lọc theo Độ dày phôi (Board)
      if (filterThickness !== "all") {
        const thk = m.thicknessMm ?? m.thickness;
        if (thk !== Number(filterThickness)) return false;
      }

      // 5. Lọc theo Khổ phôi tiêu chuẩn
      if (filterDimension !== "all") {
        if (filterDimension === "1220x2440") {
          const isStandard =
            (m.standardLengthMm === 2440 && m.standardWidthMm === 1220) ||
            (m.standardLength === 2440 && m.standardWidth === 1220);
          if (!isStandard) return false;
        } else if (filterDimension === "1830x2440") {
          const isJumbo =
            (m.standardLengthMm === 2440 && m.standardWidthMm === 1830) ||
            (m.standardLength === 2440 && m.standardWidth === 1830) ||
            nameLower.includes("jumbo");
          if (!isJumbo) return false;
        }
      }

      // 6. Lọc theo Mức giá
      if (filterPriceRange !== "all") {
        const p = m.unitPrice || 0;
        if (filterPriceRange === "under_200k" && p >= 200_000) return false;
        if (filterPriceRange === "200k_500k" && (p < 200_000 || p > 500_000)) return false;
        if (filterPriceRange === "500k_1m" && (p < 500_000 || p > 1_000_000)) return false;
        if (filterPriceRange === "above_1m" && p <= 1_000_000) return false;
      }

      // 7. Lọc theo Hệ số hao hụt
      if (filterWaste !== "all") {
        const wf = m.wasteFactor || 1;
        if (filterWaste === "has_waste" && wf <= 1.0) return false;
        if (filterWaste === "zero_waste" && wf > 1.0) return false;
      }

      // 8. Tìm kiếm từ khóa
      const searchLower = searchTerm.toLowerCase().trim();
      if (searchLower) {
        const matchSearch =
          nameLower.includes(searchLower) ||
          m.code.toLowerCase().includes(searchLower) ||
          (m.surface && m.surface.toLowerCase().includes(searchLower)) ||
          (m.coreStandard && m.coreStandard.toLowerCase().includes(searchLower)) ||
          (m.brand && brandLower.includes(searchLower));
        if (!matchSearch) return false;
      }

      return true;
    });
  }, [materials, activeTab, brandFilter, filterBrandName, filterThickness, filterDimension, filterPriceRange, filterWaste, searchTerm]);

  // Đếm số tiêu chí lọc mở rộng
  const activeAdvancedFilterCount = useMemo(() => {
    let c = 0;
    if (filterThickness !== "all") c++;
    if (filterDimension !== "all") c++;
    if (filterPriceRange !== "all") c++;
    if (filterWaste !== "all") c++;
    if (filterBrandName !== "all") c++;
    if (brandFilter !== "all") c++;
    if (searchTerm.trim()) c++;
    return c;
  }, [filterThickness, filterDimension, filterPriceRange, filterWaste, filterBrandName, brandFilter, searchTerm]);

  const handleResetAdvancedFilters = () => {
    setFilterThickness("all");
    setFilterDimension("all");
    setFilterPriceRange("all");
    setFilterWaste("all");
    setFilterBrandName("all");
    setBrandFilter("all");
    setSearchTerm("");
  };

  const formatVND = (val: number) => (val || 0).toLocaleString("vi-VN") + " đ";

  // Thống kê số lượng theo danh mục
  const countByCategory = {
    all: materials.length,
    board: materials.filter((m) => m.category === "board").length,
    edge: materials.filter((m) => m.category === "edge").length,
    hardware: materials.filter((m) => m.category === "hardware").length,
    labor: materials.filter((m) => m.category === "labor").length,
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Toast thông báo */}
      {saveToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <Boxes className="w-3.5 h-3.5" />
            <span>Thư viện Vật tư & Đơn giá Xưởng</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản lý Vật tư & Bảng giá vốn
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <span>Đơn giá được tự động chụp ảnh ({WORKSHOP_TERMS.snapshotPricing.labelWithOriginal}) khi tạo dự án để bảo toàn giá trị hợp đồng lịch sử.</span>
            <HelpTooltip content={WORKSHOP_TERMS.snapshotPricing.shortExplanation} label="Giải thích giá chốt ngày tạo" />
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm("Khôi phục danh mục về bộ dữ liệu mẫu ban đầu của xưởng?")) {
                resetToDefaults();
                showToast("Đã khôi phục dữ liệu mẫu ban đầu!");
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-xs"
            title="Khôi phục danh mục vật tư mẫu"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Khôi phục mẫu</span>
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition shadow-sm shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm vật tư mới</span>
          </button>
        </div>
      </div>

      {/* Technical Standards Ribbon */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-2 px-4 rounded-2xl font-mono border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-4 text-[10px]">
          <span className="flex items-center gap-1.5 text-amber-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            TIÊU CHUẨN ĐỊNH MỨC XƯỞNG
          </span>
          <span className="text-slate-400">KHỔ PHÔI VÁN: <strong className="text-white">1220 × 2440 MM & 1830 × 2440 JUMBO</strong></span>
          <span className="text-slate-400">DUNG SAI ĐỘ DÀY: <strong className="text-white">±0.2 MM</strong></span>
          <span className="text-slate-400">CHỈ DÁN CẠNH: <strong className="text-white">PVC 1×21MM & 2×21MM (KEO PUR)</strong></span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span className="text-emerald-400 flex items-center gap-1 font-sans font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> {WORKSHOP_TERMS.snapshotPricing.labelWithOriginal.toUpperCase()} BẢO TOÀN GIÁ VỐN
          </span>
        </div>
      </div>

      {/* Thanh Sổ Tay Quy Chuẩn & Định Mức Kỹ Thuật Nội Bộ (0% Link ngoài) */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/20 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="font-bold text-slate-800">Quy Chuẩn Định Mức & Thông Số Kỹ Thuật Vật Tư:</span>
          <span className="text-slate-500 hidden sm:inline">Khổ phôi 1220×2440 & Jumbo 1830×2440, Cốt HMR V313, Ván Nhựa WPB Chống Nước, Nẹp PUR</span>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setShowSpecHandbook(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-amber-50 text-amber-900 text-[11px] font-bold rounded-lg border border-amber-300 shadow-2xs transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span>Tra Cứu Sổ Tay Quy Cách Kỹ Thuật</span>
          </button>
        </div>
      </div>

      {/* Main Card with Tabs & Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        
        {/* Navigation Tabs and Search */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* 4 Tab lọc nhanh với màu nhận diện đặc trưng từng nhóm vật tư */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-xl text-xs font-semibold text-slate-600">
              {[
                { 
                  id: "all", 
                  label: "Tất cả", 
                  count: countByCategory.all,
                  activeClass: "bg-slate-900 text-white shadow-xs",
                  badgeClass: activeTab === "all" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                },
                { 
                  id: "board", 
                  label: "Ván công nghiệp (Board)", 
                  count: countByCategory.board,
                  activeClass: "bg-amber-500 text-white shadow-xs shadow-amber-500/20",
                  badgeClass: activeTab === "board" ? "bg-amber-600 text-white" : "bg-amber-100 text-amber-800"
                },
                { 
                  id: "edge", 
                  label: "Chỉ dán cạnh (Edge)", 
                  count: countByCategory.edge,
                  activeClass: "bg-sky-600 text-white shadow-xs shadow-sky-600/20",
                  badgeClass: activeTab === "edge" ? "bg-sky-700 text-white" : "bg-sky-100 text-sky-800"
                },
                { 
                  id: "hardware", 
                  label: "Phụ kiện (Hardware)", 
                  count: countByCategory.hardware,
                  activeClass: "bg-emerald-600 text-white shadow-xs shadow-emerald-600/20",
                  badgeClass: activeTab === "hardware" ? "bg-emerald-700 text-white" : "bg-emerald-100 text-emerald-800"
                },
                { 
                  id: "labor", 
                  label: "Nhân công (Labor)", 
                  count: countByCategory.labor,
                  activeClass: "bg-purple-600 text-white shadow-xs shadow-purple-600/20",
                  badgeClass: activeTab === "labor" ? "bg-purple-700 text-white" : "bg-purple-100 text-purple-800"
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? `${tab.activeClass} font-bold`
                      : "hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${tab.badgeClass}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Cụm Tìm kiếm & Phễu lọc */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm mã ván, tên, Melamine, HMR V313..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Nút bật tắt Phễu Lọc */}
              <button
                type="button"
                onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition shadow-xs cursor-pointer shrink-0 ${
                  activeAdvancedFilterCount > 0
                    ? "bg-amber-500 text-white shadow-amber-500/20"
                    : showAdvancedFilter
                    ? "bg-slate-900 text-white"
                    : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Phễu Lọc</span>
                {activeAdvancedFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-white text-amber-700 font-mono text-[10px] flex items-center justify-center font-black">
                    {activeAdvancedFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Hàng bộ lọc phân nhóm kỹ thuật nhanh */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-[11px] flex-wrap">
            <span className="text-slate-400 font-semibold flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3 text-slate-400" />
              Phân nhóm kỹ thuật:
            </span>
            {[
              { id: "all", label: "Tất cả quy chuẩn" },
              { id: "moisture_proof", label: "💧 Cốt Chống Ẩm V313 & WPB" },
              { id: "surface_finishing", label: "✨ Bề Mặt Melamine/Acrylic & Nẹp Chỉ" },
              { id: "hardware_system", label: "⚙️ Phụ Kiện Giảm Chấn Hệ 32mm" },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setBrandFilter(b.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  brandFilter === b.id
                    ? "bg-amber-100 text-amber-900 font-bold border border-amber-300"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/60"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Khối Phễu Lọc Mở Rộng Đa Tiêu Chí */}
          {(showAdvancedFilter || activeAdvancedFilterCount > 0) && (
            <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3.5 space-y-3 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 text-xs">
                {/* Lọc Độ dày phôi */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Độ dày phôi:</label>
                  <select
                    value={filterThickness}
                    onChange={(e) => setFilterThickness(e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-amber-500 focus:outline-none"
                  >
                    <option value="all">Tất cả độ dày</option>
                    <option value="6">6mm (Ván hậu)</option>
                    <option value="9">9mm (Hộc kéo)</option>
                    <option value="15">15mm (Tủ nhỏ)</option>
                    <option value="17">17mm (Thùng & Cánh chuẩn)</option>
                    <option value="18">18mm (Tiêu chuẩn xuất khẩu)</option>
                  </select>
                </div>

                {/* Lọc Khổ phôi */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Quy cách khổ phôi:</label>
                  <select
                    value={filterDimension}
                    onChange={(e) => setFilterDimension(e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-amber-500 focus:outline-none"
                  >
                    <option value="all">Tất cả quy cách</option>
                    <option value="1220x2440">Khổ chuẩn 1220 × 2440 mm</option>
                    <option value="1830x2440">Khổ lớn Jumbo 1830 × 2440 mm</option>
                  </select>
                </div>

                {/* Lọc Thương hiệu / Hãng */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Hãng / Xuất xứ:</label>
                  <select
                    value={filterBrandName}
                    onChange={(e) => setFilterBrandName(e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-amber-500 focus:outline-none"
                  >
                    <option value="all">Tất cả thương hiệu</option>
                    {uniqueBrands.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* Lọc Khoảng giá */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Khoảng giá vốn:</label>
                  <select
                    value={filterPriceRange}
                    onChange={(e) => setFilterPriceRange(e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-amber-500 focus:outline-none"
                  >
                    <option value="all">Tất cả mức giá</option>
                    <option value="under_200k">Dưới 200.000 đ</option>
                    <option value="200k_500k">200.000 - 500.000 đ</option>
                    <option value="500k_1m">500.000 - 1.000.000 đ</option>
                    <option value="above_1m">Trên 1.000.000 đ</option>
                  </select>
                </div>

                {/* Lọc Hao hụt */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Định mức hao hụt:</label>
                  <select
                    value={filterWaste}
                    onChange={(e) => setFilterWaste(e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-amber-500 focus:outline-none"
                  >
                    <option value="all">Tất cả định mức</option>
                    <option value="has_waste">Có hao hụt (&gt; 0%)</option>
                    <option value="zero_waste">Không hao hụt (0%)</option>
                  </select>
                </div>
              </div>

              {/* Thanh tiêu chí & Reset */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-slate-500 font-medium">Bộ lọc:</span>
                  {filterThickness !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-semibold font-mono">
                      Dày: {filterThickness}mm
                      <button type="button" onClick={() => setFilterThickness("all")} className="hover:text-black">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filterDimension !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-semibold font-mono">
                      Khổ: {filterDimension}
                      <button type="button" onClick={() => setFilterDimension("all")} className="hover:text-black">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filterBrandName !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-semibold">
                      Hãng: {filterBrandName}
                      <button type="button" onClick={() => setFilterBrandName("all")} className="hover:text-black">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filterPriceRange !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-semibold">
                      Giá: {filterPriceRange}
                      <button type="button" onClick={() => setFilterPriceRange("all")} className="hover:text-black">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filterWaste !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-semibold">
                      Hao hụt: {filterWaste}
                      <button type="button" onClick={() => setFilterWaste("all")} className="hover:text-black">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-600">
                    Hiển thị <strong>{filteredMaterials.length}</strong> / <strong>{materials.length}</strong> vật tư
                  </span>
                  {activeAdvancedFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={handleResetAdvancedFilters}
                      className="inline-flex items-center gap-1 px-2 py-1 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition font-semibold cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Đặt lại</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hướng dẫn thao tác nhanh kiểu Excel */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
          <span className="flex items-center gap-1.5 text-amber-700 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Bấm trực tiếp vào ô Đơn giá hoặc Hao hụt để sửa nhanh như Excel (Enter để lưu, Esc để hủy).
          </span>
          <span className="font-mono text-slate-400">
            Hiển thị {filteredMaterials.length} vật tư
          </span>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3 w-10 text-center">STT</th>
                <th className="p-3">Mã vật tư</th>
                <th className="p-3">Tên vật tư & Quy chuẩn kỹ thuật</th>
                <th className="p-3">Phân loại</th>
                <th className="p-3">Quy cách / Khổ chuẩn</th>
                <th className="p-3 text-right">Đơn vị</th>
                <th className="p-3 text-right">Đơn giá vốn</th>
                <th className="p-3 text-right">Hệ số hao hụt</th>
                <th className="p-3 text-center w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    <Boxes className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p>Không tìm thấy vật tư nào phù hợp với bộ lọc.</p>
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((m, idx) => {
                  const isEditing = editingId === m.id;
                  const lengthMm = m.standardLengthMm ?? m.standardLength ?? 2440;
                  const widthMm = m.standardWidthMm ?? m.standardWidth ?? 1220;
                  const thickMm = m.thicknessMm ?? m.thickness ?? 17;

                  return (
                    <tr key={m.id} className="hover:bg-amber-50/30 transition">
                      {/* STT */}
                      <td className="p-3 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Mã vật tư */}
                      <td className="p-3">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                          {m.code}
                        </span>
                      </td>

                      {/* Tên vật tư & Tiêu chuẩn */}
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-900">{m.name}</span>
                          {m.brand && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                              {m.brand}
                            </span>
                          )}
                          {m.coreStandard && (
                            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {m.coreStandard}
                            </span>
                          )}
                        </div>
                        {m.surface && (
                          <div className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1">
                            <span className="text-slate-400">Bề mặt:</span>
                            <span className="font-medium text-slate-700">{m.surface}</span>
                          </div>
                        )}
                        {m.note && (
                          <div className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5">{m.note}</div>
                        )}
                      </td>

                      {/* Phân loại badge */}
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            m.category === "board"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : m.category === "edge"
                              ? "bg-sky-50 text-sky-800 border-sky-200"
                              : m.category === "hardware"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-purple-50 text-purple-800 border-purple-200"
                          }`}
                        >
                          {m.category === "board"
                            ? "Ván tấm"
                            : m.category === "edge"
                            ? "Chỉ dán cạnh"
                            : m.category === "hardware"
                            ? "Phụ kiện"
                            : "Nhân công"}
                        </span>
                      </td>

                      {/* Quy cách khổ chuẩn */}
                      <td className="p-3 font-mono text-slate-600 text-[11px]">
                        {m.category === "board" ? (
                          <span>
                            {lengthMm} x {widthMm} mm ({thickMm}mm)
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Đơn vị tính */}
                      <td className="p-3 text-right font-medium text-slate-600">
                        {m.unit}
                      </td>

                      {/* Đơn giá vốn: Bấm vào sửa trực tiếp như Excel */}
                      <td 
                        className="p-3 text-right cursor-pointer group"
                        onClick={() => { if (!isEditing) startInlineEdit(m); }}
                        title="Bấm để sửa đơn giá trực tiếp"
                      >
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(Number(e.target.value))}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveInlineEdit(m.id);
                                if (e.key === "Escape") cancelInlineEdit();
                              }}
                              className="w-28 text-right font-mono text-xs px-2 py-1 bg-amber-50 border-2 border-amber-500 rounded-lg focus:outline-none font-bold text-slate-900 shadow-2xs"
                              autoFocus
                            />
                            <button
                              onClick={(e) => { e.stopPropagation(); saveInlineEdit(m.id); }}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                              title="Lưu (Enter)"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); cancelInlineEdit(); }}
                              className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                              title="Hủy (Esc)"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-amber-50 border border-transparent hover:border-amber-200 transition">
                            <span className="font-mono font-bold text-slate-900">
                              {formatVND(m.unitPrice)}
                            </span>
                            <Edit3 className="w-3 h-3 text-slate-300 group-hover:text-amber-600 transition" />
                          </div>
                        )}
                      </td>

                      {/* Hệ số hao hụt: Bấm vào sửa trực tiếp */}
                      <td 
                        className="p-3 text-right cursor-pointer group"
                        onClick={() => { if (!isEditing) startInlineEdit(m); }}
                        title="Bấm để sửa hệ số hao hụt trực tiếp"
                      >
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editWaste}
                            onChange={(e) => setEditWaste(Number(e.target.value))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveInlineEdit(m.id);
                              if (e.key === "Escape") cancelInlineEdit();
                            }}
                            className="w-16 text-right font-mono text-xs px-2 py-1 bg-amber-50 border-2 border-amber-500 rounded-lg focus:outline-none font-bold text-slate-900 shadow-2xs"
                          />
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-amber-50 border border-transparent hover:border-amber-200 transition">
                            <span className="font-mono text-slate-600 font-semibold">
                              {m.wasteFactor > 1
                                ? `+${Math.round((m.wasteFactor - 1) * 100)}% (${m.wasteFactor})`
                                : "1.00 (0%)"}
                            </span>
                            <Edit3 className="w-3 h-3 text-slate-300 group-hover:text-amber-600 transition" />
                          </div>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="p-3 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => saveInlineEdit(m.id)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition"
                              title="Lưu"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelInlineEdit}
                              className="p-1 text-slate-400 hover:bg-slate-100 rounded transition"
                              title="Hủy"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => startInlineEdit(m)}
                              className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition"
                              title="Sửa nhanh giá & hao hụt"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEditModal(m)}
                              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition"
                              title="Sửa chi tiết thông tin"
                            >
                              <Layers className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(m)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                              title="Xóa vật tư"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Chú thích phía dưới */}
        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 flex items-start gap-2 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Lưu ý:</strong> Khi bạn thay đổi giá trong Thư viện này, giá của các dự án cũ đã lưu trong danh sách sẽ không bị thay đổi (Bảo toàn lịch sử giá vốn - {WORKSHOP_TERMS.snapshotPricing.labelWithOriginal}).
          </span>
        </div>
      </div>

      {/* ================================================================== */}
      {/* MODAL THÊM MỚI / SỬA CHI TIẾT VẬT TƯ                                */}
      {/* ================================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-600" />
                <h3 className="font-black text-slate-900 text-base">
                  {modalMode === "create" ? "Thêm vật tư xưởng mới" : "Chỉnh sửa thông tin vật tư"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              {/* Phân loại */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Phân loại vật tư</label>
                <select
                  value={formCategory}
                  onChange={(e) => {
                    const cat = e.target.value as MaterialCategory;
                    setFormCategory(cat);
                    if (cat === "board") {
                      setFormUnit("tấm");
                      setFormWaste(1.15);
                    } else if (cat === "edge") {
                      setFormUnit("md");
                      setFormWaste(1.08);
                    } else if (cat === "hardware") {
                      setFormUnit("cái");
                      setFormWaste(1.0);
                    } else {
                      setFormUnit("tấm");
                      setFormWaste(1.0);
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="board">1. Ván công nghiệp (MDF, Plywood, Picomat, HDF...)</option>
                  <option value="edge">2. Chỉ dán cạnh PVC đồng màu</option>
                  <option value="hardware">3. Phụ kiện kim khí (Bản lề, ray âm, tay nắm...)</option>
                  <option value="labor">4. Nhân công gia công xưởng & lắp đặt</option>
                </select>
              </div>

              {/* Mã & Đơn vị tính */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mã vật tư (viết hoa)</label>
                  <input
                    type="text"
                    placeholder="VD: MDF_17_AN_CUONG"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    required
                    className="w-full p-2.5 font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Đơn vị tính</label>
                  <input
                    type="text"
                    placeholder="tấm / md / cái / bộ"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              {/* Tên vật tư */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên vật tư chi tiết</label>
                <input
                  type="text"
                  placeholder="VD: Ván MDF Chống ẩm An Cường 17mm vân gỗ Melamine 330"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-slate-900"
                />
              </div>

              {/* Thương hiệu & Tiêu chuẩn cốt */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Thương hiệu / Xuất xứ</label>
                  <input
                    type="text"
                    placeholder="VD: An Cường, Hettich, Imundex..."
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                  />
                  <div className="flex gap-1 mt-1">
                    {["An Cường", "Hettich", "Imundex"].map((b) => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => setFormBrand(b)}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 transition"
                      >
                        +{b}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tiêu chuẩn cốt gỗ / Vật liệu</label>
                  <input
                    type="text"
                    placeholder="VD: HMR V313 E1, WPB Chịu nước 100%..."
                    value={formCoreStandard}
                    onChange={(e) => setFormCoreStandard(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              {/* Bề mặt phủ */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Quy cách bề mặt phủ</label>
                <input
                  type="text"
                  placeholder="VD: Melamine 2 mặt MS 330, Acrylic Noline PARC 01, Laminate Kingdom..."
                  value={formSurface}
                  onChange={(e) => setFormSurface(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Kích thước khổ chuẩn (nếu là ván) */}
              {formCategory === "board" && (
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 space-y-2">
                  <span className="font-bold text-amber-900 block text-[11px]">
                    Quy cách tấm ván tiêu chuẩn
                  </span>
                  <div className="grid grid-cols-3 gap-2 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Dài (mm)</span>
                      <input
                        type="number"
                        value={formLength}
                        onChange={(e) => setFormLength(Number(e.target.value))}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Rộng (mm)</span>
                      <input
                        type="number"
                        value={formWidth}
                        onChange={(e) => setFormWidth(Number(e.target.value))}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Độ dày (mm)</span>
                      <input
                        type="number"
                        value={formThickness}
                        onChange={(e) => setFormThickness(Number(e.target.value))}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Đơn giá vốn & Hao hụt */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Đơn giá vốn (VNĐ)</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    required
                    className="w-full p-2.5 font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Hệ số hao hụt ({Math.round((formWaste - 1) * 100)}%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formWaste}
                    onChange={(e) => setFormWaste(Number(e.target.value))}
                    required
                    className="w-full p-2.5 font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-slate-700 font-bold"
                  />
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ghi chú tiêu chuẩn</label>
                <input
                  type="text"
                  placeholder="VD: Tiêu chuẩn E1, keo PUR chống ẩm, lõi xanh..."
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition shadow-sm shadow-amber-500/20"
                >
                  {modalMode === "create" ? "Thêm vào danh mục" : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* SỔ TAY QUY CÁCH KỸ THUẬT GỖ CÔNG NGHIỆP LINH ĐỘNG (0% LINK NGOÀI)  */}
      {/* ================================================================== */}
      <TechnicalHandbookModal
        isOpen={showSpecHandbook}
        onClose={() => setShowSpecHandbook(false)}
      />

    </div>
  );
}
