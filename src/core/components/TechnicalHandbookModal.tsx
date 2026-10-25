"use client";

import { useState, useMemo } from "react";
import {
  BookOpen,
  X,
  Search,
  Layers,
  ShieldCheck,
  Maximize2,
  Wrench,
  Calculator,
  Check,
  Copy,
  ChevronRight,
  Info,
  Sparkles,
  ArrowRight,
  Gauge,
  Sliders,
} from "lucide-react";

interface TechnicalHandbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySpec?: (spec: { code: string; name: string; standardArea?: number; note?: string }) => void;
}

export type HandbookCategory = "all" | "boards" | "cores" | "surfaces" | "hardware" | "calculator";

interface SpecItem {
  id: string;
  category: "boards" | "cores" | "surfaces" | "hardware";
  code: string;
  title: string;
  dimensions?: string;
  areaM2?: number;
  highlight: string;
  description: string;
  advantages: string[];
  workshopTip: string;
  badge: string;
  badgeColor: string;
}

const SPEC_ITEMS: SpecItem[] = [
  // --- 1. KHỔ PHÔI VÁN & CẮT XẺ ---
  {
    id: "spec-board-standard",
    category: "boards",
    code: "VAN_1220X2440",
    title: "Khổ Phôi Ván Tiêu Chuẩn Thị Trường",
    dimensions: "1220 × 2440 mm",
    areaM2: 2.9768,
    highlight: "Chiếm 85% sản lượng sản xuất nội thất gỗ công nghiệp",
    description: "Khổ ván thông dụng nhất tại Việt Nam và Đông Nam Á. Phù hợp cắt hông tủ áo cao dưới 2m4, hồi tủ, đợt ngang, ngăn kéo.",
    advantages: [
      "Luôn sẵn hàng tại mọi đại lý ván",
      "Tối ưu tốt nhất cho các dòng máy CNC Nesting 1325",
      "Độ dày đa dạng: 6mm (hậu tủ), 9mm, 12mm, 15mm, 17mm, 18mm",
    ],
    workshopTip: "Hệ số hao hụt tối ưu máy CNC Nesting dao 6mm: 1.12 - 1.15 (+12% đến 15%).",
    badge: "Tiêu chuẩn quốc dân",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
  },
  {
    id: "spec-board-jumbo",
    category: "boards",
    code: "VAN_1830X2440",
    title: "Khổ Lớn Jumbo 1830 × 2440 mm",
    dimensions: "1830 × 2440 mm",
    areaM2: 4.4652,
    highlight: "Giải pháp vàng cho cánh tủ kịch trần khổ rộng",
    description: "Khổ ván bản rộng 1.83m giúp cắt xẻ các tấm vách ngăn văn phòng, cánh tủ áo kịch trần, mặt bàn họp lớn mà không phải chắp nối.",
    advantages: [
      "Không để lại vết ghép nối thẩm mỹ",
      "Tiết kiệm phôi khi xếp nesting các chi tiết có chiều rộng > 600mm",
      "Diện tích lớn hơn 50% so với tấm chuẩn 1220x2440",
    ],
    workshopTip: "Yêu cầu bàn hút chân không máy CNC có công suất lớn (7.5kW trở lên) để giữ phôi chắc chắn.",
    badge: "Khổ lớn Jumbo",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  {
    id: "spec-board-tall",
    category: "boards",
    code: "VAN_1220X2745",
    title: "Khổ Ván Kịch Trần Chiều Cao 2.745 m",
    dimensions: "1220 × 2745 mm",
    areaM2: 3.3489,
    highlight: "Thiết kế nội thất chung cư trần cao 2.6m - 2.7m",
    description: "Chuyên biệt cho cánh tủ áo sát trần chung cư cao cấp. Tránh hoàn toàn việc phải làm cục tủ trên hoặc chia cánh đôi ngắn.",
    advantages: [
      "Cánh tủ liền mạch thẳng đứng từ sàn lên trần",
      "Tăng vẻ sang trọng phong cách hiện đại Minimalist / Japandi",
    ],
    workshopTip: "Cánh tủ dài trên 2.4m bắt buộc lắp thêm thanh ty nhôm chống cong vênh cánh âm mặt sau.",
    badge: "Cánh kịch trần",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-300",
  },

  // --- 2. CỐT GỖ & ĐỘ KHÁNG ẨM ---
  {
    id: "spec-core-hmr",
    category: "cores",
    code: "COT_MDF_V313",
    title: "MDF Lõi Xanh Chống Ẩm HMR V313 (Chuẩn E1)",
    highlight: "Cốt gỗ phổ biến nhất cho tủ áo, giường, kệ tivi",
    description: "Sợi gỗ nghiền mịn kết hợp keo chống ẩm chuyên dụng nhuộm màu chỉ thị xanh. Đạt thử nghiệm chu kỳ ngâm nước nóng V313 khắt khe.",
    advantages: [
      "Tỷ trọng nén cao 750 – 800 kg/m³",
      "Độ trương nở chiều dày ≤ 12% khi ngâm nước 24h",
      "Nồng độ phát thải Formaldehyde chuẩn E1 an toàn cho phòng ngủ",
    ],
    workshopTip: "Phù hợp làm toàn bộ thùng và cánh khu vực khô ráo và tủ áo.",
    badge: "Cốt lõi xanh V313",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  {
    id: "spec-core-wpb",
    category: "cores",
    code: "COT_NHUA_WPB",
    title: "Tấm Nhựa Đặc WPB (Water Proof Board) Chống Nước 100%",
    highlight: "Giải pháp vĩnh cửu cho khoang tủ bếp & tủ lavabo",
    description: "Cấu tạo từ bột nhựa PVC đùn ép đặc bọt tỷ trọng cao. Hoàn toàn miễn nhiễm với nước, mối mọt và không cháy lan.",
    advantages: [
      "Ngâm ngập trong nước 10 năm không mục rữa",
      "Không cong vênh khi thay đổi độ ẩm đột ngột",
      "Bám vít tốt khi dùng vít ren thưa chuyên dụng cho nhựa",
    ],
    workshopTip: "Bắt buộc dùng cho khoang chậu rửa tủ bếp (dưới bồn rửa bát) và tủ lavabo phòng tắm.",
    badge: "Chống nước 100%",
    badgeColor: "bg-cyan-100 text-cyan-800 border-cyan-300",
  },
  {
    id: "spec-core-plywood",
    category: "cores",
    code: "COT_PLYWOOD_WBP",
    title: "Gỗ Dán Plywood Chịu Nước Nhiều Lớp (Keo WBP)",
    highlight: "Khả năng chịu lực uốn và bám vít số 1",
    description: "Các lớp gỗ lạng tự nhiên xếp so le thớ ép nhiệt với keo chống nước WBP Phenolic. Được ưa chuộng ở thị trường xuất khẩu Mỹ/Châu Âu.",
    advantages: [
      "Khả năng giữ vít vượt trội so với MDF",
      "Chịu lực võng tốt cho đợt tủ rộng trên 900mm",
      "Chống ẩm tốt ở vùng khí hậu nồm miền Bắc",
    ],
    workshopTip: "Thích hợp làm khung chịu lực, vách hậu tủ âm tường và giường ngủ.",
    badge: "Plywood chịu uốn",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300",
  },

  // --- 3. BỀ MẶT PHỦ & NẸP CHỈ PVC ---
  {
    id: "spec-surface-melamine",
    category: "surfaces",
    code: "BE_MAT_MELAMINE",
    title: "Bề Mặt Phủ Melamine Chống Trầy (MS Series)",
    highlight: "Độ bền màu cao, hàng trăm vân gỗ & màu đơn sắc",
    description: "Giấy trang trí nhúng keo Melamine ép nhiệt trực tiếp lên bề mặt cốt gỗ ở 200°C. Chống trầy xước nhẹ và dễ lau chùi.",
    advantages: [
      "Chi phí đầu tư tiết kiệm và hiệu quả nhất",
      "Không phai màu theo thời gian",
      "Đồng bộ với chỉ dán cạnh PVC cùng mã vân",
    ],
    workshopTip: "Chọn loại vân gỗ sần (Texture) để che vết trầy xước và bám vân tay tốt hơn bề mặt bóng mịn.",
    badge: "Vân gỗ thông dụng",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
  },
  {
    id: "spec-surface-acrylic",
    category: "surfaces",
    code: "BE_MAT_ACRYLIC_NOLINE",
    title: "Cánh Acrylic Bóng Gương Noline (Dán Không Line Mép)",
    highlight: "Đỉnh cao thẩm mỹ cho tủ bếp & tủ áo hiện đại",
    description: "Tấm Acrylic tráng gương bóng sâu dán lên cốt gỗ bằng công nghệ ép nhiệt chân không PUR, gia công dán cạnh Laser Noline.",
    advantages: [
      "Độ bóng gương sâu tạo cảm giác không gian rộng gấp đôi",
      "Cạnh dán liền khối không thấy đường keo dán mép",
      "Bề mặt chống bám dầu mỡ nhà bếp",
    ],
    workshopTip: "Vệ sinh bằng khăn vi sợi microfiber mềm ẩm, tuyệt đối không dùng cọ sắt hay hóa chất tẩy mạnh.",
    badge: "Bóng gương sang trọng",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
  },
  {
    id: "spec-edge-pvc",
    category: "surfaces",
    code: "NEP_CHI_PVC",
    title: "Quy Cách Chỉ Nẹp Dán Cạnh PVC (1×21, 2×21 & 1×43mm)",
    highlight: "Bịt kín mép cắt ngăn ẩm xâm nhập cốt gỗ",
    description: "Dải nẹp nhựa PVC nguyên sinh chống nứt gãy. Có 3 độ dày chuẩn: 1mm (thân tủ), 2mm (cánh tủ bo tròn R2 chống sứt), 43mm (mặt bàn kẹp đôi).",
    advantages: [
      "Nẹp 2x21 bo R2 mềm mại, trẻ em va vào không bị rách da",
      "Bám dính bền bỉ khi chạy qua máy dán cạnh tự động 5 - 8 chức năng",
    ],
    workshopTip: "Bắt buộc cộng hệ số hao hụt chỉ 8% (1.08) để bù trừ đoạn đầu thừa và đuôi nẹp khi máy xén dao.",
    badge: "Nẹp chỉ chuẩn xưởng",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
  },
  {
    id: "spec-glue-pur",
    category: "surfaces",
    code: "KEO_PUR_DAN_CANH",
    title: "Keo Hạt Nhiệt PUR Chống Thấm Mép Chuyên Sâu",
    highlight: "Khắc phục triệt để hiện tượng nồm ẩm mốc thâm mép gỗ",
    description: "Keo Polyurethane phản ứng nhiệt tự liên kết với độ ẩm không khí. Tạo lớp rào cản ngăn ẩm tuyệt đối ở mép dán cạnh tủ bếp.",
    advantages: [
      "Đường keo mỏng tàng hình (chỉ 0.1mm)",
      "Kháng nước sôi và nhiệt độ cao lên tới 150°C",
      "Không bị bong tróc sau 10 năm sử dụng",
    ],
    workshopTip: "Nồi keo máy dán cạnh sau khi chạy PUR phải được vệ sinh bằng sáp hạt xúc rửa chuyên dụng trước khi tắt máy.",
    badge: "Chống nồm ẩm",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
  },

  // --- 4. PHỤ KIỆN & HỆ 32MM ---
  {
    id: "spec-hw-hinge",
    category: "hardware",
    code: "BAN_LE_HE_32",
    title: "Bản Lề Bật Inox Giảm Chấn (Chuẩn Lỗ Khoan Hệ 32mm)",
    highlight: "Quy cách tim lỗ chuẩn quốc tế cho máy CNC",
    description: "Chén bản lề phi 35mm, độ sâu lỗ khoan 11.5–12mm. Khoảng cách tim chén tới mép cánh chuẩn là 21.5mm (hoặc 22mm tùy xưởng).",
    advantages: [
      "Đế tháo lắp nhanh bấm nút tiện lợi khi thi công",
      "Piston giảm chấn thủy lực đóng êm ái",
      "Độ bền thử nghiệm 50.000 – 100.000 lần đóng mở",
    ],
    workshopTip: "Cánh tủ cao dưới 1m dùng 2 bản lề; cao 1m–1.6m dùng 3 bản lề; cao 1.6m–2.2m dùng 4 bản lề; kịch trần >2.2m dùng 5 bản lề.",
    badge: "Bản lề hệ 32",
    badgeColor: "bg-slate-100 text-slate-800 border-slate-300",
  },
  {
    id: "spec-hw-slide",
    category: "hardware",
    code: "RAY_AM_GIAM_CHAN",
    title: "Ray Trượt Âm Giảm Chấn 450mm Mở Toàn Phần",
    highlight: "Giấu kín đáy hộc kéo, tăng tải trọng lên 35 - 50kg",
    description: "Ray gắn giấu dưới đáy ngăn kéo, không nhìn thấy thanh sắt khi kéo ra. Độ mở toàn phần giúp lấy đồ đạc tận góc sâu bên trong.",
    advantages: [
      "Độ hụt chiều ngang phủ bì hộc kéo so với lọt lòng tủ là 42mm",
      "Lẫy khóa 3D chỉnh khe hở ngăn kéo lên xuống, sang trái phải dễ dàng",
    ],
    workshopTip: "Chiều sâu lọt lòng hộc tủ tối thiểu phải lớn hơn chiều dài ray 10mm (Ray 450mm cần lọt lòng sâu ≥ 460mm).",
    badge: "Ray âm cao cấp",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
];

export default function TechnicalHandbookModal({
  isOpen,
  onClose,
  onApplySpec,
}: TechnicalHandbookModalProps) {
  const [activeTab, setActiveTab] = useState<HandbookCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Bộ tính nhanh số tấm ván từ kích thước tủ
  const [cabinetHeight, setCabinetHeight] = useState(2400);
  const [cabinetWidth, setCabinetWidth] = useState(1800);
  const [cabinetDepth, setCabinetDepth] = useState(600);
  const [doorsCount, setDoorsCount] = useState(4);
  const [drawersCount, setDrawersCount] = useState(3);

  // Bộ tính nhanh mét dài dán chỉ
  const [partL, setPartL] = useState(2400);
  const [partW, setPartW] = useState(600);
  const [partQty, setPartQty] = useState(2);
  const [edgeSides, setEdgeSides] = useState<number>(4);

  // Tính toán diện tích tủ ước tính (Net & Số tấm)
  const cabinetCalc = useMemo(() => {
    const h = cabinetHeight / 1000;
    const w = cabinetWidth / 1000;
    const d = cabinetDepth / 1000;

    // Hông trái + hông phải: 2 * (h * d)
    const hongs = 2 * (h * d);
    // Đáy + Nóc: 2 * (w * d)
    const dayNoc = 2 * (w * d);
    // Vách đứng giữa (tủ > 1m cần 1 vách, >1.6m cần 2 vách)
    const vachs = (w > 1.6 ? 2 : w > 1.0 ? 1 : 0) * (h * d);
    // Đợt ngang (ước tính 4 đợt)
    const dots = 4 * ((w / (w > 1.6 ? 3 : 2)) * d);
    // Cánh tủ
    const canh = w * h;
    // Hậu tủ (ván 6mm)
    const hau = w * h;

    const netBoard17 = hongs + dayNoc + vachs + dots + canh;
    const netHau6 = hau;

    // Quy đổi số tấm chuẩn 1220x2440 (2.9768 m2) với hao hụt 15%
    const standardSheetArea = 2.9768;
    const waste = 1.15;

    const sheets17 = Math.ceil(((netBoard17 * waste) / standardSheetArea) * 2) / 2;
    const sheets6 = Math.ceil(((netHau6 * waste) / standardSheetArea) * 2) / 2;

    // Mét dài chỉ ước tính
    const totalEdgeEstimated = Math.round(
      (2 * (h + d) * 2 + 2 * (w + d) * 2 + canh * 4 + dots * 2) * 1.08
    );

    // Bản lề & Ray
    const hingesEstimated = doorsCount * (h > 2.2 ? 5 : h > 1.6 ? 4 : 3);
    const slidesEstimated = drawersCount;

    return {
      netBoard17: Number(netBoard17.toFixed(2)),
      sheets17,
      netHau6: Number(netHau6.toFixed(2)),
      sheets6,
      totalEdgeEstimated,
      hingesEstimated,
      slidesEstimated,
    };
  }, [cabinetHeight, cabinetWidth, cabinetDepth, doorsCount, drawersCount]);

  // Tính toán mét dài chỉ cho tấm lẻ
  const edgeSingleCalc = useMemo(() => {
    const l = partL / 1000;
    const w = partW / 1000;
    let perimeter = 0;
    if (edgeSides === 4) perimeter = 2 * (l + w);
    else if (edgeSides === 3) perimeter = 2 * l + w;
    else if (edgeSides === 2) perimeter = 2 * l;
    else if (edgeSides === 1) perimeter = l;

    const totalNet = perimeter * partQty;
    const withWaste = totalNet * 1.08;
    return {
      netMeters: Number(totalNet.toFixed(2)),
      grossMeters: Number(withWaste.toFixed(2)),
    };
  }, [partL, partW, partQty, edgeSides]);

  // Lọc danh mục spec items
  const filteredSpecs = useMemo(() => {
    return SPEC_ITEMS.filter((item) => {
      const matchCat = activeTab === "all" || item.category === activeTab;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.highlight.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.workshopTip.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [activeTab, searchQuery]);

  const copySpec = (item: SpecItem) => {
    const text = `[${item.title}]\n• Kích thước/Quy cách: ${item.dimensions || "Chuẩn"}\n• Đặc tính: ${item.highlight}\n• Lưu ý xưởng: ${item.workshopTip}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        
        {/* ================================================================ */}
        {/* MODAL HEADER WITH TABS & LIVE SEARCH                             */}
        {/* ================================================================ */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 shrink-0 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                    Sổ Tay Quy Cách Kỹ Thuật Gỗ Công Nghiệp 2026
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                    Bản Linh Động v2.0
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Định mức gia công xưởng mộc, khổ phôi tiêu chuẩn, dung sai máy CNC & bộ công cụ tính nhanh
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

          {/* Thanh tìm kiếm và Tabs danh mục */}
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nhanh: Jumbo, HMR V313, WPB, Noline, PUR, Hệ 32mm, Bản lề..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Segmented Filter Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
              {[
                { id: "all", label: "Tất cả" },
                { id: "boards", label: "Khổ ván" },
                { id: "cores", label: "Cốt gỗ" },
                { id: "surfaces", label: "Bề mặt & Chỉ" },
                { id: "hardware", label: "Phụ kiện" },
                { id: "calculator", label: "⚡ Bộ tính nhanh", isSpecial: true },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as HandbookCategory)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer ${
                    activeTab === tab.id
                      ? tab.isSpecial
                        ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                        : "bg-white text-slate-950 font-bold shadow-xs"
                      : tab.isSpecial
                      ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* MODAL BODY (CUỘN NỘI DUNG TƯƠNG TÁC)                             */}
        {/* ================================================================ */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/70">
          
          {/* TAB ĐẶC BIỆT: BỘ TÍNH NHANH TƯƠNG TÁC CHO XƯỞNG */}
          {activeTab === "calculator" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* 1. Công cụ tính số tấm ván từ kích thước tủ */}
              <div className="bg-white rounded-3xl border border-amber-200 p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Ước tính số tấm ván & mét chỉ từ kích thước tủ (Ngoại quan phủ bì)
                      </h4>
                      <p className="text-xs text-slate-500">
                        Dành cho thợ báo giá nhanh ngay tại công trình mà không cần mở CAD hay vẽ 3D
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                    Hao hụt chuẩn 15%
                  </span>
                </div>

                {/* Grid nhập thông số tủ */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Chiều cao (mm)</label>
                    <input
                      type="number"
                      value={cabinetHeight}
                      onChange={(e) => setCabinetHeight(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Chiều rộng (mm)</label>
                    <input
                      type="number"
                      value={cabinetWidth}
                      onChange={(e) => setCabinetWidth(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Chiều sâu (mm)</label>
                    <input
                      type="number"
                      value={cabinetDepth}
                      onChange={(e) => setCabinetDepth(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Số cánh mở</label>
                    <input
                      type="number"
                      value={doorsCount}
                      onChange={(e) => setDoorsCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Số ngăn kéo</label>
                    <input
                      type="number"
                      value={drawersCount}
                      onChange={(e) => setDrawersCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Kết quả dự toán nhanh */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80">
                    <span className="text-[10px] text-amber-800 font-bold block uppercase">Ván Thùng/Cánh (17mm)</span>
                    <strong className="text-xl font-black text-amber-950 font-mono">
                      {cabinetCalc.sheets17} <span className="text-xs font-normal">tấm</span>
                    </strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                      Net: {cabinetCalc.netBoard17} m²
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-600 font-bold block uppercase">Ván Hậu (6mm)</span>
                    <strong className="text-xl font-black text-slate-900 font-mono">
                      {cabinetCalc.sheets6} <span className="text-xs font-normal">tấm</span>
                    </strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                      Net: {cabinetCalc.netHau6} m²
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200/80">
                    <span className="text-[10px] text-sky-800 font-bold block uppercase">Chỉ dán cạnh PVC</span>
                    <strong className="text-xl font-black text-sky-950 font-mono">
                      {cabinetCalc.totalEdgeEstimated} <span className="text-xs font-normal">mét dài</span>
                    </strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      ~ {Math.ceil(cabinetCalc.totalEdgeEstimated / 100)} cuộn (100m)
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80">
                    <span className="text-[10px] text-emerald-800 font-bold block uppercase">Phụ kiện cơ bản</span>
                    <strong className="text-sm font-black text-emerald-950 font-mono block mt-1">
                      {cabinetCalc.hingesEstimated} bản lề • {cabinetCalc.slidesEstimated} bộ ray
                    </strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Chuẩn hệ 32mm
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Công cụ tính mét dài dán chỉ cho tấm chi tiết */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-sky-600" />
                  <h4 className="font-bold text-slate-900 text-sm">
                    Bộ tính mét dài dán chỉ nẹp (Kèm hao hụt 8% máy dán cạnh tự động)
                  </h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Chiều dài tấm (mm)</label>
                    <input
                      type="number"
                      value={partL}
                      onChange={(e) => setPartL(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Chiều rộng tấm (mm)</label>
                    <input
                      type="number"
                      value={partW}
                      onChange={(e) => setPartW(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Số lượng tấm</label>
                    <input
                      type="number"
                      value={partQty}
                      onChange={(e) => setPartQty(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Số cạnh dán chỉ</label>
                    <select
                      value={edgeSides}
                      onChange={(e) => setEdgeSides(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-slate-900 bg-white"
                    >
                      <option value={4}>4 cạnh (Cánh tủ, mặt bàn)</option>
                      <option value={3}>3 cạnh (Hông tủ, đợt ngoài)</option>
                      <option value={2}>2 cạnh dài (D1 + D2)</option>
                      <option value={1}>1 cạnh dài (D1 mặt trước)</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 text-white flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Kết quả mét dài cần xén:</span>
                    <span className="text-lg font-bold text-amber-400">
                      {edgeSingleCalc.grossMeters} md <span className="text-xs text-slate-400 font-normal">(đã gồm 8% hao hụt)</span>
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-slate-400">
                    Net: {edgeSingleCalc.netMeters} md
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* HIỂN THỊ DANH SÁCH QUY CÁCH KỸ THUẬT THEO TABS */}
          {activeTab !== "calculator" && (
            <div className="space-y-4">
              {filteredSpecs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Không tìm thấy quy cách kỹ thuật nào khớp với từ khóa "{searchQuery}".
                </div>
              ) : (
                filteredSpecs.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:border-amber-300 transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-sm">
                          {item.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.dimensions && (
                          <span className="font-mono text-xs font-bold text-amber-900 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200/80">
                            {item.dimensions} {item.areaM2 ? `(${item.areaM2} m²)` : ""}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => copySpec(item)}
                          className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                          title="Sao chép quy cách này"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-amber-900">
                      ⚡ {item.highlight}
                    </p>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Ưu điểm kỹ thuật */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-700">
                      {item.advantages.map((adv, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{adv}</span>
                        </div>
                      ))}
                    </div>

                    {/* Mẹo xưởng mộc */}
                    <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-950 flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Kinh nghiệm sản xuất:</strong> {item.workshopTip}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* ================================================================ */}
        {/* MODAL FOOTER                                                     */}
        {/* ================================================================ */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Tài liệu tiêu chuẩn kỹ thuật số hóa dùng cho xưởng gỗ nội thất & thợ thiết kế</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === "calculator" ? "all" : "calculator")}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 transition cursor-pointer flex items-center gap-1.5"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>{activeTab === "calculator" ? "Xem danh mục quy cách" : "Mở bộ tính nhanh"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition cursor-pointer"
            >
              Đóng sổ tay
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
