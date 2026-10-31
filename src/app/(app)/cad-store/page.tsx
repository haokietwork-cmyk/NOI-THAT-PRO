"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/core/store/useAuth";
import { 
  Sparkles, 
  Download, 
  CheckCircle2, 
  Terminal, 
  HelpCircle, 
  QrCode,
  ShieldCheck,
  CreditCard,
  Copy,
  Check,
  Cpu,
  Layers,
  FileCode,
  ExternalLink,
  Laptop,
  RefreshCw,
  Clock,
  ArrowRight,
  Search,
  Filter,
  X,
  RotateCcw
} from "lucide-react";

interface PluginItem {
  id: string;
  code: string;
  cmd: string;
  platform: "autocad" | "sketchup";
  title: string;
  desc: string;
  priceNumber: number;
  priceText: string;
  isFree?: boolean;
  tag: string;
  tagColor: string;
  supportedCad: string;
  features: string[];
}

export default function CadStorePage() {
  const { user } = useAuth();
  const isVip = true; // Mở khóa đặc quyền VIP toàn bộ tính năng theo yêu cầu chủ xưởng
  const [showApploadGuide, setShowApploadGuide] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<PluginItem | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<"all" | "autocad" | "sketchup">("all");
  const [orderCode, setOrderCode] = useState("");
  const [volumeId, setVolumeId] = useState("4A2B-8C1D");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Phễu lọc kho Plugin
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showFilterFunnel, setShowFilterFunnel] = useState(false);
  
  // Payment & License states
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [generatedLicense, setGeneratedLicense] = useState<string | null>(null);
  const [downloadSecondsLeft, setDownloadSecondsLeft] = useState(60);

  const plugins: PluginItem[] = [
    {
      id: "autoplot-flexible",
      code: "AutoPlotFlexible.bundle",
      cmd: "AUTOPLOT",
      platform: "autocad",
      title: "AutoPlot Flexible v2.0 (.NET In Gộp PDF Hàng Loạt)",
      desc: "Công cụ in & gộp PDF hàng loạt đỉnh cao cho AutoCAD (.NET C# / AutoCAD 2018-2026). Tự động nhận diện khung Block động, Polyline, sắp xếp Natural Sort (A-2 < A-10), in qua Named View chống lệch lề và gộp PDF tự động tạo Bookmark mục lục.",
      priceNumber: 399_000,
      priceText: "399.000 đ",
      tag: "Công cụ chính thức v2.0 - 63/63 Pass Oracle",
      tagColor: "bg-amber-50 text-amber-800 border-amber-200",
      supportedCad: "AutoCAD 2018 - 2026",
      features: [
        "Nhận diện khung Block động lồng nhau, Polyline kín và Layer",
        "Khử trùng lặp khung thông minh bằng lưới băm Spatial Hash Grid",
        "Sắp xếp trang tự nhiên (Natural Sort) và theo ma trận tọa độ",
        "In qua Named View triệt tiêu 100% tình trạng lệch lề, mất nét",
        "Tự động gộp file PDF thành 1 tập duy nhất kèm Bookmark mục lục",
        "Quản lý bản quyền Machine ID (RSA), dùng thử 15 ngày & cập nhật ngầm",
      ],
    },
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Mở modal mua VietQR
  const handleOpenBuyModal = (plugin: PluginItem) => {
    setSelectedPlugin(plugin);
    const code = `LISP_${plugin.cmd}_${Math.floor(1000 + Math.random() * 9000)}`;
    setOrderCode(code);
    setPaymentSuccess(false);
    setGeneratedLicense(null);
    setDownloadSecondsLeft(60);
  };

  // ==========================================================================
  // REAL-TIME POLLING WEBHOOK: Kiểm tra tự động mỗi 3 giây
  // ==========================================================================
  useEffect(() => {
    if (!selectedPlugin || !orderCode || paymentSuccess) return;

    let isMounted = true;
    setIsCheckingPayment(true);

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/webhooks/payment?orderCode=${encodeURIComponent(orderCode)}&volumeId=${encodeURIComponent(volumeId)}&pluginCmd=${encodeURIComponent(selectedPlugin.cmd)}`
        );
        const data = await res.json();

        if (isMounted && data.success && data.paid) {
          clearInterval(interval);
          handlePaymentComplete(data.licenseKey);
        }
      } catch (err) {
        console.warn("Polling error:", err);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedPlugin, orderCode, paymentSuccess, volumeId]);

  // Bộ đếm lùi 60 giây cho link tải file
  useEffect(() => {
    if (!paymentSuccess || downloadSecondsLeft <= 0) return;
    const timer = setInterval(() => {
      setDownloadSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [paymentSuccess, downloadSecondsLeft]);

  // Xử lý khi thanh toán thành công
  const handlePaymentComplete = (license?: string) => {
    const finalLicense =
      license ||
      `NTPRO-${volumeId.replace(/[^A-Z0-9]/g, "").slice(0, 4)}-${selectedPlugin?.cmd || "CAD"}-${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedLicense(finalLicense);
    setPaymentSuccess(true);
    setIsCheckingPayment(false);
    setDownloadSecondsLeft(60);

    // Lưu vào LocalStorage danh sách tài sản đã mua để hiển thị ở /my-assets
    try {
      const stored = localStorage.getItem("purchased_plugins");
      const list = stored ? JSON.parse(stored) : [];
      list.push({
        id: selectedPlugin?.id,
        name: selectedPlugin?.title,
        fileName: selectedPlugin?.code,
        commandName: selectedPlugin?.cmd,
        purchasedDate: new Date().toLocaleDateString("vi-VN"),
        licenseKey: finalLicense,
        volumeId: volumeId,
      });
      localStorage.setItem("purchased_plugins", JSON.stringify(list));
    } catch (e) {
      console.warn("Storage error:", e);
    }
  };

  // Giả lập thanh toán nhanh cho Demo Mode
  const handleSimulatePayment = async () => {
    if (!volumeId.trim()) {
      alert("Vui lòng nhập Mã máy (Volume ID) ổ cứng của bạn trước khi thanh toán!");
      return;
    }

    try {
      const res = await fetch(
        `/api/webhooks/payment?orderCode=${encodeURIComponent(orderCode)}&simulate=true&volumeId=${encodeURIComponent(volumeId)}&pluginCmd=${encodeURIComponent(selectedPlugin?.cmd || "CAD")}`
      );
      const data = await res.json();
      if (data.paid) {
        handlePaymentComplete(data.licenseKey);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Tải file Lisp hoặc SketchUp Extension (sinh file đính kèm với License)
  const handleDownloadFile = (plugin: PluginItem, license?: string) => {
    // Tải trực tiếp bộ cài đặt AutoPlot Flexible .NET
    if (plugin.id === "autoplot-flexible") {
      const link = document.createElement("a");
      link.href = "/downloads/AutoPlot_Flexible_v2.0_Setup.zip";
      link.download = "AutoPlot_Flexible_v2.0_Setup.zip";
      link.click();
      return;
    }
    // Tải trực tiếp file lsp thật chuẩn từ gói công cụ tương ứng
    if (plugin.id === "autocutlist-pro") {
      const link = document.createElement("a");
      link.href = "/plugins/autocad/autocutlist-pro/AutoCutlist_Pro.lsp";
      link.download = "AutoCutlist_Pro.lsp";
      link.click();
      return;
    }
    if (plugin.id === "smartdim-furniture") {
      const link = document.createElement("a");
      link.href = "/plugins/autocad/smartdim-furniture/SmartDim_Furniture.lsp";
      link.download = "SmartDim_Furniture.lsp";
      link.click();
      return;
    }
    if (plugin.id === "batchplot-layout") {
      const link = document.createElement("a");
      link.href = "/plugins/autocad/batchplot-layout/BatchPlot_Layout.lsp";
      link.download = "BatchPlot_Layout.lsp";
      link.click();
      return;
    }
    if (plugin.id === "hardware-counter") {
      const link = document.createElement("a");
      link.href = "/plugins/autocad/hardware-counter/Hardware_Counter.lsp";
      link.download = "Hardware_Counter.lsp";
      link.click();
      return;
    }

    let content = "";
    let mimeType = "text/plain;charset=utf-8";

    if (plugin.platform === "sketchup") {
      content = `# ==============================================================================
# NỀN TẢNG NỘI THẤT PRO - PLUGIN SKETCHUP BẢN QUYỀN (.RBZ)
# Plugin: ${plugin.title}
# File: ${plugin.code}
# Lệnh/Module: ${plugin.cmd}
# License Key: ${license || "MIEN_PHI"}
# Volume Serial ID: ${volumeId}
# ==============================================================================
require 'sketchup.rb'

module NoiThatPro
  module ${plugin.cmd.replace(/[^a-zA-Z0-9]/g, "") || "Tool"}
    def self.run
      UI.messagebox("KHỞI ĐỘNG THÀNH CÔNG ${plugin.title}!\\n\\nBản quyền cấp cho máy: ${volumeId}\\nLicense Key: ${license || "MIEN_PHI"}\\n\\nSẵn sàng sử dụng trên SketchUp!")
    end
  end
end

if !file_loaded?(__FILE__)
  menu = UI.menu('Plugins')
  menu.add_item('${plugin.title}') {
    NoiThatPro::${plugin.cmd.replace(/[^a-zA-Z0-9]/g, "") || "Tool"}.run
  }
  file_loaded?(__FILE__)
end
`;
    } else {
      content = `; ==============================================================================
; NỀN TẢNG NỘI THẤT PRO - PLUGIN AUTOCAD BẢN QUYỀN
; Plugin: ${plugin.title}
; File: ${plugin.code}
; Lệnh khởi động: ${plugin.cmd}
; License Key: ${license || "MIEN_PHI"}
; Volume Serial ID: ${volumeId}
; ==============================================================================
(vl-load-com)

(defun c:${plugin.cmd} ( / ss filePath f)
  (princ "\\n>>> KHOI DONG ${plugin.title}...")
  (princ "\\n>>> BAN QUYEN DANG KY CHO MAY: ${volumeId}")
  (princ "\\n>>> LENH CHAY: ${plugin.cmd}")
  (alert (strcat "CHUC MUNG BAN DA KICH HOAT THANH CONG!\\n\\nPlugin: ${plugin.title}\\nLicense Key: ${license || "MIEN_PHI"}\\n\\nSan sang su dung!"))
  (princ)
)

(princ "\\n[DA NAP ${plugin.title}] - Go lenh '${plugin.cmd}' de bat dau!")
(princ)
`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = plugin.code;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredPlugins = plugins.filter((p) => {
    // 1. Nền tảng
    if (selectedPlatform !== "all" && p.platform !== selectedPlatform) return false;

    // 2. Mức phí
    if (priceFilter === "free" && !p.isFree) return false;
    if (priceFilter === "paid" && p.isFree) return false;

    // 3. Phân loại tính năng
    if (categoryFilter === "cutlist" && !p.id.includes("cutlist")) return false;
    if (categoryFilter === "modeling" && !p.id.includes("smartcabinet") && !p.id.includes("smartdim")) return false;
    if (categoryFilter === "production" && !p.id.includes("batchplot") && !p.id.includes("counter")) return false;

    // 4. Tìm kiếm từ khóa
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        p.title.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.cmd.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.supportedCad.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const activeCadFilterCount = (searchQuery.trim() ? 1 : 0) + (priceFilter !== "all" ? 1 : 0) + (categoryFilter !== "all" ? 1 : 0);

  const handleResetCadFilter = () => {
    setSearchQuery("");
    setPriceFilter("all");
    setCategoryFilter("all");
    setSelectedPlatform("all");
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl pb-16">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kho Công Cụ CAD/3D Bổ Kỹ Thuật & Bóc Tách Xưởng</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Kho Plugin AutoCAD & SketchUp (Store & DRM Tools)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Phát triển theo mô hình Profile Builder & SketchUcation PluginStore: Đọc bóc tách vật tư, xuất UTF-8 BOM, khóa bản quyền theo máy tính.
          </p>
        </div>

        <button
          onClick={() => setShowApploadGuide(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-xs cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-amber-600" />
          <span>Hướng dẫn nạp Tool (AutoCAD / SketchUp)</span>
        </button>
      </div>

      {/* Tabs Phân loại Nền Tảng & Phễu Lọc */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tabs Nền tảng */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedPlatform("all")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                selectedPlatform === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Tất cả công cụ ({plugins.length})
            </button>
            <button
              onClick={() => setSelectedPlatform("autocad")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                selectedPlatform === "autocad"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
              }`}
            >
              <span>AutoCAD Lisp / VLX</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
                {plugins.filter((p) => p.platform === "autocad").length}
              </span>
            </button>
            <button
              onClick={() => setSelectedPlatform("sketchup")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                selectedPlatform === "sketchup"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
              }`}
            >
              <span>SketchUp Plugins (.RBZ)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
                {plugins.filter((p) => p.platform === "sketchup").length}
              </span>
            </button>
          </div>

          {/* Ô tìm kiếm & Nút Phễu Lọc */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên tool, lệnh QC, SC3D..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowFilterFunnel(!showFilterFunnel)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition shadow-xs cursor-pointer ${
                activeCadFilterCount > 0
                  ? "bg-amber-500 text-white shadow-amber-500/20"
                  : showFilterFunnel
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Phễu Lọc</span>
              {activeCadFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-amber-700 font-mono text-[10px] flex items-center justify-center font-black">
                  {activeCadFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Khối Phễu Lọc Mở Rộng */}
        {(showFilterFunnel || activeCadFilterCount > 0) && (
          <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs animate-in fade-in duration-150">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600 text-[11px]">Mức phí bản quyền:</span>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value as any)}
                  className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:border-amber-500 focus:outline-none"
                >
                  <option value="all">Tất cả (Miễn phí & Trả phí)</option>
                  <option value="free">🎁 Miễn phí cộng đồng</option>
                  <option value="paid">💎 Có phí bản quyền</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600 text-[11px]">Mục đích sử dụng:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:border-amber-500 focus:outline-none"
                >
                  <option value="all">Tất cả mục đích</option>
                  <option value="cutlist">Bóc tách danh sách tấm (Cutlist) sang Web</option>
                  <option value="modeling">Dựng hình 3D Parametric & Ghi Dim</option>
                  <option value="production">Xuất xưởng: In ấn & Đếm phụ kiện</option>
                </select>
              </div>

              {activeCadFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetCadFilter}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition font-semibold text-xs ml-auto cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Xóa bộ lọc</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Đang hiển thị <strong>{filteredPlugins.length}</strong> / <strong>{plugins.length}</strong> công cụ</span>
            </div>
          </div>
        )}
      </div>

      {/* Product Grid */}
      {filteredPlugins.length === 0 ? (
        <div className="p-12 text-center text-slate-500 space-y-3 bg-white rounded-2xl border border-slate-200/80">
          <Filter className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-bold text-slate-800">Không tìm thấy công cụ CAD nào khớp với phễu lọc.</p>
          <p className="text-xs text-slate-500">Hãy thử đổi từ khóa tìm kiếm hoặc chọn tất cả nền tảng.</p>
          <button
            type="button"
            onClick={handleResetCadFilter}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Xóa bộ lọc</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPlugins.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3.5">
              
              {/* Badge & Lệnh tắt */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                      p.platform === "sketchup"
                        ? "bg-rose-100 text-rose-800 border border-rose-300"
                        : "bg-amber-100 text-amber-900 border border-amber-300"
                    }`}
                  >
                    {p.platform === "sketchup" ? "SketchUp .RBZ" : "AutoCAD LISP"}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${p.tagColor}`}>
                    {p.tag}
                  </span>
                </div>
                <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
                  {p.platform === "sketchup" ? "MENU" : "LỆNH"}: {p.cmd}
                </span>
              </div>

              {/* Tên & File code */}
              <div>
                <span className="text-[11px] font-mono text-slate-400 block font-semibold">{p.code}</span>
                <h3 className="font-bold text-base text-slate-900 leading-snug">{p.title}</h3>
              </div>

              {/* Mô tả */}
              <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>

              {/* Tính năng nổi bật */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Tính năng chuẩn xưởng:
                </span>
                {p.features.map((f, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {/* Phiên bản hỗ trợ & Link README */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hỗ trợ: <strong className="text-slate-700">{p.supportedCad}</strong></span>
                </div>
                {p.platform === "autocad" && (
                  <a
                    href={`/plugins/autocad/${p.id}/README.md`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-800 underline underline-offset-2"
                  >
                    <FileCode className="w-3 h-3" />
                    <span>Xem README</span>
                  </a>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">
                  {isVip ? "Đặc quyền Tài khoản VIP" : p.isFree ? "Bản quyền vĩnh viễn" : "Bản quyền trọn đời / máy"}
                </span>
                <span className="text-xl font-black text-emerald-600 font-mono">
                  {isVip ? "0 đ (Miễn Phí VIP)" : p.priceText}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadFile(p)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải Bộ Cài Đặt (745 KB)</span>
                </button>
                <Link
                  href="/kich-hoat?tool=AUTOPLOT&vip=true"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Kích Hoạt VIP (0đ)</span>
                </Link>
              </div>
            </div>

          </div>
        ))}
      </div>
      )}

      {/* ================================================================== */}
      {/* MODAL MUA LISP QUA VIETQR VỚI TÍNH NĂNG CẤP LICENSE & TẢI 60S     */}
      {/* ================================================================== */}
      {selectedPlugin && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Thanh Toán VietQR & Cấp License Key
                </h3>
              </div>
              <button
                onClick={() => setSelectedPlugin(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {paymentSuccess ? (
              /* MÀN HÌNH SAU KHI THANH TOÁN THÀNH CÔNG */
              <div className="py-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">
                    Kích Hoạt Bản Quyền Thành Công!
                  </h3>
                  <p className="text-xs text-slate-600">
                    Cảm ơn bạn đã mua plugin <strong className="text-slate-900">{selectedPlugin.title}</strong>.
                  </p>
                </div>

                {/* Khung License Key */}
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                  <span className="font-bold text-emerald-900 block text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>MÃ LICENSE KEY CHO MÁY ({volumeId}):</span>
                  </span>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-emerald-300 font-mono font-bold text-slate-900 text-sm">
                    <span>{generatedLicense}</span>
                    <button
                      onClick={() => handleCopy(generatedLicense || "", "lic")}
                      className="text-xs text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-sans font-semibold"
                    >
                      {copiedText === "lic" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText === "lic" ? "Đã sao chép" : "Sao chép"}</span>
                    </button>
                  </div>
                </div>

                {/* Nút tải file có giới hạn 60s */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-amber-700 font-bold">
                    <Clock className="w-4 h-4" />
                    <span>Link tải file an toàn có hiệu lực trong: {downloadSecondsLeft}s</span>
                  </div>

                  {downloadSecondsLeft > 0 ? (
                    <button
                      onClick={() => handleDownloadFile(selectedPlugin, generatedLicense || undefined)}
                      className="w-full py-3 px-4 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Tải file cài đặt ({selectedPlugin.code})</span>
                    </button>
                  ) : (
                    <div className="p-2 text-rose-600 text-xs font-semibold">
                      Link tải tạm thời đã hết hạn. Bạn có thể vào mục &ldquo;Tiện ích & Bản quyền&rdquo; để tải lại.
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setSelectedPlugin(null)}
                    className="px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition"
                  >
                    Hoàn tất
                  </button>
                </div>
              </div>
            ) : (
              /* MÀN HÌNH QUÉT MÃ QR & NHẬP VOLUME ID */
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-900">{selectedPlugin.title}</span>
                    <span className="font-mono font-black text-amber-700 text-sm">{selectedPlugin.priceText}</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Cấp bản quyền vĩnh viễn khóa theo Volume Serial Number ổ cứng máy tính.
                  </p>
                </div>

                {/* Ô nhập mã máy Volume Serial ID */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-800">
                      1. Nhập mã máy tính cần cấp quyền (Volume ID): <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">Ví dụ: 4A2B-8C1D</span>
                  </div>
                  <div className="relative">
                    <Cpu className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Mở cmd gõ 'vol c:' để lấy mã..."
                      value={volumeId}
                      onChange={(e) => setVolumeId(e.target.value.toUpperCase())}
                      className="w-full pl-9 pr-3 py-2 font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-bold text-slate-900"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    💡 Phím tắt: Bấm <code className="bg-slate-100 px-1 font-bold">Win + R</code>, gõ <code className="bg-slate-100 px-1 font-bold">cmd</code>, gõ tiếp <code className="bg-slate-100 px-1 font-bold">vol c:</code> và copy 8 ký tự số serial ổ cứng.
                  </p>
                </div>

                {/* Mã QR Thanh toán VietQR */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-32 h-32 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs shrink-0 flex items-center justify-center">
                    <img
                      src={`https://img.vietqr.io/image/MB-99990912345678-compact2.png?amount=${selectedPlugin.priceNumber}&addInfo=${orderCode}&accountName=XUONG%20NOI%20THAT%20HOANG%20GIA`}
                      alt="VietQR Mã Thanh Toán"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-600 flex-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ngân hàng:</span>
                      <strong className="text-slate-900">MB Bank (Quân Đội)</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Số tài khoản:</span>
                      <strong className="font-mono font-bold text-slate-900">99990912345678</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Chủ tài khoản:</span>
                      <strong className="text-slate-900 uppercase">XUONG NOI THAT HOANG GIA</strong>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                      <span className="text-slate-400 font-semibold">Nội dung CK:</span>
                      <div className="flex items-center gap-1">
                        <strong className="font-mono text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded text-xs">
                          {orderCode}
                        </strong>
                        <button
                          onClick={() => handleCopy(orderCode, "code")}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500"
                        >
                          {copiedText === "code" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                  <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" />
                  <span>Đang chờ chuyển khoản... Tự động cấp License sau 5 giây</span>
                </div>

                {/* Modal Buttons */}
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setSelectedPlugin(null)}
                    className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    Hủy bỏ
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    className="px-4 py-2 font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition"
                  >
                    Tôi đã chuyển khoản xong
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL HƯỚNG DẪN APPLOAD                                            */}
      {/* ================================================================== */}
      {showApploadGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">Hướng dẫn nạp Lisp bằng lệnh APPLOAD</h3>
              </div>
              <button
                onClick={() => setShowApploadGuide(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-slate-600 leading-relaxed">
              <div className="space-y-1">
                <strong className="text-slate-900 block font-bold">Bước 1: Mở hộp thoại nạp Lisp trong AutoCAD</strong>
                <p>Trong màn hình vẽ AutoCAD, gõ lệnh <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800 font-bold">APPLOAD</code> và nhấn Enter.</p>
              </div>

              <div className="space-y-1">
                <strong className="text-slate-900 block font-bold">Bước 2: Nạp file .LSP hoặc .VLX vào Startup Suite</strong>
                <p>Bấm vào biểu tượng chiếc cặp <strong className="text-slate-800">Startup Suite (Contents...)</strong>, sau đó chọn nút <strong className="text-slate-800">Add...</strong> và dẫn đến file vừa tải về. Cách này giúp Lisp tự động nạp mỗi khi bạn mở bản vẽ.</p>
              </div>

              <div className="space-y-1">
                <strong className="text-slate-900 block font-bold">Bước 3: Chạy lệnh bóc tách hoặc đo vẽ</strong>
                <p>Gõ lệnh tắt tương ứng (ví dụ: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800 font-bold">QC</code> cho AutoCutlist, <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800 font-bold">SD</code> cho SmartDim) và thao tác theo hướng dẫn.</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <a
                href="/plugins/autocad/HDSD_CaiDat_Lisp_NoiThatPro.txt"
                download="HDSD_CaiDat_Lisp_NoiThatPro.txt"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải Cẩm Nang HDSD (.txt)</span>
              </a>

              <button
                onClick={() => setShowApploadGuide(false)}
                className="px-5 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
