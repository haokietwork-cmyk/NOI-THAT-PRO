"use client";

import { useState } from "react";
import { 
  X, 
  Layers, 
  Plus, 
  Check, 
  Sparkles, 
  Sliders, 
  ChevronRight, 
  Info, 
  Maximize2,
  Box,
  LayoutGrid
} from "lucide-react";
import { FURNITURE_PRESETS, FurniturePreset } from "../data/furniturePresets";
import { CutlistPart } from "../types";
import { WORKSHOP_TERMS } from "../constants/terms";

interface PresetLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (presetParts: Omit<CutlistPart, "id">[], mode: "replace" | "append", presetName: string) => void;
}

export default function PresetLibraryModal({
  isOpen,
  onClose,
  onSelectPreset,
}: PresetLibraryModalProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("preset-tu-ao-master");

  // Tab chuyển giữa Danh mục mẫu & Bộ sinh tủ tham số (Parametric Generator)
  const [activeTab, setActiveTab] = useState<"presets" | "generator">("presets");

  // State cho Bộ sinh tủ tham số
  const [genName, setGenName] = useState("Tủ Áo Phòng Ngủ Nhỏ");
  const [genHeight, setGenHeight] = useState(2400);
  const [genWidth, setGenWidth] = useState(1600);
  const [genDepth, setGenDepth] = useState(600);
  const [genDoors, setGenDoors] = useState(4);
  const [genShelves, setGenShelves] = useState(4);

  if (!isOpen) return null;

  const currentPreset = FURNITURE_PRESETS.find((p) => p.id === selectedPresetId) || FURNITURE_PRESETS[0];

  const filteredPresets = FURNITURE_PRESETS.filter(
    (p) => activeCategory === "all" || p.category === activeCategory
  );

  // Xử lý tự sinh chi tiết tấm theo kích thước bao
  const handleGenerateCabinet = (mode: "replace" | "append") => {
    const h = genHeight;
    const w = genWidth;
    const d = genDepth;

    const parts: Omit<CutlistPart, "id">[] = [
      // 2 Hông tủ
      { moduleName: genName, partName: "Hông tủ trái", lengthMm: h, widthMm: d, thicknessMm: 17, qty: 1, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: true, edgeW1: false, edgeW2: false },
      { moduleName: genName, partName: "Hông tủ phải", lengthMm: h, widthMm: d, thicknessMm: 17, qty: 1, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: true, edgeW1: false, edgeW2: false },
      // Đáy & Nóc
      { moduleName: genName, partName: "Đáy tủ", lengthMm: w - 34, widthMm: d, thicknessMm: 17, qty: 1, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: false, edgeW1: false, edgeW2: false },
      { moduleName: genName, partName: "Nóc tủ", lengthMm: w - 34, widthMm: d, thicknessMm: 17, qty: 1, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: false, edgeW1: false, edgeW2: false },
      // Vách đứng giữa (nếu rộng > 1m)
      ...(w > 1000
        ? [{ moduleName: genName, partName: "Vách đứng giữa", lengthMm: h - 34, widthMm: d - 20, thicknessMm: 17, qty: 1, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: false, edgeW1: false, edgeW2: false }]
        : []),
      // Đợt di động
      { moduleName: genName, partName: "Đợt di động chia ngăn", lengthMm: Math.round((w - 51) / (w > 1000 ? 2 : 1)), widthMm: d - 40, thicknessMm: 17, qty: genShelves, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: false, edgeW1: false, edgeW2: false },
      // Cánh tủ
      { moduleName: genName, partName: "Cánh tủ mở (Nẹp bo R2)", lengthMm: h - 50, widthMm: Math.round((w - (genDoors * 3)) / genDoors), thicknessMm: 17, qty: genDoors, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: true, edgeW1: true, edgeW2: true },
      // Ván hậu 6mm
      { moduleName: genName, partName: "Ván hậu soi rãnh (6mm)", lengthMm: h - 20, widthMm: w - 20, thicknessMm: 6, qty: 1, materialCode: "MDF_6_HAU", edgeL1: false, edgeL2: false, edgeW1: false, edgeW2: false },
    ];

    onSelectPreset(parts, mode, genName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  Kho Hạng Mục Mẫu & Tự Sinh Chi Tiết Tủ
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                  Chuẩn Xưởng CNC
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Nạp sẵn cấu trúc tấm nội thất chuẩn xưởng hoặc nhập nhanh kích thước tủ để tự sinh {WORKSHOP_TERMS.cutlist.label.toLowerCase()}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Mẫu Có Sẵn vs Tự Sinh Tham Số */}
        <div className="px-6 pt-3 bg-slate-100 border-b border-slate-200 flex items-center gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={`px-4 py-2 rounded-t-xl transition cursor-pointer flex items-center gap-2 border-t-2 ${
              activeTab === "presets"
                ? "bg-white text-slate-900 border-amber-500 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 border-transparent"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-amber-600" />
            <span>1. Hạng Mục Mẫu Chuẩn (1-Click Nạp)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("generator")}
            className={`px-4 py-2 rounded-t-xl transition cursor-pointer flex items-center gap-2 border-t-2 ${
              activeTab === "generator"
                ? "bg-white text-slate-900 border-amber-500 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 border-transparent"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>2. Tự Sinh Tấm Theo Kích Thước Tủ (Cao × Rộng × Sâu)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/60">
          
          {/* TAB 1: DANH MỤC MẪU CÓ SẴN */}
          {activeTab === "presets" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              
              {/* Cột trái: Danh sách các mẫu */}
              <div className="md:col-span-5 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Chọn mẫu tủ cần dùng:
                </span>
                {FURNITURE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedPresetId(preset.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                      selectedPresetId === preset.id
                        ? "bg-white border-amber-400 shadow-xs ring-1 ring-amber-400/30"
                        : "bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{preset.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-xs truncate">
                        {preset.name}
                      </h4>
                      <p className="font-mono text-[11px] text-amber-800 font-semibold mt-0.5">
                        {preset.dimensions}
                      </p>
                      <span className="text-[10px] text-slate-500">
                        {preset.parts.length} chi tiết tấm
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Cột phải: Chi tiết mẫu đã chọn */}
              <div className="md:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">{currentPreset.icon}</span>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {currentPreset.name}
                      </h4>
                      <span className="font-mono text-xs text-amber-900 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Kích thước: {currentPreset.dimensions}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {currentPreset.description}
                </p>

                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-950 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Đặc tính kỹ thuật:</strong> {currentPreset.highlight}</span>
                </div>

                {/* Danh sách các tấm trong mẫu */}
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block mb-2">
                    Các chi tiết cấu thành ({currentPreset.parts.length} tấm):
                  </span>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/60 p-1 text-[11px] font-mono divide-y divide-slate-100">
                    {currentPreset.parts.map((p, idx) => (
                      <div key={idx} className="p-1.5 flex items-center justify-between text-slate-700">
                        <span className="font-sans font-medium">{p.partName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">{p.lengthMm}×{p.widthMm}</span>
                          <span className="font-bold text-slate-900">x{p.qty}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2 Nút nạp dữ liệu */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectPreset(currentPreset.parts, "replace", currentPreset.name);
                      onClose();
                    }}
                    className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition shadow-xs shadow-amber-500/20 text-center cursor-pointer"
                  >
                    ⚡ Nạp mới (Thay thế toàn bộ bảng)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectPreset(currentPreset.parts, "append", currentPreset.name);
                      onClose();
                    }}
                    className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition border border-slate-200 text-center cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm vào dự án hiện tại</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: TỰ SINH TỦ THEO THAM SỐ (PARAMETRIC CABINET GENERATOR) */}
          {activeTab === "generator" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5 max-w-2xl mx-auto">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Bộ Tự Động Phân Rã Kích Thước Tủ Thành {WORKSHOP_TERMS.cutlist.labelWithOriginal} Chuẩn</span>
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Nhập kích thước phủ bì (Cao, Rộng, Sâu), thuật toán sẽ tự tính chiều dài trừ ngàm âm, trừ khe hở cánh và soi rãnh hậu 6mm.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-bold mb-1">Tên {WORKSHOP_TERMS.module.label.toLowerCase()}</label>
                  <input
                    type="text"
                    value={genName}
                    onChange={(e) => setGenName(e.target.value)}
                    placeholder="VD: Tủ áo phòng Master, Tủ bếp dưới, Tủ giày sảnh..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Chiều cao phủ bì (mm)</label>
                  <input
                    type="number"
                    value={genHeight}
                    onChange={(e) => setGenHeight(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Chiều rộng phủ bì (mm)</label>
                  <input
                    type="number"
                    value={genWidth}
                    onChange={(e) => setGenWidth(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Chiều sâu lọt lòng (mm)</label>
                  <input
                    type="number"
                    value={genDepth}
                    onChange={(e) => setGenDepth(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Số cánh mở</label>
                  <input
                    type="number"
                    value={genDoors}
                    onChange={(e) => setGenDoors(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1 font-mono">
                <span className="font-sans font-bold text-slate-800 block">Quy chuẩn áp dụng:</span>
                <div>• Ván thùng/cánh: MDF lõi xanh kháng ẩm HMR V313 17mm</div>
                <div>• Ván hậu: MDF 6mm trắng phủ 1 mặt (trừ âm lọt lòng 10mm)</div>
                <div>• Cánh tủ mở: Trừ khe hở 2mm chống cấn cọ, dán nẹp PVC bo R2</div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleGenerateCabinet("replace")}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition shadow-xs text-center cursor-pointer"
                >
                  ⚡ Sinh tấm mới (Thay thế bảng)
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerateCabinet("append")}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition text-center cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Sinh tấm & Ghép vào dự án</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Quy cách kích thước dựa trên tiêu chuẩn sản xuất xưởng gỗ CNC</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
