"use client";

import { useState, useMemo } from "react";
import { Search, X, Check, Boxes, Filter, Tag, Layers, ArrowUpRight } from "lucide-react";
import { SAMPLE_MATERIALS_CATALOG, ExportMaterialItem } from "@/core/data/exportFurnitureCatalog";

function formatVND(val: number): string {
  return (val || 0).toLocaleString("vi-VN") + " đ";
}

interface MaterialCatalogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (item: ExportMaterialItem) => void;
  title?: string;
  selectedCode?: string;
}

const CATEGORIES: { key: string; label: string }[] = [
  { key: "all", label: "Tất cả (612)" },
  { key: "WOOD", label: "Gỗ tự nhiên" },
  { key: "BOARD", label: "Ván công nghiệp" },
  { key: "PLYWOOD", label: "Gỗ Plywood" },
  { key: "HARDWARE", label: "Phụ kiện kim khí" },
  { key: "CHEMICAL", label: "Hóa chất & Sơn" },
  { key: "STONE", label: "Đá thi công" },
  { key: "METAL", label: "Kim loại / Khung sắt" },
  { key: "FOAM & FABRIC", label: "Nệm mút & Vải" },
  { key: "RATTAN/ LEATHER", label: "Mây đan & Da" },
  { key: "RESIN", label: "Nhựa Resin" },
  { key: "VENNER", label: "Veneer lạng" },
  { key: "END GRAIN", label: "End Grain" },
  { key: "HONEYCOMB", label: "Tổ ong Honeycomb" },
  { key: "Woven", label: "Vật liệu dệt" },
];

export default function MaterialCatalogDrawer({
  isOpen,
  onClose,
  onSelect,
  title = "Tra cứu 612 mã vật tư chuẩn xưởng (Sheet1)",
  selectedCode,
}: MaterialCatalogDrawerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredMaterials = useMemo(() => {
    let result = SAMPLE_MATERIALS_CATALOG;
    if (activeCategory !== "all") {
      result = result.filter((m) => m.category === activeCategory);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (m) =>
          (m.rmCode && m.rmCode.toLowerCase().includes(q)) ||
          m.name.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          (m.subCategory && m.subCategory.toLowerCase().includes(q))
      );
    }
    return result;
  }, [searchTerm, activeCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col border-l border-zinc-200 animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900">{title}</h3>
              <p className="text-[11px] text-zinc-500 font-mono">
                Sheet1 Ngày 28/08/2026 • 16 Nhóm Ngành • 612 Mã Chuẩn
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-zinc-100 space-y-3 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã vật tư (WO01..., MDF...), tên gọi, nhóm..."
              className="w-full pl-9 pr-8 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition font-sans"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeCategory === cat.key
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>Tìm thấy {filteredMaterials.length} vật tư phù hợp</span>
          {onSelect && <span>Click vào dòng để áp dụng vào bảng BOM</span>}
        </div>

        {/* Material List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 p-2 space-y-1">
          {filteredMaterials.map((m, idx) => {
            const isSelected = selectedCode && m.rmCode === selectedCode;
            return (
              <div
                key={m.rmCode || `${m.name}-${idx}`}
                onClick={() => {
                  if (onSelect) {
                    onSelect(m);
                    onClose();
                  }
                }}
                className={`p-3 rounded-lg border transition flex items-center justify-between gap-3 ${
                  onSelect ? "cursor-pointer hover:border-zinc-400 hover:bg-zinc-50/80" : ""
                } ${
                  isSelected
                    ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900"
                    : "border-zinc-100 bg-white"
                }`}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {m.rmCode ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
                        {m.rmCode}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-100 text-zinc-500">
                        N/A
                      </span>
                    )}
                    <span className="text-[10px] font-mono uppercase text-zinc-400">
                      {m.category} {m.subCategory ? `• ${m.subCategory}` : ""}
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs text-zinc-900 truncate">{m.name}</h4>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
                    <span>ĐVT: <strong className="text-zinc-700">{m.unit}</strong></span>
                    <span>•</span>
                    <span>Hao hụt: <strong className="text-zinc-700">{Math.round(m.waste * 100)}%</strong></span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-xs text-zinc-900">
                    {formatVND(m.priceVND)}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400">
                    ${m.priceUSD.toFixed(2)} USD
                  </div>
                  {onSelect && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-zinc-900 mt-1">
                      Chọn <ArrowUpRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {filteredMaterials.length === 0 && (
            <div className="p-8 text-center text-xs text-zinc-400 space-y-2">
              <Boxes className="w-8 h-8 mx-auto text-zinc-300" />
              <p>Không tìm thấy vật tư nào khớp với từ khóa &ldquo;{searchTerm}&rdquo;</p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("all");
                }}
                className="text-zinc-900 font-bold hover:underline"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs text-zinc-500">
          <span>Tổng 612 vật tư tham khảo</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
