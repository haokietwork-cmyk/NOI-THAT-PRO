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
  Box,
  Image as ImageIcon,
  Tag,
  Percent,
} from "lucide-react";
import type { ProjectProductItem } from "../calculations/project-collection";
import type { QuoteScopeMode } from "../types";
import {
  PRODUCT_ARCHETYPES_CATALOG,
  ARCHETYPE_CATEGORIES,
  type ProductArchetypeItem,
} from "../data/productArchetypesCatalog";

interface ProjectProductsCollectionBarProps {
  products: ProjectProductItem[];
  activeProductId: string;
  quoteScope?: QuoteScopeMode;
  onSelectProduct: (productId: string) => void;
  onAddProduct: (archetype?: ProductArchetypeItem, room?: string, customName?: string) => void;
  onDuplicateProduct: (productId: string) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateProductQty: (productId: string, newQty: number) => void;
  onUpdateProductRoom: (productId: string, newRoom: string) => void;
  onUpdateProductTag?: (productId: string, newTag: string) => void;
  onUpdateProductMarkup?: (productId: string, newMarkup?: number) => void;
  onChangeScope?: (newScope: QuoteScopeMode) => void;
  onOpenAiImageModal?: () => void;
  productPrices?: Record<string, number>; // unitPrice per product
  totalQuotePrice: number;
  totalCOGSPrice: number;
  collectionType?: "project" | "collection";
}

