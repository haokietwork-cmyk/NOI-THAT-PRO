/**
 * KHO HẠNG MỤC NỘI THẤT MẪU CHUẨN XƯỞNG GỖ (FURNITURE PRESETS)
 * Dành cho thợ thiết kế, chủ xưởng và khách hàng nạp nhanh các module tủ
 * theo quy chuẩn kỹ thuật mộc thực tế tại Việt Nam.
 */

import { CutlistPart } from "../types";

export interface FurniturePreset {
  id: string;
  name: string;
  category: "all" | "bedroom" | "kitchen" | "living" | "office";
  description: string;
  dimensions: string;
  partCount: number;
  highlight: string;
  icon: string;
  parts: Omit<CutlistPart, "id">[];
}

export const FURNITURE_PRESETS: FurniturePreset[] = [
  // 1. TỦ ÁO MASTER KỊCH TRẦN
  {
    id: "preset-tu-ao-master",
    name: "Tủ Áo Master Kịch Trần (3 Buồng 6 Cánh)",
    category: "bedroom",
    description: "Quy cách chuẩn cho phòng ngủ Master. Bao gồm hệ hồi tủ 2m4, khoang treo quần áo dài, đợt gấp và hộc kéo âm.",
    dimensions: "2400 × 1800 × 600 mm",
    partCount: 16,
    highlight: "Khớp khổ ván chuẩn 1220×2440 mm, ván hậu 6mm soi rãnh âm 10mm",
    icon: "🚪",
    parts: [
      { moduleName: "Tủ áo Master", partName: "Hông tủ trái", lengthMm: 2400, widthMm: 600, thicknessMm: 17, qty: 1, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: true, edgeW1: false, edgeW2: false },
      { moduleName: "Tủ áo Master", partName: "Hông tủ phải", lengthMm: 2400, widthMm: 600, thicknessMm: 17, qty: 1, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: true, edgeW1: false, edgeW2: false },
      { moduleName: "Tủ áo Master", partName: "Vách đứng giữa 1", lengthMm: 2366, widthMm: 580, thicknessMm: 17, qty: 1, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: false, edgeW1: false, edgeW2: false },
      { moduleName: "Tủ áo Master", partName: "Vách đứng giữa 2", lengthMm: 2366, widthMm: 580, thicknessMm: 17, qty: 1, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: false, edgeW1: false, edgeW2: false },
      { moduleName: "Tủ áo Master", partName: "Nóc tủ áo", lengthMm: 1766, widthMm: 600, thicknessMm: 17, qty: 1, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: false, edgeW1: false, edgeW2: false },
      { moduleName: "Tủ áo Master", partName: "Đáy tủ áo", lengthMm: 1766, widthMm: 600, thicknessMm: 17, qty: 1, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: false, edgeW1: false, edgeW2: false },
      { moduleName: "Tủ áo Master", partName: "Đợt ngang cố định", lengthMm: 1766, widthMm: 580, thicknessMm: 17, qty: 1, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: false, edgeW1: false, edgeW2: false },
      { moduleName: "Tủ áo Master", partName: "Đợt di động buồng trái", lengthMm: 570, widthMm: 560, thicknessMm: 17, qty: 3, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: false, edgeW1: false, edgeW2: false },
      { moduleName: "Tủ áo Master", partName: "Đợt di động buồng phải", lengthMm: 570, widthMm: 560, thicknessMm: 17, qty: 3, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: false, edgeW1: false, edgeW2: false },
      { moduleName: "Tủ áo Master", partName: "Cánh tủ kịch trần (Nẹp bo R2)", lengthMm: 2350, widthMm: 295, thicknessMm: 17, qty: 6, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: true, edgeW1: true, edgeW2: true },
      { moduleName: "Tủ áo Master", partName: "Ván hậu tủ áo (6mm)", lengthMm: 2380, widthMm: 1780, thicknessMm: 6, qty: 1, materialCode: "MDF_6_HAU", edgeL1: false, edgeL2: false, edgeW1: false, edgeW2: false },
      { moduleName: "Tủ áo Master", partName: "Len chân tủ", lengthMm: 1766, widthMm: 80, thicknessMm: 17, qty: 2, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: false, edgeW1: false, edgeW2: false },
    ],
  },

  // 2. TỦ BẾP CHỮ L KHÁNG ẨM & KHOANG CHẬU RỬA WPB
  {
    id: "preset-tu-bep-chu-l",
    name: "Tủ Bếp Chữ L Kháng Nước (Thùng MDF + Khoang WPB)",
    category: "kitchen",
    description: "Bộ tủ bếp chữ L tiêu chuẩn. Đặc biệt khoang bồn rửa bát sử dụng tấm nhựa đặc WPB chịu nước tuyệt đối 100%.",
    dimensions: "3000 × 2000 × 810 mm",
    partCount: 18,
    highlight: "Tích hợp tấm nhựa WPB chống ẩm mốc cho khoang chậu rửa",
    icon: "🍳",
    parts: [
      { moduleName: "Tủ bếp dưới", partName: "Hông tủ bếp dưới", lengthMm: 810, widthMm: 580, thicknessMm: 17, qty: 4, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: true, edgeW1: false, edgeW2: false },
      { moduleName: "Tủ bếp dưới", partName: "Khoang chậu rửa (Nhựa WPB)", lengthMm: 810, widthMm: 580, thicknessMm: 17, qty: 2, materialCode: "WPB_17_CHIU_NUOC", edgeL1: true, edgeL2: true, edgeW1: false, edgeW2: false },
      { moduleName: "Tủ bếp dưới", partName: "Đáy khoang chậu rửa (WPB)", lengthMm: 866, widthMm: 580, thicknessMm: 17, qty: 1, materialCode: "WPB_17_CHIU_NUOC", edgeL1: true, edgeL2: false, edgeW1: false, edgeW2: false },
      { moduleName: "Tủ bếp dưới", partName: "Đáy tủ bếp nhánh 1", lengthMm: 2066, widthMm: 580, thicknessMm: 17, qty: 1, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: false, edgeW1: false, edgeW2: false },
      { moduleName: "Tủ bếp dưới", partName: "Giằng nóc tủ bếp dưới", lengthMm: 866, widthMm: 100, thicknessMm: 17, qty: 4, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: false, edgeW1: false, edgeW2: false },
      { moduleName: "Tủ bếp trên", partName: "Hông tủ bếp trên", lengthMm: 750, widthMm: 350, thicknessMm: 17, qty: 4, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: true, edgeW1: false, edgeW2: false },
      { moduleName: "Tủ bếp trên", partName: "Đáy tủ bếp trên", lengthMm: 2966, widthMm: 350, thicknessMm: 17, qty: 1, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: false, edgeW1: false, edgeW2: false },
      { moduleName: "Tủ bếp trên", partName: "Nóc tủ bếp trên", lengthMm: 2966, widthMm: 350, thicknessMm: 17, qty: 1, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: false, edgeW1: false, edgeW2: false },
      { moduleName: "Cánh tủ bếp", partName: "Cánh tủ bếp dưới (Nẹp bo R2)", lengthMm: 720, widthMm: 445, thicknessMm: 17, qty: 6, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: true, edgeW1: true, edgeW2: true },
      { moduleName: "Cánh tủ bếp", partName: "Cánh tủ bếp trên (Nẹp bo R2)", lengthMm: 740, widthMm: 445, thicknessMm: 17, qty: 6, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: true, edgeW1: true, edgeW2: true },
      { moduleName: "Hậu tủ bếp", partName: "Ván hậu chống ẩm (6mm)", lengthMm: 2980, widthMm: 740, thicknessMm: 6, qty: 1, materialCode: "MDF_6_HAU", edgeL1: false, edgeL2: false, edgeW1: false, edgeW2: false },
    ],
  },

  // 3. TỦ GIÀY KỊCH TRẦN KÈM GHẾ NGỒI ĐỆM
  {
    id: "preset-tu-giay",
    name: "Tủ Giày Kịch Trần & Kệ Trang Trí Đèn Led",
    category: "living",
    description: "Tủ giày sát sảnh ra vào. Kết hợp đợt nghiêng để giày, ô để nón bảo hiểm và hốc ngồi mang giày có ngăn kéo.",
    dimensions: "2400 × 1200 × 350 mm",
    partCount: 12,
    highlight: "Đợt nghiêng tối ưu diện tích để giày dép, vách trang trí sảnh",
    icon: "👟",
    parts: [
      { moduleName: "Tủ giày", partName: "Hông tủ giày kịch trần", lengthMm: 2400, widthMm: 350, thicknessMm: 17, qty: 2, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: true, edgeW1: false, edgeW2: false },
      { moduleName: "Tủ giày", partName: "Nóc tủ giày", lengthMm: 1166, widthMm: 350, thicknessMm: 17, qty: 1, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: false, edgeW1: false, edgeW2: false },
      { moduleName: "Tủ giày", partName: "Đáy tủ giày", lengthMm: 1166, widthMm: 350, thicknessMm: 17, qty: 1, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: false, edgeW1: false, edgeW2: false },
      { moduleName: "Tủ giày", partName: "Vách chia ô ngồi đệm", lengthMm: 1600, widthMm: 330, thicknessMm: 17, qty: 1, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: false, edgeW1: false, edgeW2: false },
      { moduleName: "Tủ giày", partName: "Mặt ghế ngồi mang giày", lengthMm: 580, widthMm: 350, thicknessMm: 17, qty: 1, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: true, edgeW1: true, edgeW2: false },
      { moduleName: "Tủ giày", partName: "Đợt nghiêng để giày", lengthMm: 566, widthMm: 320, thicknessMm: 17, qty: 5, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: false, edgeW1: false, edgeW2: false },
      { moduleName: "Tủ giày", partName: "Cánh tủ giày mở có khe gió", lengthMm: 1580, widthMm: 285, thicknessMm: 17, qty: 4, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: true, edgeW1: true, edgeW2: true },
      { moduleName: "Tủ giày", partName: "Ván hậu tủ giày (6mm)", lengthMm: 2380, widthMm: 1180, thicknessMm: 6, qty: 1, materialCode: "MDF_6_HAU", edgeL1: false, edgeL2: false, edgeW1: false, edgeW2: false },
    ],
  },

  // 4. BÀN LÀM VIỆC & KỆ SÁCH VĂN PHÒNG
  {
    id: "preset-ban-lam-viec",
    name: "Bàn Làm Việc Mặt Kẹp Đôi & Kệ Sách Treo Tường",
    category: "office",
    description: "Bộ bàn làm việc cao cấp. Mặt bàn kẹp đôi dày 34mm dán nẹp PVC bản rộng 43mm, hộc 3 ngăn kéo và giá sách treo.",
    dimensions: "1600 × 700 × 750 mm",
    partCount: 11,
    highlight: "Mặt bàn kẹp đôi 34mm chịu lực, nẹp chỉ 1×43mm dày dặn",
    icon: "💻",
    parts: [
      { moduleName: "Bàn làm việc", partName: "Mặt bàn lớp trên (Kẹp đôi)", lengthMm: 1600, widthMm: 700, thicknessMm: 17, qty: 1, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: true, edgeW1: true, edgeW2: true },
      { moduleName: "Bàn làm việc", partName: "Mặt bàn lớp lót (Kẹp đôi)", lengthMm: 1560, widthMm: 660, thicknessMm: 17, qty: 1, materialCode: "MDF_17_CHONG_AM", edgeL1: false, edgeL2: false, edgeW1: false, edgeW2: false },
      { moduleName: "Bàn làm việc", partName: "Chân bàn hồi gỗ", lengthMm: 730, widthMm: 680, thicknessMm: 17, qty: 1, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: true, edgeW1: false, edgeW2: false },
      { moduleName: "Bàn làm việc", partName: "Yếm bàn giằng chân", lengthMm: 1160, widthMm: 350, thicknessMm: 17, qty: 1, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: false, edgeW1: false, edgeW2: false },
      { moduleName: "Hộc ngăn kéo", partName: "Hông hộc kéo bàn", lengthMm: 730, widthMm: 500, thicknessMm: 17, qty: 2, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: true, edgeW1: false, edgeW2: false },
      { moduleName: "Hộc ngăn kéo", partName: "Mặt ngăn kéo (3 hộc)", lengthMm: 395, widthMm: 180, thicknessMm: 17, qty: 3, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: true, edgeW1: true, edgeW2: true },
      { moduleName: "Kệ sách", partName: "Đợt kệ sách treo tường", lengthMm: 1200, widthMm: 250, thicknessMm: 17, qty: 3, materialCode: "MDF_17_CHONG_AM", edgeL1: true, edgeL2: true, edgeW1: true, edgeW2: true },
    ],
  },
];
