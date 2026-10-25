"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Boxes,
  ShoppingBag,
  CircleDollarSign,
  Settings,
  Layers,
  Key,
  CreditCard,
  Lock,
  LogOut,
  User,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/core/store/useAuth";
import { WORKSHOP_TERMS } from "@/core/constants/terms";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    {
      name: "Tổng quan",
      sub: "Bảng điều khiển & Dự án",
      href: "/dashboard",
      icon: LayoutDashboard,
      requiresAuth: true,
    },
    {
      name: "Bóc tách & Báo giá",
      sub: isAuthenticated ? `${WORKSHOP_TERMS.cutlist.label} -> Báo giá A4` : "⚡ Dùng thử mẫu 48 tấm",
      href: "/quoting",
      icon: FileSpreadsheet,
      requiresAuth: false, // Chức năng test cho phép dùng thử
      badge: isAuthenticated ? "Chủ lực" : "Dùng thử",
      badgeColor: isAuthenticated
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      name: "Thư viện Vật tư & Giá",
      sub: "Ván, Chỉ, Phụ kiện, Thợ",
      href: "/materials",
      icon: Boxes,
      requiresAuth: true,
    },
    {
      name: "Kho Plugin CAD",
      sub: "AutoLISP bóc tách",
      href: "/cad-store",
      icon: ShoppingBag,
      badge: "Lisp",
      badgeColor: "bg-slate-100 text-slate-600 border-slate-200",
      requiresAuth: false,
    },
    {
      name: "Thẩm định giá",
      sub: "Kiểm tra báo giá xưởng",
      href: "/price-check",
      icon: CircleDollarSign,
      badge: "Sắp có",
      badgeColor: "bg-slate-100 text-slate-500 border-slate-200",
      requiresAuth: true,
    },
    {
      name: "Tiện ích & Bản quyền",
      sub: "Mã máy & File Lisp",
      href: "/my-assets",
      icon: Key,
      requiresAuth: true,
    },
    {
      name: "Hồ sơ Xưởng & Bản in",
      sub: "Logo, Hotline, Mẫu A4",
      href: "/settings",
      icon: Settings,
      requiresAuth: true,
    },
    {
      name: "Gói cước & VietQR",
      sub: "Nâng cấp Xưởng Pro",
      href: "/settings/billing",
      icon: CreditCard,
      requiresAuth: true,
    },
  ];

  return (
    <aside className="no-print w-72 bg-white text-slate-800 flex flex-col shrink-0 border-r border-slate-200/80 min-h-screen select-none transition-all">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200/80 gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-sm shadow-amber-500/20 group-hover:bg-amber-600 transition">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-slate-900">
                NỘI THẤT <span className="text-amber-600">PRO</span>
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                CNC-v1.2
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Dự toán & Báo giá Xưởng Gỗ
            </p>
          </div>
        </Link>
      </div>

      {/* Widget Giám sát Định mức Xưởng */}
      <div className="m-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs space-y-2.5 relative overflow-hidden">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
          <span className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Định Mức Xưởng Chuẩn
          </span>
          <span className="text-[9px] font-mono font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
            JIS A 5905
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Khổ tấm:</span>
            <span className="font-semibold text-slate-900 font-mono">1220 × 2440</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Mạch cưa:</span>
            <span className="font-semibold text-slate-900 font-mono">3.2 mm</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Hao hụt ván:</span>
            <span className="font-semibold text-amber-700 font-mono">+15% (1.15)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Hao hụt chỉ:</span>
            <span className="font-semibold text-emerald-700 font-mono">+8% (1.08)</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
          <span>Trạng thái:</span>
          {isAuthenticated ? (
            <span className="font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Đã đăng nhập RLS
            </span>
          ) : (
            <span className="font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Dùng thử Test Mode
            </span>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          const Icon = item.icon;
          const isLocked = !isAuthenticated && item.requiresAuth;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                isActive
                  ? "bg-amber-50 text-amber-900 font-semibold border border-amber-200/80 shadow-sm"
                  : isLocked
                  ? "text-slate-400 hover:bg-slate-50 hover:text-slate-700 opacity-80"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-amber-600" : isLocked ? "text-slate-400" : "text-slate-500"
                  }`}
                />
                <div>
                  <div className="text-xs font-semibold leading-tight flex items-center gap-1.5">
                    <span>{item.name}</span>
                    {isLocked && <Lock className="w-3 h-3 text-slate-400" />}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{item.sub}</div>
                </div>
              </div>

              {isLocked ? (
                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-medium bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5" />
                  Khóa
                </span>
              ) : item.badge ? (
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-md font-semibold border ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* User Footer Panel */}
      <div className="p-4 border-t border-slate-200/80 bg-slate-50/70 text-xs">
        {isAuthenticated && user ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 text-xs truncate">
                    {user.companyName || user.name}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {user.phone || user.email}
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                PRO
              </span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Chế độ Test</span>
              <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                Dùng thử
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Đăng nhập qua SĐT / Email để mở khóa Thư viện giá & Lưu dự án.
            </p>
            <Link
              href="/login"
              className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition shadow-xs flex items-center justify-center gap-1.5 text-center"
            >
              <span>🔑 Đăng nhập / Đăng ký</span>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
