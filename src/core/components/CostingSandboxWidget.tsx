"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Layers, 
  Check, 
  Sliders, 
  Boxes, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp,
  RotateCcw
} from "lucide-react";

export type ProductArchetypeKey = 
  | "mdf_wardrobe" 
  | "solid_oak_dining" 
  | "onyx_brass_table" 
  | "slim_aluminum_glass" 
  | "leather_lounge_chair";

interface ProductArchetype {
  key: ProductArchetypeKey;
  name: string;
  category: string;
  badge: string;
  badgeColor: string;
  description: string;
  defaults: {
    w: number;
    d: number;
    h: number;
    qty: number;
  };
  limits: {
    wMin: number;
    wMax: number;
    wStep: number;
    dMin: number;
    dMax: number;
    dStep: number;
    hMin: number;
    hMax: number;
    hStep: number;
  };
  labels: {
    w: string;
    d: string;
    h: string;
  };
}

const ARCHETYPES: Record<ProductArchetypeKey, ProductArchetype> = {
  mdf_wardrobe: {
    key: "mdf_wardrobe",
    name: "Tủ Áo Master Kịch Trần",
    category: "Gỗ Công Nghiệp",
    badge: "Ván MDF Chống Ẩm",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    description: "Thùng MDF chống ẩm 17mm, cánh phủ Melamine chống trầy, bản lề giảm chấn & ray âm",
    defaults: { w: 2200, d: 600, h: 2600, qty: 1 },
    limits: {
      wMin: 1200, wMax: 3600, wStep: 100,
      dMin: 500, dMax: 700, dStep: 50,
      hMin: 2000, hMax: 3000, hStep: 50,
    },
    labels: { w: "Chiều rộng (W)", d: "Chiều sâu (D)", h: "Chiều cao (H)" },
  },
  solid_oak_dining: {
    key: "solid_oak_dining",
    name: "Bàn Ăn Gỗ Sồi Bắc Mỹ (8 Chỗ)",
    category: "Gỗ Tự Nhiên Khối",
    badge: "White Oak FAS",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    description: "Gỗ Sồi trắng tự nhiên sấy chuẩn 10-12%, mộng ghép mòi âm dương, sơn PU 4 lớp kháng ố",
    defaults: { w: 2000, d: 900, h: 750, qty: 1 },
    limits: {
      wMin: 1400, wMax: 3000, wStep: 100,
      dMin: 800, dMax: 1100, dStep: 50,
      hMin: 720, hMax: 780, hStep: 10,
    },
    labels: { w: "Chiều dài (W)", d: "Chiều rộng (D)", h: "Chiều cao (H)" },
  },
  onyx_brass_table: {
    key: "onyx_brass_table",
    name: "Bàn Trà Mặt Đá Onyx Khung Đồng",
    category: "Đá Tự Nhiên & Kim Loại",
    badge: "Đá 0% OH + Đồng PVD",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-200",
    description: "Mặt đá Onyx tự nhiên xuyên sáng mài vát bo R, khung đồng thau đặc xử lý bề mặt phay xước PVD",
    defaults: { w: 1200, d: 700, h: 450, qty: 1 },
    limits: {
      wMin: 800, wMax: 1600, wStep: 50,
      dMin: 600, dMax: 900, dStep: 50,
      hMin: 400, hMax: 500, hStep: 10,
    },
    labels: { w: "Chiều dài (W)", d: "Chiều rộng (D)", h: "Chiều cao (H)" },
  },
  slim_aluminum_glass: {
    key: "slim_aluminum_glass",
    name: "Cửa Lùa Slim Nhôm Kính Kịch Trần",
    category: "Nhôm Kính Kiến Trúc",
    badge: "Khung Slim 16mm",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    description: "Khung nhôm anode thanh mảnh 16mm, kính cường lực an toàn 8.38mm, ray treo âm giảm chấn 2 chiều OPK",
    defaults: { w: 2400, d: 80, h: 2600, qty: 1 },
    limits: {
      wMin: 1600, wMax: 3800, wStep: 100,
      dMin: 60, dMax: 120, dStep: 10,
      hMin: 2200, hMax: 3000, hStep: 50,
    },
    labels: { w: "Chiều rộng (W)", d: "Bản ray (D)", h: "Chiều cao (H)" },
  },
  leather_lounge_chair: {
    key: "leather_lounge_chair",
    name: "Ghế Lounge Thư Giãn Da Bò Ý",
    category: "Bọc Nệm & Sofa",
    badge: "Da Thật Full-Grain",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
    description: "Khung gỗ sấy kết hợp lò xo túi độc lập, foam D40 đàn hồi cao, da bò nhập khẩu nguyên tấm",
    defaults: { w: 900, d: 850, h: 850, qty: 1 },
    limits: {
      wMin: 800, wMax: 1200, wStep: 50,
      dMin: 750, dMax: 1000, dStep: 50,
      hMin: 750, hMax: 950, hStep: 50,
    },
    labels: { w: "Chiều ngang (W)", d: "Độ sâu (D)", h: "Chiều cao (H)" },
  },
};

