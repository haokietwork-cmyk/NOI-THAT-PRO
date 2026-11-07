/**
 * MÔ HÌNH BÁO GIÁ NỘI THẤT GỖ KHỐI & XUẤT KHẨU (EXPORT FURNITURE MODEL)
 * Tuân thủ mục 4 của brief-cong-cu-bao-gia.md và Bước 1c của runbook-trien-khai-brief.md
 */

import type { CostingModel, PricingContext } from "./pricing-context.ts";
import { roundHalfUp } from "./pricing-context.ts";

export type CostGroup =
  | "Stone"
  | "Upholstery"
  | "Metal frame - S"
  | "Sub.Con"
  | "Wood"
  | "Metal Frame - P"
  | "Glass"
  | "Resin"
  | "Metal Leaf"
  | "Lea + Uph"
  | "Chemical"
  | "Hardware"
  | "Consumables"
  | "Packing"
  | "Labour Cost Total";

export interface ExportCostLine {
  id?: string;
  group: CostGroup;
  rmCode?: string;
  description?: string;
  unit: "m2" | "m3" | "pcs" | "m" | "set" | "kg" | "flat";
  thicknessMm?: number;
  widthMm?: number;
  lengthMm?: number;
  qty: number;
  waste: number;           // Tỷ lệ hao hụt, vd 0.2 (20%), 0.45 (45%)
  unitPriceUSD: number;    // Đơn giá USD (hoặc quy đổi từ VND / fx)
  directAmountUSD?: number; // Cho phép ghi đè số tiền trực tiếp nếu có
}

export interface ComputedCostLine extends ExportCostLine {
  netQty: number;          // SQM hoặc CBM hoặc mét/cái thuần
  usingQty: number;        // Lượng dùng sau hao hụt = Net / (1 - waste)
  amountUSD: number;       // Thành tiền = usingQty * unitPriceUSD
}

export interface LaborProcessLine {
  id?: string;
  processCode: string;     // Mã công đoạn thực tế (từ sheet Quy trình cột M-Q, vd: RAW, MAC, CNC-MDF, VEN, ASS, SAND, CMF...)
  name?: string;            // Tên công đoạn (vd: Gia công cơ khí, Phủ veneer, Lắp ráp...)
  hours: number;           // Số giờ công thực tế
  hourlyRateUSD?: number;  // Đơn giá USD/giờ (mặc định 4.2 USD/h từ dòng 723 Sheet Material, xưởng tự sửa được)
}

export interface ComputedLaborProcessLine extends LaborProcessLine {
  hourlyRateUSD: number;
  amountUSD: number;       // Thành tiền = hours * hourlyRateUSD
}

export interface GroupSubtotal {
  group: CostGroup;
  amountUSD: number;
  category: "stone" | "subcon" | "general";
}

export interface MoqResult {
  moq: number;
  surchargePercent: number;
  unitPriceUSD: number;
}

export interface ExportFurnitureOutput {
  modelId: "export_furniture";
  computedLines: ComputedCostLine[];
  computedLaborLines: ComputedLaborProcessLine[];
  groupSubtotals: Record<CostGroup, number>;
  lmUSD: number;           // Tổng chi phí vật tư và nhân công (L&M)
  ohUSD: number;           // Overhead tổng
  ohBreakdown: {
    stoneOH: number;       // 0%
    subconOH: number;      // 10%
    generalOH: number;     // 35%
    antMarbOH: number;     // 3.42 * Labour(Ant-Marb) nếu có
  };
  cogsUSD: number;         // Giá vốn xưởng = LM + OH
  profitUSD: number;       // Lợi nhuận = COGS * markup (mặc định 20%)
  sellingPriceUSD: number; // Giá bán chuẩn trước MOQ = ROUND(COGS + Profit, 0)
  moqPrices: MoqResult[];  // Giá bán theo từng bậc MOQ
  stoneUSD: number;        // Tiền đá tách riêng để không tính phụ phí MOQ
}

export interface ExportFurnitureInput {
  lines?: ExportCostLine[];
  laborLines?: LaborProcessLine[];
  overrideGroupTotals?: Partial<Record<CostGroup, number>>;
  antMarbLaborUSD?: number;
}

const SUBCON_GROUPS: Set<CostGroup> = new Set([
  "Upholstery",
  "Metal frame - S",
  "Sub.Con",
]);

export function computeLineUsing(line: ExportCostLine): { netQty: number; usingQty: number; amountUSD: number } {
  if (line.directAmountUSD !== undefined && line.directAmountUSD !== null) {
    return {
      netQty: line.qty,
      usingQty: line.qty,
      amountUSD: line.directAmountUSD,
    };
  }

  const wasteDivisor = 1 - (line.waste || 0);
  const safeDivisor = wasteDivisor <= 0 ? 1 : wasteDivisor;

  let netQty = 0;
  if (line.unit === "m2") {
    // Ván hoặc da hoặc đá tính theo m2: SQM = (Length * Width * Qty) / 1,000,000
    const l = line.lengthMm || 0;
    const w = line.widthMm || 0;
    netQty = (l * w * line.qty) / 1_000_000;
  } else if (line.unit === "m3") {
    // Gỗ khối: CBM = (Thickness * Width * Length * Qty) / 1,000,000,000
    const t = line.thicknessMm || 0;
    const w = line.widthMm || 0;
    const l = line.lengthMm || 0;
    netQty = (t * w * l * line.qty) / 1_000_000_000;
  } else if (line.unit === "m") {
    // Mét dài: (Length * Qty) / 1,000
    const l = line.lengthMm || 0;
    netQty = (l * line.qty) / 1_000;
  } else {
    // Cái, bộ, kg, phẳng: lấy số lượng thuần
    netQty = line.qty;
  }

  const usingQty = netQty / safeDivisor;
  const amountUSD = usingQty * line.unitPriceUSD;

  return { netQty, usingQty, amountUSD };
}

