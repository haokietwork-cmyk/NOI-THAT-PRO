"use client";

import { useState, useMemo } from "react";
import { 
  Search, 
  X, 
  Sparkles, 
  Check, 
  ArrowRight, 
  DoorClosed, 
  CookingPot, 
  Layers, 
  Archive, 
  Tv, 
  Bath, 
  Table, 
  Shield, 
  Armchair, 
  Bed, 
  Maximize, 
  Box, 
  Sliders
} from "lucide-react";
import { 
  PRODUCT_ARCHETYPES_CATALOG, 
  ARCHETYPE_CATEGORIES, 
  searchProductArchetypes, 
  type ProductArchetypeItem,
  normalizeVietnamese
} from "@/core/data/productArchetypesCatalog";

// Mapping string iconName to Lucide components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  DoorClosed,
  CookingPot,
  Layers,
  Archive,
  Tv,
  Bath,
  Table,
  Shield,
  Armchair,
  Bed,
  Maximize,
  Sparkles,
  Box,
};

interface ProductArchetypeSelectorProps {
  selectedArchetypeId: string;
  onSelectArchetype: (archetype: ProductArchetypeItem) => void;
  onCustomTextChange?: (text: string) => void;
}

export default function ProductArchetypeSelector({
  selectedArchetypeId,
  onSelectArchetype,
  onCustomTextChange,
}: ProductArchetypeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Filtered and scored list of products
  const searchResults = useMemo(() => {
    return searchProductArchetypes(searchQuery, activeCategory);
  }, [searchQuery, activeCategory]);

  // Best smart match when user types non-standard keywords
  const bestSmartMatch = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return null;
    const matches = searchProductArchetypes(searchQuery, "all");
    if (matches.length > 0) {
      return matches[0];
    }
    return null;
  }, [searchQuery]);

  const handleSelect = (item: ProductArchetypeItem) => {
    onSelectArchetype(item);
  };

  return (
    <div className="space-y-3.5 bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-200">
      
      {/* Top Search Bar & Keyword Resolver */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span>Chọn Loại Sản Phẩm Báo Giá:</span>
            <span className="text-[11px] font-normal text-slate-500">
              (Liệt kê sẵn đa dạng mọi dòng hàng • Tìm kiếm từ khóa thông minh)
            </span>
          </label>

          <span className="text-[11px] font-mono text-slate-500">
            {searchResults.length} mẫu sản phẩm
          </span>
        </div>

        {/* Input Search with Instant Clear */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onCustomTextChange?.(e.target.value);
            }}
            placeholder="Tìm theo tên gọi thực tế: bàn phấn, chạn bát, bàn sofa đá, sofa chữ L, bàn ăn 8 ghế sồi, cửa slim..."
            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Smart Keyword Detection Banner (When typing non-standard alias) */}
      {bestSmartMatch && searchQuery.trim().length >= 2 && (
        <div className="p-2.5 bg-amber-50 border border-amber-200/80 rounded-lg flex items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 overflow-hidden">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="truncate">
              <span className="text-slate-600 font-sans">Nhận diện thông minh: </span>
              <strong className="text-slate-900 font-semibold">{bestSmartMatch.name}</strong>
              <span className="text-slate-400 text-[11px] ml-1.5 font-mono">
                ({bestSmartMatch.defaultDimensions.widthMm} × {bestSmartMatch.defaultDimensions.depthMm} × {bestSmartMatch.defaultDimensions.heightMm} mm)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              handleSelect(bestSmartMatch);
              setSearchQuery("");
            }}
            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded text-[11px] transition shadow-2xs cursor-pointer"
          >
            <span>Áp dụng mẫu này</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Category Tabs Ribbon */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {ARCHETYPE_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer border ${
                isActive
                  ? "bg-slate-900 text-white border-slate-900 font-semibold shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100/80 hover:text-slate-900"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Catalog Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
        {searchResults.map((item) => {
          const isSelected = selectedArchetypeId === item.id;
          const Icon = ICON_MAP[item.iconName] || Box;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item)}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 relative ${
                isSelected
                  ? "bg-amber-50/70 border-amber-500 shadow-xs ring-1 ring-amber-500"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs"
              }`}
            >
              {/* Header with Icon and Badge */}
              <div className="flex items-start justify-between gap-1.5 w-full">
                <div className={`p-1.5 rounded-md ${
                  isSelected ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>

                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border truncate max-w-[130px] ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900 truncate" title={item.name}>
                  {item.name}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-1" title={item.description}>
                  {item.description}
                </p>
              </div>

              {/* Bottom Specs: Dimensions & Trade Badges */}
              <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500 w-full">
                <span>
                  {item.defaultDimensions.widthMm}×{item.defaultDimensions.depthMm}×{item.defaultDimensions.heightMm}
                </span>

                <div className="flex items-center gap-1">
                  {item.defaultFlags.hasStone && (
                    <span className="w-2 h-2 rounded-full bg-sky-500" title="Có mặt đá 0% OH" />
                  )}
                  {item.defaultFlags.hasGlass && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500" title="Có cánh kính" />
                  )}
                  {item.defaultFlags.hasUpholstery && (
                    <span className="w-2 h-2 rounded-full bg-amber-500" title="Có bọc nệm" />
                  )}
                  {item.defaultFlags.hasMetal && (
                    <span className="w-2 h-2 rounded-full bg-slate-500" title="Có kim loại" />
                  )}
                </div>
              </div>

              {/* Selected Check Indicator */}
              {isSelected && (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}
            </button>
          );
        })}

        {searchResults.length === 0 && (
          <div className="col-span-full py-8 text-center text-slate-400 space-y-2">
            <p className="text-xs">Không tìm thấy mẫu có sẵn khớp với từ khóa "{searchQuery}".</p>
            <button
              type="button"
              onClick={() => {
                const customItem = PRODUCT_ARCHETYPES_CATALOG.find((p) => p.id === "custom_composite")!;
                handleSelect(customItem);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              <Box className="w-3.5 h-3.5" />
              <span>Dùng Hạng Mục Tùy Chỉnh Tự Do</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
