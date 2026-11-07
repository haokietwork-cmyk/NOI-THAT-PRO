"use client";

import { useState } from "react";
import { 
  FileSpreadsheet, 
  Cpu, 
  Printer, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Download, 
  Smartphone, 
  PenTool, 
  Eye, 
  Sliders, 
  Clock, 
  ChevronRight,
  Database
} from "lucide-react";

type StageKey = "inputs" | "engine" | "outputs" | "post_quote";

interface StageInfo {
  key: StageKey;
  stepNumber: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  summary: string;
  pillars: {
    title: string;
    description: string;
    badge: string;
  }[];
  flowNote: string;
}

const STAGES: StageInfo[] = [
  {
    key: "inputs",
    stepNumber: "01",
    title: "Đầu Vào Đa Dạng",
    subtitle: "2 Cổng nạp linh hoạt cho mọi nhu cầu",
    badge: "NHANH HOẶC CHI TIẾT",
    badgeColor: "bg-zinc-100 text-zinc-900 border-zinc-200",
    summary: "Người dùng không bị gò bó vào một cách nhập liệu duy nhất. Tùy thuộc vào giai đoạn thiết kế, xưởng có thể ước lượng nhanh bằng kích thước bao hoặc bóc tách chi tiết từng linh kiện.",
    pillars: [
      {
        title: "Phương thức 1: Nhập nhanh W × D × H",
        description: "Chọn Archetype sản phẩm, nhập kích thước bao phủ bì, chất liệu chính và đánh dấu 5 tuỳ chọn đặc biệt (Đá 0% OH, Kính, Kim loại, Đệm sofa, Đèn LED). Hệ thống tự quy đổi định mức trong 30 giây.",
        badge: "Dự toán sơ bộ",
      },
      {
        title: "Phương thức 2: Bóc tách BOM Chi tiết",
        description: "Nhập bảng chi tiết từng tấm hoặc linh kiện (Dài × Rộng × Dày, Số lượng, Mã vật tư từ thư viện 612 mã vật liệu, chọn trong 37 công đoạn xưởng). Khớp chính xác với cách làm của xưởng kỹ thuật.",
        badge: "BOM chi tiết",
      },
      {
        title: "Tương thích file CAD & Excel",
        description: "Hỗ trợ quét khối tủ trực tiếp từ AutoCAD bằng Lisp QC (.csv UTF-8) hoặc tải lên bảng tính nội bộ xưởng không lo lỗi font tiếng Việt.",
        badge: "AutoCAD & Excel",
      },
    ],
    flowNote: "Dữ liệu đầu vào được chuẩn hóa sang cấu trúc tham số trước khi chuyển qua động cơ tính toán.",
  },
  {
    key: "engine",
    stepNumber: "02",
    title: "Động Cơ Tính Toán Kép & AI",
    subtitle: "Lõi toán học độc lập & Trợ lý Gemini AI",
    badge: "100% CÔNG THỨC TOÁN",
    badgeColor: "bg-zinc-100 text-zinc-900 border-zinc-200",
    summary: "Hệ thống sở hữu hai mô hình tính toán độc lập, không gộp lẫn nhau, kết hợp cùng Trợ lý Gemini AI chỉ hoạt động như bước hỗ trợ khi dữ liệu bị thiếu.",
    pillars: [
      {
        title: "Mô hình panel_cnc (Ván Công Nghiệp)",
        description: "Quy đổi diện tích Net ra số tấm tiêu chuẩn 1220×2440 mm và Jumbo 1830×2440 mm kèm hao hụt cưa (+15%), tổng mét dài dán cạnh (+8% bo), nhân công tấm và markup lợi nhuận xưởng gỗ công nghiệp.",
        badge: "Ván MDF & MFC",
      },
      {
        title: "Mô hình export_furniture (Gỗ Khối & Xuất Khẩu)",
        description: "Chiết tính 15 nhóm chi phí L&M, cơ chế Overhead đa tầng (Đá 0% OH, Thầu phụ 10%, Xưởng 35%, hệ số Ant-Marb 3.42x), COGS, Markup 20% và Bậc thang số lượng đặt hàng MOQ (1 / 5 / 10 / 20).",
        badge: "Gỗ sồi, Đá, Sofa",
      },
      {
        title: "Trợ lý Google Gemini AI (Demo & BYOK)",
        description: "Chỉ kích hoạt khi thiếu mã vật tư hoặc cần ước lượng quy cách ngoài danh mục. Kết quả luôn mang nhãn 'ước tính AI chưa xác nhận'. AI tuyệt đối không can thiệp vào phép tính tổng tiền.",
        badge: "Kiểm soát chi phí",
      },
    ],
    flowNote: "Mọi đơn giá đều được bảo vệ bằng cơ chế Snapshot Pricing — bảo toàn vĩnh viễn giá hợp đồng lịch sử.",
  },
  {
    key: "outputs",
    stepNumber: "03",
    title: "Một Đầu Vào, Hai Đầu Ra",
    subtitle: "Bảo mật tuyệt đối giá vốn kinh doanh",
    badge: "BẢN IN A4 & EXCEL",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-200",
    summary: "Giải quyết triệt để vấn đề muôn thuở của xưởng mộc: Khách hàng đòi gửi file Excel rồi soi công thức giá vốn hoặc đại lý cạnh tranh bớt giá.",
    pillars: [
      {
        title: "Đầu ra 1: Bảng đặt hàng Xưởng (Excel .xlsx)",
        description: "Dành riêng cho thợ phụ trách và quản đốc: Bóc trần số tấm ván cần mua, mét dài nẹp dán, mã phụ kiện kim khí, danh sách giờ công 37 công đoạn và tổng chi phí giá vốn (COGS) gửi đại lý.",
        badge: "BOM Nội Bộ",
      },
      {
        title: "Đầu ra 2: Báo giá thương mại Khách (PDF A4)",
        description: "Dành gửi khách hàng & chủ đầu tư: Ẩn 100% giá vốn nội bộ, ẩn chi tiết tấm lẻ và tỷ lệ hao hụt. Chỉ thể hiện Tên hạng mục thành phẩm, quy cách tổng thể, hình ảnh đại diện, cam kết bảo hành và chữ ký số.",
        badge: "PDF Chuẩn A4",
      },
      {
        title: "Bản quyền thương hiệu riêng",
        description: "Tự động chèn Logo xưởng, Hotline, Địa chỉ xưởng và Điều khoản thanh toán lên bản in A4, mang lại vẻ ngoài uy tín và chuyên nghiệp.",
        badge: "Thương hiệu xưởng",
      },
    ],
    flowNote: "Bản in PDF sử dụng CSS @media print chuyên biệt, không vỡ layout, 100% chuẩn font tiếng Việt.",
  },
  {
    key: "post_quote",
    stepNumber: "04",
    title: "4 Trụ Cột Hậu Báo Giá",
    subtitle: "Hệ sinh thái vận hành xưởng chuẩn Houzz Pro",
    badge: "HỆ SINH THÁI KHÉP KÍN",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    summary: "Báo giá không phải là điểm kết thúc, mà là điểm bắt đầu của quá trình thi công. Nền tảng cung cấp 4 công cụ tương tác chuyên nghiệp giữa xưởng và chủ nhà.",
    pillars: [
      {
        title: "1. Financial & Costing Suite",
        description: "Không gian quản lý dự toán tổng thể: So sánh nhiều phiên bản báo giá (V1, V2, V3), theo dõi biến động giá vốn vật tư và bảo vệ biên lợi nhuận của từng công trình.",
        badge: "Quản trị dòng tiền",
      },
      {
        title: "2. Cổng Duyệt Mẫu Selections Portal",
        description: "Gửi link trực tuyến cho chủ nhà duyệt mẫu vật tư (mã màu Melamine An Cường, da bò Ý, mẫu đá tự nhiên) trên điện thoại, bấm 'Đồng ý' hoặc 'Đổi mẫu' có lưu lịch sử.",
        badge: "Duyệt mẫu trực tuyến",
      },
      {
        title: "3. Phiếu Phát Sinh Change Orders Ký Số",
        description: "Khi chủ nhà thay đổi kích thước hoặc vật tư, hệ thống sinh Phiếu phát sinh kèm chữ ký điện tử trực tiếp trên màn hình di động, dập tắt mọi tranh chấp cãi cọ tiền bạc.",
        badge: "Ký số di động",
      },
      {
        title: "4. Cổng Tra Cứu Khách Hàng Client Portal",
        description: "Khách hàng tra cứu tiến độ thi công, ảnh nghiệm thu xưởng và lịch sử thanh toán chỉ bằng số điện thoại di động, giảm 90% các cuộc gọi hối thúc gián đoạn việc xưởng.",
        badge: "Tra cứu theo SĐT",
      },
    ],
    flowNote: "Mọi thay đổi từ Selections hay Change Orders đều cập nhật ngược lại vào sổ kế toán dự án tự động.",
  },
];

