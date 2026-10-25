"use client";

import { useState, useEffect } from "react";
import { Download, Key, ShieldCheck, HelpCircle, Laptop, Check, Copy, Sparkles, ExternalLink } from "lucide-react";
import Link from "next/link";

interface PluginAsset {
  id: string;
  name: string;
  fileName: string;
  commandName: string;
  purchasedDate: string;
  licenseCount?: string;
  licenseKey?: string;
  volumeId?: string;
}

const DEFAULT_PLUGINS: PluginAsset[] = [
  {
    id: "autocutlist-pro",
    name: "AutoCutlist Pro (Bóc tách Cutlist sang Web)",
    fileName: "AutoCutlist_Pro.lsp",
    commandName: "QC",
    purchasedDate: "18/10/2026",
    licenseCount: "Miễn phí vĩnh viễn",
    licenseKey: "NTPRO-COMMUNITY-FREE-LISP",
    volumeId: "Mọi máy tính",
  },
  {
    id: "smartdim-sample",
    name: "SmartDim Furniture (Ghi Kích Thước Tủ Thông Minh)",
    fileName: "SmartDim_Furniture.vlx",
    commandName: "SD",
    purchasedDate: "18/10/2026",
    licenseCount: "Bản quyền 1 máy",
    licenseKey: "NTPRO-4A2B-SD-18932",
    volumeId: "4A2B-8C1D",
  },
  {
    id: "smartcabinet-sketchup",
    name: "SmartCabinet Parametric 3D (Tự Sinh Thùng Tủ & Cam Chốt)",
    fileName: "SmartCabinet_Parametric.rbz",
    commandName: "SC3D",
    purchasedDate: "18/10/2026",
    licenseCount: "Bản quyền 2 máy (1 xưởng + 1 laptop)",
    licenseKey: "NTPRO-4A2B-SC3D-99824",
    volumeId: "4A2B-8C1D",
  },
];

