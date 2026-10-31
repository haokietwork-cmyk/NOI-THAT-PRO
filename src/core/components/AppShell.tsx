"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, Layers } from "lucide-react";
import Sidebar from "./Sidebar";
import AuthGuard from "./AuthGuard";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Chỉ cho phép dùng thử ở chức năng test bóc tách (/quoting)
  // Toàn bộ các trang quản trị xưởng khác bắt buộc đăng nhập (Email / SĐT)
  const isTestQuotingPage = pathname === "/quoting" || pathname?.startsWith("/quoting");

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
      {/* Sidebar cố định trên Desktop (>= 1024px) */}
      <div className="no-print hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Navigation (< 1024px) */}
      {isMobileMenuOpen && (
        <div className="no-print fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-white h-full z-10 shadow-2xl flex flex-col">
            <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Vùng nội dung chính */}
      <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        {/* Top Navbar cho Mobile (< 1024px) */}
        <header className="no-print lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-2xs">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900">
                NỘI THẤT <span className="text-amber-600">PRO</span>
              </span>
              <span className="ml-1.5 text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                CNC
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
            aria-label="Mở menu quản trị xưởng"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Khung nội dung: padding tối ưu 375px (p-3.5 sm:p-6 lg:p-8) */}
        <div className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
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
