/**
 * TỪ ĐIỂN THUẬT NGỮ CHUẨN XƯỞNG MỘC AUTOCUTLIST (SINGLE SOURCE OF TRUTH)
 * Quy định chuẩn hóa các khái niệm, nhãn hiển thị và định nghĩa tooltip.
 * Lần xuất hiện đầu tiên giữ từ gốc tiếng Anh trong ngoặc đơn để dễ nhận diện.
 */

export interface TermDefinition {
  label: string;
  labelWithOriginal: string;
  shortExplanation: string;
}

export const WORKSHOP_TERMS = {
  // 1. Cutlist -> Danh sách tấm
  cutlist: {
    label: "Danh sách tấm",
    labelWithOriginal: "Danh sách tấm (Cutlist)",
    shortExplanation: "Bảng quy cách kích thước Dài × Rộng × Dày và dán cạnh từng chi tiết phôi xưởng cần cắt.",
  },

  // 2. BOM -> Bảng đặt vật tư
  bom: {
    label: "Bảng đặt vật tư",
    labelWithOriginal: "Bảng đặt vật tư (BOM)",
    shortExplanation: "Bảng bóc trần tổng số tấm ván nguyên, tổng mét dài chỉ dán cạnh và phụ kiện cần đặt mua từ nhà cung cấp.",
  },

  // 3. Markup -> Lãi trên giá vốn
  markup: {
    label: "Lãi trên giá vốn",
    labelWithOriginal: "Lãi trên giá vốn (Markup)",
    shortExplanation: "Tỷ lệ phần trăm cộng thêm trên tổng giá vốn để cấu thành giá chào khách hàng (Ví dụ: x1.65 tương ứng lãi 65% trên giá vốn).",
  },

  // 4. Profit Margin -> Biên lợi nhuận
  profitMargin: {
    label: "Biên lợi nhuận",
    labelWithOriginal: "Biên lợi nhuận thực tế",
    shortExplanation: "Tỷ lệ phần trăm lợi nhuận thu được trên tổng doanh thu báo giá khách: (Giá bán - Giá vốn) / Giá bán (Ví dụ: Markup 65% tương ứng biên lợi nhuận thực 39,4%).",
  },

  // 5. Snapshot Pricing -> Giá chốt tại ngày tạo
  snapshotPricing: {
    label: "Giá chốt tại ngày tạo",
    labelWithOriginal: "Giá chốt tại ngày tạo (Snapshot)",
    shortExplanation: "Toàn bộ đơn giá vật tư được chụp cố định tại ngày tạo dự án. Dù sau này giá thị trường biến động, báo giá cũ mở lại vẫn giữ nguyên 100%.",
  },

  // 6. Module -> Hạng mục tủ
  module: {
    label: "Hạng mục tủ",
    labelWithOriginal: "Hạng mục tủ thành phẩm",
    shortExplanation: "Khối sản phẩm đồ gỗ hoàn thiện trong công trình (như Tủ áo Master, Hệ tủ bếp dưới, Kệ TV...).",
  },
} as const;

export type WorkshopTermKey = keyof typeof WORKSHOP_TERMS;
