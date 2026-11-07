"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  FileSpreadsheet,
  Boxes,
  Settings,
  CreditCard,
  ShoppingBag,
  Plus,
  ArrowRight,
  FolderOpen,
  X,
  Layers,
} from "lucide-react";
import { useAppStore } from "@/core/store/useAppStore";

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter();
  const { projects } = useAppStore();
  const [query, setQuery] = useState("");

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const handleSelect = (url: string) => {
    onOpenChange(false);
    setQuery("");
    router.push(url);
  };

  const navItems = [
    { name: "Danh sách dự án & báo giá", url: "/dashboard", icon: LayoutDashboard, category: "Điều hướng" },
    { name: "Lập báo giá sản xuất mới", url: "/quoting", icon: FileSpreadsheet, category: "Điều hướng" },
    { name: "Thư viện vật tư & đơn giá xưởng", url: "/materials", icon: Boxes, category: "Điều hướng" },
    { name: "Hồ sơ xưởng & mẫu in A4", url: "/settings", icon: Settings, category: "Điều hướng" },
    { name: "Gói cước dịch vụ & thanh toán", url: "/settings/billing", icon: CreditCard, category: "Điều hướng" },
    { name: "Kho công cụ AutoCAD (.NET)", url: "/cad-store", icon: ShoppingBag, category: "Công cụ CAD" },
  ];

  const filteredNav = useMemo(() => {
    if (!query.trim()) return navItems;
    const q = query.toLowerCase().trim();
    return navItems.filter((item) => item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q));
  }, [query]);

  const filteredProjects = useMemo(() => {
    if (!query.trim()) return projects.slice(0, 5);
    const q = query.toLowerCase().trim();
    return projects.filter(
      (p) =>
        p.projectName.toLowerCase().includes(q) ||
        (p.clientName && p.clientName.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [projects, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Command Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col font-sans">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-slate-50/50">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Tìm trang, công cụ hoặc tên dự án..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full text-xs text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-white text-slate-400 border border-slate-200 rounded">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100 text-xs">
          {/* Điều hướng trang */}
          {filteredNav.length > 0 && (
            <div className="py-1">
              <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Trang &amp; Chức năng
              </div>
              {filteredNav.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.url}
                    type="button"
                    onClick={() => handleSelect(item.url)}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-zinc-900 transition" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Dự án gần đây */}
          {filteredProjects.length > 0 && (
            <div className="py-1">
              <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Dự án báo giá</span>
                <span className="font-mono text-slate-400">{filteredProjects.length} kết quả</span>
              </div>
              {filteredProjects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelect(`/quoting?id=${p.id}`)}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FolderOpen className="w-4 h-4 text-slate-400 group-hover:text-zinc-900 shrink-0 transition" />
                    <div className="min-w-0 truncate">
                      <div className="font-medium text-slate-900 truncate">{p.projectName}</div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Khách: {p.clientName || "Chưa rõ"} • {p.items?.length || 0} hạng mục
                      </div>
                    </div>
                  </div>
                  <span className="font-mono font-semibold text-slate-700 shrink-0 ml-2 text-[11px]">
                    {(p.totalQuote || 0).toLocaleString("vi-VN")} đ
                  </span>
                </button>
              ))}
            </div>
          )}

          {filteredNav.length === 0 && filteredProjects.length === 0 && (
            <div className="py-8 text-center text-slate-400 text-xs">
              Không tìm thấy trang hoặc dự án nào khớp với từ khóa.
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Chọn:</span>
            <kbd className="px-1 py-0.2 bg-white border border-slate-200 rounded font-mono text-[9px] text-slate-500">↵ Enter</kbd>
            <span className="ml-2">Thoát:</span>
            <kbd className="px-1 py-0.2 bg-white border border-slate-200 rounded font-mono text-[9px] text-slate-500">ESC</kbd>
          </div>
          <span className="text-[10px] text-slate-400">Nội Thất Pro</span>
        </div>
      </div>
    </div>
  );
}
