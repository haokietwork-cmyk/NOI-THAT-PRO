/**
 * TRÁI TIM TÍNH TIỀN - MODULE TÍNH TOÁN MÉT DÀI CHỈ DÁN CẠNH PVC
 * Tuân thủ tuyệt đối quy định trong GEMINI.md
 */

export const DEFAULT_EDGE_WASTE_FACTOR = 1.08; // Mặc định hao hụt chỉ 8%

export interface EdgeBandingConfig {
  l1?: boolean; // Cạnh dài 1
  l2?: boolean; // Cạnh dài 2
  w1?: boolean; // Cạnh rộng 1
  w2?: boolean; // Cạnh rộng 2
}

/**
 * Tính tổng mét dài chỉ dán cạnh của 1 tấm chi tiết
 * @param lengthMm Chiều dài (mm)
 * @param widthMm Chiều rộng (mm)
 * @param qty Số lượng tấm
 * @param edges Cấu hình các cạnh được đánh dấu dán chỉ
 * @param wasteFactor Hệ số hao hụt chỉ (mặc định 1.08)
 * @returns Tổng mét dài chỉ cần mua (đã nhân hao hụt)
 */
export function calculateEdgeMeters(
  lengthMm: number,
  widthMm: number,
  qty: number = 1,
  edges: EdgeBandingConfig = {},
  wasteFactor: number = DEFAULT_EDGE_WASTE_FACTOR
): number {
  if (qty <= 0) return 0;

  let netMm = 0;
  if (edges.l1) netMm += lengthMm;
  if (edges.l2) netMm += lengthMm;
  if (edges.w1) netMm += widthMm;
  if (edges.w2) netMm += widthMm;

  const totalMm = netMm * qty;
  const netMeters = totalMm / 1_000;
  return Number((netMeters * wasteFactor).toFixed(2));
}
