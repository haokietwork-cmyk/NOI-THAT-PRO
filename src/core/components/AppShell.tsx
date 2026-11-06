"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, Layers, Search, Plus, ChevronRight } from "lucide-react";
import Sidebar from "./Sidebar";
import AuthGuard from "./AuthGuard";
import CommandMenu from "./CommandMenu";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);

  // Chỉ cho phép dùng thử ở chức năng test bóc tách (/quoting)
  // Toàn bộ các trang quản trị xưởng khác bắt buộc đăng nhập (Email / SĐT)
  const isTestQuotingPage = pathname === "/quoting" || pathname?.startsWith("/quoting");

  const getBreadcrumbTitle = (path: string) => {
    if (path.startsWith("/dashboard")) return "Danh sách dự án";
    if (path.startsWith("/quoting")) return "Lập báo giá sản xuất";
    if (path.startsWith("/materials")) return "Thư viện vật tư & đơn giá";
    if (path.startsWith("/projects")) return "Hồ sơ dự án";
    if (path.startsWith("/settings/billing")) return "Gói cước & dịch vụ";
    if (path.startsWith("/settings")) return "Cài đặt hồ sơ xưởng";
    if (path.startsWith("/cad-store")) return "Kho công cụ AutoCAD";
    if (path.startsWith("/kich-hoat")) return "Kích hoạt bản quyền";
    return "Tổng quan";
  };

  const getFeatureName = (path: string) => {
    if (path.startsWith("/dashboard")) return "Bảng điều khiển tổng quan xưởng";
    if (path.startsWith("/materials")) return "Thư viện vật tư & Đơn giá xưởng";
    if (path.startsWith("/projects")) return "Kho lưu trữ dự án xưởng";
    if (path.startsWith("/settings")) return "Cài đặt hồ sơ xưởng & Mẫu in A4";
    if (path.startsWith("/my-assets")) return "Kho bản quyền & File Lisp CAD";
    return "khu vực quản trị xưởng này";
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Global Command Palette (Cmd+K) */}
      <CommandMenu open={isCommandMenuOpen} onOpenChange={setIsCommandMenuOpen} />

      {/* Sidebar cố định trên Desktop (>= 1024px) */}
      <div className="no-print hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Navigation (< 1024px) */}
      {isMobileMenuOpen && (
        <div className="no-print fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-white h-full z-10 shadow-2xl flex flex-col">
            <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Vùng nội dung chính */}
      <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        {/* Top Header Bar chuẩn Shadcn Admin */}
        <header className="no-print sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Trái: Menu Mobile + Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
              aria-label="Mở menu quản trị"
            >
              <Menu className="w-4 h-4" />
            </button>

            <nav className="flex items-center gap-1.5 text-xs">
              <Link href="/dashboard" className="text-slate-500 hover:text-slate-800 transition">
                Xưởng Gỗ
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="font-semibold text-slate-900">
                {getBreadcrumbTitle(pathname || "")}
              </span>
            </nav>
          </div>

          {/* Phải: Command Menu Button + Fast Action */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsCommandMenuOpen(true)}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/80 rounded-md border border-slate-200 transition cursor-pointer"
              title="Mở bảng tìm kiếm nhanh (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Tìm kiếm...</span>
              <kbd className="hidden sm:inline text-[10px] font-mono px-1 py-0.2 bg-white text-slate-500 border border-slate-200 rounded">
                ⌘K
              </kbd>
            </button>

            <Link
              href="/quoting"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tạo báo giá</span>
            </Link>
          </div>
        </header>

        {/* Khung nội dung */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {isTestQuotingPage ? (
            children
          ) : (
            <AuthGuard featureName={getFeatureName(pathname || "")}>
              {children}
            </AuthGuard>
          )}
        </div>
      </main>
    </div>
  );
}
