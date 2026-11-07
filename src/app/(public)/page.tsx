"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  FileSpreadsheet, 
  Printer, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  FileText, 
  Download, 
  CheckCircle2, 
  ChevronRight, 
  TrendingUp, 
  Lock, 
  Building2, 
  Check, 
  User, 
  Menu, 
  X, 
  BookOpen,
  Boxes,
  LayoutDashboard,
  Plus,
  Wrench,
  Clock,
  LogOut,
  ShoppingBag,
} from "lucide-react";
import TechnicalHandbookModal from "@/core/components/TechnicalHandbookModal";
import { useAuth } from "@/core/store/useAuth";
import { WORKSHOP_TERMS } from "@/core/constants/terms";

export default function LandingPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSpecHandbook, setShowSpecHandbook] = useState(false);

  const formatVND = (val: number) => val.toLocaleString("vi-VN") + " đ";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-amber-100 selection:text-amber-900">
      
      {/* ================================================================== */}
      {/* HEADER: THANH ĐIỀU HƯỚNG CỐ ĐỊNH & TRẠNG THÁI ĐĂNG NHẬP          */}
      {/* ================================================================== */}
      <header className="no-print sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-9 h-9 rounded-lg bg-amber-600 flex items-center justify-center text-white shadow-xs group-hover:bg-amber-700 transition">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-slate-900">
                  NỘI THẤT <span className="text-amber-700">PRO</span>
                </span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  B2B
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal -mt-0.5 whitespace-nowrap">
                Dự toán &amp; Báo giá Xưởng Gỗ
              </p>
            </div>
          </Link>

          {/* Navigation Bar (Segmented Pill Style) */}
          <nav className="hidden lg:flex items-center p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600 whitespace-nowrap">
            <Link 
              href="/quoting" 
              className="px-3.5 py-1.5 rounded-md hover:bg-white hover:text-slate-900 hover:shadow-2xs transition"
            >
              Lập báo giá nhanh
            </Link>

            <Link 
              href="/materials" 
              className="px-3.5 py-1.5 rounded-md hover:bg-white hover:text-slate-900 hover:shadow-2xs transition"
            >
              Thư viện vật tư &amp; đơn giá
            </Link>

            <Link 
              href="/cad-store" 
              className="px-3.5 py-1.5 rounded-md hover:bg-white hover:text-slate-900 hover:shadow-2xs transition"
            >
              Công cụ AutoCAD (.NET)
            </Link>

            <a 
              href="#features" 
              className="px-3.5 py-1.5 rounded-md hover:bg-white hover:text-slate-900 hover:shadow-2xs transition"
            >
              Quy chuẩn kỹ thuật
            </a>

            <a 
              href="#pricing" 
              className="px-3.5 py-1.5 rounded-md hover:bg-white hover:text-slate-900 hover:shadow-2xs transition"
            >
              Bảng giá dịch vụ
            </a>
          </nav>

          {/* Auth State & Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 whitespace-nowrap">
            {isAuthenticated ? (
              /* Trạng thái ĐÃ ĐĂNG NHẬP */
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                  <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {(user?.companyName || user?.name || "X")[0].toUpperCase()}
                  </div>
                  <span className="font-semibold text-slate-800 max-w-[140px] truncate">
                    {user?.companyName || user?.name || "Xưởng của bạn"}
                  </span>
                  <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-bold border border-amber-200">
                    PRO
                  </span>
                </div>

                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition shadow-2xs"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden md:inline">Bảng Quản Trị</span>
                </Link>

                <Link
                  href="/quoting"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo Báo Giá</span>
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  title="Đăng xuất"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Trạng thái CHƯA ĐĂNG NHẬP */
              <div className="flex items-center gap-2">
                <Link 
                  href="/login" 
                  className="hidden sm:inline-flex text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 transition items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Đăng nhập</span>
                </Link>
                
                <Link
                  href="/quoting"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition"
                >
                  <span>Bắt đầu báo giá</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition border border-slate-200"
              aria-label="Menu điều hướng"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-5 py-4 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150 text-xs">
            {isAuthenticated && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                    {(user?.companyName || user?.name || "X")[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{user?.companyName || user?.name}</div>
                    <div className="text-[11px] text-slate-500">{user?.phone || user?.email}</div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="text-rose-600 font-medium hover:underline text-[11px]"
                >
                  Đăng xuất
                </button>
              </div>
            )}

            <div className="flex flex-col gap-1 font-medium text-slate-700">
              {isAuthenticated ? (
                <Link 
                  href="/dashboard" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-slate-900 font-semibold"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-600" />
                  <span>Bảng quản trị dự án</span>
                </Link>
              ) : null}

              <Link 
                href="/quoting" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg hover:bg-slate-50 flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4 text-slate-600" />
                <span>Lập báo giá nhanh</span>
              </Link>
              
              <Link 
                href="/materials" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg hover:bg-slate-50 flex items-center gap-2"
              >
                <Boxes className="w-4 h-4 text-slate-600" />
                <span>Thư viện đơn giá xưởng</span>
              </Link>
              
              <Link 
                href="/cad-store" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg hover:bg-slate-50 flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-slate-600" />
                <span>Kho công cụ AutoCAD (.NET)</span>
              </Link>
              
              <a 
                href="#pricing" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg hover:bg-slate-50 flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4 text-slate-600" />
                <span>Bảng giá dịch vụ</span>
              </a>
            </div>
            
            {!isAuthenticated && (
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 text-center font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Đăng nhập tài khoản
                </Link>
                <Link
                  href="/quoting"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 text-center font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition"
                >
                  Bắt đầu lập báo giá
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ================================================================== */}
      {/* HERO SECTION: THẨM MỸ KỸ THUẬT XƯỞNG MỘC (TASTE & BANNER STANDARDS)  */}
      {/* ================================================================== */}
      <section className="no-print relative pt-14 pb-16 md:pt-20 md:pb-24 overflow-hidden bg-blueprint-grid border-b border-slate-200">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          {/* Badge kỹ thuật định danh */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="font-mono text-slate-500 text-[11px]">QUY CHUẨN KỸ THUẬT GỖ CÔNG NGHIỆP</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-800 font-semibold">Khổ 1220×2440 &amp; Jumbo 1830×2440</span>
          </div>

          {/* H1 Headline: Đạt chuẩn 2 dòng, tự tin, không câu từ AI sáo rỗng */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Dự toán &amp; Báo giá nội thất chuẩn xưởng. <br className="hidden sm:block" />
            <span className="text-amber-700">Chính xác giá vốn, chuyên nghiệp cho khách hàng.</span>
          </h1>

          {/* Subtitle: Trực diện vào giải pháp */}
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Thiết lập nhanh quy cách sản phẩm, hệ thống tự động bóc tách chi phí ván phôi, chỉ dán cạnh, phụ kiện kim khí và nhân công. Xuất bản in báo giá A4 gửi khách trong vài phút, bảo mật tuyệt đối giá vốn nội bộ.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition"
                >
                  <LayoutDashboard className="w-4 h-4 text-amber-400" />
                  <span>Vào Bảng Quản Trị Dự Án</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/quoting"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition"
                >
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>Tạo Báo Giá Mới</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/quoting"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition"
                >
                  <span>Bắt đầu lập báo giá ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  type="button"
                  onClick={() => setShowSpecHandbook(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition"
                >
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span>Sổ tay quy cách kỹ thuật</span>
                </button>
              </>
            )}
          </div>

          {/* Technical Trust Strip */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Khổ ván 1220×2440 &amp; Jumbo</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tùy chỉnh hệ số hao hụt (+15%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bảo mật giá vốn Snapshot</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xuất bản in A4 &amp; Excel chuẩn xưởng</span>
            </span>
          </div>
        </div>

        {/* ================================================================ */}
        {/* SHOWCASE MATRIX: 1 QUY CÁCH -> 2 ĐẦU RA KỸ THUẬT                  */}
        {/* ================================================================ */}
        <div className="mt-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden text-left">
            
            {/* Window Top Bar */}
            <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-white font-semibold">NỘI THẤT PRO</span>
                <span className="text-slate-500">/</span>
                <span>MÔ HÌNH DỰ TOÁN BÁO GIÁ THỰC DỤNG</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                CHUẨN HÓA SẢN XUẤT 2026
              </span>
            </div>

            {/* 3 Pillars */}
            <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-50/50">
              
              {/* Cột 1: Thông số quy cách đầu vào */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                    BƯỚC 1: QUY CÁCH
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Kích thước</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Sản phẩm:</span>
                    <strong className="text-slate-900">Tủ áo Master kịch trần</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Kích thước (W×D×H):</span>
                    <strong className="text-slate-900 font-mono">1800 × 600 × 2400 mm</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Vật liệu thùng:</span>
                    <strong className="text-slate-900">MDF Chống ẩm 17mm</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Vật liệu cánh:</span>
                    <strong className="text-slate-900">MDF Phủ Melamine vân gỗ</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Phụ kiện:</span>
                    <strong className="text-slate-900">Bản lề giảm chấn &amp; Ray âm</strong>
                  </div>
                </div>
              </div>

              {/* Cột 2: Bảng phân tích giá vốn nội bộ */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    BƯỚC 2: GIÁ VỐN NỘI BỘ
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Dành cho xưởng</span>
                </div>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-sans">Ván thùng &amp; cánh (1220×2440):</span>
                    <strong className="text-slate-800">14 tấm</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-sans">Chỉ dán cạnh PVC (+8% bo):</span>
                    <strong className="text-slate-800">176.7 md</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-sans">Phụ kiện cam chốt &amp; ray:</span>
                    <strong className="text-slate-800">32 cái / 4 bộ</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-sans">Nhân công thợ &amp; lắp ráp:</span>
                    <strong className="text-slate-800">2.220.000 đ</strong>
                  </div>
                  <div className="flex justify-between py-1 pt-2 border-t border-slate-200 font-bold font-sans">
                    <span className="text-slate-700">Tổng giá vốn (COGS):</span>
                    <strong className="text-emerald-700 font-mono text-sm">16.282.000 đ</strong>
                  </div>
                </div>
              </div>

              {/* Cột 3: Báo giá thương mại gửi khách */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider">
                    BƯỚC 3: BÁO GIÁ KHÁCH
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Bản in A4</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="py-1 border-b border-slate-50">
                    <strong className="block text-slate-900 font-medium">Hệ Tủ Áo Master Kịch Trần</strong>
                    <span className="text-[11px] text-slate-500">MDF chống ẩm 17mm Melamine kháng trầy, phụ kiện đồng bộ</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 text-[11px]">
                    <span className="text-slate-500">Đơn vị tính:</span>
                    <span className="font-mono text-slate-700">1 Bộ (4.32 m²)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 text-[11px]">
                    <span className="text-slate-500">Hệ số lợi nhuận:</span>
                    <span className="font-mono text-emerald-700 font-semibold">+65% (x1.65)</span>
                  </div>
                  <div className="flex justify-between py-1 pt-2 border-t border-slate-200 font-bold">
                    <span className="text-slate-700">Báo giá đề xuất:</span>
                    <strong className="text-amber-700 font-mono text-sm">26.865.218 đ</strong>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 3 GIÁ TRỊ CỐT LÕI (TECHNICAL INVARIANTS)                           */}
      {/* ================================================================== */}
      <section id="features" className="py-16 md:py-20 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider">
              NGHIỆP VỤ NỘI THẤT CHUẨN XƯỞNG
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              3 Nguyên Tắc Bảo Vệ Lợi Nhuận Xưởng Gỗ
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Thiết kế giải quyết triệt để các rủi ro sót giá, thiếu ván và lộ giá vốn khi làm việc trên Excel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs space-y-3">
              <div className="w-9 h-9 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Bảo Vệ Bí Mật Giá Vốn
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tách biệt hoàn toàn bảng giá vốn xưởng nội bộ và báo giá khách hàng. Bản in A4 tự động ẩn thông số kỹ thuật tấm lẻ, tránh rủi ro khách hàng soi công thức giá vốn như khi gửi file Excel.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs space-y-3">
              <div className="w-9 h-9 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Boxes className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Tính Đúng Hao Hụt Thực Tế
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tự động quy đổi diện tích thành số tấm ván nguyên (1220×2440 mm và Jumbo 1830×2440 mm) kèm hệ số hao hụt phôi cưa (+15%) và mét dài dán chỉ (+8% bo góc), không bao giờ lo thiếu vật tư.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs space-y-3">
              <div className="w-9 h-9 rounded-md bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5 text-sky-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Bảo Toàn Giá Lịch Sử (Snapshot)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mỗi công trình khi lưu trữ sẽ khóa cố định bản sao đơn giá tại ngày tạo dự án. Dù sau này giá thị trường biến động, các báo giá hợp đồng cũ mở lại vẫn giữ nguyên 100% số liệu đã chốt.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* KHO CÔNG CỤ AUTOCAD (.NET)                                         */}
      {/* ================================================================== */}
      <section id="cad-tools" className="py-16 md:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider">
                HỆ SINH THÁI CÔNG CỤ KỸ THUẬT
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                Kho Công Cụ AutoCAD (.NET) Chuyên Dụng
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Tối ưu hóa bản vẽ kỹ thuật, bổ liên kết cam chốt và in ấn hàng loạt chuẩn xác.
              </p>
            </div>

            <Link
              href="/cad-store"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition shadow-2xs shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
              <span>Xem toàn bộ công cụ</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Tool 1 */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    LỆNH: QC
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">AutoCAD 2018-2026</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Lisp Bóc Tách Khối Lượng Bản Vẽ
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Quét chọn khối tủ trên Model/Layout. Tự động đọc Tên chi tiết, Kích thước Dài × Rộng × Dày, 4 cạnh dán chỉ và xuất file CSV UTF-8 nạp thẳng lên hệ thống.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-900">299.000 đ</span>
                <Link href="/cad-store" className="text-amber-700 hover:text-amber-800 font-medium">
                  Chi tiết →
                </Link>
              </div>
            </div>

            {/* Tool 2 */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    LỆNH: MC
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Hệ 32mm Chuẩn</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Lisp Vẽ Mộng Cam Chốt &amp; Rãnh Hậu
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tự động bổ tim liên kết cam chốt hệ 32mm, rãnh soi hậu 6mm kẹp âm chỉ với 1 thao tác. Tiết kiệm 80% thời gian bổ chi tiết kỹ thuật cho thợ vẽ.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-900">199.000 đ</span>
                <Link href="/cad-store" className="text-amber-700 hover:text-amber-800 font-medium">
                  Chi tiết →
                </Link>
              </div>
            </div>

            {/* Tool 3 */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    LỆNH: AUTOPLOT
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">.NET Universal</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  AutoPlot In Bản Vẽ Hàng Loạt
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tự động quét khung Block động lồng nhau trên Model và Layout. Sắp xếp thứ tự tự nhiên (A-2 trước A-10), in chuẩn tỉ lệ và gộp 1 file PDF kèm mục lục.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-900">399.000 đ</span>
                <Link href="/cad-store" className="text-amber-700 hover:text-amber-800 font-medium">
                  Chi tiết →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* BẢNG GIÁ DỊCH VỤ (PRICING)                                         */}
      {/* ================================================================== */}
      <section id="pricing" className="py-16 md:py-20 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider">
              BẢNG GIÁ DỊCH VỤ
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Lựa Chọn Gói Phù Hợp Với Quy Mô Xưởng
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Chi phí hợp lý, kích hoạt tài khoản tự động qua cổng thanh toán VietQR.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* Gói Cơ Bản */}
            <div className="p-6 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    CƠ BẢN
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">Trải Nghiệm Miễn Phí</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Dành cho thợ thiết kế tự do &amp; tìm hiểu quy trình.</p>
                </div>

                <div className="flex items-baseline gap-1 py-1">
                  <span className="text-3xl font-bold text-slate-900 font-mono">0 đ</span>
                  <span className="text-xs text-slate-500">/ mãi mãi</span>
                </div>

                <ul className="text-xs text-slate-600 space-y-2.5 pt-3 border-t border-slate-200">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Lập báo giá theo quy cách thông số</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Quy đổi số tấm ván khổ chuẩn 1220×2440 mm</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Hệ số hao hụt ván tiêu chuẩn (+15%)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Lưu tạm thời trên trình duyệt máy tính</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/quoting"
                className="w-full text-center py-2.5 px-4 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition shadow-2xs block"
              >
                Bắt đầu miễn phí
              </Link>
            </div>

            {/* Gói Xưởng Pro */}
            <div className="p-6 rounded-lg border-2 border-slate-900 bg-white shadow-sm flex flex-col justify-between space-y-6 relative">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-amber-300">
                    GÓI KHUYÊN DÙNG
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">Xưởng Pro</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Dành cho xưởng sản xuất đồ gỗ (1–8 thợ) và đơn vị thi công.</p>
                </div>

                <div className="flex items-baseline gap-1.5 py-1">
                  <span className="text-3xl font-bold text-slate-900 font-mono">149.000 đ</span>
                  <span className="text-xs text-slate-500">/ tháng</span>
                </div>

                <ul className="text-xs text-slate-700 space-y-2.5 pt-3 border-t border-slate-200">
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Không giới hạn</strong> số dự án &amp; báo giá lưu trữ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Tùy chỉnh thư viện đơn giá xưởng riêng</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Xuất PDF A4</strong> kèm Logo &amp; Hotline xưởng</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Bảo lưu giá vốn Snapshot chống biến động giá</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Kích hoạt tự động tức thì qua VietQR</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/settings/billing"
                className="w-full text-center py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition shadow-xs block"
              >
                Nâng cấp Xưởng Pro
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* FOOTER                                                             */}
      {/* ================================================================== */}
      <footer className="no-print bg-slate-50 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-amber-600 flex items-center justify-center text-white text-[10px] font-bold">
                NT
              </div>
              <span className="font-bold text-slate-900">NỘI THẤT PRO</span>
              <span>© 2026. Nền tảng dự toán &amp; báo giá nội thất.</span>
            </div>

            <div className="flex items-center gap-5">
              <Link href="/quoting" className="hover:text-slate-900 transition">Báo giá nhanh</Link>
              <Link href="/materials" className="hover:text-slate-900 transition">Thư viện vật tư</Link>
              <Link href="/cad-store" className="hover:text-slate-900 transition">Công cụ AutoCAD</Link>
              <Link href="/privacy" className="hover:text-slate-900 transition">Bảo mật</Link>
              <Link href="/terms" className="hover:text-slate-900 transition">Điều khoản</Link>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/80 text-center text-[11px] text-slate-400">
            Lưu ý: Bảng khối lượng dự toán dựa trên hệ số hao hụt và đơn giá do người dùng thiết lập. Quý xưởng vui lòng đối chiếu sơ đồ cắt thực tế trước khi xuất lệnh đặt hàng.
          </div>
        </div>
      </footer>

      {/* Sổ tay quy cách kỹ thuật modal */}
      <TechnicalHandbookModal
        isOpen={showSpecHandbook}
        onClose={() => setShowSpecHandbook(false)}
      />

    </div>
  );
}
