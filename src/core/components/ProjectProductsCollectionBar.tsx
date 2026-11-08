"use client";

import React, { useState } from "react";
import {
  Layers,
  Plus,
  Copy,
  Trash2,
  FolderOpen,
  Sparkles,
  Bed,
  DoorClosed,
  Table,
  Tv,
  Check,
  X,
  ChevronRight,
  Maximize2,
  Sliders,
} from "lucide-react";
import type { ProjectProductItem } from "../calculations/project-collection";
import {
  PRODUCT_ARCHETYPES_CATALOG,
  ARCHETYPE_CATEGORIES,
  type ProductArchetypeItem,
} from "../data/productArchetypesCatalog";

interface ProjectProductsCollectionBarProps {
  products: ProjectProductItem[];
  activeProductId: string;
  onSelectProduct: (productId: string) => void;
  onAddProduct: (archetype?: ProductArchetypeItem, room?: string) => void;
  onDuplicateProduct: (productId: string) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateProductQty: (productId: string, newQty: number) => void;
  onUpdateProductRoom: (productId: string, newRoom: string) => void;
  productPrices?: Record<string, number>; // unitPrice per product
  totalQuotePrice: number;
  totalCOGSPrice: number;
  collectionType?: "project" | "collection";
}

export default function ProjectProductsCollectionBar({
  products,
  activeProductId,
  onSelectProduct,
  onAddProduct,
  onDuplicateProduct,
  onDeleteProduct,
  onUpdateProductQty,
  onUpdateProductRoom,
  productPrices = {},
  totalQuotePrice,
  totalCOGSPrice,
  collectionType = "project",
}: ProjectProductsCollectionBarProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [targetRoom, setTargetRoom] = useState("Phòng ngủ");

  const formatVND = (val: number) => (val || 0).toLocaleString("vi-VN") + " đ";

  const ROOM_SUGGESTIONS = [
    "Phòng khách",
    "Phòng ngủ Master",
    "Phòng ngủ nhỏ",
    "Phòng bếp",
    "Phòng ăn",
    "Sảnh vào",
    "Phòng tắm",
    "Ban công",
    "Phòng làm việc",
  ];

  const filteredArchetypes = PRODUCT_ARCHETYPES_CATALOG.filter((item) => {
    const matchesCat = selectedCategory === "all" || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.aliases || []).some((a) => a.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const totalItemsCount = products.reduce((sum, p) => sum + (p.qty || 1), 0);

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-2xs p-3.5 space-y-3">
      {/* Top Header of Collection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-zinc-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider truncate">
                {collectionType === "collection"
                  ? "Danh Sách Sản Phẩm Trong Bộ Sưu Tập"
                  : "Danh Sách Sản Phẩm Trong Dự Án"}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 text-zinc-800 border border-zinc-200 shrink-0">
                {products.length} sản phẩm • {totalItemsCount} món
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 truncate">
              {collectionType === "collection"
                ? "Nhấp vào sản phẩm để cấu hình kích thước & quy cách. Bảng giá tự động tổng hợp cho toàn bộ bộ sưu tập."
                : "Nhấp vào sản phẩm để cấu hình kích thước & vật tư riêng biệt. Toàn bộ chi phí được cộng dồn vào báo giá dự án."}
            </p>
          </div>
        </div>

        {/* Project Rollup Mini Counters */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto text-xs">
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block font-medium">
              {collectionType === "collection" ? "Tổng Giá Vốn BST:" : "Tổng Giá Vốn Dự Án:"}
            </span>
            <span className="font-mono font-bold text-zinc-700">{formatVND(totalCOGSPrice)}</span>
          </div>
          <div className="w-px h-6 bg-zinc-200" />
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block font-medium">
              {collectionType === "collection" ? "Tổng Báo Giá BST:" : "Tổng Báo Giá Khách:"}
            </span>
            <span className="font-mono font-bold text-zinc-900 text-sm">{formatVND(totalQuotePrice)}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-bold transition shadow-2xs cursor-pointer ml-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Sản Phẩm</span>
          </button>
        </div>
      </div>

      {/* Horizontal Strip of Product Cards */}
      <div className="flex items-stretch gap-2.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
        {products.map((prod, idx) => {
          const isActive = prod.id === activeProductId;
          const unitPrice = productPrices[prod.id] || 0;
          const totalPrice = unitPrice * (prod.qty || 1);
          const dims = prod.questionnaire?.dimensions;

          return (
            <div
              key={prod.id}
              onClick={() => onSelectProduct(prod.id)}
              className={`min-w-[240px] max-w-[280px] p-3 rounded-xl border transition flex flex-col justify-between gap-2.5 shrink-0 cursor-pointer relative ${
                isActive
                  ? "border-zinc-900 bg-zinc-50/60 ring-2 ring-zinc-900/10 shadow-xs"
                  : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/40"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-4 h-4 rounded-full bg-zinc-200 text-zinc-700 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-[10px] font-medium text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200 truncate">
                      {prod.room || "Chung"}
                    </span>
                  </div>

                  {isActive && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-zinc-900 text-white shrink-0">
                      Đang chọn
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-xs text-zinc-900 line-clamp-1" title={prod.name}>
                  {prod.name}
                </h3>

                <p className="text-[11px] font-mono text-zinc-500">
                  {dims ? `${dims.widthMm} × ${dims.depthMm} × ${dims.heightMm}` : "1800 × 600 × 2400"} mm
                </p>
              </div>

              {/* Bottom Price & Controls */}
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-zinc-400">SL:</span>
                  <div className="inline-flex items-center border border-zinc-200 rounded bg-white text-xs font-mono">
                    <button
                      type="button"
                      disabled={prod.qty <= 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateProductQty(prod.id, Math.max(1, prod.qty - 1));
                      }}
                      className="px-1.5 py-0.5 text-zinc-500 hover:text-zinc-900 disabled:opacity-30 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-1 font-bold text-zinc-900">{prod.qty || 1}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateProductQty(prod.id, (prod.qty || 1) + 1);
                      }}
                      className="px-1.5 py-0.5 text-zinc-500 hover:text-zinc-900 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-xs text-zinc-900 block">
                    {formatVND(totalPrice)}
                  </span>
                  {prod.qty > 1 && (
                    <span className="text-[9px] font-mono text-zinc-400 block">
                      ({formatVND(unitPrice)} / cái)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    title="Nhân bản sản phẩm này"
                    onClick={() => onDuplicateProduct(prod.id)}
                    className="p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {products.length > 1 && (
                    <button
                      type="button"
                      title="Xóa sản phẩm khỏi dự án"
                      onClick={() => onDeleteProduct(prod.id)}
                      className="p-1 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Big Add Product Card */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="min-w-[180px] p-3 rounded-xl border-2 border-dashed border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50/60 transition flex flex-col items-center justify-center gap-1.5 text-center shrink-0 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-zinc-100 group-hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-zinc-700 group-hover:text-zinc-900">
            + Thêm Sản Phẩm Mới
          </span>
          <span className="text-[10px] text-zinc-400">Chọn từ 20+ mẫu Archetype</span>
        </button>
      </div>

      {/* Modal Chọn & Thêm Sản Phẩm Mới Vào Dự Án */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-zinc-900" />
                  Thêm Sản Phẩm Mới Vào Dự Án / Bộ Sưu Tập
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Chọn mẫu sản phẩm chuẩn để tự động nạp kích thước, kết cấu và định mức vật tư tiêu chuẩn xưởng.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Room Selector & Search */}
            <div className="p-4 bg-zinc-50 border-b border-zinc-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-700 shrink-0">Bố trí tại phòng / Vị trí:</span>
                  <select
                    value={targetRoom}
                    onChange={(e) => setTargetRoom(e.target.value)}
                    className="text-xs font-semibold px-2.5 py-1.5 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
                  >
                    {ROOM_SUGGESTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-72">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm tủ áo, giường, kệ tivi, bàn ăn..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {ARCHETYPE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer ${
                      selectedCategory === cat.id
                        ? "bg-zinc-900 text-white shadow-2xs"
                        : "bg-white text-zinc-600 hover:bg-zinc-200/70 border border-zinc-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Archetype Grid */}
            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredArchetypes.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onAddProduct(item, targetRoom);
                    setShowAddModal(false);
                  }}
                  className="p-3.5 rounded-xl border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50/60 transition cursor-pointer flex flex-col justify-between gap-3 group bg-white shadow-2xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 font-semibold px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200">
                        {item.categoryLabel}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {item.defaultDimensions.widthMm}×{item.defaultDimensions.depthMm}×{item.defaultDimensions.heightMm}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-zinc-900 group-hover:text-black">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-zinc-400 font-medium">
                      ~{item.typicalLabourHours}h gia công
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-900 group-hover:translate-x-0.5 transition-transform">
                      Thêm vào dự án
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between text-xs">
              <span className="text-zinc-500 text-[11px]">
                Tìm thấy {filteredArchetypes.length} mẫu sản phẩm phù hợp
              </span>
              <button
                type="button"
                onClick={() => {
                  onAddProduct(undefined, targetRoom);
                  setShowAddModal(false);
                }}
                className="px-3 py-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-800 font-semibold transition cursor-pointer"
              >
                + Thêm Sản Phẩm Trống Tùy Chỉnh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