export const exportFurnitureModel: CostingModel<ExportFurnitureInput, ExportFurnitureOutput> = {
  id: "export_furniture",
  name: "Nội thất Gỗ Khối & Xuất Khẩu (USD)",
  compute(input: ExportFurnitureInput, ctx: PricingContext): ExportFurnitureOutput {
    const lines = input.lines || [];
    const computedLines: ComputedCostLine[] = [];
    const groupSubtotals: Record<CostGroup, number> = {
      Stone: 0,
      Upholstery: 0,
      "Metal frame - S": 0,
      "Sub.Con": 0,
      Wood: 0,
      "Metal Frame - P": 0,
      Glass: 0,
      Resin: 0,
      "Metal Leaf": 0,
      "Lea + Uph": 0,
      Chemical: 0,
      Hardware: 0,
      Consumables: 0,
      Packing: 0,
      "Labour Cost Total": 0,
    };

    // 1. Tính toán từng dòng chi tiết vật tư
    for (const line of lines) {
      const computed = computeLineUsing(line);
      computedLines.push({
        ...line,
        netQty: computed.netQty,
        usingQty: computed.usingQty,
        amountUSD: computed.amountUSD,
      });
      groupSubtotals[line.group] = (groupSubtotals[line.group] || 0) + computed.amountUSD;
    }

    // 1b. Tính toán nhân công theo các công đoạn thực tế (sheet Quy trình cột M-Q & đơn giá dòng 723 Material: 4.2 USD/hr)
    const computedLaborLines: ComputedLaborProcessLine[] = [];
    if (input.laborLines && input.laborLines.length > 0) {
      let totalLaborAmount = 0;
      const defaultRate = ctx.constants.laborRateUSD ?? 4.2;
      for (const lb of input.laborLines) {
        const rate = lb.hourlyRateUSD !== undefined && lb.hourlyRateUSD !== null ? lb.hourlyRateUSD : defaultRate;
        const amountUSD = lb.hours * rate;
        totalLaborAmount += amountUSD;
        computedLaborLines.push({
          ...lb,
          hourlyRateUSD: rate,
          amountUSD,
        });
      }
      groupSubtotals["Labour Cost Total"] = totalLaborAmount;
    }

    // Ghi đè tổng nhóm nếu input có overrideGroupTotals (hỗ trợ nhập nhanh theo sheet Costing)
    if (input.overrideGroupTotals) {
      for (const [grp, val] of Object.entries(input.overrideGroupTotals)) {
        if (val !== undefined && val !== null) {
          groupSubtotals[grp as CostGroup] = val;
        }
      }
    }

    // 2. Tính L&M (Tổng chi phí vật tư và nhân công)
    let lmUSD = 0;
    let subconSum = 0;
    let generalSum = 0;
    const stoneAmount = groupSubtotals.Stone || 0;

    for (const [groupKey, amount] of Object.entries(groupSubtotals)) {
      const grp = groupKey as CostGroup;
      lmUSD += amount;
      if (grp === "Stone") {
        // Đá 0% OH
      } else if (SUBCON_GROUPS.has(grp)) {
        subconSum += amount;
      } else {
        generalSum += amount;
      }
    }

    // 3. Tính Overhead (OH)
    const subconOH = subconSum * ctx.constants.ohSubcon;
    const generalOH = generalSum * ctx.constants.ohGeneral;
    const antMarbOH = input.antMarbLaborUSD ? 3.42 * input.antMarbLaborUSD : 0;
    const ohUSD = subconOH + generalOH + antMarbOH;

    // 4. Giá vốn COGS & Lợi nhuận Profit
    const cogsUSD = lmUSD + ohUSD;
    const profitUSD = cogsUSD * ctx.constants.markup;
    const rawSellingPrice = cogsUSD + profitUSD;
    const sellingPriceUSD = roundHalfUp(rawSellingPrice, 0);

    // 5. Tính giá theo MOQ tiers
    // Phụ phí áp lên (SellingPrice - Stone), sau đó cộng lại Stone
    const moqPrices: MoqResult[] = (ctx.constants.moqTiers || []).map((tier) => {
      const baseForSurcharge = Math.max(0, sellingPriceUSD - stoneAmount);
      const unitPriceUSD = roundHalfUp(baseForSurcharge * (1 + tier.surcharge) + stoneAmount, 0);
      return {
        moq: tier.moq,
        surchargePercent: tier.surcharge * 100,
        unitPriceUSD,
      };
    });

    return {
      modelId: "export_furniture",
      computedLines,
      computedLaborLines,
      groupSubtotals,
      lmUSD,
      ohUSD,
      ohBreakdown: {
        stoneOH: 0,
        subconOH,
        generalOH,
        antMarbOH,
      },
      cogsUSD,
      profitUSD,
      sellingPriceUSD,
      moqPrices,
      stoneUSD: stoneAmount,
    };
  },
};