export default function ProjectProductsCollectionBar({
  products,
  activeProductId,
  quoteScope = "single_item",
  onSelectProduct,
  onAddProduct,
  onDuplicateProduct,
  onDeleteProduct,
  onUpdateProductQty,
  onUpdateProductRoom,
  onUpdateProductTag,
  onUpdateProductMarkup,
  onChangeScope,
  onOpenAiImageModal,
  productPrices = {},
  totalQuotePrice,
  totalCOGSPrice,
  collectionType = "project",
}: ProjectProductsCollectionBarProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [targetRoom, setTargetRoom] = useState("Phòng ngủ");
  const [editingMarkupId, setEditingMarkupId] = useState<string | null>(null);
  const [tempMarkupVal, setTempMarkupVal] = useState<string>("");

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

  const COLLECTION_CATEGORY_SUGGESTIONS = [
    "Bàn ăn & Bàn trà",
    "Ghế & Đôn",
    "Tủ áo & Tủ giày",
    "Kệ TV & Tủ console",
    "Giường & Đầu giường",
    "Đèn & Chiếu sáng",
    "Vách trang trí & Gương",
    "Phụ kiện Decor",
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

  // =========================================================================
  // CHẾ ĐỘ 1: BÁO GIÁ 1 SẢN PHẨM RỜI (SINGLE ITEM / SKU)
  // Khi người dùng chỉ báo giá 1 món đồ lẻ, thu gọn hoàn toàn dải thẻ cồng kềnh
  // =========================================================================
  if (quoteScope === "single_item" && products.length === 1) {
    const prod = products[0];
    const unitPrice = productPrices[prod.id] || 0;
    const dims = prod.questionnaire?.dimensions;

    return (
      <div className="bg-white rounded-xl border border-zinc-200 shadow-2xs p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center shrink-0">
            <Box className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded-full border border-zinc-200 shrink-0">
                1 Sản phẩm đơn lẻ (SKU)
              </span>
              <h2 className="text-xs sm:text-sm font-bold text-zinc-900 truncate" title={prod.name}>
                {prod.name}
              </h2>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5 truncate">
              Quy cách: {dims ? `${dims.widthMm} × ${dims.depthMm} × ${dims.heightMm} mm` : "Kích thước tiêu chuẩn"} • SL: {prod.qty || 1} cái • Đơn giá: <strong className="text-zinc-900">{formatVND(unitPrice)}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => onDuplicateProduct(prod.id)}
            title="Nhân bản sản phẩm này để tạo biến thể mới"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold transition cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-zinc-500" />
            <span>Nhân bản SP</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onChangeScope) onChangeScope("order_list");
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Thêm SP vào Đơn hàng / BST</span>
          </button>
        </div>

        {/* Modal Chọn & Thêm Sản Phẩm */}
        {showAddModal && renderAddModal()}
      </div>
    );
  }

  // =========================================================================
  // CHẾ ĐỘ NHIỀU SẢN PHẨM: ĐƠN HÀNG, BỘ SƯU TẬP HOẶC DỰ ÁN CÔNG TRÌNH
  // =========================================================================
  const getScopeTitle = () => {
    if (quoteScope === "collection" || collectionType === "collection") {
      return "Danh Sách Sản Phẩm Trong Bộ Sưu Tập (Catalog)";
    }
    if (quoteScope === "order_list") {
      return "Danh Sách Sản Phẩm Trong Đơn Hàng Mua Sắm";
    }
    return "Danh Sách Hạng Mục Trong Dự Án (Theo Phòng / Khu Vực)";
  };

  const getScopeSubtitle = () => {
    if (quoteScope === "collection" || collectionType === "collection") {
      return "Nhấp vào sản phẩm để cấu hình kích thước và tỷ lệ lãi riêng. Hỗ trợ xuất Bảng Báo Giá Danh Mục (Catalog Matrix) theo các cột MOQ.";
    }
    if (quoteScope === "order_list") {
      return "Theo dõi số lượng đặt, đơn giá theo bậc MOQ và thành tiền của từng sản phẩm trong đơn hàng mua sắm.";
    }
    return "Nhấp vào sản phẩm để cấu hình kích thước & vật tư riêng biệt. Chi phí được cộng dồn theo từng khu vực vào báo giá dự án.";
  };

  function renderAddModal() {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
          {/* Modal Header */}
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-zinc-900" />
                Thêm Sản Phẩm Mới Vào Báo Giá
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Bạn có thể tạo sản phẩm trống tùy ý, hoặc chọn từ mẫu xưởng để nạp nhanh kích thước và kết cấu tiêu chuẩn.
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

          {/* Quick Action: Tạo Sản Phẩm Trống Hoàn Toàn */}
          <div className="p-4 bg-slate-50 border-b border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-700 shrink-0">
                {quoteScope === "collection" ? "Dòng phân loại:" : "Khu vực / Vị trí:"}
              </span>
              <select
                value={targetRoom}
                onChange={(e) => setTargetRoom(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1.5 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
              >
                {(quoteScope === "collection" ? COLLECTION_CATEGORY_SUGGESTIONS : ROOM_SUGGESTIONS).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  onAddProduct(undefined, targetRoom, "Sản phẩm mới");
                  setShowAddModal(false);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tạo sản phẩm trống mới</span>
              </button>

              {onOpenAiImageModal && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    onOpenAiImageModal();
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition shadow-2xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Dựng từ Ảnh AI</span>
                </button>
              )}
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="p-4 bg-white border-b border-zinc-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs font-semibold text-zinc-600">
                Hoặc điền nhanh thông số từ mẫu xưởng:
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
                    Thêm vào báo giá
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Footer */}
          <div className="p-3 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between text-xs">
            <span className="text-zinc-500 text-[11px]">
              Hiển thị {filteredArchetypes.length} mẫu xưởng có sẵn
            </span>
            <button
              type="button"
              onClick={() => {
                onAddProduct(undefined, targetRoom, "Sản phẩm mới");
                setShowAddModal(false);
              }}
              className="px-3.5 py-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-800 font-bold transition cursor-pointer"
            >
              + Thêm Sản Phẩm Trống Mới
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                {getScopeTitle()}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 text-zinc-800 border border-zinc-200 shrink-0">
                {products.length} sản phẩm • {totalItemsCount} món
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 truncate">
              {getScopeSubtitle()}
            </p>
          </div>
        </div>

        {/* Project Rollup Mini Counters */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto text-xs">
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block font-medium">
              {quoteScope === "collection" ? "Tổng Giá Vốn BST:" : "Tổng Giá Vốn:"}
            </span>
            <span className="font-mono font-bold text-zinc-700">{formatVND(totalCOGSPrice)}</span>
          </div>
          <div className="w-px h-6 bg-zinc-200" />
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block font-medium">
              {quoteScope === "collection" ? "Tổng Báo Giá BST:" : "Tổng Báo Giá:"}
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
          const isCollection = quoteScope === "collection" || collectionType === "collection";

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
                    <span className="text-[10px] font-medium text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200 truncate">
                      {isCollection ? (prod.tag || "Dòng SP") : (prod.room || "Chung")}
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

                {/* Custom Profit Margin for Collection Mode */}
                {isCollection && onUpdateProductMarkup && (
                  <div
                    className="pt-1 flex items-center justify-between text-[10px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-zinc-500 flex items-center gap-1">
                      <Percent className="w-3 h-3 text-zinc-400" />
                      Lãi riêng:
                    </span>
                    {editingMarkupId === prod.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.05"
                          min="1.0"
                          max="3.0"
                          value={tempMarkupVal}
                          onChange={(e) => setTempMarkupVal(e.target.value)}
                          className="w-14 px-1 py-0.5 text-[10px] font-mono border border-zinc-300 rounded bg-white text-zinc-900 focus:outline-hidden"
                          placeholder="1.65"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = parseFloat(tempMarkupVal);
                            if (!isNaN(val) && val >= 1.0) {
                              onUpdateProductMarkup(prod.id, val);
                            } else if (tempMarkupVal === "") {
                              onUpdateProductMarkup(prod.id, undefined);
                            }
                            setEditingMarkupId(null);
                          }}
                          className="px-1.5 py-0.5 bg-zinc-900 text-white rounded text-[9px] font-bold"
                        >
                          Lưu
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMarkupId(prod.id);
                          setTempMarkupVal(prod.customProfitMargin ? String(prod.customProfitMargin) : "");
                        }}
                        className="font-mono font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-1.5 py-0.5 rounded transition cursor-pointer"
                        title="Bấm để đặt tỷ lệ lãi riêng cho sản phẩm này"
                      >
                        {prod.customProfitMargin
                          ? `x${prod.customProfitMargin.toFixed(2)} (+${Math.round((prod.customProfitMargin - 1) * 100)}%)`
                          : "Theo BST"}
                      </button>
                    )}
                  </div>
                )}
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
                      title="Xóa sản phẩm khỏi danh sách"
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

        {/* 3-Path Direct Add Product Card */}
        <div className="min-w-[200px] p-3 rounded-xl border-2 border-dashed border-zinc-200 hover:border-zinc-400 bg-zinc-50/40 hover:bg-zinc-50/80 transition flex flex-col justify-between gap-2 shrink-0">
          <div className="text-center pt-1">
            <span className="text-xs font-bold text-zinc-800 block">
              + Thêm Sản Phẩm Mới
            </span>
            <span className="text-[10px] text-zinc-400 block mt-0.5">
              3 phương thức khởi tạo:
            </span>
          </div>

          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => onAddProduct(undefined, targetRoom, "Sản phẩm mới")}
              className="w-full py-1.5 px-2 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>+ Tạo SP trống</span>
            </button>

            {onOpenAiImageModal && (
              <button
                type="button"
                onClick={onOpenAiImageModal}
                className="w-full py-1.5 px-2 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>+ Dựng từ Ảnh AI</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="w-full py-1.5 px-2 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <Box className="w-3.5 h-3.5" />
              <span>+ Chọn mẫu xưởng</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Chọn & Thêm Sản Phẩm Mới */}
      {showAddModal && renderAddModal()}
    </div>
  );
}
