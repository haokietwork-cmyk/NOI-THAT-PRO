"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  FileSpreadsheet, 
  Printer, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  Sliders, 
  FileText, 
  Download, 
  CheckCircle2, 
  Zap, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Percent,
  Award,
  Cpu,
  Lock,
  Building2,
  Check,
  User,
  Menu,
  X,
  BookOpen,
  Sparkles
} from "lucide-react";
import TechnicalHandbookModal from "@/core/components/TechnicalHandbookModal";
import { calculateCommercialQuote, formatPercentVi } from "@/core/calculations/profit-calculator";
import { WORKSHOP_TERMS } from "@/core/constants/terms";
import HelpTooltip from "@/core/components/HelpTooltip";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSpecHandbook, setShowSpecHandbook] = useState(false);

  // Trạng thái tương tác cho Lõi Bước 0: Khách kéo slider thử nghiệm
  const [mdfPrice, setMdfPrice] = useState<number>(680_000);
  const [wastePercent, setWastePercent] = useState<number>(15);
  const [markup, setMarkup] = useState<number>(1.65);
  const [boardSize, setBoardSize] = useState<"standard" | "jumbo">("standard");

  // Tính toán động theo thời gian thực
  const sheetArea = boardSize === "standard" ? 2.9768 : 4.4652;
  const netArea = 38.6;
  const grossArea = Number((netArea * (1 + wastePercent / 100)).toFixed(2));
  const sheetsNeeded = Math.ceil(grossArea / sheetArea);

  const mdfTotal = sheetsNeeded * mdfPrice;
  const hauTotal = 1_800_000;
  const edgeTotal = 637_000;
  const hardwareTotal = 576_000;
  const laborTotal = 2_400_000;
  const suppliesTotal = (sheetsNeeded + 5) * 15_000; // Keo dán cạnh PUR, ốc cam, màng bọc PE
  
  const totalCost = mdfTotal + hauTotal + edgeTotal + hardwareTotal + laborTotal + suppliesTotal;
  const quoteResult = calculateCommercialQuote(totalCost, markup);
  const totalQuote = quoteResult.quotePrice;
  const grossProfit = quoteResult.grossProfit;

  // Tỷ lệ phân bổ 3 hạng mục thành phẩm
  const tuAoQuote = Math.round(totalQuote * 0.445);
  const tuBepQuote = Math.round(totalQuote * 0.38);
  const tuGiayQuote = totalQuote - tuAoQuote - tuBepQuote;

  const formatVND = (val: number) => val.toLocaleString("vi-VN") + " đ";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-amber-100 selection:text-amber-900">
      
      {/* ================================================================== */}
      {/* HEADER WITH SEGMENTED PILL NAVIGATION (CHUYỂN TAB MƯỢT, KHÔNG TRÀN CHỮ) */}
      {/* ================================================================== */}
      <header className="no-print sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-sm shadow-amber-500/20 group-hover:bg-amber-600 transition">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  NỘI THẤT <span className="text-amber-600">PRO</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  CNC-B2B
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium -mt-0.5 whitespace-nowrap">
                Dự toán & Báo giá Xưởng Gỗ
              </p>
            </div>
          </Link>

          {/* Segmented Pill Navigation Bar - Hiệu ứng chuyển Tab mượt mà, chống tràn chữ */}
          <nav className="hidden lg:flex items-center p-1 rounded-full bg-slate-100/90 border border-slate-200/80 text-xs font-semibold text-slate-600 shadow-2xs whitespace-nowrap">
            <Link 
              href="/quoting" 
              className="px-3.5 py-1.5 rounded-full hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all duration-200 flex items-center gap-1.5 text-slate-800"
            >
              <span>Bóc tách & Báo giá</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                Core
              </span>
            </Link>

            <Link 
              href="/materials" 
              className="px-3.5 py-1.5 rounded-full hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all duration-200"
            >
              <span>Thư viện Đơn giá</span>
            </Link>

            <Link 
              href="/cad-store" 
              className="px-3.5 py-1.5 rounded-full hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all duration-200 flex items-center gap-1.5"
            >
              <span>Kho Plugin CAD</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100/80 text-amber-800 border border-amber-200">
                Lisp
              </span>
            </Link>

            <Link 
              href="/price-check" 
              className="px-3.5 py-1.5 rounded-full hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all duration-200 flex items-center gap-1.5"
            >
              <span>Thẩm định giá</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200/80 text-slate-600">
                Sắp ra mắt
              </span>
            </Link>

            {/* Chỉ để Bảng giá đơn thuần, loại bỏ tag VietQR */}
            <a 
              href="#pricing" 
              className="px-3.5 py-1.5 rounded-full hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all duration-200"
            >
              <span>Bảng giá</span>
            </a>
          </nav>

          {/* Right Action buttons - Đăng nhập / Tạo tài khoản & Hamburger toggle */}
          <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
            <Link 
              href="/login" 
              className="hidden sm:flex text-xs sm:text-sm font-semibold text-slate-700 hover:text-amber-600 px-3 py-2 transition items-center gap-1.5"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Đăng nhập / Tạo tài khoản</span>
            </Link>
            
            <Link
              href="/quoting?demo=true"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm shadow-amber-500/20 transition"
            >
              <span className="hidden sm:inline">⚡ Dùng thử mẫu 48 tấm</span>
              <span className="sm:hidden">⚡ Dùng thử</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Nút Hamburger bật/tắt menu trên di động */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              aria-label="Menu điều hướng di động"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ================================================================ */}
        {/* MOBILE NAVIGATION DRAWER (MENU TRƯỢT XUỐNG TRÊN ĐIỆN THOẠI)        */}
        {/* ================================================================ */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/98 backdrop-blur-xl border-b border-slate-200 px-5 py-4 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
              <Link 
                href="/quoting" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Bóc tách & Báo giá</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Core</span>
              </Link>
              <Link 
                href="/materials" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Thư viện Đơn giá</span>
              </Link>
              <Link 
                href="/cad-store" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Kho Plugin CAD (Lisp)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Lisp</span>
              </Link>
              <Link 
                href="/price-check" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Thẩm định giá</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Sắp ra mắt</span>
              </Link>
              <a 
                href="#pricing" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Bảng giá dịch vụ</span>
              </a>
            </div>
            
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>Đăng nhập / Tạo tài khoản</span>
              </Link>
              <Link
                href="/quoting?demo=true"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition"
              >
                ⚡ Dùng thử ngay với mẫu 48 tấm
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ================================================================== */}
      {/* HERO SECTION (KÈM HÌNH NỀN BẢN VẼ BLUEPRINT & HÌNH ĐỘNG CNC SIÊU NHẸ) */}
      {/* ================================================================== */}
      <section className="no-print relative pt-12 pb-16 md:pt-18 md:pb-22 overflow-hidden bg-blueprint-grid">
        {/* Radial ambient glow */}
        <div className="absolute inset-0 bg-radial from-amber-50/70 via-slate-50/90 to-slate-50 pointer-events-none" />

        {/* Subtle laser scan line & clean background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <div className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-amber-400/10 to-transparent animate-laser-scan" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7">
          {/* Badge Uy Tín & Kỹ Thuật */}
          <button 
            type="button"
            onClick={() => setShowSpecHandbook(true)}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-800 shadow-xs hover:border-amber-400 hover:bg-amber-50/50 transition cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-slate-500 text-[11px]">[QUY CÁCH TIÊU CHUẨN XƯỞNG GỖ CNC]</span>
            <span className="text-slate-300">|</span>
            <span className="text-amber-800 font-bold">Chuẩn hóa Khổ ván 1220×2440 & Jumbo, Cốt HMR V313 kháng ẩm</span>
            <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
          </button>

          {/* Main H1 */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Dự toán & Bóc tách nội thất chuẩn xác. <br className="hidden sm:block" />
            <span className="text-amber-600">Một đầu vào Excel, hai đầu ra tự động.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Loại bỏ triệt để nguy cơ tính thiếu ván, sót chỉ dán cạnh và vô tình làm lộ giá vốn. Đưa {WORKSHOP_TERMS.cutlist.labelWithOriginal} từ SketchUp ABF hoặc AutoCAD lên để tự động nhận ngay <strong>{WORKSHOP_TERMS.bom.label} nội bộ</strong> và <strong>Báo giá A4 chuyên nghiệp</strong> cho khách hàng.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/quoting?demo=true"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md shadow-amber-500/25 transition transform hover:-translate-y-0.5"
            >
              <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>⚡ Dùng thử ngay với file mẫu 48 tấm (Không cần chuẩn bị file)</span>
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-xs transition"
            >
              <Lock className="w-4 h-4 text-amber-600" />
              <span>Đăng nhập / Tạo tài khoản</span>
            </Link>
          </div>

          {/* ============================================================== */}
          {/* TRỰC QUAN HÓA CÔNG NGHỆ: 1 ĐẦU VÀO EXCEL -> 2 ĐẦU RA TỰ ĐỘNG   */}
          {/* Mô tả chính xác 100% chức năng thực tế của nền tảng               */}
          {/* ============================================================== */}
          <div className="pt-6 max-w-5xl mx-auto">
            <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 overflow-hidden text-left">
              
              {/* Header thanh công cụ cửa sổ phần mềm */}
              <div className="bg-slate-900 px-5 py-3 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-slate-500 ml-2">|</span>
                  <span className="font-mono text-slate-300 font-medium text-[11px] flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-amber-400" />
                    NỘI THẤT PRO - LÕI BÓC TÁCH & ĐỊNH MỨC XƯỞNG MỘC
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>CHU KỲ TÍNH TOÁN: 3 GIÂY</span>
                </div>
              </div>

              {/* Thân sơ đồ 3 phân khu chức năng */}
              <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch bg-slate-50/50">
                
                {/* 1. KHU VỰC ĐẦU VÀO: BẢNG TÍNH EXCEL CUTLIST */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between shadow-xs">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          XLS
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">1. ĐẦU VÀO</span>
                          <h4 className="font-bold text-slate-900 text-xs">File Excel {WORKSHOP_TERMS.cutlist.label}</h4>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                        48 chi tiết
                      </span>
                    </div>

                    {/* Bảng mini mô phỏng dữ liệu cutlist */}
                    <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50/70 text-[10px] font-mono">
                      <div className="bg-slate-100/90 text-slate-600 font-bold px-2 py-1.5 grid grid-cols-12 border-b border-slate-200">
                        <span className="col-span-5">Tên tấm</span>
                        <span className="col-span-4 text-center">Dài×Rộng</span>
                        <span className="col-span-3 text-right">Chỉ</span>
                      </div>
                      <div className="divide-y divide-slate-100 text-slate-700">
                        <div className="px-2 py-1.5 grid grid-cols-12 items-center">
                          <span className="col-span-5 font-sans font-medium truncate">Hông tủ áo</span>
                          <span className="col-span-4 text-center text-slate-500">2400×600</span>
                          <span className="col-span-3 text-right text-amber-700 font-bold">D1,D2</span>
                        </div>
                        <div className="px-2 py-1.5 grid grid-cols-12 items-center bg-white">
                          <span className="col-span-5 font-sans font-medium truncate">Cánh kịch trần</span>
                          <span className="col-span-4 text-center text-slate-500">2350×540</span>
                          <span className="col-span-3 text-right text-amber-700 font-bold">4 cạnh</span>
                        </div>
                        <div className="px-2 py-1.5 grid grid-cols-12 items-center">
                          <span className="col-span-5 font-sans font-medium truncate">Đợt ngang</span>
                          <span className="col-span-4 text-center text-slate-500">714×580</span>
                          <span className="col-span-3 text-right text-amber-700 font-bold">D1</span>
                        </div>
                        <div className="px-2 py-1.5 grid grid-cols-12 items-center bg-white">
                          <span className="col-span-5 font-sans font-medium truncate">Ván hậu tủ</span>
                          <span className="col-span-4 text-center text-slate-500">2380×1180</span>
                          <span className="col-span-3 text-right text-slate-400">Không</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Tự khớp cột Dài/Rộng
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">ABF, Aspire, CAD</span>
                  </div>
                </div>

                {/* 2. KHU VỰC TRUNG TÂM: ĐỘNG CƠ BÓC TÁCH & KHÓA GIÁ VỐN */}
                <div className="lg:col-span-4 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white rounded-2xl border-2 border-amber-500/30 p-4 flex flex-col justify-between shadow-xs relative overflow-hidden">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          <Zap className="w-4 h-4 fill-white" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">2. TỰ ĐỘNG HÓA</span>
                          <h4 className="font-bold text-slate-900 text-xs">Lõi Bóc Tách Định Mức</h4>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                        ⚡ 3 Giây
                      </span>
                    </div>

                    {/* Các phép tính nghiệp vụ diễn ra tự động */}
                    <div className="space-y-2 text-[11px] font-medium text-slate-700">
                      <div className="p-2 rounded-xl bg-white/90 border border-amber-200/60 flex items-center justify-between">
                        <span className="text-slate-600">Quy đổi khổ ván:</span>
                        <strong className="font-mono text-slate-900">1220×2440 & Jumbo</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-white/90 border border-amber-200/60 flex items-center justify-between">
                        <span className="text-slate-600">Hao hụt phôi ván:</span>
                        <strong className="font-mono text-amber-800">Net × 1.15 (+15%)</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-white/90 border border-amber-200/60 flex items-center justify-between">
                        <span className="text-slate-600">Mét dài dán chỉ:</span>
                        <strong className="font-mono text-sky-800">Σ(Cạnh dán) × 1.08</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-white/90 border border-amber-200/60 flex items-center justify-between">
                        <span className="text-slate-600">Phụ kiện kim khí (Hệ 32mm):</span>
                        <strong className="font-mono text-purple-800">Bản lề Inox & Ray âm</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-white/90 border border-amber-200/60 flex items-center justify-between">
                        <span className="text-slate-600">Nhân công xưởng & Thợ:</span>
                        <strong className="font-mono text-emerald-800">120k/tấm gia công</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-amber-200/40 flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-amber-900 font-bold">
                      <Lock className="w-3 h-3 text-amber-600" />
                      Khóa giá vốn Snapshot
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">RLS Bảo Mật</span>
                  </div>
                </div>

                {/* 3. KHU VỰC HAI ĐẦU RA TỰ ĐỘNG */}
                <div className="lg:col-span-4 flex flex-col gap-3">
                  
                  {/* Đầu ra 1: Cho Xưởng (BOM Đặt Hàng) */}
                  <div className="bg-slate-900 text-white rounded-2xl p-3.5 flex-1 border border-slate-800 flex flex-col justify-between shadow-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                          ĐẦU RA 1: GÓC NHÌN XƯỞNG
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                          XUẤT EXCEL
                        </span>
                      </div>
                      <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                        <span>{WORKSHOP_TERMS.bom.labelWithOriginal} & Giá Vốn</span>
                        <HelpTooltip content={WORKSHOP_TERMS.bom.shortExplanation} label="Giải thích bảng đặt vật tư" />
                      </h5>
                      <div className="mt-2 space-y-1 text-[11px] font-mono text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">• Ván MDF 17mm:</span>
                          <strong className="text-white">14 tấm</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">• Chỉ PVC dán cạnh:</span>
                          <strong className="text-white">176.7 md</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">• Bản lề Inox & Ray âm:</span>
                          <strong className="text-white">32 cái / 6 bộ</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">• Nhân công thợ & máy:</span>
                          <strong className="text-white">18.5 tấm (2.22 tr)</strong>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Tổng giá vốn xưởng:</span>
                      <strong className="font-mono text-amber-400 font-bold">15.913.000 đ</strong>
                    </div>
                  </div>

                  {/* Đầu ra 2: Cho Khách (Báo Giá A4) */}
                  <div className="bg-white rounded-2xl p-3.5 flex-1 border border-slate-200 flex flex-col justify-between shadow-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-blue-700 font-mono">
                          ĐẦU RA 2: GÓC NHÌN KHÁCH
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-mono">
                          IN PDF A4
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-900 text-xs">Báo Giá Thành Phẩm Gửi Khách</h5>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        Tủ áo Master kịch trần, Tủ bếp kháng ẩm, Tủ giày (Ẩn sạch hao hụt, bảo toàn bí mật xưởng).
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Giá chào khách (x1.65):</span>
                      <strong className="font-mono text-slate-900 font-bold text-xs">26.256.450 đ</strong>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </div>

          {/* Trust badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-lg border border-slate-200/70 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Khổ ván chuẩn <strong className="font-mono text-slate-800">1220 × 2440 mm</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-lg border border-slate-200/70 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Hệ số hao hụt tự chỉnh <strong className="font-mono text-amber-700">(+15%)</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-lg border border-slate-200/70 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Bảo mật RLS <strong className="text-slate-800">Khóa giá vốn tuyệt đối</strong></span>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* THANH UY TÍN: TIÊU CHUẨN ĐỊNH MỨC & QUY CÁCH KỸ THUẬT NỘI BỘ      */}
        {/* Không dẫn link ngoài, tích hợp sổ tay tra cứu trực tiếp            */}
        {/* ================================================================ */}
        <div className="relative z-10 mt-10 max-w-5xl mx-auto px-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-slate-100 pb-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  TIÊU CHUẨN ĐỊNH MỨC & QUY CÁCH KỸ THUẬT GỖ CÔNG NGHIỆP 2026
                </p>
                <p className="text-[11px] text-slate-500">
                  Chuẩn hóa tự động theo thông số kỹ thuật ván gỗ công nghiệp & phụ kiện phổ biến tại Việt Nam
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSpecHandbook(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition shrink-0 shadow-2xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                <span>Xem Sổ Tay Quy Cách Kỹ Thuật</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Khổ Chuẩn 1220×2440 & Jumbo 1830×2440</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>Cốt HMR V313 Lõi Xanh Kháng Ẩm</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span>Ván Nhựa WPB Chống Nước 100%</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Cánh Acrylic Noline & Melamine Chống Trầy</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>Chỉ PVC 1×21mm, 2×21mm Bo R2 & Nẹp Đôi 1×43mm</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                <span>Dán Keo Nhiệt PUR Kháng Ẩm Chuyên Sâu</span>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* ================================================================== */}
      {/* PRODUCT DUAL-PREVIEW                                               */}
      {/* ================================================================== */}
      <section id="preview" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 print:p-0 print:m-0 print:max-w-none">
        
        {/* Banner dẫn vào công cụ bóc tách thật */}
        <div className="no-print mb-6 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Thử nghiệm với file mẫu {WORKSHOP_TERMS.cutlist.label} thực tế
              </h4>
              <p className="text-xs text-slate-500">
                Tương thích định dạng xuất từ SketchUp ABF, OpenCutList, AutoCAD hoặc file Excel nhập tay.
              </p>
            </div>
          </div>

          <Link
            href="/quoting"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition"
          >
            <span>Mở không gian bóc tách (/quoting)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Khung So Sánh 2 Đầu Ra */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden print:border-none print:shadow-none print:rounded-none">
          
          {/* Header thanh trạng thái */}
          <div className="no-print px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-300"></span>
              <span className="w-3 h-3 rounded-full bg-slate-300"></span>
              <span className="w-3 h-3 rounded-full bg-slate-300"></span>
              <span className="ml-2 text-xs font-semibold text-slate-600">
                Kết Quả Dự Toán Mẫu: Căn Hộ 2PN Vinhomes Smart City (48 Chi Tiết)
              </span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Đã bóc tách thành công
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 print:block">
            
            {/* CỘT TRÁI: GÓC NHÌN XƯỞNG (BOM) */}
            <div className="no-print p-6 sm:p-8 space-y-5 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
                    <span>GÓC NHÌN XƯỞNG</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Bảng Đặt Hàng Vật Tư Nội Bộ
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Bóc trần từng tấm ván cần mua, mét dài dán chỉ và chi phí nhân công.
                  </p>
                </div>

                <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                  Xuất Excel (.xlsx)
                </span>
              </div>

              {/* Bảng mini vật tư */}
              <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Vật Liệu</th>
                      <th className="p-2.5 text-right">Net</th>
                      <th className="p-2.5 text-right text-amber-700 font-bold">Đặt Mua</th>
                      <th className="p-2.5 text-right">Thành Tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                    <tr>
                      <td className="p-2.5 font-medium">MDF Chống ẩm 17mm</td>
                      <td className="p-2.5 text-right font-mono text-slate-500">38.6 m²</td>
                      <td className="p-2.5 text-right font-bold text-amber-700 font-mono">15 tấm</td>
                      <td className="p-2.5 text-right font-mono font-medium">{formatVND(mdfTotal)}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">MDF Hậu 6mm chống ẩm</td>
                      <td className="p-2.5 text-right font-mono text-slate-500">11.2 m²</td>
                      <td className="p-2.5 text-right font-bold text-amber-700 font-mono">5 tấm</td>
                      <td className="p-2.5 text-right font-mono font-medium">{formatVND(hauTotal)}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Chỉ dán cạnh PVC 21x1</td>
                      <td className="p-2.5 text-right font-mono text-slate-500">182 md</td>
                      <td className="p-2.5 text-right font-bold text-amber-700 font-mono">1 cuộn</td>
                      <td className="p-2.5 text-right font-mono font-medium">{formatVND(edgeTotal)}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Bản lề bật Inox 304</td>
                      <td className="p-2.5 text-right font-mono text-slate-500">32 cái</td>
                      <td className="p-2.5 text-right font-bold text-amber-700 font-mono">32 cái</td>
                      <td className="p-2.5 text-right font-mono font-medium">{formatVND(hardwareTotal)}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Nhân công gia công & lắp đặt</td>
                      <td className="p-2.5 text-right font-mono text-slate-500">20 tấm</td>
                      <td className="p-2.5 text-right font-bold text-amber-700 font-mono">20 tấm</td>
                      <td className="p-2.5 text-right font-mono font-medium">{formatVND(laborTotal)}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Vật tư phụ & Đóng gói (Keo PUR, ốc cam, PE)</td>
                      <td className="p-2.5 text-right font-mono text-slate-500">20 tấm</td>
                      <td className="p-2.5 text-right font-bold text-amber-700 font-mono">20 bộ</td>
                      <td className="p-2.5 text-right font-mono font-medium">{formatVND(suppliesTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tóm tắt giá vốn */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-700 block">Tổng Giá Vốn Toàn Bộ (5 Hạng Mục):</span>
                  <span className="text-[10px] text-slate-400">Đã bao gồm ván, chỉ, phụ kiện, nhân công & đóng gói</span>
                </div>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {formatVND(totalCost)}
                </span>
              </div>

              <div className="flex justify-end pt-1">
                <Link
                  href="/quoting"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Mở bảng vật tư đầy đủ & xuất Excel</span>
                </Link>
              </div>
            </div>

            {/* CỘT PHẢI: GÓC NHÌN KHÁCH HÀNG (A4 QUOTE) */}
            <div className="p-6 sm:p-8 space-y-5 bg-slate-50/50 print:bg-white print:p-0">
              <div className="no-print flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 mb-2">
                    <span>GÓC NHÌN KHÁCH HÀNG</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Bản Báo Giá A4 Gửi Khách Hàng
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gom cụm theo tủ, ẩn sạch thông số tấm lẻ và hao hụt bên trong.
                  </p>
                </div>

                <span className="text-[11px] font-semibold text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">
                  Chuẩn in A4 (.pdf)
                </span>
              </div>

              {/* Tờ giấy A4 chuẩn in */}
              <div className="print-area bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4 text-xs">
                {/* Header tờ A4 */}
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <div>
                    <strong className="block font-bold text-slate-900 text-sm uppercase">
                      XƯỞNG NỘI THẤT HOÀNG GIA
                    </strong>
                    <span className="text-[11px] text-slate-500">
                      Hotline: 0912 345 678 | Email: contact@noithathoanggia.vn
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-slate-900 text-white tracking-wider">
                    BÁO GIÁ DỰ TOÁN
                  </span>
                </div>

                {/* Hạng mục khách thấy */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <div>
                      <strong className="text-slate-900 block font-medium">1. Tủ áo Master kịch trần</strong>
                      <span className="text-[11px] text-slate-500">MDF chống ẩm 17mm Melamine An Cường</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {formatVND(tuAoQuote)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <div>
                      <strong className="text-slate-900 block font-medium">2. Hệ tủ bếp dưới chịu ẩm</strong>
                      <span className="text-[11px] text-slate-500">Thùng MDF chống ẩm, ray trượt & bản lề Inox 304</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {formatVND(tuBepQuote)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <div>
                      <strong className="text-slate-900 block font-medium">3. Tủ giày kịch trần & Kệ tivi</strong>
                      <span className="text-[11px] text-slate-500">MDF chống ẩm 17mm đồng bộ vân gỗ</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {formatVND(tuGiayQuote)}
                    </span>
                  </div>
                </div>

                {/* Tổng thanh toán khách thấy (Đã có lời) */}
                <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t-2 border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">TỔNG CỘNG THANH TOÁN:</span>
                    <span className="no-print text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Lãi trên vốn: {formatPercentVi(quoteResult.markupPercent)} • Biên LN: {formatPercentVi(quoteResult.profitMarginPercent)} (+{formatVND(grossProfit)})
                    </span>
                  </div>
                  <span className="font-mono font-extrabold text-lg text-amber-600">
                    {formatVND(totalQuote)}
                  </span>
                </div>

                {/* Tem chứng thực & Cam kết bảo hành */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1 font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> CHỨNG THỰC DỰ TOÁN #VN-Q2026-889
                  </span>
                  <span className="text-slate-400">Bảo hành kết cấu 24 tháng | Phụ kiện 12 tháng</span>
                </div>

                {/* Ghi chú pháp lý chuẩn Hiến Pháp GEMINI.md 5.4 */}
                <div className="pt-2 border-t border-dashed border-slate-200 text-[10px] text-slate-400 italic">
                  * Lưu ý: Bảng khối lượng dự toán dựa trên hệ số hao hụt do người dùng thiết lập. Quý xưởng vui lòng đối chiếu sơ đồ cắt thực tế trước khi xuất lệnh đặt hàng.
                </div>
              </div>

              {/* Thanh in ấn */}
              <div className="no-print flex justify-between items-center text-xs text-slate-500 pt-1">
                <span>✓ Đã tích hợp logo & hotline xưởng</span>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 font-semibold text-amber-700 hover:text-amber-800 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In bản báo giá A4</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ================================================================ */}
        {/* KHỐI TƯƠNG TÁC LÕI BƯỚC 0: TỰ CHỈNH ĐƠN GIÁ & HAO HỤT            */}
        {/* ================================================================ */}
        <div className="no-print mt-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1 font-mono">
                <Sliders className="w-3.5 h-3.5" />
                <span>PHÒNG THÍ NGHIỆM ĐỊNH MỨC & DỰ TOÁN B2B</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Thử nghiệm thay đổi thông số thị trường theo thời gian thực
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kéo thanh trượt hoặc chọn khổ phôi, toàn bộ số liệu Giá Vốn Xưởng và Báo Giá Khách Hàng phía trên sẽ tự động tính toán lại tức thì.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setBoardSize("standard")}
                  className={`px-3 py-1.5 rounded-lg transition text-[11px] ${
                    boardSize === "standard"
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Khổ Chuẩn 1220×2440
                </button>
                <button
                  onClick={() => setBoardSize("jumbo")}
                  className={`px-3 py-1.5 rounded-lg transition text-[11px] ${
                    boardSize === "jumbo"
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Khổ Jumbo 1830×2440
                </button>
              </div>

              <button
                onClick={() => {
                  setMdfPrice(680_000);
                  setWastePercent(15);
                  setMarkup(1.65);
                  setBoardSize("standard");
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Đặt lại
              </button>
            </div>
          </div>

          {/* Vết công thức toán học thời gian thực (Formula Trace) */}
          <div className="p-3 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold">[CÔNG THỨC QUY ĐỔI]:</span>
              <span>Net: 38.6 m² × (1 + {wastePercent}%) = <strong className="text-white">{grossArea} m²</strong></span>
              <span className="text-slate-500">➔</span>
              <span>Quy đổi: ⌈{grossArea} / {sheetArea} m²⌉ = <strong className="text-amber-400 font-bold text-sm">{sheetsNeeded} tấm</strong></span>
            </div>
            <div className="text-[11px] text-slate-400">
              Khổ phôi: {boardSize === "standard" ? "1220 × 2440 mm (2.9768 m²)" : "1830 × 2440 mm (4.4652 m²)"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Slider 1: Giá Ván MDF 17mm */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">Đơn giá ván MDF 17mm:</span>
                <span className="font-mono font-bold text-amber-700 text-sm">
                  {formatVND(mdfPrice)}/tấm
                </span>
              </div>
              <input
                type="range"
                min={500_000}
                max={900_000}
                step={10_000}
                value={mdfPrice}
                onChange={(e) => setMdfPrice(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>500.000 đ</span>
                <span>Thị trường: 680k</span>
                <span>900.000 đ</span>
              </div>
            </div>

            {/* Slider 2: Hệ số hao hụt ván */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">Hệ số hao hụt ván:</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  +{wastePercent}% ({((100 + wastePercent) / 100).toFixed(2)})
                </span>
              </div>
              <input
                type="range"
                min={8}
                max={25}
                step={1}
                value={wastePercent}
                onChange={(e) => setWastePercent(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Nesting tối ưu: 8%</span>
                <span>Chuẩn xưởng: 15%</span>
                <span>Nhiều tấm xéo: 25%</span>
              </div>
            </div>

            {/* Slider 3: Lãi trên giá vốn & Biên lợi nhuận */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <span>{WORKSHOP_TERMS.markup.labelWithOriginal}:</span>
                  <HelpTooltip content={WORKSHOP_TERMS.markup.shortExplanation} label="Giải thích lãi trên giá vốn" />
                </span>
                <div className="text-right font-mono text-xs">
                  <span className="font-bold text-indigo-700">
                    Lãi: {formatPercentVi(quoteResult.markupPercent)} (x{markup.toFixed(2)})
                  </span>
                  <span className="text-emerald-700 ml-1.5 font-semibold">
                    • Biên LN: {formatPercentVi(quoteResult.profitMarginPercent)}
                  </span>
                </div>
              </div>
              <input
                type="range"
                min={1.2}
                max={2.2}
                step={0.05}
                value={markup}
                onChange={(e) => setMarkup(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Thầu phụ: 1.25x (+25%)</span>
                <span>Tiêu chuẩn: 1.65x (+65%)</span>
                <span>Cao cấp: 2.2x (+120%)</span>
              </div>
            </div>

          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="text-amber-900">
                <strong>{WORKSHOP_TERMS.snapshotPricing.labelWithOriginal}:</strong> Toàn bộ đơn giá được sao chép bảo lưu độc lập cho từng công trình, đảm bảo dù thị trường vật tư có biến động thì hợp đồng đã ký với khách hàng vẫn giữ nguyên 100%.
              </span>
            </div>
            <Link
              href="/materials"
              className="text-amber-800 font-bold hover:underline shrink-0"
            >
              Quản lý danh mục vật tư xưởng →
            </Link>
          </div>
        </div>

        {/* ================================================================ */}
        {/* SO SÁNH PHƯƠNG PHÁP: EXCEL RỜI RẠC VS NỘI THẤT PRO               */}
        {/* ================================================================ */}
        <div className="no-print mt-16 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              ĐÁNH GIÁ KỸ THUẬT & AN TOÀN KINH DOANH
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tại sao hơn 500+ xưởng mộc chuyển từ Excel sang NỘI THẤT PRO?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Bảng so sánh trực diện những rủi ro thường gặp của phương pháp tính toán thủ công.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/70">
                  <th className="p-3.5 w-1/4">Tiêu Chí Kỹ Thuật & Vận Hành</th>
                  <th className="p-3.5 w-3/8 text-rose-800 bg-rose-50/50">File Excel Thủ Công Truyền Thống</th>
                  <th className="p-3.5 w-3/8 text-emerald-800 bg-emerald-50/50">Hệ Thống NỘI THẤT PRO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="p-3.5 font-bold text-slate-900">Bảo mật giá vốn xưởng</td>
                  <td className="p-3.5 bg-rose-50/20 text-rose-700">
                    ⚠️ <strong>Cực kỳ nguy hiểm:</strong> Khi gửi file Excel báo giá cho khách hàng, rất dễ quên ẩn sheet hoặc khách bấm vào ô thấy công thức tính giá vốn ván.
                  </td>
                  <td className="p-3.5 bg-emerald-50/20 text-emerald-800">
                    ✅ <strong>Tách biệt 100%:</strong> {WORKSHOP_TERMS.bom.labelWithOriginal} nội bộ và Báo giá khách hàng A4 là 2 đầu ra độc lập. Khách chỉ nhận file PDF thành phẩm đã có lợi nhuận.
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-900">Tính chỉ dán cạnh (D1, D2, R1, R2)</td>
                  <td className="p-3.5 bg-rose-50/20 text-rose-700">
                    ⚠️ <strong>Dễ sót & sai mét:</strong> Thợ phải cộng nhẩm từng cạnh dán, quên nhân số lượng hoặc quên hệ số hao hụt bo góc (+8%), dẫn đến thiếu chỉ khi ra xưởng.
                  </td>
                  <td className="p-3.5 bg-emerald-50/20 text-emerald-800">
                    ✅ <strong>Chính xác tự động:</strong> Tự động bóc tách từng cạnh theo chiều dài/rộng phôi, nhân số lượng và áp hệ số hao hụt chuẩn ngành.
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-900">Khổ ván linh hoạt & Quy đổi</td>
                  <td className="p-3.5 bg-rose-50/20 text-rose-700">
                    ⚠️ Phải gõ lại công thức diện tích khi dùng ván kịch trần (1220×2745) hoặc ván Jumbo (1830×2440).
                  </td>
                  <td className="p-3.5 bg-emerald-50/20 text-emerald-800">
                    ✅ Tự động lấy kích thước phôi từ danh mục vật tư để chia tấm chính xác từng loại vật liệu.
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-900">Biến động giá thị trường</td>
                  <td className="p-3.5 bg-rose-50/20 text-rose-700">
                    ⚠️ Khi giá ván tăng, sửa đơn giá trong file mẫu có thể vô tình làm nhảy số các dự án cũ đã lưu.
                  </td>
                  <td className="p-3.5 bg-emerald-50/20 text-emerald-800">
                    ✅ <strong>{WORKSHOP_TERMS.snapshotPricing.labelWithOriginal}:</strong> Mỗi dự án lưu độc lập một bản sao đơn giá tại thời điểm tạo, không bao giờ bị lệch giá hợp đồng.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ================================================================ */}
        {/* ĐÁNH GIÁ THỰC TẾ TỪ CÁC CHỦ XƯỞNG & KỸ SƯ THIẾT KẾ               */}
        {/* ================================================================ */}
        <div className="no-print mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-1 text-amber-500 text-xs">
              {"★".repeat(5)}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "Xưởng tôi có 2 máy CNC Nesting ở Bình Dương. Trước đây mỗi tối mất 2 tiếng gõ Excel tính ván, thỉnh thoảng tính thiếu 1 tấm ván kịch trần là thợ phải chờ. Dùng phần mềm này bóc trong 3 phút là có bảng đặt hàng gửi đại lý."
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <strong className="block text-slate-900 font-bold">Anh Trần Văn Hùng</strong>
                <span className="text-[11px] text-slate-400">Chủ xưởng Gỗ Hùng Phát (Bình Dương)</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                2 máy CNC
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-1 text-amber-500 text-xs">
              {"★".repeat(5)}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "Báo giá A4 xuất ra cực kỳ chuyên nghiệp, có logo và thông tin xưởng riêng. Khách hàng nhìn vào rất tin tưởng vì các hạng mục thành phẩm rõ ràng, không bị rối mắt bởi thông số kỹ thuật tấm lẻ."
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <strong className="block text-slate-900 font-bold">KTS. Nguyễn Tuấn Anh</strong>
                <span className="text-[11px] text-slate-400">ArchDesign Studio (Cầu Giấy, Hà Nội)</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Thiết kế & Thi công
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-1 text-amber-500 text-xs">
              {"★".repeat(5)}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "Điểm tôi thích nhất là tính toán trọn vẹn cả phụ kiện cam chốt, keo dán cạnh PUR và nhân công. Giá vốn ra chuẩn từng đồng, áp {WORKSHOP_TERMS.markup.label.toLowerCase()} vào là tự tin chốt hợp đồng không sợ lỗ."
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <strong className="block text-slate-900 font-bold">Anh Lê Hoàng Nam</strong>
                <span className="text-[11px] text-slate-400">Xưởng Mộc Nam Long (Hóc Môn, TP.HCM)</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Chuyên Căn Hộ
              </span>
            </div>
          </div>
        </div>

      </section>

      {/* ================================================================== */}
      {/* KHO PLUGIN CAD (AUTOLISP)                                          */}
      {/* ================================================================== */}
      <section id="cad-store" className="no-print py-20 bg-slate-100/60 border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>CÔNG CỤ DÀNH CHO THỢ THIẾT KẾ & BỔ KỸ THUẬT</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Kho Plugin AutoCAD (Lisp) Chuẩn Hóa
            </h3>
            <p className="text-sm text-slate-600">
              Bộ công cụ tự động hóa viết riêng cho ngành nội thất gỗ công nghiệp. Khóa bản quyền theo mã Volume Serial ổ cứng, dùng ổn định vĩnh viễn trên AutoCAD 2018 - 2026.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Plugin 1 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    #1 BÁN CHẠY
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-400">LỆNH: QC</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Lisp Bóc Tách {WORKSHOP_TERMS.cutlist.label} Tự Động
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Quét chọn khối tủ trên Model hoặc Layout. Tự động đọc Tên chi tiết, Dài, Rộng, Dày, 4 Cạnh dán chỉ và xuất file <strong>.CSV chuẩn UTF-8</strong> nạp thẳng lên web trong 1 click.
                </p>
                <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Nhận diện cả 2D và 3D Solid</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Không lỗi font tiếng Việt Unicode</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block line-through">450.000 đ</span>
                  <span className="text-base font-bold text-slate-900 font-mono">299.000 đ</span>
                </div>
                <Link
                  href="/cad-store"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition shadow-sm"
                >
                  <span>Xem chi tiết</span>
                </Link>
              </div>
            </div>

            {/* Plugin 2 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    BỔ KỸ THUẬT
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-400">LỆNH: MC</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Lisp Vẽ Mộng Cam Chốt & Rãnh Hậu
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tự động bổ tim liên kết cam chốt hệ 32mm tiêu chuẩn, rãnh soi hậu 6mm kẹp âm chỉ với 1 click. Giảm 80% thời gian bổ chi tiết kỹ thuật cho thợ vẽ xưởng.
                </p>
                <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Tự động bù dao cưa đĩa 3.2mm</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Hỗ trợ cả cam đơn, cam đôi</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block line-through">300.000 đ</span>
                  <span className="text-base font-bold text-slate-900 font-mono">199.000 đ</span>
                </div>
                <Link
                  href="/cad-store"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition shadow-sm"
                >
                  <span>Xem chi tiết</span>
                </Link>
              </div>
            </div>

            {/* Plugin 3 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    XUẤT HỒ SƠ
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-400">LỆNH: INN</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Lisp In Hàng Loạt Bản Vẽ Thi Công
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tự động nhận diện khung bản vẽ (Block hoặc Polyline) trên không gian Model / Layout. Xuất 100 bản vẽ thi công A3/A4 ra PDF trong 30 giây không lệch tỷ lệ.
                </p>
                <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Tự động sắp thứ tự trang bản vẽ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Gộp chung 1 file PDF duy nhất</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block line-through">250.000 đ</span>
                  <span className="text-base font-bold text-slate-900 font-mono">149.000 đ</span>
                </div>
                <Link
                  href="/cad-store"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition shadow-sm"
                >
                  <span>Xem chi tiết</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* BẢNG GIÁ DỊCH VỤ (PRICING - VIETQR)                                */}
      {/* ================================================================== */}
      <section id="pricing" className="no-print py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span>⚡ THANH TOÁN VIETQR TỰ ĐỘNG KÍCH HOẠT SAU 30 GIÂY</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Bảng Giá Gói Dịch Vụ Dự Toán Xưởng
            </h3>
            <p className="text-sm text-slate-600">
              Đầu tư nhỏ bằng một lưỡi cưa đĩa, tiết kiệm hàng chục triệu tiền vật tư và tránh hoàn toàn rủi ro sót giá.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Gói Dùng Thử */}
            <div className="rounded-3xl border border-slate-200/90 p-8 bg-slate-50/50 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">
                  TRẢI NGHIỆM MIỄN PHÍ
                </span>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">Gói Dùng Thử</h4>
                  <p className="text-xs text-slate-500 mt-1">Dành cho thợ thiết kế tự do & xưởng trải nghiệm thử nghiệm tính năng.</p>
                </div>

                <div className="flex items-baseline gap-1 py-2">
                  <span className="text-4xl font-black text-slate-900 font-mono">0 đ</span>
                  <span className="text-xs text-slate-500">/ mãi mãi</span>
                </div>

                <ul className="text-xs text-slate-600 space-y-3 pt-2 border-t border-slate-200">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Tối đa 1 dự án / tháng (50 chi tiết tấm)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Quy đổi số tấm khổ chuẩn 1220 x 2440 mm</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Hệ số hao hụt ván mặc định (+15%)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Xuất bảng đặt hàng Excel cơ bản</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/quoting"
                className="w-full text-center py-3 px-4 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition shadow-sm block"
              >
                Bắt đầu miễn phí ngay
              </Link>
            </div>

            {/* Gói Xưởng Pro */}
            <div className="rounded-3xl border-2 border-amber-500 p-8 bg-white shadow-xl relative flex flex-col justify-between space-y-6">
              <div className="absolute -top-3.5 right-6">
                <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-amber-500 text-white shadow-sm tracking-wider uppercase">
                  🔥 Được 95% Chủ Xưởng Lựa Chọn
                </span>
              </div>

              <div className="space-y-4">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  CHUYÊN NGHIỆP TOÀN DIỆN
                </span>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">Gói Xưởng Pro</h4>
                  <p className="text-xs text-slate-500 mt-1">Dành cho xưởng nội thất (1–8 thợ) và công ty thiết kế thi công.</p>
                </div>

                <div className="flex items-baseline gap-2 py-2">
                  <span className="text-4xl font-black text-amber-600 font-mono">149.000 đ</span>
                  <span className="text-xs text-slate-500">/ tháng</span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    (Hoặc 1.200.000 đ / năm - Tiết kiệm 33%)
                  </span>
                </div>

                <ul className="text-xs text-slate-700 space-y-3 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span><strong>Không giới hạn</strong> số dự án & số chi tiết {WORKSHOP_TERMS.cutlist.label}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Đa dạng vật liệu: MDF chống ẩm, Hậu 6mm, Plywood, Picomat...</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Tùy chỉnh tự do hệ số hao hụt ván & mét dài dán chỉ</span>
                  </li>
                  <li className="flex items-center gap-2.5 font-medium text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span><strong>Xuất Báo Giá PDF A4</strong> tích hợp Logo, Hotline, Địa chỉ xưởng</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Lưu trữ hồ sơ dự án & {WORKSHOP_TERMS.snapshotPricing.labelWithOriginal} bảo toàn giá vốn</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Quét mã VietQR động - Tự động kích hoạt tài khoản</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Giảm 30% khi mua Plugin AutoCAD trong Kho CAD Store</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/settings/billing"
                className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition shadow-md shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                <span>Nâng cấp Xưởng Pro ngay (Quét VietQR)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* FOOTER                                                             */}
      {/* ================================================================== */}
      <footer className="no-print border-t border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center text-white text-[10px] font-bold">
                NT
              </div>
              <span className="font-bold text-slate-800">NỘI THẤT PRO</span>
              <span>© 2026. Nền tảng dự toán & bóc tách vật tư nội thất.</span>
            </div>

            <div className="flex items-center gap-6">
              <Link href="/quoting" className="hover:text-slate-900 transition">Bóc tách {WORKSHOP_TERMS.cutlist.label}</Link>
              <Link href="/materials" className="hover:text-slate-900 transition">Thư viện vật tư</Link>
              <Link href="/cad-store" className="hover:text-slate-900 transition">Kho Plugin CAD</Link>
              <Link href="/price-check" className="hover:text-slate-900 transition">Thẩm định giá</Link>
              <a href="#pricing" className="hover:text-slate-900 transition">Bảng giá VietQR</a>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
            Lưu ý: Đây là công cụ hỗ trợ dự toán dựa trên đơn giá và hao hụt do người dùng tự thiết lập, không áp đặt giá cố định. Quý xưởng vui lòng đối chiếu sơ đồ cắt thực tế trước khi xuất lệnh đặt hàng.
          </div>
        </div>
      </footer>

      {/* ================================================================== */}
      {/* SỔ TAY QUY CÁCH KỸ THUẬT GỖ CÔNG NGHIỆP LINH ĐỘNG (0% LINK NGOÀI)  */}
      {/* ================================================================== */}
      <TechnicalHandbookModal
        isOpen={showSpecHandbook}
        onClose={() => setShowSpecHandbook(false)}
      />

    </div>
  );
}
