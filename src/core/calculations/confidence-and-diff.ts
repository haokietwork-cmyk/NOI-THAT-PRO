/**
 * BỘ ĐÁNH GIÁ ĐỘ TIN CẬY & ĐỐI CHIẾU PHIÊN BẢN (CONFIDENCE & VERSION DIFF)
 * Tuân thủ Hiến pháp dự án (GEMINI.md) và Tài liệu thiết kế Costing Sheet V2 (Chương 4.3 & 4.4).
 * Tính toán độ tin cậy 1-5 sao và đối chiếu phần trăm chênh lệch giữa các phiên bản báo giá.
 */

import type { ConfidenceStars, ConfidenceRating, CostingQuestionnaire } from "./parametric-types.ts";

export interface VersionDiffResult {
  activePrice: number;
  quotedPrice: number;
  diffAmount: number;
  diffPercent: number;
  formattedDiff: string;
  isDifferent: boolean;
  alertMessage?: string;
}

/**
 * Đánh giá độ tin cậy của kết quả Costing Sheet từ 1 đến 5 sao
 */
export function evaluateConfidence(
  calcMode: "detail" | "quick",
  questionnaire: CostingQuestionnaire,
  unitPricesReady: boolean = true,
  missingPricesCount: number = 0,
  isFromTemplate: boolean = false
): ConfidenceRating {
  // 1 sao: Có chọn vật tư đắt tiền (Đá, Kính, Kim loại) nhưng đơn giá bằng 0
  const hasExpensiveOption =
    questionnaire.materials.hasStone ||
    questionnaire.materials.hasGlass ||
    questionnaire.materials.hasMetal ||
    questionnaire.materials.hasUpholstery;

  if (hasExpensiveOption && missingPricesCount > 0) {
    return {
      stars: 1,
      label: "Không tin cậy",
      colorClass: "text-rose-700 bg-rose-50 border-rose-200",
      reasons: ["Có vật liệu đặc thù (Đá/Kính/Kim loại/Nệm) nhưng chưa có đơn giá thực tế trong thư viện xưởng."],
      recommendation: "Cập nhật đơn giá vật tư trong Thư viện trước khi áp dụng hoặc gửi cho khách hàng.",
    };
  }

  // 2 sao: Kích thước phi tiêu chuẩn hoặc đơn giá chưa cập nhật đầy đủ
  const { widthMm, depthMm, heightMm } = questionnaire.dimensions;
  const isExtremeDimension =
    widthMm > 4000 || widthMm < 300 ||
    depthMm > 1500 || depthMm < 150 ||
    heightMm > 3200 || heightMm < 200;

  if (isExtremeDimension || !unitPricesReady) {
    return {
      stars: 2,
      label: "Chỉ để định hướng",
      colorClass: "text-orange-700 bg-orange-50 border-orange-200",
      reasons: ["Kích thước sản phẩm ngoài dải tiêu chuẩn hoặc đang dùng đơn giá tham khảo mặc định."],
      recommendation: "Nên kiểm tra lại định mức chi tiết hoặc cập nhật bảng giá xưởng trước khi chốt hợp đồng.",
    };
  }

  // 3 sao: Tính theo chế độ Ước nhanh hoặc để trống số ngăn kéo/cánh
  const autoInterpolatedDetails =
    questionnaire.details?.drawerCount === undefined ||
    questionnaire.details?.doorCount === undefined;

  if (calcMode === "quick" || autoInterpolatedDetails) {
    return {
      stars: 3,
      label: "Tham khảo",
      colorClass: "text-amber-700 bg-amber-50 border-amber-200",
      reasons: ["Tính toán ước nhanh theo thông số tổng thể hoặc hệ thống tự nội suy số lượng phụ kiện."],
      recommendation: "Phù hợp để báo giá khái toán ban đầu; hãy xác nhận số cánh/ngăn kéo trước khi sản xuất.",
    };
  }

  // 4 sao: Tính chi tiết, điền đủ thông số, đơn giá sẵn sàng
  if (calcMode === "detail" && !isFromTemplate) {
    return {
      stars: 4,
      label: "Sát",
      colorClass: "text-emerald-600 bg-emerald-50/70 border-emerald-200",
      reasons: ["Bảng chiết tính chi tiết với đầy đủ kích thước, số lượng cánh/ngăn kéo và đơn giá xưởng."],
      recommendation: "Độ chính xác cao, có thể xuất bản báo giá thương mại gửi khách hàng.",
    };
  }

  // 5 sao: Chi tiết hoàn hảo hoặc dựng từ mẫu chuẩn có kích thước tương đồng
  return {
    stars: 5,
    label: "Rất sát",
    colorClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
    reasons: ["Định mức được kiểm chứng 100% từ cấu trúc sản phẩm thực tế cùng đơn giá cập nhật."],
    recommendation: "Độ chính xác tuyệt đối, sẵn sàng xuất báo giá và lệnh mua vật tư.",
  };
}

/**
 * Tính phần trăm và độ lệch giữa bản đang xem và bản đã chốt gửi khách (Quoted Version)
 */
export function calculateVersionDiff(
  activePrice: number,
  quotedPrice: number
): VersionDiffResult {
  const diffAmount = activePrice - quotedPrice;
  const diffPercent = quotedPrice > 0 ? (diffAmount / quotedPrice) * 100 : 0;
  const isDifferent = Math.abs(diffAmount) > 1000;

  let formattedDiff = "0%";
  if (diffPercent > 0) {
    formattedDiff = `+${diffPercent.toFixed(1)}%`;
  } else if (diffPercent < 0) {
    formattedDiff = `${diffPercent.toFixed(1)}%`;
  }

  let alertMessage: string | undefined;
  if (isDifferent) {
    alertMessage = `Giá hiện tại chênh lệch ${formattedDiff} (${diffAmount.toLocaleString("vi-VN")} đ) so với giá đã chốt trên báo giá gửi khách.`;
  }

  return {
    activePrice,
    quotedPrice,
    diffAmount,
    diffPercent,
    formattedDiff,
    isDifferent,
    alertMessage,
  };
}

/**
 * Trả về màu sắc CSS Tailwind chuẩn Web-Twin cho từng bậc sao
 */
export function getConfidenceBadgeStyle(stars: ConfidenceStars): {
  textColor: string;
  bgColor: string;
  borderColor: string;
  starString: string;
} {
  switch (stars) {
    case 5:
      return {
        textColor: "text-emerald-700",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        starString: "★★★★★",
      };
    case 4:
      return {
        textColor: "text-emerald-600",
        bgColor: "bg-emerald-50/70",
        borderColor: "border-emerald-200",
        starString: "★★★★☆",
      };
    case 3:
      return {
        textColor: "text-amber-700",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        starString: "★★★☆☆",
      };
    case 2:
      return {
        textColor: "text-orange-700",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        starString: "★★☆☆☆",
      };
    case 1:
    default:
      return {
        textColor: "text-rose-700",
        bgColor: "bg-rose-50",
        borderColor: "border-rose-200",
        starString: "★☆☆☆☆",
      };
  }
}
