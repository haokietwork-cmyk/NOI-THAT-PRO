"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  FileSpreadsheet, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  ChevronRight, 
  TrendingUp, 
  Check, 
  User, 
  Menu, 
  X, 
  BookOpen,
  Boxes,
  LayoutDashboard,
  Plus,
  Clock,
  LogOut,
  ShoppingBag,
  Sliders,
  Smartphone,
  PenTool,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Cpu
} from "lucide-react";
import TechnicalHandbookModal from "@/core/components/TechnicalHandbookModal";
import CostingSandboxWidget from "@/core/components/CostingSandboxWidget";
import OperationalWorkflowDiagram from "@/core/components/OperationalWorkflowDiagram";
import { useAuth } from "@/core/store/useAuth";

// Accordion FAQ items
const FAQ_ITEMS = [
  {
    id: "multi-trade",
    question: "Hệ thống có bị bó hẹp trong ván MDF 1220×2440 cố định không?",
    answer: "Hoàn toàn không. Nền tảng được thiết kế cho xưởng sản xuất hiện đại đa dòng hàng: hỗ trợ đồng thời ván gỗ công nghiệp (MDF, Plywood, HDF, MFC khổ tiêu chuẩn & Jumbo), gỗ tự nhiên nguyên khối (Sồi, Tần bì, Óc chó sấy), mặt đá tự nhiên & nhân tạo (Onyx, Marble, Granite với cơ chế 0% Overhead nhạy cảm giá), nhôm kính kiến trúc và sofa da bọc nệm thủ công.",
  },
  {
    id: "cost-secrecy",
    question: "Báo giá gửi cho khách hàng có nguy cơ bị lộ giá vốn nội bộ không?",
    answer: "Tuyệt đối an toàn. Hệ thống áp dụng triết lý 'Một đầu vào, hai đầu ra'. Khi xuất Báo giá khách hàng (bản in PDF chuẩn A4), hệ thống tự động ẩn sạch toàn bộ thông số chi tiết tấm lẻ, định mức hao hụt phôi cưa và công thức giá vốn nội bộ. Chỉ có chủ xưởng và quản đốc mới xem được Bảng bóc tách giá vốn chi tiết (COGS) và tải bảng đặt hàng xưởng (.xlsx).",
  },
  {
    id: "mobile-signing",
    question: "Khách hàng có thể ký duyệt phát sinh hay duyệt mẫu trên điện thoại mà không cần cài app không?",
    answer: "Có. Cổng duyệt mẫu Selections Portal và Phiếu phát sinh Change Orders được gửi cho khách hàng qua đường link bảo mật độc lập, giao diện tối ưu 100% cho màn hình điện thoại cảm ứng (iOS & Android). Chủ nhà chỉ cần bấm vào link, xem ảnh swatch mã màu ván/da/đá, rồi ký tay trực tiếp lên màn hình điện thoại để xác nhận.",
  },
  {
    id: "snapshot-pricing",
    question: "Đơn giá vật tư trên thị trường thay đổi thì các dự án cũ đã lưu có bị nhảy số không?",
    answer: "Không bao giờ. Hệ thống ứng dụng công nghệ Snapshot Pricing bất biến: Mỗi khi một dự án hoặc báo giá được tạo ra, hệ thống sao chép một bản chụp đơn giá độc lập tại ngày tạo. Dù sau này bạn cập nhật đơn giá thị trường trong Thư viện, mọi hồ sơ hợp đồng cũ đã chốt với khách hàng vẫn giữ nguyên 100% số liệu lịch sử.",
  },
  {
    id: "gemini-ai-role",
    question: "Trợ lý Google Gemini AI đóng vai trò gì và có tự ý quyết định giá bán không?",
    answer: "Toàn bộ công thức tính giá, tỷ lệ hao hụt, Overhead xưởng và lợi nhuận đều do động cơ toán học (deterministic) thực hiện theo quy tắc của xưởng, AI tuyệt đối không bao giờ được tự quyết định giá tiền. Trợ lý Gemini AI chỉ đóng vai trò hỗ trợ khi bạn nhập một quy cách lạ ngoài danh mục hoặc cần ước tính nhanh khi chưa có bản vẽ chi tiết; mọi kết quả do AI đề xuất đều mang nhãn 'ước tính AI chưa xác nhận' để bạn duyệt trước khi áp dụng.",
  },
];

