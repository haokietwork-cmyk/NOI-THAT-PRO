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
  X,
} from "lucide-react";
import { useAuth } from "@/core/store/useAuth";
import { WORKSHOP_TERMS } from "@/core/constants/terms";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export default function Sidebar({ onCloseMobile }: SidebarProps = {}) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const navSections = [
    {
      title: "DỰ ÁN & BÁO GIÁ",
      items: [
        {
          name: "Danh sách dự án",
          sub: "Quản lý hợp đồng & tiến độ",
          href: "/dashboard",
          icon: LayoutDashboard,
          requiresAuth: true,
        },
        {
          name: "Lập báo giá sản xuất",
          sub: "Chiết tính giá vốn & xuất in A4",
          href: "/quoting",
          icon: FileSpreadsheet,
          requiresAuth: false,
        },
      ],
    },
    {
      title: "DANH MỤC VẬT TƯ",
      items: [
        {
          name: "Thư viện vật tư & giá",
          sub: "Ván, chỉ, phụ kiện, nhân công",
          href: "/materials",
          icon: Boxes,
          requiresAuth: true,
        },
      ],
    },
    {
      title: "CẤU HÌNH XƯỞNG",
      items: [
        {
          name: "Hồ sơ xưởng & bản in",
          sub: "Logo, hotline, tiêu đề A4",
          href: "/settings",
          icon: Settings,
          requiresAuth: true,
        },
        {
          name: "Gói dịch vụ & hóa đơn",
          sub: "Nâng cấp tài khoản xưởng",
          href: "/settings/billing",
          icon: CreditCard,
          requiresAuth: true,
        },
      ],
    },
    {
      title: "CÔNG CỤ CAD",
      items: [
        {
          name: "Kho công cụ AutoCAD",
          sub: "Bộ công cụ tự động hóa (.NET)",
          href: "/cad-store",
          icon: ShoppingBag,
          badge: ".NET",
          badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
          requiresAuth: false,
        },
        {
          name: "Kích hoạt bản quyền",
          sub: "Quản lý khóa máy & mã kích hoạt",
          href: "/kich-hoat",
          icon: Key,
          requiresAuth: false,
        },
      ],
    },
  ];

  return (
    <aside className="no-print w-72 bg-white text-slate-800 flex flex-col shrink-0 border-r border-slate-200 min-h-screen select-none transition-all">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200">
        <Link
          href="/"
          onClick={() => onCloseMobile?.()}
          className="flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white transition">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-slate-900">
                NỘI THẤT <span className="text-amber-700">PRO</span>
              </span>
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal">
              Dự toán &amp; Báo giá Xưởng Gỗ
            </p>
          </div>
        </Link>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Đóng menu điều hướng"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Thông số & Năng lực báo giá xưởng */}
      <div className="m-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
          <span className="font-semibold text-slate-700 text-[11px]">
            Hệ Báo Giá Đa Ngành
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            V2.0
          </span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div>
            <span className="text-slate-500 block text-[10px]">Dòng hàng hỗ trợ:</span>
            <span className="font-medium text-slate-900 block truncate">
              Gỗ CN • Cánh Kính • Nhựa • Gỗ TN • Nệm
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <div>
              <span className="text-slate-500 block text-[10px]">Phương pháp:</span>
              <span className="font-medium text-slate-900 font-mono">W×D×H phủ bì</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Độ tin cậy:</span>
              <span className="font-medium text-emerald-700 font-mono">Sai số &lt; 1%</span>
            </div>
          </div>
        </div>

        <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
          <span>Trạng thái xưởng:</span>
          {isAuthenticated ? (
            <span className="font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-700" />
              Đã kích hoạt
            </span>
          ) : (
            <span className="font-medium text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              Chế độ trải nghiệm
            </span>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-0.5">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {section.title}
            </div>
            {section.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname?.startsWith(item.href));
              const Icon = item.icon;
              const isLocked = !isAuthenticated && item.requiresAuth;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onCloseMobile?.()}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-slate-100 text-slate-900 font-medium"
                      : isLocked
                      ? "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-amber-700" : isLocked ? "text-slate-400" : "text-slate-500"
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-medium leading-tight flex items-center gap-1.5">
                        <span className="truncate">{item.name}</span>
                        {isLocked && <Lock className="w-3 h-3 text-slate-400 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate">{item.sub}</div>
                    </div>
                  </div>

                  {isLocked ? (
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-medium bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-0.5 shrink-0 ml-1">
                      <Lock className="w-2.5 h-2.5" />
                      Khóa
                    </span>
                  ) : item.badge ? (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-medium border shrink-0 ml-1 ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Footer Panel */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 text-xs">
        {isAuthenticated && user ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-md bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 text-xs truncate">
                    {user.companyName || user.name}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {user.phone || user.email}
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                PRO
              </span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="w-full py-1.5 px-3 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-medium text-slate-700">Chế độ trải nghiệm</span>
              <span className="text-[9px] font-medium text-slate-600 bg-slate-200 px-1.5 py-0.2 rounded">
                Khách
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Đăng nhập để lưu dự án và quản lý bảng giá vật tư riêng của xưởng.
            </p>
            <Link
              href="/login"
              onClick={() => onCloseMobile?.()}
              className="w-full py-1.5 px-3 rounded-md text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white transition flex items-center justify-center gap-1.5 text-center"
            >
              <span>Đăng nhập hệ thống</span>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