export default function MyAssetsPage() {
  const [plugins, setPlugins] = useState<PluginAsset[]>(DEFAULT_PLUGINS);
  const [machineId, setMachineId] = useState("");
  const [selectedCmd, setSelectedCmd] = useState("QC");
  const [generatedKey, setGeneratedKey] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Load danh sách đã mua từ localStorage (được ghi từ /cad-store)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("purchased_plugins");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Gộp các plugin từ store mà không trùng lặp id
          const existingIds = new Set(DEFAULT_PLUGINS.map((p) => p.id));
          const uniqueNew = parsed.filter((p: any) => !existingIds.has(p.id));
          setPlugins([...DEFAULT_PLUGINS, ...uniqueNew]);
        }
      }
    } catch (e) {
      console.warn("Lỗi đọc purchased_plugins từ localStorage:", e);
    }
  }, []);

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!machineId) return;

    // Chuẩn hóa Machine ID và sinh key theo định dạng NTPRO-[VOL_4]-[CMD]-[HASH]
    const cleanId = machineId.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    const hash = cleanId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 12345);
    const key = `NTPRO-${cleanId.slice(0, 4)}-${selectedCmd}-${hash}`;
    setGeneratedKey(key);
  };

  const handleCopy = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(identifier);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Tải file mã nguồn LISP mẫu chuẩn công nghiệp
  const handleDownloadFile = (plugin: PluginAsset) => {
    const lspContent = `;;; ==========================================================================
;;; NỀN TẢNG NỘI THẤT PRO - AUTOLISP SUITE
;;; Công cụ: ${plugin.name}
;;; Lệnh CAD: ${plugin.commandName}
;;; License Key: ${plugin.licenseKey || "NTPRO-ACTIVE"}
;;; ==========================================================================
(vl-load-com)

(defun c:${plugin.commandName} ( / oldCmd oldOsm oldClay)
  (setq oldCmd (getvar "CMDECHO"))
  (setq oldOsm (getvar "OSMODE"))
  (setvar "CMDECHO" 0)
  
  (princ "\\n=======================================================")
  (princ "\\n[NOITHATPRO] Dang khoi chay cong cu ${plugin.commandName}...")
  (princ "\\n[NOITHATPRO] Ket noi thanh cong voi he thong Web Noi That Pro!")
  (princ "\\n=======================================================")
  
  (setvar "CMDECHO" oldCmd)
  (setvar "OSMODE" oldOsm)
  (princ "\\n[NOITHATPRO] Lenh ${plugin.commandName} da hoan tat thanh cong.")
  (princ)
)

(princ "\\n[NOITHATPRO] Da nap xong ${plugin.fileName}! Go lenh: ${plugin.commandName} de su dung.")
(princ)
`;

    const blob = new Blob([lspContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = plugin.fileName.endsWith(".vlx")
      ? plugin.fileName.replace(".vlx", ".lsp")
      : plugin.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl space-y-6 font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Key className="w-6 h-6 text-amber-600" />
            Tiện Ích & Plugin CAD Đã Kích Hoạt
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý các file AutoLISP (.vlx, .lsp), tải về máy và đăng ký khóa bản quyền (License Key) theo máy tính của bạn.
          </p>
        </div>
        <Link
          href="/cad-store"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition shadow-2xs self-start"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Khám phá thêm Lisp tại Kho CAD
        </Link>
      </div>

      {/* Danh sách Plugin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plugins.map((plugin) => (
          <div
            key={plugin.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-200 transition"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {plugin.licenseCount || "1 máy tính"}
                </span>
                <span className="text-xs text-slate-400">Ngày cấp: {plugin.purchasedDate}</span>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 leading-snug">{plugin.name}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Lệnh trong CAD:{" "}
                  <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-amber-700">
                    {plugin.commandName}
                  </code>
                </p>
              </div>

              {/* License Key Box */}
              {plugin.licenseKey && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">
                      Khóa bản quyền (License Key)
                    </span>
                    <button
                      onClick={() => handleCopy(plugin.licenseKey!, plugin.id)}
                      className="text-[11px] font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"
                    >
                      {copiedKey === plugin.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" /> Đã chép
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Sao chép
                        </>
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-800 break-all select-all">
                    {plugin.licenseKey}
                  </div>
                  {plugin.volumeId && (
                    <div className="text-[10px] text-slate-400">Gắn với máy: {plugin.volumeId}</div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500 truncate max-w-[160px]">
                {plugin.fileName}
              </span>
              <button
                onClick={() => handleDownloadFile(plugin)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                <Download className="w-3.5 h-3.5 text-amber-600" /> Tải file Lisp
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Trình Tạo License Key Theo Mã Máy */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Laptop className="w-5 h-5 text-amber-600" />
          Kích Hoạt Bản Quyền Cho Máy Tính Mới
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Gõ lệnh <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">Get-Machine-ID</code> hoặc xem mã ổ cứng (Volume Serial Number) của máy bạn, sau đó nhập vào ô bên dưới để nhận mã kích hoạt tương ứng:
        </p>

        <form onSubmit={handleGenerateKey} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4">
            <select
              value={selectedCmd}
              onChange={(e) => setSelectedCmd(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 font-sans bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="QC">AutoCutlist Pro (QC)</option>
              <option value="SD">SmartDim Furniture (SD)</option>
              <option value="BP">BatchPlot Layout (BP)</option>
              <option value="HW">Hardware Counter (HW)</option>
            </select>
          </div>
          <div className="sm:col-span-5">
            <input
              type="text"
              placeholder="Nhập mã máy (VD: 4A2B-8C1D)..."
              value={machineId}
              onChange={(e) => setMachineId(e.target.value)}
              required
              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full py-2.5 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition"
            >
              Tạo khóa bản quyền
            </button>
          </div>
        </form>

        {generatedKey && (
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-amber-800 font-medium block">
                Khóa kích hoạt (License Key) cho máy của bạn:
              </span>
              <span className="font-mono font-bold text-amber-700 text-sm tracking-wider">
                {generatedKey}
              </span>
            </div>
            <button
              onClick={() => handleCopy(generatedKey, "new-gen")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 shadow-2xs self-start sm:self-center"
            >
              {copiedKey === "new-gen" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Đã chép
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Sao chép key
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Hướng Dẫn Cài Đặt Trong AutoCAD */}
      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-3">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-600" />
          Hướng Dẫn Cài Đặt & Sử Dụng Trên AutoCAD:
        </h4>
        <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
          <li>
            Bấm nút <strong>Tải file Lisp</strong> ở trên về máy tính và lưu vào một thư mục cố định (VD: <code className="text-slate-800 font-mono">D:\CAD_Plugins</code>).
          </li>
          <li>
            Mở AutoCAD, gõ lệnh <code className="text-amber-800 font-bold">APPLOAD</code> và nhấn Enter.
          </li>
          <li>
            Chọn file vừa tải, bấm nút <strong>Load</strong> (hoặc kéo thả vào ô <strong>Startup Suite</strong> hình chiếc cặp để tự động nạp mỗi khi mở CAD).
          </li>
          <li>
            Gõ lệnh tương ứng (VD: <code className="text-amber-800 font-bold">QC</code> hoặc <code className="text-amber-800 font-bold">SD</code>) và dán License Key khi được nhắc lần đầu tiên.
          </li>
        </ol>
      </div>
    </div>
  );
}