export default function LandingPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSpecHandbook, setShowSpecHandbook] = useState(false);
  const [openFaqId, setOpenFaqId] = useState<string | null>("multi-trade");

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-zinc-900 selection:text-white">
      
      {/* ================================================================== */}
      {/* HEADER: THANH ĐIỀU HƯỚNG CỐ ĐỊNH & TRẠNG THÁI ĐĂNG NHẬP          */}
      {/* ================================================================== */}
      <header className="no-print sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center text-white shadow-xs group-hover:bg-black transition">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-slate-900">
                  NỘI THẤT <span className="text-zinc-900">PRO</span>
                </span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                  B2B
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal -mt-0.5 whitespace-nowrap">
                Hệ Báo Giá &amp; Quản Lý Xưởng Nội Thất
              </p>
            </div>
          </Link>

          {/* Navigation Bar (Segmented Pill Style) */}
          <nav className="hidden xl:flex items-center p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600 whitespace-nowrap">
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

            <a 
              href="#workflow" 
              className="px-3.5 py-1.5 rounded-md hover:bg-white hover:text-slate-900 hover:shadow-2xs transition"
            >
              Sơ đồ vận hành
            </a>

            <a 
              href="#pillars" 
              className="px-3.5 py-1.5 rounded-md hover:bg-white hover:text-slate-900 hover:shadow-2xs transition"
            >
              4 Trụ cột nghiệp vụ
            </a>

            <Link 
              href="/cad-store" 
              className="px-3.5 py-1.5 rounded-md hover:bg-white hover:text-slate-900 hover:shadow-2xs transition"
            >
              Công cụ AutoCAD (.NET)
            </Link>

            <a 
              href="#pricing" 
              className="px-3.5 py-1.5 rounded-md hover:bg-white hover:text-slate-900 hover:shadow-2xs transition"
            >
              Bảng giá dịch vụ
            </a>

            <a 
              href="#faq" 
              className="px-3.5 py-1.5 rounded-md hover:bg-white hover:text-slate-900 hover:shadow-2xs transition"
            >
              Hỏi đáp
            </a>
          </nav>

          {/* Auth State & Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 whitespace-nowrap">
            {isAuthenticated ? (
              /* Trạng thái ĐÃ ĐĂNG NHẬP */
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                  <div className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">
                    {(user?.companyName || user?.name || "X")[0].toUpperCase()}
                  </div>
                  <span className="font-semibold text-slate-800 max-w-[140px] truncate">
                    {user?.companyName || user?.name || "Xưởng của bạn"}
                  </span>
                  <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-100 text-zinc-800 font-bold border border-zinc-200">
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
              className="xl:hidden p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition border border-slate-200"
              aria-label="Menu điều hướng"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-b border-slate-200 px-5 py-4 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150 text-xs">
            {isAuthenticated && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
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

              <a 
                href="#workflow" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg hover:bg-slate-50 flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-slate-600" />
                <span>Sơ đồ vận hành</span>
              </a>

              <a 
                href="#pillars" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg hover:bg-slate-50 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-slate-600" />
                <span>4 Trụ cột nghiệp vụ</span>
              </a>
              
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

              <a 
                href="#faq" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg hover:bg-slate-50 flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4 text-slate-600" />
                <span>Hỏi đáp</span>
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
      {/* HERO SECTION: THẨM MỸ KỸ THUẬT XƯỞNG MỘC & SANDBOX TRỰC TIẾP       */}
      {/* ================================================================== */}
      <section className="no-print relative pt-12 pb-16 md:pt-16 md:pb-20 overflow-hidden bg-blueprint-grid border-b border-slate-200">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          {/* Badge kỹ thuật định danh */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-zinc-900" />
            <span className="font-mono text-slate-500 text-[11px]">DỰ TOÁN &amp; BÁO GIÁ NỘI THẤT</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-800 font-semibold">Ván Gỗ • Gỗ Tự Nhiên • Mặt Đá • Nhôm Kính • Sofa Da</span>
          </div>

          {/* H1 Headline: Đạt chuẩn 2 dòng, tự tin, không câu từ AI sáo rỗng */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Báo giá nhanh, chính xác giá vốn xưởng. <br className="hidden sm:block" />
            <span className="text-zinc-900 underline decoration-zinc-300 underline-offset-8">Chuyên nghiệp cho khách hàng, đa dạng mọi dòng hàng.</span>
          </h1>

          {/* Subtitle: Trực diện vào giải pháp */}
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Chiết tính giá vốn toàn diện cho cả ván gỗ công nghiệp, gỗ tự nhiên khối, đá tự nhiên và kim loại. Tích hợp 37 công đoạn sản xuất thực tế, tự động xuất bản in báo giá A4 bảo mật giá vốn và bảng đặt hàng xưởng trong vài phút.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-lg shadow-xs transition"
                >
                  <LayoutDashboard className="w-4 h-4 text-zinc-400" />
                  <span>Vào Bảng Quản Trị Dự Án</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/quoting"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition"
                >
                  <Plus className="w-4 h-4 text-zinc-900" />
                  <span>Tạo Báo Giá Mới</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/quoting"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-lg shadow-xs transition"
                >
                  <span>Bắt đầu lập báo giá ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  type="button"
                  onClick={() => setShowSpecHandbook(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition"
                >
                  <BookOpen className="w-4 h-4 text-zinc-700" />
                  <span>Sổ tay quy cách kỹ thuật</span>
                </button>
              </>
            )}
          </div>

          {/* Technical Trust Strip */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-zinc-800" />
              <span>Đa dòng hàng: Gỗ, Đá, Kính, Sofa</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-zinc-800" />
              <span>37 Công đoạn sản xuất thực tế</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-zinc-800" />
              <span>Bảo mật giá vốn Snapshot</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-zinc-800" />
              <span>Xuất bản in A4 &amp; Excel chuẩn xưởng</span>
            </span>
          </div>
        </div>

        {/* ================================================================ */}
        {/* INTERACTIVE COSTING SANDBOX WIDGET (LIVE HEART OF THE PAGE)     */}
        {/* ================================================================ */}
        <div className="mt-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <CostingSandboxWidget />
        </div>
      </section>

      {/* ================================================================== */}
      {/* SƠ ĐỒ VẬN HÀNH TOÀN DIỆN (OPERATIONAL ARCHITECTURE & WORKFLOW)     */}
      {/* ================================================================== */}
      <section id="workflow" className="py-16 md:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <OperationalWorkflowDiagram />
        </div>
      </section>

      {/* ================================================================== */}
      {/* 4 TRỤ CỘT NGHIỆP VỤ XƯỞNG NỘI THẤT (BENTO GRID - HOUZZ PRO FOR VN) */}
      {/* ================================================================== */}
      <section id="pillars" className="py-16 md:py-20 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider">
              HỆ SINH THÁI KHÉP KÍN CHO XƯỞNG SẢN XUẤT
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              4 Trụ Cột Nghiệp Vụ Bảo Vệ Lợi Nhuận
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Giải quyết triệt để rủi ro sai sót giá vốn, mất lòng khách hàng và tranh chấp phát sinh công trình.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
            
            {/* Pillar 1: Financial & Costing Suite (Span 7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-zinc-900 font-bold border border-zinc-200">
                    GIÁ VỐN &amp; ĐỊNH MỨC
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Chiết Tính Giá Vốn Chi Tiết &amp; Định Mức Sản Xuất
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hỗ trợ toàn diện từ ván gỗ công nghiệp, gỗ tự nhiên khối, đá tự nhiên, kim loại đến bọc nệm. Tự động bóc tách vật tư, phụ kiện và định mức giờ công sản xuất thực tế với đơn giá giờ công có thể tùy chỉnh linh hoạt theo từng xưởng.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/80 flex flex-wrap gap-2 text-[11px] font-mono text-slate-600">
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200">Bóc tách vật tư chuẩn xác</span>
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200">Định mức nhân công thực tế</span>
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200">Phân bổ chi phí xưởng hợp lý</span>
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200">Chiết khấu theo số lượng đặt</span>
              </div>
            </div>

            {/* Pillar 2: Selections Portal (Span 5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-zinc-900 font-bold border border-zinc-200">
                    TRỤ CỘT 2: SELECTIONS
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Cổng Duyệt Mẫu Vật Tư Trực Tuyến
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Gửi link xem mẫu vật liệu (mã Melamine An Cường, da bò Ý, mẫu đá tự nhiên) trực tiếp qua Zalo/SMS cho chủ nhà. Khách duyệt từng mẫu trên điện thoại và ấn "Đồng ý" hoặc "Yêu cầu đổi mẫu" mà không cần đến xưởng.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Không cần cài app</span>
                <span className="font-mono text-zinc-900 font-semibold">Tự động đồng bộ báo giá</span>
              </div>
            </div>

            {/* Pillar 3: Change Orders (Span 5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold">
                    <PenTool className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-zinc-900 font-bold border border-zinc-200">
                    TRỤ CỘT 3: CHANGE ORDERS
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Phiếu Phát Sinh Công Trình Ký Số
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Xóa bỏ vĩnh viễn rủi ro "làm trước rồi cãi nhau về tiền phát sinh sau". Mọi điều chỉnh về kích thước, phụ kiện hay hoàn thiện đều tạo phiếu phát sinh điện tử có chữ ký ngón tay của khách hàng ngay trên màn hình di động.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Lưu vết bằng chứng pháp lý</span>
                <span className="font-mono text-zinc-900 font-semibold">Cộng trừ tiền tự động</span>
              </div>
            </div>

            {/* Pillar 4: Client Portal (Span 7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-zinc-900 font-bold border border-zinc-200">
                    TRỤ CỘT 4: CLIENT PORTAL
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Cổng Tra Cứu Tiến Độ Thi Công Theo Số Điện Thoại
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Chủ nhà chỉ cần nhập số điện thoại là có thể tra cứu toàn bộ tiến độ sản xuất, ảnh chụp nghiệm thu từng đợt tại xưởng, lịch giao hàng dự kiến và các đợt thanh toán theo hợp đồng. Tiết kiệm 90% thời gian thợ phải nghe điện thoại trả lời từng thắc mắc vụn vặt.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/80 flex flex-wrap gap-2 text-[11px] font-mono text-slate-600">
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200">Tra cứu nhanh OTP</span>
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200">Bảo mật thông tin xưởng</span>
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200">Giao diện khách hàng riêng</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* KHO CÔNG CỤ AUTOCAD (.NET) CHUYÊN DỤNG                             */}
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
              <ShoppingBag className="w-3.5 h-3.5 text-zinc-700" />
              <span>Xem toàn bộ công cụ</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Tool 1 */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-900 border border-zinc-200">
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
                <Link href="/cad-store" className="text-zinc-900 hover:text-black font-semibold">
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
                <Link href="/cad-store" className="text-zinc-900 hover:text-black font-semibold">
                  Chi tiết →
                </Link>
              </div>
            </div>

            {/* Tool 3 */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-900 border border-zinc-200">
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
                <Link href="/cad-store" className="text-zinc-900 hover:text-black font-semibold">
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
                    <Check className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                    <span>Lập báo giá nhanh theo quy cách W×D×H</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                    <span>Dự toán đa dòng hàng: Ván, Sồi, Đá, Sofa</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                    <span>Hệ số hao hụt tiêu chuẩn theo ngành</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
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
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
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
                    <Check className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                    <span><strong>Không giới hạn</strong> số dự án &amp; báo giá lưu trữ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                    <span>Thư viện 612 mã vật tư &amp; 37 công đoạn thực tế</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                    <span><strong>Xuất PDF A4</strong> kèm Logo &amp; Hotline xưởng</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                    <span>Tải bảng đặt hàng xưởng Excel (.xlsx)</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                    <span>Bảo lưu giá vốn Snapshot chống biến động giá</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
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
      {/* HỎI ĐÁP THƯỜNG GẶP (SHADCN ACCORDION PATTERN - FAQ)               */}
      {/* ================================================================== */}
      <section id="faq" className="py-16 md:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider">
              GIẢI ĐÁP THẮC MẮC
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Câu Hỏi Thường Gặp Của Chủ Xưởng
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Mọi thắc mắc về tính bảo mật, đa dòng hàng và cách thức vận hành thực tế tại xưởng mộc.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-2xs overflow-hidden">
            {FAQ_ITEMS.map((item) => {
              const isOpen = openFaqId === item.id;
              return (
                <div key={item.id} className="transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleFaq(item.id)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition"
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-zinc-700 shrink-0" />
                      <span>{item.question}</span>
                    </span>
                    <span className="p-1 rounded bg-slate-100 text-slate-500 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-50 bg-slate-50/30 animate-in fade-in duration-150">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
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
              <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center text-white text-[10px] font-bold">
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
