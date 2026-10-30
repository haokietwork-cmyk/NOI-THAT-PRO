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

  // 7. Input Modes (AX6)
  cutlistMode: {
    label: "Bóc tách chi tiết",
    labelWithOriginal: "Bóc tách phôi tấm chi tiết (Cutlist Mode)",
    shortExplanation: "Nhập danh sách phôi tấm Dài × Rộng × Dày từ AutoCAD / SketchUp hoặc Excel để bóc tách ván và chỉ dán cạnh.",
  },
  quickModuleMode: {
    label: "Báo giá nhanh",
    labelWithOriginal: "Báo giá nhanh theo m² / mét dài (Quick Mode)",
    shortExplanation: "Dự toán sơ bộ khối lượng theo diện tích m² hoặc mét dài tủ khi chưa có bản vẽ chi tiết.",
  },
  manualLinesMode: {
    label: "Dòng nhập tay",
    labelWithOriginal: "Dòng chi phí nhập tay (Manual Lines)",
    shortExplanation: "Bổ sung linh hoạt các hạng mục mua ngoài, thầu phụ đá/kính, thiết bị bếp và vận chuyển.",
  },

  // 8. Cost Sources (AX5)
  defaultReferenceSource: {
    label: "Mặc định tham khảo",
    labelWithOriginal: "Mặc định tham khảo (Default Reference)",
    shortExplanation: "Định mức hoặc đơn giá mẫu do hệ thống gợi ý, xưởng nên cập nhật lại theo thực tế.",
  },
  workshopEnteredSource: {
    label: "Xưởng nhập",
    labelWithOriginal: "Xưởng nhập thực tế (Workshop Entered)",
    shortExplanation: "Đơn giá và định mức sản xuất do chính xưởng thiết lập.",
  },
  projectOverrideSource: {
    label: "Ghi đè dự án",
    labelWithOriginal: "Ghi đè riêng cho dự án (Project Override)",
    shortExplanation: "Đơn giá hoặc khối lượng điều chỉnh riêng cho hợp đồng này, không ảnh hưởng thư viện gốc.",
  },
} as const;

export type WorkshopTermKey = keyof typeof WORKSHOP_TERMS;
