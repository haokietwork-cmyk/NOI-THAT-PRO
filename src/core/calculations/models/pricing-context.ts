/**
 * GIAO DIỆN CHUNG & HỆ QUY CHIẾU TÍNH GIÁ (PRICING CONTEXT)
 * Tuân thủ mục 4 của brief-cong-cu-bao-gia.md và Bước 1 của runbook-trien-khai-brief.md
 */

export interface MoqTier {
  moq: number;
  surcharge: number; // Tỷ lệ phụ phí, ví dụ 0, 0.05, 0.10, 0.25, 1.20 hoặc 2.00
}

export interface PricingConstants {
  fx: number;             // Tỷ giá quy đổi (VD: 25000 VND / USD)
  ohGeneral: number;      // Tỷ lệ Overhead chung (VD: 0.35 tức 35%)
  ohSubcon: number;       // Tỷ lệ Overhead thầu phụ/kim loại/nệm (VD: 0.10 tức 10%)
  ohMarble: number;       // Tỷ lệ Overhead đá (VD: 0)
  markup: number;         // Tỷ lệ lãi trên giá vốn COGS (VD: 0.20 tức 20% hoặc 0.65 tức 65%)
  laborRateUSD?: number;  // Đơn giá nhân công theo giờ (mặc định tham khảo 4.2 USD/h = 105.000 đ/h, dòng 723 Material)
  moqTiers: MoqTier[];    // Bảng phụ phí MOQ linh hoạt theo cấu hình
}

export interface PricingContext {
  constants: PricingConstants;
  rounding: "half_up";
}

/**
 * Hàm làm tròn nửa lên (ROUND HALF UP) chuẩn xác như Excel ROUND(val, decimals)
 * 922.5 -> 923, -922.5 -> -923
 */
export function roundHalfUp(value: number, decimals: number = 0): number {
  if (!isFinite(value) || isNaN(value)) return 0;
  const factor = Math.pow(10, decimals);
  const sign = value >= 0 ? 1 : -1;
  const absVal = Math.abs(value);
  // Thêm epsilon cực nhỏ để tránh lỗi floating point precision (vd: 1.005 * 100 = 100.49999999999999)
  const rounded = Math.floor(absVal * factor + 0.5 + Number.EPSILON);
  return sign * (rounded / factor);
}

export interface CostingModel<I, O> {
  id: "panel_cnc" | "export_furniture";
  name: string;
  compute(input: I, ctx?: PricingContext): O;
}