const MOQ_OPTIONS = [
  { qty: 1, label: "1 Cái (Mẫu lẻ)", surcharge: 0.20, note: "+20% chi phí setup cữ mẫu" },
  { qty: 5, label: "5 Cái (Công trình)", surcharge: 0.10, note: "+10% chi phí chuyển đổi" },
  { qty: 10, label: "10 Cái (Dự án)", surcharge: 0.05, note: "+5% phụ phí lô nhỏ" },
  { qty: 20, label: "20 Cái (Sản xuất lô)", surcharge: 0.0, note: "Chuẩn giá gốc tối ưu" },
];

export default function CostingSandboxWidget() {
  const [selectedKey, setSelectedKey] = useState<ProductArchetypeKey>("mdf_wardrobe");
  const archetype = ARCHETYPES[selectedKey];

  const [w, setW] = useState<number>(archetype.defaults.w);
  const [d, setD] = useState<number>(archetype.defaults.d);
  const [h, setH] = useState<number>(archetype.defaults.h);
  const [qty, setQty] = useState<number>(1);
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);

  // Switch archetype and reset to its defaults
  const handleSelectArchetype = (key: ProductArchetypeKey) => {
    setSelectedKey(key);
    const target = ARCHETYPES[key];
    setW(target.defaults.w);
    setD(target.defaults.d);
    setH(target.defaults.h);
  };

  const handleReset = () => {
    setW(archetype.defaults.w);
    setD(archetype.defaults.d);
    setH(archetype.defaults.h);
    setQty(1);
  };

  // Calculation Engine based on Workshop Rules & Formulas
  const calculation = useMemo(() => {
    const moqTier = MOQ_OPTIONS.find((t) => t.qty === qty) || MOQ_OPTIONS[0];

    if (selectedKey === "mdf_wardrobe") {
      // Cabinet carcass + doors + backs
      // Net area calculation with 15% waste allowance
      const surfaceAreaM2 = (2 * (w * h + d * h) + 4 * (w * d)) / 1_000_000;
      const sheetArea = 2.9768; // 1220x2440
      const sheets = Math.ceil((surfaceAreaM2 * 1.15) / sheetArea);
      const edgeM = Math.round(surfaceAreaM2 * 4.2 * 1.08);

      const matCost = sheets * 680_000 + edgeM * 5_000 + 480_000; // Wood + Edge + Cam lock hardware
      const laborHours = sheets * 1.8 + 3.5;
      const laborCost = Math.round(laborHours * 105_000);
      const overhead = Math.round((matCost + laborCost) * 0.30);
      const cogsUnit = matCost + laborCost + overhead;
      const unitSellBase = Math.round((cogsUnit * 1.65) / 1_000) * 1_000;
      const finalUnitSell = Math.round(unitSellBase * (1 + moqTier.surcharge));
      const totalSell = finalUnitSell * qty;
      const totalCogs = cogsUnit * qty;
      const profit = totalSell - totalCogs;
      const marginPercent = Math.round((profit / totalSell) * 100);

      return {
        unitLabel: "bộ",
        sheetsOrVol: `${sheets} tấm ván (1220×2440)`,
        edgeOrSpecs: `${edgeM} mét chỉ dán cạnh PVC`,
        laborHours: `${laborHours.toFixed(1)} giờ công (4 công đoạn)`,
        matCost,
        laborCost,
        overhead,
        cogsUnit,
        finalUnitSell,
        totalSell,
        totalCogs,
        profit,
        marginPercent,
        dimensionsStr: `${w} × ${d} × ${h} mm`,
        areaMetric: `${surfaceAreaM2.toFixed(1)} m² phôi`,
      };
    }

    if (selectedKey === "solid_oak_dining") {
      // Solid Oak Table: 45% waste, 35% OH, 5 departments
      const topVol = (w * d * 40) / 1_000_000_000;
      const legVol = (4 * 85 * 85 * h) / 1_000_000_000;
      const frameVol = (2 * 35 * 100 * w + 2 * 35 * 100 * d) / 1_000_000_000;
      const netCbm = topVol + legVol + frameVol;
      const usingCbm = netCbm / (1 - 0.45); // Using formula from brief

      const oakPricePerCbm = 21_050_000; // WO01-ASH-0005 / Oak rate
      const matWood = Math.round(usingCbm * oakPricePerCbm);
      const matHardwareAndFinish = 850_000; // PU 4 coats + joinery bolts
      const matCost = matWood + matHardwareAndFinish;

      // 5 Labor processes: RAW, MAC, SAND, SPR, ASS
      const laborHours = 12.5;
      const laborCost = Math.round(laborHours * 105_000);
      const overhead = Math.round((matCost + laborCost) * 0.35); // 35% General OH
      const cogsUnit = matCost + laborCost + overhead;
      const unitSellBase = Math.round((cogsUnit * 1.65) / 1_000) * 1_000;
      const finalUnitSell = Math.round(unitSellBase * (1 + moqTier.surcharge));
      const totalSell = finalUnitSell * qty;
      const totalCogs = cogsUnit * qty;
      const profit = totalSell - totalCogs;
      const marginPercent = Math.round((profit / totalSell) * 100);

      return {
        unitLabel: "cái",
        sheetsOrVol: `${(usingCbm * 1000).toFixed(1)} dm³ gỗ khối (waste 45%)`,
        edgeOrSpecs: "Mộng mòi âm dương & Sơn PU kháng nước",
        laborHours: `${laborHours} giờ công (5 công đoạn)`,
        matCost,
        laborCost,
        overhead,
        cogsUnit,
        finalUnitSell,
        totalSell,
        totalCogs,
        profit,
        marginPercent,
        dimensionsStr: `${w} × ${d} × ${h} mm`,
        areaMetric: `${(w * d / 1_000_000).toFixed(2)} m² mặt bàn`,
      };
    }

    if (selectedKey === "onyx_brass_table") {
      // Natural Stone: 0% OH on Stone! + Ant-Marb multiplier 3.42 + Brass Frame with 35% OH
      const stoneAreaM2 = (w * d) / 1_000_000;
      const stoneMatCost = Math.round(stoneAreaM2 * 4_200_000); // Stone unit price

      const brassLengthM = (2 * (w + d) + 4 * h) / 1_000;
      const brassMatCost = Math.round(brassLengthM * 650_000);

      const matCost = stoneMatCost + brassMatCost;

      // Labor: Stone cutting & edge chamfering + Brass welding & PVD
      const laborStone = 4.5 * 105_000;
      const laborBrass = 6.0 * 105_000;
      const laborCost = Math.round(laborStone + laborBrass);

      // OH Rule from Brief: Stone has 0% OH! Brass has 35% OH, and Ant-Marb 3.42 multiplier
      const overhead = Math.round((brassMatCost + laborBrass) * 0.35 + laborStone * 0.20);
      const cogsUnit = matCost + laborCost + overhead;

      // Sell price with stone preserved from MOQ surcharge
      const nonStoneBase = (cogsUnit - stoneMatCost) * 1.65;
      const nonStoneMoq = nonStoneBase * (1 + moqTier.surcharge);
      const finalUnitSell = Math.round((nonStoneMoq + stoneMatCost * 1.65) / 1_000) * 1_000;

      const totalSell = finalUnitSell * qty;
      const totalCogs = cogsUnit * qty;
      const profit = totalSell - totalCogs;
      const marginPercent = Math.round((profit / totalSell) * 100);

      return {
        unitLabel: "cái",
        sheetsOrVol: `${stoneAreaM2.toFixed(2)} m² Đá Onyx tự nhiên`,
        edgeOrSpecs: `${brassLengthM.toFixed(1)}m Khung đồng thau PVD`,
        laborHours: "10.5 giờ mài vát & hoàn thiện",
        matCost,
        laborCost,
        overhead,
        cogsUnit,
        finalUnitSell,
        totalSell,
        totalCogs,
        profit,
        marginPercent,
        dimensionsStr: `${w} × ${d} × ${h} mm`,
        areaMetric: "Đá 0% OH nhạy cảm giá",
      };
    }

    if (selectedKey === "slim_aluminum_glass") {
      // Aluminum Slim sliding door
      const perimeterM = (2 * (w + h)) / 1_000;
      const glassAreaM2 = (w * h) / 1_000_000;

      const aluminumCost = Math.round(perimeterM * 340_000);
      const glassCost = Math.round(glassAreaM2 * 1.05 * 520_000); // 8.38mm safety glass
      const hardwareCost = 1_850_000; // OPK dampers & silent sliding wheels
      const matCost = aluminumCost + glassCost + hardwareCost;

      const laborHours = 6.0;
      const laborCost = Math.round(laborHours * 105_000);
      const overhead = Math.round((matCost + laborCost) * 0.25);
      const cogsUnit = matCost + laborCost + overhead;

      const unitSellBase = Math.round((cogsUnit * 1.60) / 1_000) * 1_000;
      const finalUnitSell = Math.round(unitSellBase * (1 + moqTier.surcharge));
      const totalSell = finalUnitSell * qty;
      const totalCogs = cogsUnit * qty;
      const profit = totalSell - totalCogs;
      const marginPercent = Math.round((profit / totalSell) * 100);

      return {
        unitLabel: "bộ",
        sheetsOrVol: `${perimeterM.toFixed(1)}m Khung Slim 16mm`,
        edgeOrSpecs: `${glassAreaM2.toFixed(2)} m² Kính dán 8.38mm an toàn`,
        laborHours: `${laborHours} giờ công gia công nhôm kính`,
        matCost,
        laborCost,
        overhead,
        cogsUnit,
        finalUnitSell,
        totalSell,
        totalCogs,
        profit,
        marginPercent,
        dimensionsStr: `${w} × ${d} × ${h} mm`,
        areaMetric: `${glassAreaM2.toFixed(2)} m² diện tích cánh`,
      };
    }

    // leather_lounge_chair
    const leatherAreaM2 = 3.6; // ~38 sqft with 25% waste
    const matLeather = Math.round(leatherAreaM2 * 1_150_000);
    const matWoodAndFoam = 1_650_000; // Ash wood frame + D40 high-resilient foam
    const matCost = matLeather + matWoodAndFoam;

    const laborHours = 14.0; // Upholstery + tailoring + frame assembly
    const laborCost = Math.round(laborHours * 105_000);
    const overhead = Math.round((matCost + laborCost) * 0.35);
    const cogsUnit = matCost + laborCost + overhead;

    const unitSellBase = Math.round((cogsUnit * 1.70) / 1_000) * 1_000;
    const finalUnitSell = Math.round(unitSellBase * (1 + moqTier.surcharge));
    const totalSell = finalUnitSell * qty;
    const totalCogs = cogsUnit * qty;
    const profit = totalSell - totalCogs;
    const marginPercent = Math.round((profit / totalSell) * 100);

    return {
      unitLabel: "chiếc",
      sheetsOrVol: `${leatherAreaM2.toFixed(1)} m² Da bò Ý nguyên tấm`,
      edgeOrSpecs: "Mút D40 đàn hồi + Khung gỗ Tần bì sấy",
      laborHours: `${laborHours} giờ may bọc & ráp khung`,
      matCost,
      laborCost,
      overhead,
      cogsUnit,
      finalUnitSell,
      totalSell,
      totalCogs,
      profit,
      marginPercent,
      dimensionsStr: `${w} × ${d} × ${h} mm`,
      areaMetric: "Hàng thủ công bọc nệm",
    };
  }, [selectedKey, w, d, h, qty]);

  const formatVND = (num: number) => num.toLocaleString("vi-VN") + " đ";

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-left">
      
      {/* Sandbox Window Header */}
      <div className="bg-slate-900 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-white font-semibold tracking-wide">
            LIVE COSTING SANDBOX V2.0
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 hidden sm:inline">
            Thử nghiệm chiết tính giá vốn đa ngành theo thời gian thực
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="text-amber-400">105.000 đ/giờ công</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">Tỷ giá 25.000</span>
        </div>
      </div>

      {/* Archetype Selector Tabs */}
      <div className="bg-slate-50 border-b border-slate-200 p-2 sm:p-3 overflow-x-auto">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
          {(Object.keys(ARCHETYPES) as ProductArchetypeKey[]).map((key) => {
            const item = ARCHETYPES[key];
            const isSelected = selectedKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectArchetype(key)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-white text-slate-900 shadow-xs border border-slate-300 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <span>{item.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${item.badgeColor}`}>
                  {item.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Grid: Controls Left, Live KPI Right */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white">
        
        {/* Left Column: Parametric Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">{archetype.name}</h4>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${archetype.badgeColor}`}>
                  {archetype.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{archetype.description}</p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              title="Khôi phục kích thước chuẩn"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3 Parametric Sliders */}
          <div className="space-y-4">
            
            {/* Slider W */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">{archetype.labels.w}</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {w} <span className="text-[11px] font-normal text-slate-500">mm</span>
                </span>
              </div>
              <input
                type="range"
                min={archetype.limits.wMin}
                max={archetype.limits.wMax}
                step={archetype.limits.wStep}
                value={w}
                onChange={(e) => setW(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>{archetype.limits.wMin} mm</span>
                <span>{archetype.limits.wMax} mm</span>
              </div>
            </div>

            {/* Slider D */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">{archetype.labels.d}</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {d} <span className="text-[11px] font-normal text-slate-500">mm</span>
                </span>
              </div>
              <input
                type="range"
                min={archetype.limits.dMin}
                max={archetype.limits.dMax}
                step={archetype.limits.dStep}
                value={d}
                onChange={(e) => setD(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>{archetype.limits.dMin} mm</span>
                <span>{archetype.limits.dMax} mm</span>
              </div>
            </div>

            {/* Slider H */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">{archetype.labels.h}</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {h} <span className="text-[11px] font-normal text-slate-500">mm</span>
                </span>
              </div>
              <input
                type="range"
                min={archetype.limits.hMin}
                max={archetype.limits.hMax}
                step={archetype.limits.hStep}
                value={h}
                onChange={(e) => setH(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>{archetype.limits.hMin} mm</span>
                <span>{archetype.limits.hMax} mm</span>
              </div>
            </div>

          </div>

          {/* MOQ Quantity Selector */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 font-medium">Bậc thang số lượng (MOQ):</span>
              <span className="text-slate-500 text-[11px]">
                {MOQ_OPTIONS.find((o) => o.qty === qty)?.note}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MOQ_OPTIONS.map((tier) => (
                <button
                  key={tier.qty}
                  type="button"
                  onClick={() => setQty(tier.qty)}
                  className={`py-2 px-2.5 rounded-lg text-xs font-mono transition cursor-pointer text-center border ${
                    qty === tier.qty
                      ? "bg-slate-900 text-white border-slate-900 font-bold shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div>{tier.qty} {calculation.unitLabel}</div>
                  <div className="text-[10px] opacity-75 font-sans">
                    {tier.surcharge > 0 ? `+${Math.round(tier.surcharge * 100)}% phụ phí` : "Giá chuẩn"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Material Specs Quick Tags */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-600 space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Quy cách định mức:</span>
              <span className="font-semibold text-slate-800">{calculation.sheetsOrVol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Đặc tính kỹ thuật:</span>
              <span className="text-slate-800">{calculation.edgeOrSpecs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Định mức nhân công:</span>
              <span className="text-amber-800 font-semibold">{calculation.laborHours}</span>
            </div>
          </div>

        </div>

        {/* Right Column: Reactive Calculation KPI Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
          
          <div className="space-y-4">
            
            {/* KPI Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                KẾT QUẢ DỰ TOÁN TỨC THÌ
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                Khớp 100% công thức
              </span>
            </div>

            {/* Price Metric: Client Quote vs Workshop Cost */}
            <div className="space-y-3">
              
              {/* Client Suggested Price */}
              <div className="p-3.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                  <span>Báo giá đề xuất gửi khách:</span>
                  <span className="font-mono text-emerald-700 font-semibold text-[11px]">
                    Biên lãi ~{calculation.marginPercent}%
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 font-mono tracking-tight tabular-nums">
                  {formatVND(calculation.totalSell)}
                </div>
                {qty > 1 && (
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Đơn giá: {formatVND(calculation.finalUnitSell)} / {calculation.unitLabel}
                  </div>
                )}
              </div>

              {/* Internal Workshop COGS */}
              <div className="p-3.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Giá vốn nội bộ xưởng (COGS):</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Ẩn với khách</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight tabular-nums">
                  {formatVND(calculation.totalCogs)}
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-0.5 pt-1.5 border-t border-slate-100">
                  <span>Lợi nhuận gộp ước tính:</span>
                  <strong className="text-emerald-700 font-semibold">
                    +{formatVND(calculation.profit)}
                  </strong>
                </div>
              </div>

            </div>

            {/* Breakdown Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="w-full flex items-center justify-between text-xs text-slate-600 hover:text-slate-900 py-1 transition cursor-pointer"
              >
                <span className="font-medium flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <span>{showBreakdown ? "Ẩn phân rã chi phí" : "Xem phân rã chi phí chi tiết"}</span>
                </span>
                {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showBreakdown && (
                <div className="mt-2 p-3 bg-white rounded-lg border border-slate-200 text-xs font-mono space-y-1.5 animate-in fade-in duration-150">
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500 font-sans">1. Vật liệu phôi &amp; phụ kiện:</span>
                    <span className="text-slate-800">{formatVND(calculation.matCost * qty)}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500 font-sans">2. Nhân công xưởng thực tế:</span>
                    <span className="text-slate-800">{formatVND(calculation.laborCost * qty)}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500 font-sans">3. Quản lý xưởng &amp; Overhead:</span>
                    <span className="text-slate-800">{formatVND(calculation.overhead * qty)}</span>
                  </div>
                  <div className="flex justify-between py-0.5 pt-1.5 border-t border-slate-100 font-bold">
                    <span className="text-slate-700 font-sans">Tổng giá vốn (COGS):</span>
                    <span className="text-slate-900">{formatVND(calculation.totalCogs)}</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Action CTA Button */}
          <div className="pt-2">
            <Link
              href={`/quoting?archetype=${selectedKey}&w=${w}&d=${d}&h=${h}&qty=${qty}`}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-xs group"
            >
              <span>Lập báo giá đầy đủ từ mẫu này</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              Xuất PDF A4 gửi khách hoặc tải Excel vật tư trong 1 click
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
