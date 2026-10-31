"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  FolderOpen,
  Plus,
  Boxes,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  Layers,
  Sparkles,
  Printer,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Search,
  X,
  RotateCcw,
  SlidersHorizontal,
  Lock,
} from "lucide-react";
import { useAppStore } from "@/core/store/useAppStore";
import { formatPercentVi } from "@/core/calculations/profit-calculator";
import { WORKSHOP_TERMS } from "@/core/constants/terms";
import HelpTooltip from "@/core/components/HelpTooltip";

export default function DashboardPage() {
  const { projects, deleteProject } = useAppStore();

  // ==========================================================================
  // PHỄU LỌC DỰ ÁN (PROJECTS FILTER FUNNEL)
  // ==========================================================================
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "quoted" | "approved" | "in_production">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "quote_desc" | "quote_asc" | "items_desc">("newest");
  const [priceRangeFilter, setPriceRangeFilter] = useState<"all" | "under_20m" | "20m_50m" | "above_50m">("all");
  const [showFilterFunnel, setShowFilterFunnel] = useState(false);

  // Thống kê số lượng dự án theo từng bước của phễu (Status Pipeline)
  const statusCounts = useMemo(() => ({
    all: projects.length,
    draft: projects.filter((p) => p.status === "draft").length,
    quoted: projects.filter((p) => p.status === "quoted").length,
    approved: projects.filter((p) => p.status === "approved" || p.status === "ordered" || p.status === "finalized").length,
    in_production: projects.filter((p) => p.status === "in_production").length,
  }), [projects]);

  // Bộ lọc đa tiêu chí & Sắp xếp danh sách dự án
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        // 1. Tìm kiếm từ khóa (Tên công trình, khách hàng, số điện thoại)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const match =
            p.projectName.toLowerCase().includes(q) ||
            (p.clientName && p.clientName.toLowerCase().includes(q)) ||
            (p.clientPhone && p.clientPhone.includes(q));
          if (!match) return false;
        }

        // 2. Lọc theo Phễu trạng thái hợp đồng
        if (statusFilter !== "all") {
          if (statusFilter === "draft" && p.status !== "draft") return false;
          if (statusFilter === "quoted" && p.status !== "quoted") return false;
          if (statusFilter === "approved" && p.status !== "approved" && p.status !== "ordered" && p.status !== "finalized") return false;
          if (statusFilter === "in_production" && p.status !== "in_production") return false;
        }

        // 3. Lọc theo Khoảng giá trị dự toán
        if (priceRangeFilter !== "all") {
          const val = p.totalQuote || 0;
          if (priceRangeFilter === "under_20m" && val >= 20_000_000) return false;
          if (priceRangeFilter === "20m_50m" && (val < 20_000_000 || val > 50_000_000)) return false;
          if (priceRangeFilter === "above_50m" && val <= 50_000_000) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === "quote_desc") return (b.totalQuote || 0) - (a.totalQuote || 0);
        if (sortBy === "quote_asc") return (a.totalQuote || 0) - (b.totalQuote || 0);
        if (sortBy === "items_desc") return (b.items?.length || 0) - (a.items?.length || 0);
        return 0;
      });
  }, [projects, searchQuery, statusFilter, priceRangeFilter, sortBy]);

  const activeFilterCount = (searchQuery ? 1 : 0) + (statusFilter !== "all" ? 1 : 0) + (priceRangeFilter !== "all" ? 1 : 0) + (sortBy !== "newest" ? 1 : 0);

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriceRangeFilter("all");
    setSortBy("newest");
  };

  const totalQuoteSum = projects.reduce((sum, p) => sum + (p.totalQuote || 0), 0);
  const totalCostSum = projects.reduce((sum, p) => sum + (p.totalCost || 0), 0);
  const totalProfitSum = totalQuoteSum - totalCostSum;

  const formatVND = (val: number) => val.toLocaleString("vi-VN") + " đ";

  return (
    <div className="space-y-6 font-sans">
      {/* Technical Status Ribbon */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-2 px-4 rounded-2xl font-mono border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-4 text-[10px]">
          <span className="flex items-center gap-1.5 text-amber-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            TRUNG TÂM QUẢN TRỊ XƯỞNG GỖ CNC
          </span>
          <span className="text-slate-400">KHỔ VÁN CHUẨN: <strong className="text-white">1220 × 2440 MM</strong></span>
          <span className="text-slate-400">MẠCH CƯA: <strong className="text-white">3.2 MM</strong></span>
          <span className="text-slate-400">ĐỊNH MỨC KEO: <strong className="text-white">PUR 190°C</strong></span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span className="text-emerald-400 flex items-center gap-1 font-sans font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> BẢO MẬT RLS TOÀN VẸN
          </span>
          <span className="font-mono">SAI SỐ &lt; 1%</span>
        </div>
      </div>

      {/* Welcome Hero Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Nền tảng dự toán & bóc tách gỗ công nghiệp chuẩn xưởng</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Một đầu vào {WORKSHOP_TERMS.cutlist.labelWithOriginal} Excel, hai đầu ra tự động.
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed">
            Quy đổi tự động khổ ván tiêu chuẩn 1220x2440mm, tính chính xác mét dài chỉ dán cạnh PVC và xuất bản báo giá A4 chuyên nghiệp có logo riêng của xưởng.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/quoting"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-amber-500 hover:bg-amber-600 shadow-sm shadow-amber-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Bóc tách dự án mới (/quoting)</span>
            </Link>

            <Link
              href="/materials"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition"
            >
              <Boxes className="w-4 h-4 text-slate-500" />
              <span>Thư viện đơn giá xưởng</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Dự án đã lưu</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FolderOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{projects.length}</div>
          <p className="text-xs text-slate-500">Đang lưu trữ trong kho</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tổng doanh số dự toán</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{formatVND(totalQuoteSum)}</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-xs text-emerald-700 font-medium">Lợi nhuận gộp: +{formatVND(totalProfitSum)}</p>
            {totalQuoteSum > 0 && (
              <span className="text-[11px] text-slate-500 font-mono flex items-center gap-0.5">
                <span>• Biên LN: <strong className="text-emerald-800">{formatPercentVi((totalProfitSum / totalQuoteSum) * 100)}</strong></span>
                <HelpTooltip content={WORKSHOP_TERMS.profitMargin.shortExplanation} label="Giải thích biên lợi nhuận" />
              </span>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Khổ ván chuẩn xưởng</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">2.9768 m²</div>
          <p className="text-xs text-slate-500">1220 x 2440 mm (Hao hụt +15%)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Cổng thanh toán</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              VietQR
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">Sẵn sàng</div>
          <p className="text-xs text-slate-500">Tự động kích hoạt gói Pro</p>
        </div>
      </div>

      {/* Projects List with Phễu Lọc (Filter Funnel) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Header với tìm kiếm & công cụ lọc */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
            <h2 className="font-bold text-slate-900 text-sm">
              Danh sách dự án đã bóc tách
            </h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {filteredProjects.length === projects.length
                ? `${projects.length} dự án`
                : `${filteredProjects.length} / ${projects.length} dự án`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Ô tìm kiếm dự án */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên dự án, khách, SĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 w-48 sm:w-56"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Sắp xếp */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-1.5 px-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
            >
              <option value="newest">Mới nhất trước</option>
              <option value="oldest">Cũ nhất trước</option>
              <option value="quote_desc">Giá trị cao nhất</option>
              <option value="quote_asc">Giá trị thấp nhất</option>
              <option value="items_desc">Nhiều chi tiết tấm nhất</option>
            </select>

            {/* Nút bật tắt Phễu Lọc mở rộng */}
            <button
              type="button"
              onClick={() => setShowFilterFunnel(!showFilterFunnel)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition shadow-xs cursor-pointer ${
                activeFilterCount > 0
                  ? "bg-amber-500 text-white shadow-amber-500/20"
                  : showFilterFunnel
                  ? "bg-slate-900 text-white"
                  : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Phễu Lọc</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-amber-700 font-mono text-[10px] flex items-center justify-center font-black">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <Link
              href="/quoting"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Dự án mới</span>
            </Link>
          </div>
        </div>

        {/* Thanh Phễu Lọc Theo Trạng Thái (Pipeline Funnel Tabs) */}
        <div className="px-4 py-2 bg-slate-100/60 border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-400 font-bold text-[11px] shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Trạng thái:
          </span>

          {[
            { id: "all", label: "Tất cả", count: statusCounts.all, color: "bg-slate-900 text-white" },
            { id: "draft", label: "📝 Bản nháp", count: statusCounts.draft, color: "bg-amber-600 text-white" },
            { id: "quoted", label: "📨 Đã gửi khách", count: statusCounts.quoted, color: "bg-blue-600 text-white" },
            { id: "approved", label: "✅ Đã chốt duyệt", count: statusCounts.approved, color: "bg-emerald-600 text-white" },
            { id: "in_production", label: "🚀 Lệnh xưởng CNC", count: statusCounts.in_production, color: "bg-indigo-600 text-white" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                statusFilter === tab.id
                  ? `${tab.color} shadow-xs font-bold`
                  : "bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                statusFilter === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Khung Phễu Lọc Mở Rộng (Giá trị, Khoảng quy mô) */}
        {(showFilterFunnel || activeFilterCount > 0) && (
          <div className="bg-slate-50/90 border-b border-slate-200/80 p-3.5 space-y-2.5 animate-in fade-in duration-150 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600 text-[11px]">Khoảng giá trị hợp đồng:</span>
                <select
                  value={priceRangeFilter}
                  onChange={(e) => setPriceRangeFilter(e.target.value as any)}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-amber-500 focus:outline-none"
                >
                  <option value="all">Tất cả quy mô ngân sách</option>
                  <option value="under_20m">Dưới 20 triệu (Dự án nhỏ/1 phòng)</option>
                  <option value="20m_50m">20 - 50 triệu (Căn hộ 1-2PN)</option>
                  <option value="above_50m">Trên 50 triệu (Biệt thự/Nhà phố)</option>
                </select>
              </div>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition font-semibold text-xs ml-auto cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Xóa toàn bộ bộ lọc</span>
                </button>
              )}
            </div>
          </div>
        )}

        <div className="divide-y divide-slate-100">
          {projects.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-3">
              <FolderOpen className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-medium">Chưa có dự án nào được lưu.</p>
              <Link
                href="/quoting"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Bóc tách {WORKSHOP_TERMS.cutlist.label} đầu tiên</span>
              </Link>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-3">
              <Filter className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-800">Không tìm thấy dự án phù hợp với phễu lọc.</p>
              <p className="text-xs text-slate-500">Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn tất cả trạng thái.</p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa bộ lọc</span>
              </button>
            </div>
          ) : (
            filteredProjects.map((prj) => (
              <div
                key={prj.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{prj.projectName}</h3>
                    {prj.versionNo && prj.versionNo > 1 && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-700 border border-slate-300">
                        v{prj.versionNo}
                      </span>
                    )}
                    {prj.isLocked && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-amber-300 border border-slate-700 flex items-center gap-1 shadow-2xs">
                        <Lock className="w-2.5 h-2.5 text-amber-400" />
                        Đã Khóa HĐ
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        prj.status === "in_production"
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200 font-bold"
                          : prj.status === "approved" || prj.status === "ordered" || prj.status === "finalized"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold"
                          : prj.status === "quoted"
                          ? "bg-blue-50 text-blue-700 border-blue-200 font-bold"
                          : "bg-amber-50 text-amber-700 border-amber-200 font-bold"
                      }`}
                    >
                      {prj.status === "in_production"
                        ? "🚀 Lệnh xưởng CNC"
                        : prj.status === "approved" || prj.status === "finalized"
                        ? "✅ Đã chốt duyệt"
                        : prj.status === "ordered"
                        ? "Đã đặt hàng"
                        : prj.status === "quoted"
                        ? "📨 Đã gửi khách"
                        : "📝 Bản nháp"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Khách: <strong className="text-slate-700 font-medium">{prj.clientName}</strong> • {new Date(prj.createdAt).toLocaleDateString("vi-VN")} • {prj.items?.length || 0} chi tiết tấm
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400">Báo giá khách</div>
                    <div className="font-mono font-bold text-slate-900 text-sm">
                      {formatVND(prj.totalQuote)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/quoting?id=${prj.id}`}
                      className="px-3.5 py-2 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition"
                    >
                      Mở dự toán
                    </Link>

                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xóa dự án "${prj.projectName}"?`)) {
                          deleteProject(prj.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Xóa dự án"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
