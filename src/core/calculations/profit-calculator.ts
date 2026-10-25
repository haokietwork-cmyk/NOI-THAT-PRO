/**
 * PROFIT CALCULATOR - CÔNG CỤ TÍNH LÃI TRÊN GIÁ VỐN & BIÊN LỢI NHUẬN THỰC TẾ
 * Tuân thủ quy tắc tính toán tập trung tại src/core/calculations/
 * 
 * Công thức chuẩn:
 * - Hệ số k (VD: 1.65):
 *   + Lãi trên giá vốn (Markup %) = (k - 1) * 100  -->  (1.65 - 1) * 100 = 65.0%
 *   + Biên lợi nhuận thực (Margin %) = ((k - 1) / k) * 100  -->  ((1.65 - 1) / 1.65) * 100 ≈ 39.4%
 * 
 * Xử lý biên:
 * - k <= 0: Không chia cho 0, trả về -100%
 * - 0 < k < 1: Lãi âm (bán lỗ dưới giá vốn)
 */

export const DEFAULT_LEGACY_PROFIT_MARGIN = 1.35; // Mặc định cũ (markup 35%) cho dự án lịch sử thiếu profitMargin
export const DEFAULT_NEW_PROFIT_MARGIN = 1.65;    // Mặc định mới (markup 65%) cho dự án tạo mới
export const DEFAULT_PROFIT_MARGIN = DEFAULT_NEW_PROFIT_MARGIN;

/**
 * Phân giải hệ số lợi nhuận an toàn cho dự án:
 * - Nếu dự án có lưu profitMargin hợp lệ (> 0): dùng đúng giá trị đã lưu.
 * - Nếu dự án cũ bị thiếu/null: dùng DEFAULT_LEGACY_PROFIT_MARGIN (1.35) để không làm nhảy số tiền lịch sử.
 * - Nếu là dự án mới tạo: dùng DEFAULT_NEW_PROFIT_MARGIN (1.65).
 */
export function resolveProjectProfitMargin(
  savedMargin?: number | null,
  isNewProject: boolean = false
): number {
  if (savedMargin !== undefined && savedMargin !== null && !isNaN(savedMargin) && savedMargin > 0) {
    return Number(savedMargin);
  }
  return isNewProject ? DEFAULT_NEW_PROFIT_MARGIN : DEFAULT_LEGACY_PROFIT_MARGIN;
}

/**
 * Phân bổ giá vốn và giá bán cho từng hạng mục (Module) theo tỷ lệ diện tích ván net
 */
export function calculateModuleQuoteLine(
  moduleAreaM2: number,
  totalAreaM2: number,
  totalBaseCost: number,
  totalQuotePrice: number
): { ratio: number; baseCost: number; quotePrice: number } {
  const ratio = totalAreaM2 > 0 ? moduleAreaM2 / totalAreaM2 : 0;
  const baseCost = Math.round(totalBaseCost * ratio);
  const quotePrice = Math.round(totalQuotePrice * ratio);
  return { ratio, baseCost, quotePrice };
}

/**
 * Tính tỷ lệ Lãi trên giá vốn (Markup %) từ hệ số nhân k
 */
export function calculateMarkupPercent(multiplier: number): number {
  if (multiplier <= 0) {
    return -100;
  }
  return Number(((multiplier - 1) * 100).toFixed(1));
}

/**
 * Tính Biên lợi nhuận thực tế (Profit Margin %) từ hệ số nhân k
 * Công thức: Margin = (Giá bán - Giá vốn) / Giá bán = (k - 1) / k
 */
export function calculateProfitMarginPercent(multiplier: number): number {
  if (multiplier <= 0) {
    return -100;
  }
  return Number((((multiplier - 1) / multiplier) * 100).toFixed(1));
}

/**
 * Tính tổng giá bán thương mại và lãi gộp dự kiến từ giá vốn và hệ số k
 */
export function calculateCommercialQuote(baseCost: number, multiplier: number = DEFAULT_PROFIT_MARGIN): {
  quotePrice: number;
  grossProfit: number;
  markupPercent: number;
  profitMarginPercent: number;
} {
  const safeCost = Math.max(0, baseCost);
  const safeMultiplier = Math.max(0, multiplier);
  const quotePrice = Math.round(safeCost * safeMultiplier);
  const grossProfit = quotePrice - safeCost;

  return {
    quotePrice,
    grossProfit,
    markupPercent: calculateMarkupPercent(multiplier),
    profitMarginPercent: calculateProfitMarginPercent(multiplier),
  };
}

/**
 * Định dạng phần trăm hiển thị giao diện tiếng Việt (VD: "65%", "39,4%", "+65,0%")
 */
export function formatPercentVi(percent: number, includeSign = false): string {
  const sign = includeSign && percent > 0 ? "+" : "";
  const formattedNumber = percent.toFixed(1).replace(".", ",");
  // Nếu là số tròn chục hoặc nguyên (VD: 65,0 -> 65%), làm gọn nhẹ cho thợ dễ đọc
  const cleanStr = formattedNumber.endsWith(",0") ? formattedNumber.slice(0, -2) : formattedNumber;
  return `${sign}${cleanStr}%`;
}
