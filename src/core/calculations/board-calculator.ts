/**
 * TRÁI TIM TÍNH TIỀN - MODULE TÍNH TOÁN DIỆN TÍCH & QUY ĐỔI TẤM VÁN TIÊU CHUẨN
 * Tuân thủ tuyệt đối quy định trong GEMINI.md
 */

export const STANDARD_BOARD = {
  LENGTH_MM: 2440,
  WIDTH_MM: 1220,
  AREA_M2: 2.9768, // (2440 * 1220) / 1,000,000
};

export const DEFAULT_BOARD_WASTE_FACTOR = 1.15; // Mặc định hao hụt 15%

/**
 * Tính diện tích ván thực tế (Net Area) của một tấm chi tiết
 * @param lengthMm Chiều dài tấm (mm)
 * @param widthMm Chiều rộng tấm (mm)
 * @param qty Số lượng tấm
 * @returns Diện tích net tính bằng m2
 */
export function calculateNetArea(lengthMm: number, widthMm: number, qty: number = 1): number {
  if (lengthMm <= 0 || widthMm <= 0 || qty <= 0) return 0;
  return (lengthMm * widthMm * qty) / 1_000_000;
}

/**
 * Quy đổi tổng diện tích Net thành số tấm ván tiêu chuẩn cần đặt mua
 * @param totalNetArea Tổng diện tích net (m2)
 * @param wasteFactor Hệ số hao hụt (mặc định 1.15)
 * @param standardArea Diện tích 1 tấm tiêu chuẩn (mặc định 2.9768m2)
 * @param roundToHalf Làm tròn lên 0.5 tấm (true) hoặc số nguyên tấm (false)
 * @returns Số tấm tiêu chuẩn cần mua
 */
export function calculateSheetsNeeded(
  totalNetArea: number,
  wasteFactor: number = DEFAULT_BOARD_WASTE_FACTOR,
  standardArea: number = STANDARD_BOARD.AREA_M2,
  roundToHalf: boolean = false
): number {
  if (totalNetArea <= 0) return 0;
  const grossArea = totalNetArea * wasteFactor;
  const rawSheets = grossArea / standardArea;
  if (roundToHalf) {
    return Math.ceil(rawSheets * 2) / 2;
  }
  return Math.ceil(rawSheets);
}

/**
 * Tính diện tích Gross (đã bao gồm hao hụt)
 */
export function calculateGrossArea(
  totalNetArea: number,
  wasteFactor: number = DEFAULT_BOARD_WASTE_FACTOR
): number {
  return Number((totalNetArea * wasteFactor).toFixed(4));
}
