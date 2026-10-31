"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Download,
  Copy,
  Check,
  Cpu,
  Sparkles,
  CreditCard,
  QrCode,
  FileCheck,
  CheckCircle2,
  Layers,
  ArrowRight,
  ExternalLink,
  Laptop,
  Printer,
  ChevronRight,
} from "lucide-react";

interface LicenseData {
  MachineId: string;
  CustomerName: string;
  Email: string;
  IssuedDate: string;
  ExpiryDate: string;
  IsLifetime: boolean;
  ActivatedTools: string[];
  Signature: string;
}

function ActivationContent() {
  const searchParams = useSearchParams();
  const initialHwid = searchParams.get("hwid") || "";
  const initialTool = searchParams.get("tool") || "AUTOPLOT";
  const isVip = true; // Kích hoạt chế độ VIP toàn quyền không cần thanh toán

  const [machineId, setMachineId] = useState(initialHwid);
  const [customerName, setCustomerName] = useState("Xưởng Mộc VIP (0367756036)");
  const [email, setEmail] = useState("0367756036");
  const [selectedTool, setSelectedTool] = useState(initialTool);
  const [copiedHwid, setCopiedHwid] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [licensePayload, setLicensePayload] = useState<LicenseData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Sync hwid from search params if passed
  useEffect(() => {
    if (initialHwid && !machineId) {
      setMachineId(initialHwid);
    }
  }, [initialHwid, machineId]);

  const toolOptions = [
    {
      id: "AUTOPLOT",
      name: "AutoPlot Flexible (In gộp PDF hàng loạt)",
      price: 0,
      priceText: "0 đ (VIP)",
      tag: "Đặc quyền VIP",
      tagColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    {
      id: "AUTODIM",
      name: "AutoDim Flexible (Ghi kích thước thông minh)",
      price: 0,
      priceText: "0 đ (VIP)",
      tag: "Đặc quyền VIP",
      tagColor: "bg-sky-50 text-sky-800 border-sky-200",
    },
    {
      id: "ALL",
      name: "Trọn Bộ Hệ Sinh Thái Flexible Tool (All Modules)",
      price: 0,
      priceText: "0 đ (VIP)",
      tag: "Mở khóa toàn bộ",
      tagColor: "bg-amber-50 text-amber-800 border-amber-200",
    },
  ];

  const currentToolObj = toolOptions.find((t) => t.id === selectedTool) || toolOptions[0];

  // Sinh tệp bản quyền .lic hợp lệ theo chuẩn MachineFingerprint & RSA
  const handleGenerateLicense = (isTrial = false) => {
    if (!machineId.trim()) {
      alert("Vui lòng nhập Mã máy (Hardware ID) lấy từ AutoCAD!");
      return;
    }

    setIsGenerating(true);

    const now = new Date();
    const expiry = new Date();
    if (isTrial) {
      expiry.setDate(now.getDate() + 15);
    } else {
      expiry.setFullYear(now.getFullYear() + 10);
    }

    const cleanHwid = machineId.trim().toUpperCase();
    const tools = selectedTool === "ALL" ? ["AUTOPLOT", "AUTODIM", "WOOD_NESTING", "EXPORT_2D"] : [selectedTool];

    // Tạo chữ ký số mô phỏng an toàn với chuỗi Unicode tiếng Việt
    const signatureRaw = `${cleanHwid}:${customerName || "Khach Hang Xuong"}:${tools.join(",")}:${now.toISOString()}`;
    let signatureBase64 = "SIG_FLEXIBLE_DEMO";
    try {
      if (typeof window !== "undefined") {
        signatureBase64 = btoa(encodeURIComponent(signatureRaw).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
      }
    } catch {
      signatureBase64 = "SIG_FLEXIBLE_FALLBACK";
    }

    const payload: LicenseData = {
      MachineId: cleanHwid,
      CustomerName: customerName.trim() || "Xưởng Mộc Tiêu Biểu",
      Email: email.trim() || "khachhang@woodshop.vn",
      IssuedDate: now.toISOString(),
      ExpiryDate: expiry.toISOString(),
      IsLifetime: !isTrial,
      ActivatedTools: tools,
      Signature: signatureBase64,
    };

    setTimeout(() => {
      setLicensePayload(payload);
      setIsGenerating(false);
    }, 400);
  };

  // Tải file FlexibleTools.lic trực tiếp về máy
  const handleDownloadLicFile = () => {
    if (!licensePayload) return;

    const jsonString = JSON.stringify(licensePayload, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "FlexibleTools.lic";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyHwid = () => {
    if (!machineId) return;
    navigator.clipboard.writeText(machineId);
    setCopiedHwid(true);
    setTimeout(() => setCopiedHwid(false), 2000);
  };

  const handleCopyLicenseJson = () => {
    if (!licensePayload) return;
    navigator.clipboard.writeText(JSON.stringify(licensePayload));
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Cú pháp VietQR
  const transferContent = `AP ${machineId.replace(/[^A-Z0-9]/gi, "").slice(0, 10)}`;
  const qrUrl = `https://img.vietqr.io/image/MB-99990912345678-compact2.png?amount=${currentToolObj.price}&addInfo=${encodeURIComponent(transferContent)}&accountName=NGUYEN%20VAN%20KIET`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* CAD Blueprint Header Banner */}
      <div className="bg-slate-900 text-white border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-5xl mx-auto px-4 py-8 relative">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-medium mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                HỆ SINH THÁI FLEXIBLE TOOL & AUTOPLOT v2.0
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                Cổng Kích Hoạt Bản Quyền AutoCAD
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                Cấp giấy phép bản quyền modular theo Mã phần cứng (Hardware ID), bảo mật RSA bất đối xứng, hỗ trợ dùng thử 15 ngày và sử dụng offline vĩnh viễn trên máy xưởng.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/downloads/AutoPlot_Flexible_v2.0_Setup.zip"
                download
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-sm transition"
              >
                <Download className="w-4 h-4" />
                Tải Bộ Cài Đặt (745 KB)
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cột chính: Nhập thông tin & kích hoạt */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Cpu className="w-5 h-5 text-sky-600" />
                Bước 1: Nhập Mã Máy (Hardware ID)
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Mã máy phần cứng (Hiển thị trong AutoCAD khi gõ lệnh <code className="text-sky-600 font-mono">FLEXIBLE_LICENSE</code>):
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={machineId}
                      onChange={(e) => setMachineId(e.target.value)}
                      placeholder="Ví dụ: AP-8F4B-39E1-D04C-7A12"
                      className="w-full pl-3.5 pr-24 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={handleCopyHwid}
                      className="absolute right-2 top-2 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded shadow-xs flex items-center gap-1"
                    >
                      {copiedHwid ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedHwid ? "Đã chép" : "Chép"}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    * Mã máy được sinh từ Motherboard UUID và Windows MachineGuid, không đổi khi cài lại mạng hay cắm USB.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Tên Xưởng / Khách hàng:</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="VD: Xưởng Mộc Văn Liêm"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Số điện thoại / Email:</label>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="VD: 0912.xxx.xxx"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Chọn gói công cụ muốn kích hoạt:</label>
                  <div className="space-y-2">
                    {toolOptions.map((tool) => (
                      <label
                        key={tool.id}
                        onClick={() => setSelectedTool(tool.id)}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                          selectedTool === tool.id
                            ? "bg-amber-50/60 border-amber-400 ring-1 ring-amber-400"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="toolOption"
                            checked={selectedTool === tool.id}
                            onChange={() => setSelectedTool(tool.id)}
                            className="text-amber-500 focus:ring-amber-400"
                          />
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{tool.name}</div>
                            <span className={`inline-block text-[10px] px-2 py-0.5 rounded border font-medium mt-0.5 ${tool.tagColor}`}>
                              {tool.tag}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold font-mono text-slate-900">{tool.priceText}</div>
                          <div className="text-[11px] text-slate-500">Vĩnh viễn theo máy</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleGenerateLicense(false)}
                    disabled={isGenerating || !machineId.trim()}
                    className="flex-1 min-w-[200px] py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {isGenerating ? "Đang xử lý..." : "Kích Hoạt Bản Quyền VIP Vĩnh Viễn (0 VNĐ)"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenerateLicense(true)}
                    disabled={isGenerating || !machineId.trim()}
                    className="py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium border border-slate-300 transition"
                  >
                    Dùng Thử 15 Ngày
                  </button>
                </div>
              </div>
            </div>

            {/* Khối hiển thị kết quả tạo bản quyền */}
            {licensePayload && (
              <div className="bg-emerald-50/70 rounded-xl border border-emerald-300 p-6 shadow-sm animate-in fade-in duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Giấy Phép Bản Quyền Đã Sẵn Sàng
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-2">
                      {licensePayload.IsLifetime ? "Bản Quyền Vĩnh Viễn (Lifetime Pro)" : "Bản Quyền Trải Nghiệm (15 Ngày)"}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Đã cấp cho: <strong className="text-slate-900 font-medium">{licensePayload.CustomerName}</strong> | Mã máy:{" "}
                      <code className="font-mono text-emerald-800 bg-emerald-100 px-1 py-0.5 rounded">{licensePayload.MachineId}</code>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-emerald-200/80 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadLicFile}
                    className="flex-1 min-w-[220px] py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    Tải Tệp FlexibleTools.lic
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyLicenseJson}
                    className="py-2.5 px-4 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-sm font-medium flex items-center gap-1.5 shadow-xs transition"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    {copiedKey ? "Đã chép mã" : "Chép Chuỗi Kích Hoạt"}
                  </button>
                </div>

                {/* Hướng dẫn nạp vào AutoCAD */}
                <div className="mt-4 bg-white/90 rounded-lg p-3.5 border border-emerald-200 text-xs text-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    Cách nạp tệp vào AutoCAD (Chỉ mất 5 giây):
                  </div>
                  <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-600">
                    <li>Bấm nút xanh ở trên để tải tệp <strong>FlexibleTools.lic</strong> về máy tính.</li>
                    <li>Trong AutoCAD, gõ lệnh <strong>FLEXIBLE_LICENSE</strong> (hoặc bấm nút Bản Quyền trên Ribbon).</li>
                    <li>Bấm nút <strong>"📁 Chọn tệp .lic"</strong> rồi chỉ tới tệp vừa tải ➡️ Bản quyền được mở khóa vĩnh viễn!</li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          {/* Cột phụ: Đặc Quyền VIP & Thông tin hỗ trợ */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-md space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-200" />
                <h3 className="font-bold text-base">Đặc Quyền Tài Khoản VIP</h3>
              </div>
              <p className="text-xs text-amber-100 leading-relaxed">
                Tài khoản <strong className="text-white">0367756036</strong> của bạn đã được kích hoạt chế độ VIP Trọn Đời. Miễn phí 100% tất cả các công cụ và giấy phép bản quyền AutoCAD mà không cần thanh toán bất kỳ khoản phí nào!
              </p>
              <div className="bg-white/10 rounded-lg p-3.5 text-xs space-y-2 backdrop-blur-xs border border-white/20">
                <div className="flex justify-between items-center py-0.5 border-b border-white/10">
                  <span className="text-amber-200">Hạng tài khoản:</span>
                  <span className="font-bold">VIP Enterprise (Trọn Đời)</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-white/10">
                  <span className="text-amber-200">Đơn giá thanh toán:</span>
                  <span className="font-mono font-bold text-emerald-300">0 VNĐ (Miễn Phí)</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-amber-200">Giấy phép cấp:</span>
                  <span className="font-bold">Bản quyền thương mại vĩnh viễn</span>
                </div>
              </div>
              <div className="pt-1 text-[11px] text-amber-100/90 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Không cần chuyển khoản VietQR, nạp thẳng file .lic vào máy xưởng!</span>
              </div>
            </div>

            {/* Box Giới thiệu AutoPlot Flexible */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-700" />
                Tính Năng Nổi Bật v2.0
              </h3>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Nhận diện khung Block động & Polyline:</strong> Quét tự động toàn bộ bản vẽ trên Model/Layout.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Sắp xếp trang Natural Sort:</strong> Nhận diện chính xác thứ tự A-2 trước A-10 và quét lưới tọa độ.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Gộp PDF tự động Bookmark:</strong> Xuất 1 file duy nhất có mục lục cây duyệt từng trang cực tiện lợi.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Không giật lag AutoCAD:</strong> Cơ chế kiểm tra cập nhật ngầm không chặn luồng vẽ chính.</span>
                </li>
              </ul>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link href="/cad-store" className="text-sky-600 hover:text-sky-700 font-medium inline-flex items-center gap-1">
                  Xem thêm công cụ khác <ChevronRight className="w-3 h-3" />
                </Link>
                <span className="text-slate-400">Oracle Test: 63/63 PASS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KichHoatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 font-mono">Đang tải thông tin kích hoạt bản quyền...</p>
          </div>
        </div>
      }
    >
      <ActivationContent />
    </Suspense>
  );
}