export default function OperationalWorkflowDiagram() {
  const [activeStage, setActiveStage] = useState<StageKey>("inputs");
  const currentStage = STAGES.find((s) => s.key === activeStage) || STAGES[0];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 text-left">
      
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-2xs">
          <Layers className="w-3.5 h-3.5 text-zinc-800" />
          <span className="font-mono text-[11px] text-slate-500">KIẾN TRÚC VẬN HÀNH TOÀN DIỆN</span>
          <span className="text-slate-300">|</span>
          <span className="font-semibold text-slate-800">4 Giai Đoạn Khép Kín</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Sơ Đồ Vận Hành Báo Giá &amp; Quản Lý Xưởng
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Từ bản vẽ ý tưởng đến dự toán chính xác, xuất đơn hàng sản xuất và quản lý nghiệm thu với chủ nhà.
        </p>
      </div>

      {/* 4 Interactive Segmented Step Cards (Top Ribbon) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STAGES.map((stage) => {
          const isActive = activeStage === stage.key;
          return (
            <button
              key={stage.key}
              type="button"
              onClick={() => setActiveStage(stage.key)}
              className={`p-3.5 sm:p-4 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between space-y-3 relative ${
                isActive
                  ? "bg-zinc-900 text-white border-zinc-900 shadow-sm ring-1 ring-zinc-900"
                  : "bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-300 shadow-2xs text-slate-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  isActive ? "bg-zinc-800 text-white" : "bg-slate-200 text-slate-700"
                }`}>
                  GIAI ĐOẠN {stage.stepNumber}
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border hidden sm:inline ${
                  isActive ? "bg-zinc-800 text-zinc-200 border-zinc-700" : stage.badgeColor
                }`}>
                  {stage.badge}
                </span>
              </div>

              <div>
                <h3 className={`text-sm font-bold tracking-tight ${
                  isActive ? "text-white" : "text-slate-900"
                }`}>
                  {stage.title}
                </h3>
                <p className={`text-[11px] mt-0.5 line-clamp-1 ${
                  isActive ? "text-zinc-300" : "text-slate-500"
                }`}>
                  {stage.subtitle}
                </p>
              </div>

              {isActive && (
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-900 border-r border-b border-zinc-900 rotate-45" />
              )}
            </button>
          );
        })}
      </div>

      {/* Stage Detail Card Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-6">
        
        {/* Stage Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                BƯỚC {currentStage.stepNumber}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {currentStage.title}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              {currentStage.summary}
            </p>
          </div>

          <div className="shrink-0">
            <span className={`inline-flex text-xs font-mono font-semibold px-2.5 py-1 rounded-full border ${currentStage.badgeColor}`}>
              {currentStage.badge}
            </span>
          </div>
        </div>

        {/* 3 Key Pillars of This Stage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentStage.pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg bg-slate-50/70 border border-slate-200 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                    {pillar.badge}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-900" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  {pillar.title}
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Operational Flow Connector Note */}
        <div className="p-3.5 rounded-lg bg-zinc-900 text-white border border-zinc-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-zinc-300 shrink-0" />
            <span className="font-medium text-white">
              Quy chuẩn chuyển tiếp: <span className="font-normal text-zinc-300">{currentStage.flowNote}</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1 font-mono text-[11px] text-zinc-400">
            <span>Tiếp tục</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

      </div>

    </div>
  );
}
