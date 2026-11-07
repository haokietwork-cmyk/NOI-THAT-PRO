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
      {/* Page Heading & Actions (Shadcn Admin Pattern) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Dự Án Báo Giá
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý hợp đồng sản xuất, tiến độ báo giá và chiết tính giá vốn xưởng
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/materials"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition shadow-2xs"
          >
            <Boxes className="w-3.5 h-3.5 text-slate-500" />
            <span>Thư viện đơn giá</span>
          </Link>
          <Link
            href="/quoting"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo báo giá mới</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards (Shadcn Admin Card System) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng doanh số */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Tổng Doanh Số Dự Toán</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-slate-900">
            {formatVND(totalQuoteSum)}
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-0.5">
            <span>Lợi nhuận gộp: <strong className="text-zinc-900 font-bold font-mono">+{formatVND(totalProfitSum)}</strong></span>
            {totalQuoteSum > 0 && (
              <span className="text-slate-400 font-mono">({formatPercentVi((totalProfitSum / totalQuoteSum) * 100)})</span>
            )}
          </p>
        </div>

        {/* Card 2: Tổng dự án */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Tổng Số Dự Án</span>
            <FolderOpen className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-slate-900">
            {projects.length}
          </div>
          <p className="text-[11px] text-slate-500 pt-0.5">
            {statusCounts.approved + statusCounts.in_production} dự án đã chốt hoặc đang sản xuất
          </p>
        </div>

        {/* Card 3: Đã chốt & Sản xuất */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Đã Duyệt &amp; Sản Xuất</span>
            <CheckCircle2 className="w-4 h-4 text-zinc-900" />
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-slate-900">
            {statusCounts.approved + statusCounts.in_production}
          </div>
          <p className="text-[11px] text-slate-500 pt-0.5">
            {statusCounts.in_production} lệnh xưởng chạy máy CNC
          </p>
        </div>

        {/* Card 4: Đang báo giá / Bản nháp */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Đang Báo Giá / Bản Nháp</span>
            <FileSpreadsheet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-slate-900">
            {statusCounts.quoted + statusCounts.draft}
          </div>
          <p className="text-[11px] text-slate-500 pt-0.5">
            {statusCounts.quoted} đã gửi khách • {statusCounts.draft} bản nháp
          </p>
        </div>
      </div>

      {/* Projects Table & Filter Toolbar (Shadcn Admin Pattern) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        {/* Top Filter Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-900 text-xs tracking-tight">
              Danh sách công trình
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {filteredProjects.length === projects.length
                ? `${projects.length}`
                : `${filteredProjects.length} / ${projects.length}`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm dự án, khách hàng, SĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 w-48 sm:w-56"
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
              className="py-1.5 px-2 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="quote_desc">Giá trị cao nhất</option>
              <option value="quote_asc">Giá trị thấp nhất</option>
              <option value="items_desc">Nhiều hạng mục nhất</option>
            </select>

            {/* Bộ lọc mở rộng */}
            <button
              type="button"
              onClick={() => setShowFilterFunnel(!showFilterFunnel)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition cursor-pointer border ${
                activeFilterCount > 0
                  ? "bg-slate-900 text-white border-slate-900"
                  : showFilterFunnel
                  ? "bg-slate-100 text-slate-900 border-slate-300"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Lọc</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-slate-900 font-mono text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Segmented Pipeline Status Tabs (Shadcn TabsList Style, NO EMOJIS) */}
        <div className="px-3.5 py-2 bg-slate-50/70 border-b border-slate-200 flex items-center gap-1 overflow-x-auto text-xs">
          {[
            { id: "all", label: "Tất cả", count: statusCounts.all },
            { id: "draft", label: "Bản nháp", count: statusCounts.draft },
            { id: "quoted", label: "Đã gửi khách", count: statusCounts.quoted },
            { id: "approved", label: "Đã duyệt", count: statusCounts.approved },
            { id: "in_production", label: "Đang sản xuất", count: statusCounts.in_production },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-white text-slate-900 border border-slate-200 shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isActive ? "bg-slate-100 text-slate-800" : "bg-slate-200/70 text-slate-600"
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Khung Phễu Lọc Mở Rộng (Giá trị, Khoảng quy mô) */}
        {(showFilterFunnel || activeFilterCount > 0) && (
          <div className="bg-slate-50/90 border-b border-slate-200 p-3.5 space-y-2.5 animate-in fade-in duration-150 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600 text-[11px]">Khoảng giá trị hợp đồng:</span>
                <select
                  value={priceRangeFilter}
                  onChange={(e) => setPriceRangeFilter(e.target.value as any)}
                  className="p-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium focus:border-slate-900 focus:outline-none"
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
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition font-semibold text-xs ml-auto cursor-pointer"
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
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo báo giá đầu tiên</span>
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
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition shadow-2xs cursor-pointer"
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
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 text-white border border-zinc-700 flex items-center gap-1 shadow-2xs">
                        <Lock className="w-2.5 h-2.5 text-zinc-300" />
                        Đã Khóa HĐ
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                        prj.status === "in_production"
                          ? "bg-zinc-900 text-white border-zinc-800"
                          : prj.status === "approved" || prj.status === "ordered" || prj.status === "finalized"
                          ? "bg-zinc-100 text-zinc-900 border-zinc-300 font-semibold"
                          : prj.status === "quoted"
                          ? "bg-zinc-50 text-zinc-700 border-zinc-200"
                          : "bg-zinc-100 text-zinc-500 border-zinc-200"
                      }`}
                    >
                      {prj.status === "in_production"
                        ? "Lệnh xưởng CNC"
                        : prj.status === "approved" || prj.status === "finalized"
                        ? "Đã chốt duyệt"
                        : prj.status === "ordered"
                        ? "Đã đặt hàng"
                        : prj.status === "quoted"
                        ? "Đã gửi khách"
                        : "Bản nháp"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Khách: <strong className="text-slate-700 font-medium">{prj.clientName || "Chưa có tên"}</strong> • {new Date(prj.createdAt).toLocaleDateString("vi-VN")} • {prj.items?.length || 0} hạng mục
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Báo giá đề xuất</div>
                    <div className="font-mono font-bold text-slate-900 text-sm">
                      {formatVND(prj.totalQuote)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/quoting?id=${prj.id}`}
                      className="px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-md transition shadow-2xs"
                    >
                      Mở báo giá
                    </Link>

                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xóa dự án "${prj.projectName}"?`)) {
                          deleteProject(prj.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition cursor-pointer"
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
